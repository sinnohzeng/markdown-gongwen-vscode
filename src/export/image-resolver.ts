/**
 * 图片路径解析与读取。
 *
 * 复用现有的 resolveImageTarget 进行路径解析，
 * 每张图片独立 try/catch，单张失败不中断整体导出。
 */
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { PAGE } from "./constants";

export interface ResolvedImage {
  buffer: Buffer;
  width: number;
  height: number;
}

export interface ImageWarning {
  url: string;
  reason: string;
}

/** 版心宽度对应的 EMU（English Metric Unit，1 EMU = 1/914400 英寸） */
const PRINT_AREA_WIDTH_EMU = Math.round(PAGE.PRINT_AREA_WIDTH_MM * 36000);

/**
 * 从 PNG/JPEG buffer 中快速读取图片尺寸（不依赖外部库）。
 * 返回 [width, height] 或 undefined（格式不支持时）。
 */
function readImageDimensions(buffer: Buffer): [number, number] | undefined {
  // PNG: IHDR chunk starts at byte 16, width at 16, height at 20 (big-endian uint32)
  if (
    buffer.length >= 24 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
  }

  // JPEG: scan for SOF0 (0xFFC0) or SOF2 (0xFFC2) marker
  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length - 9) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      if (marker === 0xc0 || marker === 0xc2) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return [width, height];
      }
      const segmentLength = buffer.readUInt16BE(offset + 2);
      offset += 2 + segmentLength;
    }
  }

  return undefined;
}

/**
 * 解析 Markdown 文档中所有图片引用并读取 buffer。
 *
 * - 本地图片：读取文件 buffer + 解析尺寸
 * - 远程图片（http/https）：跳过，返回 warning
 * - 缺失图片：跳过，返回 warning
 * - 超宽图片：自动等比缩放到版心宽度 156mm
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
      if (!resolved || !fs.existsSync(resolved)) {
        warnings.push({ url: trimmed, reason: "not-found" });
        continue;
      }

      const buffer = fs.readFileSync(resolved);
      const dims = readImageDimensions(buffer);
      let width = dims?.[0] ?? 600;
      let height = dims?.[1] ?? 400;

      // 等比缩放：宽度超过版心时缩小
      const widthEmu = width * 9525; // px → EMU (1 px = 9525 EMU at 96 DPI)
      if (widthEmu > PRINT_AREA_WIDTH_EMU) {
        const scale = PRINT_AREA_WIDTH_EMU / widthEmu;
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      images.set(url, { buffer, width, height });
    } catch {
      warnings.push({ url: trimmed, reason: "read-error" });
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
