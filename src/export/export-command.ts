/**
 * VS Code 命令处理器 —— 编排 DOCX 导出的完整 UX 流程。
 *
 * 职责：对话框、进度条、取消、通知。
 * 不包含任何转换逻辑（委托给 ast-to-docx）。
 */
import * as vscode from "vscode";
import * as path from "path";
import type { Root, Image, Content } from "mdast";
import type { ImageWarning } from "./image-resolver";

// ── Output Channel（懒初始化）───────────────────

let _outputChannel: vscode.OutputChannel | undefined;

function getOutputChannel(): vscode.OutputChannel {
  if (!_outputChannel) {
    _outputChannel = vscode.window.createOutputChannel("DOCX 导出");
  }
  return _outputChannel;
}

function log(msg: string): void {
  const ts = new Date().toISOString().slice(11, 23);
  getOutputChannel().appendLine(`[${ts}] ${msg}`);
}

function logError(msg: string, err: unknown): void {
  const detail = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
  log(`ERROR: ${msg}\n${detail}`);
}

// ── 延迟加载 docx 导出模块 ──────────────────────

let _exporter: typeof import("./ast-to-docx") | undefined;

async function getExporter() {
  if (!_exporter) {
    _exporter = await import("./ast-to-docx.js");
  }
  return _exporter;
}

// ── remark 处理器（独立于扩展主 parser，带 frontmatter 支持）──

let _processor: { parse: (text: string) => Root } | undefined;

function getProcessor(): { parse: (text: string) => Root } {
  if (!_processor) {
    /* eslint-disable @typescript-eslint/no-var-requires -- CJS/ESM 兼容，与 parser-remark.ts 同模式 */
    const { unified } = require("unified");
    const remarkParse = require("remark-parse");
    const remarkGfm = require("remark-gfm");
    const remarkFrontmatter = require("remark-frontmatter");
    /* eslint-enable @typescript-eslint/no-var-requires */

    const proc = unified()
      .use(remarkParse.default ?? remarkParse)
      .use(remarkGfm.default ?? remarkGfm)
      .use(remarkFrontmatter.default ?? remarkFrontmatter);

    _processor = { parse: (text: string) => proc.parse(text) as Root };
  }
  return _processor;
}

// ── 提取 AST 中所有图片 URL ─────────────────────

/** 导出仅供单测：收集 AST 中全部图片 URL（去重） */
export function collectImageUrls(node: Content | Root): string[] {
  const urls = new Set<string>();

  const walk = (n: Content | Root): void => {
    if (n.type === "image") {
      urls.add((n as Image).url);
    }
    if ("children" in n && Array.isArray(n.children)) {
      for (const child of n.children as Content[]) {
        walk(child);
      }
    }
  };

  walk(node);
  return [...urls]; // 去重：同一图片被引用多次只读取一次
}

// ── 导出命令（带保存对话框）─────────────────────

export function createExportDocxCommand(context: vscode.ExtensionContext) {
  return async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage("请先打开一个 Markdown 文件。");
      return;
    }

    // 语言校验
    const langId = editor.document.languageId;
    if (!["markdown", "md", "mdx", "skill", "markdoc", "mdc", "juliamarkdown", "rmarkdown"].includes(langId)) {
      vscode.window.showWarningMessage("请在 Markdown 文件中使用此命令。");
      return;
    }

    // Untitled 守卫：磁盘上没有文件，图片相对路径无法解析
    if (editor.document.isUntitled) {
      vscode.window.showWarningMessage("未命名文档无法导出，请先保存文件再导出。");
      return;
    }

    // 未保存修改提示
    if (editor.document.isDirty) {
      const choice = await vscode.window.showWarningMessage(
        "文档有未保存的修改。",
        "保存并导出",
        "直接导出",
        "取消",
      );
      if (choice === "取消" || !choice) return;
      if (choice === "保存并导出") {
        await editor.document.save();
      }
    }

    // 保存对话框
    const lastDir = context.workspaceState.get<string>("lastExportDirectory");
    const docDir = path.dirname(editor.document.fileName);
    const defaultDir = lastDir ?? docDir;
    const defaultName = path.basename(editor.document.fileName).replace(/\.(md|markdown|mdx|mdc|markdoc)$/i, "") + ".docx";

    const uri = await vscode.window.showSaveDialog({
      defaultUri: vscode.Uri.file(path.join(defaultDir, defaultName)),
      filters: { "Word Document": ["docx"] },
    });
    if (!uri) return;

    // 带进度条导出（交互模式：成功通知带"打开文件"等动作）
    await runExport(editor.document, uri, context, { quick: false });
  };
}

