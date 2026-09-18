/**
 * constants 关键关系断言：数值之间的推导链一旦漂移立即红灯。
 */
import {
  PAGE,
  FONT_SIZE_PT,
  FONT_SIZE_HALF_PT,
  LINE_SPACING_PT,
  LINE_SPACING_TWIP,
  FIRST_LINE_INDENT_TWIP,
  CAPTION_SPACING_TWIP,
  CODE_LINE_SPACING_TWIP,
  LIST_NEST_INDENT_TWIP,
  TOC_LEVEL_INDENT_TWIP,
  TOC_TAB_STOP_TWIP,
  TOC_MARKER_PATTERN,
  IMAGE,
} from "../constants";

describe("GB/T 9704 常量", () => {
  it("版心尺寸等于纸面减边距", () => {
    expect(PAGE.PRINT_AREA_WIDTH_MM).toBe(PAGE.WIDTH_MM - PAGE.MARGIN_LEFT_MM - PAGE.MARGIN_RIGHT_MM);
    expect(PAGE.PRINT_AREA_HEIGHT_MM).toBe(PAGE.HEIGHT_MM - PAGE.MARGIN_TOP_MM - PAGE.MARGIN_BOTTOM_MM);
  });

  it("半磅值 = 磅值 × 2", () => {
    for (const key of Object.keys(FONT_SIZE_PT) as (keyof typeof FONT_SIZE_PT)[]) {
      expect(FONT_SIZE_HALF_PT[key]).toBe(FONT_SIZE_PT[key] * 2);
    }
  });

  it("行距 28pt = 560 twip，题注间距为半行", () => {
    expect(LINE_SPACING_TWIP).toBe(LINE_SPACING_PT * 20);
    expect(CAPTION_SPACING_TWIP).toBe(LINE_SPACING_TWIP / 2);
  });

  it("首行缩进 2 字符 = 2 × 三号字 × 20", () => {
    expect(FIRST_LINE_INDENT_TWIP).toBe(2 * FONT_SIZE_PT.BODY * 20);
    expect(LIST_NEST_INDENT_TWIP).toBe(FONT_SIZE_PT.BODY * 20);
  });

  it("代码块行距与字号为小一号规格", () => {
    expect(CODE_LINE_SPACING_TWIP).toBe(300);
    expect(FONT_SIZE_HALF_PT.CODE).toBe(20); // 五号 10pt
  });

  it("脚注小五 9pt，目录条目缩进 2 字，制表位在版心右缘", () => {
    expect(FONT_SIZE_HALF_PT.FOOTNOTE).toBe(18);
    expect(TOC_LEVEL_INDENT_TWIP).toBe(FIRST_LINE_INDENT_TWIP);
    expect(TOC_TAB_STOP_TWIP).toBe(Math.round(PAGE.PRINT_AREA_WIDTH_MM / 25.4 * 1440));
  });

  it("目录标记只匹配独占的 [TOC] / [[toc]]", () => {
    expect(TOC_MARKER_PATTERN.test("[TOC]")).toBe(true);
    expect(TOC_MARKER_PATTERN.test("[[toc]]")).toBe(true);
    expect(TOC_MARKER_PATTERN.test("[TOC] 见下")).toBe(false);
    expect(TOC_MARKER_PATTERN.test("[toc]]")).toBe(false);
    expect(TOC_MARKER_PATTERN.test("[[toc]")).toBe(false);
    expect(TOC_MARKER_PATTERN.test("toc")).toBe(false);
  });

  it("图片回退尺寸为正", () => {
    expect(IMAGE.FALLBACK_WIDTH_PX).toBeGreaterThan(0);
    expect(IMAGE.FALLBACK_HEIGHT_PX).toBeGreaterThan(0);
  });
});
