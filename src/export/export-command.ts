/**
 * VS Code 命令处理器 —— 编排 DOCX 导出的完整 UX 流程。
 *
 * 职责：对话框、进度条、取消、通知。
 * 不包含任何转换逻辑（委托给 ast-to-docx）。
 */
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import type { Root, Image, Content } from "mdast";

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
    _exporter = await import("./ast-to-docx");
  }
  return _exporter;
}

// ── remark 处理器（独立于扩展主 parser，带 frontmatter 支持）──

let _processor: { parse: (text: string) => Root } | undefined;

function getProcessor(): { parse: (text: string) => Root } {
  if (!_processor) {
    const { unified } = require("unified");
    const remarkParse = require("remark-parse");
    const remarkGfm = require("remark-gfm");
    const remarkFrontmatter = require("remark-frontmatter");

    const proc = unified()
      .use(remarkParse.default ?? remarkParse)
      .use(remarkGfm.default ?? remarkGfm)
      .use(remarkFrontmatter.default ?? remarkFrontmatter);

    _processor = { parse: (text: string) => proc.parse(text) as Root };
  }
  return _processor;
}

// ── 提取 AST 中所有图片 URL ─────────────────────

function collectImageUrls(node: Content | Root): string[] {
  const urls: string[] = [];

  if (node.type === "image") {
    urls.push((node as Image).url);
  }

  if ("children" in node && Array.isArray(node.children)) {
    for (const child of node.children as Content[]) {
      urls.push(...collectImageUrls(child));
    }
  }

  return urls;
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
    if (!["markdown", "md", "mdx", "markdoc", "mdc", "juliamarkdown", "rmarkdown"].includes(langId)) {
      vscode.window.showWarningMessage("请在 Markdown 文件中使用此命令。");
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

    // 带进度条导出
    await doExport(editor.document, uri, context);
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
    if (!["markdown", "md", "mdx", "markdoc", "mdc", "juliamarkdown", "rmarkdown"].includes(langId)) {
      vscode.window.showWarningMessage("请在 Markdown 文件中使用此命令。");
      return;
    }

    const docPath = editor.document.fileName;
    const outputPath = docPath.replace(/\.(md|markdown|mdx|mdc|markdoc)$/i, "") + ".docx";
    const outputUri = vscode.Uri.file(outputPath);

    // 文件已存在：确认覆盖
    if (fs.existsSync(outputPath)) {
      const overwrite = await vscode.window.showWarningMessage(
        `文件 ${path.basename(outputPath)} 已存在，是否覆盖？`,
        "覆盖",
        "取消",
      );
      if (overwrite !== "覆盖") return;
    }

    await doExport(editor.document, outputUri, context);
  };
}

// ── 核心导出流程 ────────────────────────────────

async function doExport(
  document: vscode.TextDocument,
  outputUri: vscode.Uri,
  context: vscode.ExtensionContext,
): Promise<void> {
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "导出公文 DOCX",
      cancellable: true,
    },
    async (progress, token) => {
      try {
        log(`开始导出: ${document.fileName} → ${outputUri.fsPath}`);

        // 1. 解析 Markdown
        progress.report({ message: "正在解析 Markdown...", increment: 10 });
        const markdownText = document.getText();
        log(`文档长度: ${markdownText.length} 字符`);
        const processor = getProcessor();
        const ast = processor.parse(markdownText);
        log(`AST 解析完成: ${ast.children.length} 个顶层节点`);

        if (token.isCancellationRequested) { log("用户取消"); return; }

        // 2. 收集并解析图片
        progress.report({ message: "正在处理图片...", increment: 20 });
        const imageUrls = collectImageUrls(ast);
        log(`发现 ${imageUrls.length} 张图片引用`);
        const { resolveImages } = await import("./image-resolver");
        const { images, warnings } = await resolveImages(imageUrls, document.uri, token);
        log(`图片处理完成: ${images.size} 张成功, ${warnings.length} 张警告`);
        for (const w of warnings) {
          log(`  图片警告: [${w.reason}] ${w.url}`);
        }

        if (token.isCancellationRequested) { log("用户取消"); return; }

        // 3. 生成 DOCX Document
        progress.report({ message: "正在生成 DOCX...", increment: 30 });
        const exporter = await getExporter();
        const doc = exporter.convertToDocx(ast, images);
        log("DOCX Document 对象生成完成");

        if (token.isCancellationRequested) { log("用户取消"); return; }

        // 4. 打包并写入文件
        progress.report({ message: "正在写入文件...", increment: 30 });
        const buffer = await exporter.packToBuffer(doc);
        fs.writeFileSync(outputUri.fsPath, buffer);
        log(`文件已写入: ${buffer.length} 字节`);

        // 5. 记住导出目录
        await context.workspaceState.update("lastExportDirectory", path.dirname(outputUri.fsPath));

        // 6. 成功通知
        const fileSize = (buffer.length / 1024).toFixed(1);
        const sizeStr = buffer.length >= 1024 * 1024
          ? `${(buffer.length / (1024 * 1024)).toFixed(1)} MB`
          : `${fileSize} KB`;

        let message = `已导出: ${path.basename(outputUri.fsPath)} (${sizeStr})`;
        if (warnings.length > 0) {
          message += `，${warnings.length} 张图片未加载`;
        }

        log(`导出成功: ${message}`);

        const action = await vscode.window.showInformationMessage(
          message,
          "打开文件",
          "在文件管理器中显示",
        );

        if (action === "打开文件") {
          await vscode.env.openExternal(outputUri);
        } else if (action === "在文件管理器中显示") {
          await vscode.commands.executeCommand("revealFileInOS", outputUri);
        }
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
      }
    },
  );
}