// ── 快速导出命令（无对话框）─────────────────────

export function createExportDocxQuickCommand(context: vscode.ExtensionContext) {
  return async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage("请先打开一个 Markdown 文件。");
      return;
    }

    const langId = editor.document.languageId;
    if (!["markdown", "md", "mdx", "skill", "markdoc", "mdc", "juliamarkdown", "rmarkdown"].includes(langId)) {
      vscode.window.showWarningMessage("请在 Markdown 文件中使用此命令。");
      return;
    }

    // Untitled 守卫：磁盘上没有文件，无法确定输出路径与图片相对路径
    if (editor.document.isUntitled) {
      vscode.window.showWarningMessage("未命名文档无法导出，请先保存文件再导出。");
      return;
    }

    const docPath = editor.document.fileName;
    const outputPath = docPath.replace(/\.(md|markdown|mdx|mdc|markdoc)$/i, "") + ".docx";
    const outputUri = vscode.Uri.file(outputPath);

    // 文件已存在：确认覆盖。用 workspace.fs 而非 Node fs，
    // 远程/虚拟工作区（Remote-SSH、WSL）下 Node fs 探测的是本地磁盘。
    let exists = true;
    try {
      await vscode.workspace.fs.stat(outputUri);
    } catch {
      exists = false;
    }
    let targetUri = outputUri;
    if (exists) {
      const choice = await vscode.window.showWarningMessage(
        `文件 ${path.basename(outputPath)} 已存在，是否覆盖？`,
        "覆盖",
        "另存为",
        "取消",
      );
      if (choice === "取消" || !choice) return;
      if (choice === "另存为") {
        const picked = await vscode.window.showSaveDialog({
          defaultUri: outputUri,
          filters: { "Word Document": ["docx"] },
        });
        if (!picked) return;
        targetUri = picked;
      }
    }

    await runExport(editor.document, targetUri, context, { quick: true });
  };
}

// ── 核心导出流程 ────────────────────────────────

/** 两个导出命令共享的核心：Quick 用静默成功通知，对话框版保留交互动作。 */
interface ExportOptions {
  quick: boolean;
}

interface ExportOutcome {
  bytes: number;
  /** 未嵌入的图片引用（含原因） */
  warnings: ImageWarning[];
  /** 被降级呈现的内容（mermaid 占位、LaTeX 源码等） */
  fidelity: string[];
}

/** 把图片警告转为用户可读的一句话 */
function describeImageWarning(w: ImageWarning): string {
  switch (w.reason) {
    case "remote":
      return `远程图片未下载：${w.url}`;
    case "data-uri":
      return "内嵌图片（data URI）未嵌入";
    case "not-found":
      return `图片未找到：${w.url}（请检查相对路径是否正确，或重新导出）`;
    default:
      return `图片读取失败：${w.url}（${w.reason.replace(/^read-error: /, "")}）`;
  }
}

