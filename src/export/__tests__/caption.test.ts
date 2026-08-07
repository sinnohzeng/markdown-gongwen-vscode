/**
 * caption.ts 单一权威源测试。
 * 直接断言匹配/构造函数，与实现共用同一导出（防双源漂移）。
 */
import { CAPTION_NUMBER_PATTERN, CAPTION_SEPARATOR, buildCaptionText } from "../caption";

describe("题注匹配单一源", () => {
  it("编号与题注间隔为 1 个全角空格", () => {
    expect(CAPTION_SEPARATOR).toBe("\u3000");
  });

  it("图题：匹配“图N 标题”并规范为一字空", () => {
    expect(buildCaptionText("图1 总体架构", "图")).toBe("图1\u3000总体架构");
    expect(buildCaptionText("图 2 数据流", "图")).toBe("图2\u3000数据流");
  });

  it("表题：匹配“表N 标题”并规范为一字空", () => {
    expect(buildCaptionText("表1 五年成本对照", "表")).toBe("表1\u3000五年成本对照");
  });

  it("只有编号无标题时输出裸编号", () => {
    expect(buildCaptionText("图3", "图")).toBe("图3");
    expect(buildCaptionText("表 4", "表")).toBe("表4");
  });

  it("末尾标点不保留语义：整串作为题注文字原样 trim", () => {
    expect(buildCaptionText("图5  趋势图  ", "图")).toBe("图5\u3000趋势图");
  });

  it("不以 图/表+数字 开头时不匹配", () => {
    expect(buildCaptionText("如图所示", "图")).toBeNull();
    expect(buildCaptionText("表N 占位", "表")).toBeNull();
    expect(buildCaptionText("附图1 示意", "图")).toBeNull();
  });

  it("图/表模式互不串用由调用方按 kind 指定", () => {
    expect(CAPTION_NUMBER_PATTERN.图.test("图1 标题")).toBe(true);
    expect(CAPTION_NUMBER_PATTERN.表.test("图1 标题")).toBe(false);
  });
});
