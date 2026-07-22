/**
 * image-resolver 单元测试。
 *
 * 用临时目录里的最小 PNG/JPEG 头字节做夹具——readImageDimensions 只读头部，
 * 不需要完整合法图片。
 */
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { Uri, CancellationToken } from "../../test/__mocks__/vscode";
import { resolveImages } from "../image-resolver";

/** 构造带 IHDR 尺寸的最小 PNG 头（24 字节以上即可被解析） */
function pngBuffer(width: number, height: number): Buffer {
  const buf = Buffer.alloc(32);
  buf[0] = 0x89; buf[1] = 0x50; buf[2] = 0x4e; buf[3] = 0x47;
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  return buf;
}

/** 构造带 SOF0 段的最小 JPEG 头 */
function jpegBuffer(width: number, height: number): Buffer {
  const buf = Buffer.alloc(32);
  buf[0] = 0xff; buf[1] = 0xd8;          // SOI
  buf[2] = 0xff; buf[3] = 0xc0;          // SOF0 marker
  buf.writeUInt16BE(20, 4);              // segment length
  buf.writeUInt16BE(height, 7);
  buf.writeUInt16BE(width, 9);
  return buf;
}

describe("resolveImages", () => {
  let tmpDir: string;
  let docUri: InstanceType<typeof Uri>;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gongwen-img-"));
    docUri = Uri.file(path.join(tmpDir, "doc.md"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("远程图片跳过并给出 remote 警告", async () => {
    const { images, warnings } = await resolveImages(
      ["https://example.com/a.png", "http://example.com/b.png"],
      docUri as never,
    );
    expect(images.size).toBe(0);
    expect(warnings).toEqual([
      { url: "https://example.com/a.png", reason: "remote" },
      { url: "http://example.com/b.png", reason: "remote" },
    ]);
  });

  it("data URI 跳过并给出 data-uri 警告", async () => {
    const { warnings } = await resolveImages(
      ["data:image/png;base64,AAAA"],
      docUri as never,
    );
    expect(warnings).toEqual([
      { url: "data:image/png;base64,AAAA", reason: "data-uri" },
    ]);
  });

  it("缺失文件给出 not-found 警告", async () => {
    const { images, warnings } = await resolveImages(
      ["missing.png"],
      docUri as never,
    );
    expect(images.size).toBe(0);
    expect(warnings).toEqual([{ url: "missing.png", reason: "not-found" }]);
  });

  it("空 URL 直接忽略，不产生警告", async () => {
    const { images, warnings } = await resolveImages(["  ", ""], docUri as never);
    expect(images.size).toBe(0);
    expect(warnings).toEqual([]);
  });

  it("解析相对路径 PNG 并读出尺寸", async () => {
    fs.writeFileSync(path.join(tmpDir, "pic.png"), pngBuffer(100, 50));
    const { images, warnings } = await resolveImages(["pic.png"], docUri as never);
    expect(warnings).toEqual([]);
    const img = images.get("pic.png");
    expect(img?.width).toBe(100);
    expect(img?.height).toBe(50);
  });

  it("解析 JPEG 尺寸", async () => {
    fs.writeFileSync(path.join(tmpDir, "pic.jpg"), jpegBuffer(200, 80));
    const { images } = await resolveImages(["pic.jpg"], docUri as never);
    expect(images.get("pic.jpg")?.width).toBe(200);
    expect(images.get("pic.jpg")?.height).toBe(80);
  });

  it("未知格式回退到默认 600×400（超版心部分等比缩小）", async () => {
    fs.writeFileSync(path.join(tmpDir, "pic.bin"), Buffer.alloc(64, 1));
    const { images } = await resolveImages(["pic.bin"], docUri as never);
    const img = images.get("pic.bin")!;
    // 默认 600×400，600px 略超版心上限（约 589px），等比缩小后比例保持 2:3
    expect(img.width).toBeLessThanOrEqual(590);
    expect(img.width).toBeGreaterThan(580);
    expect(Math.abs(img.height / img.width - 400 / 600)).toBeLessThan(0.01);
  });

  it("超宽图片等比缩放到版心宽度以内", async () => {
    fs.writeFileSync(path.join(tmpDir, "wide.png"), pngBuffer(5000, 1000));
    const { images } = await resolveImages(["wide.png"], docUri as never);
    const img = images.get("wide.png")!;
    // 版心 156mm = 5,616,000 EMU；1 px = 9525 EMU → 上限约 589 px
    expect(img.width).toBeLessThanOrEqual(590);
    // 等比：高/宽比例保持 1:5
    expect(Math.abs(img.height / img.width - 0.2)).toBeLessThan(0.01);
  });

  it("绝对路径直接读取", async () => {
    const abs = path.join(tmpDir, "abs.png");
    fs.writeFileSync(abs, pngBuffer(10, 10));
    const { images } = await resolveImages([abs], docUri as never);
    expect(images.get(abs)?.width).toBe(10);
  });

  it("取消令牌中断处理", async () => {
    fs.writeFileSync(path.join(tmpDir, "pic.png"), pngBuffer(10, 10));
    const token = new CancellationToken(true);
    const { images, warnings } = await resolveImages(
      ["pic.png"],
      docUri as never,
      token as never,
    );
    expect(images.size).toBe(0);
    expect(warnings).toEqual([]);
  });
});
