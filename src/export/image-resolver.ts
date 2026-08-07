/**
 * 图片路径解析（VS Code 侧）+ 委托纯模块读取/量尺寸。
 *
 * 路径解析依赖 VS Code Uri，留在本模块；文件读取与尺寸解析在
 * ./image-dimensions 纯模块中（参数化 IO，可仓库外加载、可单测）。
 * 每张图片独立 try/catch，单张失败不中断整体导出，失败原因透明携带。
 */
import * as vscode from "vscode";
import * as path from "path";
import { dimensionsForPath, type ImageIo, type ResolvedImage } from "./image-dimensions";

export type { ResolvedImage } from "./image-dimensions";

export interface ImageWarning {
  url: string;
  reason: string;
}

/** 基于 vscode.workspace.fs 的 ImageIo 实现：Remote-SSH / WSL 等场景下
 * 通过 VS Code 文件系统提供方读取，而不是 Node fs 直读本地磁盘
 *（后者会把远程文件当"不存在"静默丢图）。 */
const workspaceIo: ImageIo = {
  exists: async (p: string) => {
    try {
      await vscode.workspace.fs.stat(vscode.Uri.file(p));
      return true;
    } catch {
      return false;
    }
  },
  readFile: async (p: string) => Buffer.from(await vscode.workspace.fs.readFile(vscode.Uri.file(p))),
};

/**
 * 解析 Markdown 文档中所有图片引用并读取 buffer。
 *
 * - 本地图片：读取文件 buffer + 解析尺寸（超宽自动等比缩放到版心 156mm）
 * - 远程图片（http/https）：跳过，返回 warning
 * - 缺失图片：跳过，返回 warning
 */
export async function resolveImages(
  imageUrls: string[],
  documentUri: vscode.Uri,
  token?: vscode.CancellationToken,
): Promise<{ images: Map<string, ResolvedImage>; warnings: ImageWarning[] }> {
  const images = new Map<string, ResolvedImage>();
  const warnings: ImageWarning[] = [];

  for (const url of imageUrls) {
    if (token?.isCancellationRequested) break;

    const trimmed = url.trim();
    if (!trimmed) continue;

    // 远程图片：不下载
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      warnings.push({ url: trimmed, reason: "remote" });
      continue;
    }

    // data URI：不处理
    if (trimmed.startsWith("data:")) {
      warnings.push({ url: trimmed, reason: "data-uri" });
      continue;
    }

    try {
      const resolved = resolveLocalPath(trimmed, documentUri);
      if (!resolved) {
        warnings.push({ url: trimmed, reason: "not-found" });
        continue;
      }

      const entry = await dimensionsForPath(resolved, workspaceIo);
      if (!entry) {
        warnings.push({ url: trimmed, reason: "not-found" });
        continue;
      }

      images.set(url, entry);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      warnings.push({ url: trimmed, reason: `read-error: ${detail}` });
    }
  }

  return { images, warnings };
}

function resolveLocalPath(
  url: string,
  documentUri: vscode.Uri,
): string | undefined {
  const trimmed = url.trim();

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  if (trimmed.startsWith("file:")) {
    try {
      return vscode.Uri.parse(trimmed).fsPath;
    } catch {
      return undefined;
    }
  }

  // 相对路径：相对于文档所在目录
  const docDir = path.dirname(documentUri.fsPath);
  return path.resolve(docDir, trimmed);
}
