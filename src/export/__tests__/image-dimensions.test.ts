/**
 * image-dimensions 纯模块单测（项14 解耦产物）。
 * 文件 IO 用 fake 注入，不触碰真实磁盘、不依赖 VS Code。
 */
import {
  readImageDimensions,
  readImageBuffer,
  dimensionsForPath,
  PRINT_AREA_WIDTH_EMU,
  EMU_PER_PX,
  type ImageIo,
} from "../image-dimensions";
import { IMAGE } from "../constants";

/** 构造最小合法 PNG 头（IHDR 指定宽高，big-endian uint32） */
function pngBuffer(width: number, height: number): Buffer {
  const b = Buffer.alloc(24);
  b[0] = 0x89; b[1] = 0x50; b[2] = 0x4e; b[3] = 0x47;
  b.writeUInt32BE(width, 16);
  b.writeUInt32BE(height, 20);
  return b;
}

/** 构造最小 JPEG 头（SOI + SOF0 段）。实现自段起始读：marker@+1、segLen@+2、height@+5、width@+7 */
function jpegBuffer(width: number, height: number): Buffer {
  const b = Buffer.alloc(16);
  b[0] = 0xff; b[1] = 0xd8; // SOI
  b[2] = 0xff; b[3] = 0xc0; // SOF0 marker（段起始 = offset 2）
  b.writeUInt16BE(9, 4);    // segment length
  b.writeUInt16BE(height, 7);
  b.writeUInt16BE(width, 9);
  return b;
}

function fakeIo(files: Record<string, Buffer>): ImageIo {
  return {
    exists: (p: string) => p in files,
    readFile: (p: string) => {
      if (!(p in files)) throw new Error(`ENOENT: ${p}`);
      return files[p];
    },
  };
}

describe("readImageDimensions", () => {
  it("解析 PNG IHDR 宽高", () => {
    expect(readImageDimensions(pngBuffer(800, 600))).toEqual([800, 600]);
  });

  it("解析 JPEG SOF0 宽高", () => {
    expect(readImageDimensions(jpegBuffer(1024, 768))).toEqual([1024, 768]);
  });

  it("未知格式返回 undefined", () => {
    expect(readImageDimensions(Buffer.from("GIF89a...."))).toBeUndefined();
  });
});

describe("readImageBuffer / dimensionsForPath", () => {
  it("文件不存在返回 undefined", async () => {
    const io = fakeIo({});
    expect(await readImageBuffer("/nope.png", io)).toBeUndefined();
    expect(await dimensionsForPath("/nope.png", io)).toBeUndefined();
  });

  it("尺寸正常读取", async () => {
    const io = fakeIo({ "/a.png": pngBuffer(300, 200) });
    const r = await dimensionsForPath("/a.png", io);
    expect(r).toMatchObject({ width: 300, height: 200 });
    expect(r?.buffer.length).toBe(24);
  });

  it("无法解析尺寸时使用 IMAGE 回退值（超版心时等比缩放）", async () => {
    const io = fakeIo({ "/b.bin": Buffer.alloc(64, 0x41) }); // 'A'×64，非 PNG/JPEG
    const r = await dimensionsForPath("/b.bin", io);
    const scale = Math.min(1, PRINT_AREA_WIDTH_EMU / (IMAGE.FALLBACK_WIDTH_PX * EMU_PER_PX));
    expect(r).toMatchObject({
      width: Math.round(IMAGE.FALLBACK_WIDTH_PX * scale),
      height: Math.round(IMAGE.FALLBACK_HEIGHT_PX * scale),
    });
  });

  it("超宽图片等比缩放到版心宽度", async () => {
    const maxPx = Math.floor(PRINT_AREA_WIDTH_EMU / EMU_PER_PX);
    const io = fakeIo({ "/wide.png": pngBuffer(maxPx * 2, 1000) });
    const r = await dimensionsForPath("/wide.png", io);
    expect(r?.width).toBeLessThanOrEqual(maxPx + 1); // 四舍五入误差 ±1
    // 等比：高度按同比例缩放（1000 × scale ≈ 500，四舍五入误差 ±1）
    expect(r?.height).toBeGreaterThanOrEqual(499);
    expect(r?.height).toBeLessThanOrEqual(501);
  });

  it("读取失败抛出原始错误（不吞）", async () => {
    const io: ImageIo = {
      exists: () => true,
      readFile: () => { throw new Error("EACCES: permission denied"); },
    };
    await expect(readImageBuffer("/locked.png", io)).rejects.toThrow("EACCES");
  });
});