async function runExport(
  document: vscode.TextDocument,
  outputUri: vscode.Uri,
  context: vscode.ExtensionContext,
  opts: ExportOptions,
): Promise<void> {
  // 成功/失败通知必须在 withProgress 结束后再弹：带按钮的通知要等用户
  // 交互才 resolve，若在进度回调内 await，进度通知会一直挂住不消失。
  let outcome: ExportOutcome | undefined;
  try {
    outcome = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "导出公文 DOCX",
        cancellable: true,
      },
      async (progress, token): Promise<ExportOutcome | undefined> => {
        log(`开始导出: ${document.fileName} → ${outputUri.fsPath}`);

        // 1. 解析 Markdown
        progress.report({ message: "正在解析 Markdown...", increment: 10 });
        const markdownText = document.getText();
        log(`文档长度: ${markdownText.length} 字符`);
        const processor = getProcessor();
        const ast = processor.parse(markdownText);
        log(`AST 解析完成: ${ast.children.length} 个顶层节点`);

        if (token.isCancellationRequested) { log("用户取消"); return undefined; }

        // 2. 收集并解析图片
        progress.report({ message: "正在处理图片...", increment: 20 });
        const imageUrls = collectImageUrls(ast);
        log(`发现 ${imageUrls.length} 张图片引用`);
        const { resolveImages } = await import("./image-resolver.js");
        const { images, warnings } = await resolveImages(imageUrls, document.uri, token);
        log(`图片处理完成: ${images.size} 张成功, ${warnings.length} 张警告`);
        for (const w of warnings) {
          log(`  图片警告: [${w.reason}] ${w.url}`);
        }

        if (token.isCancellationRequested) { log("用户取消"); return undefined; }

        // 3. 生成 DOCX Document
        progress.report({ message: "正在生成 DOCX...", increment: 30 });
        const exporter = (await getExporter())!;
        const fidelity: string[] = [];
        const doc = exporter.convertToDocx(ast, images, fidelity);
        log("DOCX Document 对象生成完成");
        for (const f of fidelity) {
          log(`  保真降级: ${f}`);
        }

        if (token.isCancellationRequested) { log("用户取消"); return undefined; }

        // 4. 打包并写入文件
        progress.report({ message: "正在写入文件...", increment: 30 });
        const buffer = await exporter.packToBuffer(doc);
        // 打包可能耗时数秒（图片多时）；此处再查一次取消，避免用户点了取消
        // 后仍写盘 + 弹"已导出"成功通知，让取消看起来被忽略。
        if (token.isCancellationRequested) { log("用户取消"); return undefined; }
        await vscode.workspace.fs.writeFile(outputUri, buffer);
        log(`文件已写入: ${buffer.length} 字节`);

        // 5. 记住导出目录
        await context.workspaceState.update("lastExportDirectory", path.dirname(outputUri.fsPath));

        progress.report({ increment: 10 });
        return { bytes: buffer.length, warnings, fidelity };
      },
    );
  } catch (err) {
    logError("导出失败", err);
    const errMsg = err instanceof Error ? err.message : String(err);
    const action = await vscode.window.showErrorMessage(
      `导出失败: ${errMsg}`,
      "查看日志",
    );
    if (action === "查看日志") {
      getOutputChannel().show();
    }
    return;
  }

  if (!outcome) return; // 用户取消，静默收尾

  // 成功通知（此时进度通知已自动关闭）
  const sizeStr = outcome.bytes >= 1024 * 1024
    ? `${(outcome.bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${(outcome.bytes / 1024).toFixed(1)} KB`;

  const baseMsg = `已导出: ${path.basename(outputUri.fsPath)} (${sizeStr})`;
  const issues: string[] = [
    ...outcome.fidelity,
    ...outcome.warnings.map(describeImageWarning),
  ];
  log(`导出成功: ${baseMsg}${issues.length ? `，${issues.length} 处未完整呈现` : ""}`);

  // 打开/定位动作（交互模式才提供按钮）
  const openActions = async (action: string | undefined) => {
    try {
      if (action === "打开文件") {
        await vscode.env.openExternal(outputUri);
      } else if (action === "在文件管理器中显示") {
        await vscode.commands.executeCommand("revealFileInOS", outputUri);
      } else if (action === "查看详情") {
        getOutputChannel().show();
      }
    } catch (err) {
      logError("打开导出文件失败", err);
      vscode.window.showErrorMessage(
        `无法打开文件: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  if (issues.length === 0) {
    if (opts.quick) {
      vscode.window.showInformationMessage(baseMsg); // 静默成功：无按钮
      return;
    }
    await openActions(await vscode.window.showInformationMessage(
      baseMsg,
      "打开文件",
      "在文件管理器中显示",
    ));
    return;
  }

  // 保真告警：降级/未呈现内容明示给用户，完整清单在输出通道
  const head = issues[0];
  const message = `${baseMsg}，但 ${issues.length} 处内容未完整呈现：${head}${issues.length > 1 ? " 等" : ""}`;
  if (opts.quick) {
    await openActions(await vscode.window.showWarningMessage(message, "查看详情"));
    return;
  }
  await openActions(await vscode.window.showWarningMessage(
    message,
    "打开文件",
    "查看详情",
  ));
}
