/**
 * 图片读取与尺寸解析——纯模块。
 *
 * 零 VS Code API 依赖：文件 IO 通过 ImageIo 参数化注入，
 * 可在仓库外加载、可直接单元测试。
 */
import { PAGE, IMAGE } from "./constants";

/** 参数化的文件 IO（生产环境注入 vscode.workspace.fs 实现，测试注入 fake）。
 * 方法允许同步或异步返回，统一在消费端 await。 */
export interface ImageIo {
  exists(path: string): boolean | Promise<boolean>;
  readFile(path: string): Buffer | Promise<Buffer>;
}

export interface ResolvedImage {
  buffer: Buffer;
  width: number;
  height: number;
  /** 由文件头魔数判定的真实格式，供 docx ImageRun 使用 */
  format: "png" | "jpg";
}

/** 1 px（96 DPI）对应的 EMU（English Metric Unit） */
export const EMU_PER_PX = 9525;
/** 版心宽度对应的 EMU（1 EMU = 1/914400 英寸） */
export const PRINT_AREA_WIDTH_EMU = Math.round(PAGE.PRINT_AREA_WIDTH_MM * 36000);

/**
 * 从 PNG/JPEG buffer 中快速读取图片尺寸（不依赖外部库）。
 * 返回 [width, height] 或 undefined（格式不支持时）。
 */
export function readImageDimensions(buffer: Buffer): [number, number] | undefined {
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

/** 读取图片文件 buffer；文件不存在返回 undefined，读取失败抛原始错误（不吞） */
export async function readImageBuffer(path: string, io: ImageIo): Promise<Buffer | undefined> {
  if (!(await io.exists(path))) return undefined;
  return io.readFile(path);
}

/**
 * 读取图片并解析尺寸：超宽时等比缩放到版心宽度 156mm，
 * 无法从文件头解析尺寸时使用 IMAGE 回退值。
 */
export async function dimensionsForPath(path: string, io: ImageIo): Promise<ResolvedImage | undefined> {
  const buffer = await readImageBuffer(path, io);
  if (!buffer) return undefined;

  const dims = readImageDimensions(buffer);
  let width = dims?.[0] ?? IMAGE.FALLBACK_WIDTH_PX;
  let height = dims?.[1] ?? IMAGE.FALLBACK_HEIGHT_PX;
  // JPEG SOI 魔数 → jpg；其余（含 PNG 与未知格式回退）按 png 嵌入
  const format: ResolvedImage["format"] =
    buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8 ? "jpg" : "png";

  // 等比缩放：宽度超过版心时缩小
  const widthEmu = width * EMU_PER_PX;
  if (widthEmu > PRINT_AREA_WIDTH_EMU) {
    const scale = PRINT_AREA_WIDTH_EMU / widthEmu;
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  return { buffer, width, height, format };
}
