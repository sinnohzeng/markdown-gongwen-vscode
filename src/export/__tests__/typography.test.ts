import {
  CAPTION_SPACING_TWIP,
  CODE_LINE_SPACING_TWIP,
  FIRST_LINE_INDENT_TWIP,
  FONT_SIZE_PT,
  LINE_SPACING_TWIP,
  TOC_LEVEL_INDENT_TWIP,
} from "../constants";
import { resolveDocxTypography } from "../typography";

describe("DOCX 排版参数解析", () => {
  it("缺省值完整保留现有 GB/T 9704 版式", () => {
    const resolved = resolveDocxTypography();

    expect(resolved.charsPerLine).toBe(28);
    expect(resolved.fonts.body).toEqual({
      eastAsia: "FangSong",
      ascii: "Times New Roman",
      hAnsi: "Times New Roman",
    });
    expect(resolved.fonts.title.eastAsia).toBe("FZXiaoBiaoSong-B05S");
    expect(resolved.fonts.code).toEqual({
      eastAsia: "SimSun",
      ascii: "Consolas",
      hAnsi: "Consolas",
    });
    expect(resolved.fontSizesPt.body).toBe(FONT_SIZE_PT.BODY);
    expect(resolved.lineSpacingTwip).toBe(LINE_SPACING_TWIP);
    expect(resolved.firstLineIndentTwip).toBe(FIRST_LINE_INDENT_TWIP);
    expect(resolved.captionSpacingTwip).toBe(CAPTION_SPACING_TWIP);
    expect(resolved.codeLineSpacingTwip).toBe(CODE_LINE_SPACING_TWIP);
    expect(resolved.tocLevelIndentTwip).toBe(TOC_LEVEL_INDENT_TWIP);
  });

  it("按版心、每行字数和正文字号计算真实字符网格", () => {
    // A4 版心 8844 twip：(8844 / 20 / 28 - 16) × 4096 ≈ -848。
    expect(resolveDocxTypography().docGridCharSpace).toBe(-848);
    expect(resolveDocxTypography({ charsPerLine: 30, fontSizesPt: { body: 18 } }).docGridCharSpace)
      .toBe(-13353);
  });

  it("只覆盖指定字体角色和槽位，其余槽位沿用默认值", () => {
    const resolved = resolveDocxTypography({
      fonts: {
        body: { eastAsia: "  Source Han Serif SC  ", ascii: "Body Latin" },
        heading1: { eastAsia: "Heading CJK" },
      },
    });

    expect(resolved.fonts.body).toEqual({
      eastAsia: "Source Han Serif SC",
      ascii: "Body Latin",
      hAnsi: "Times New Roman",
    });
    expect(resolved.fonts.heading1).toEqual({
      eastAsia: "Heading CJK",
      ascii: "Arial",
      hAnsi: "Arial",
    });
    expect(resolved.fonts.heading2.eastAsia).toBe("KaiTi");
  });

  it("派生半磅字号、固定行距、缩进和代码行距", () => {
    const resolved = resolveDocxTypography({
      fontSizesPt: { body: 18, title: 22, code: 10.5 },
      lineSpacingPt: 30,
      firstLineIndentChars: 1.5,
    });

    expect(resolved.fontSizeHalfPt.body).toBe(36);
    expect(resolved.fontSizeHalfPt.title).toBe(44);
    expect(resolved.lineSpacingTwip).toBe(600);
    expect(resolved.captionSpacingTwip).toBe(300);
    expect(resolved.firstLineIndentTwip).toBe(540);
    expect(resolved.codeLineSpacingTwip).toBe(315);
    expect(resolved.listNestIndentTwip).toBe(360);
    expect(resolved.tocLevelIndentTwip).toBe(720);
  });

  it("正文首行缩进为 0 时仍保留目录层级缩进", () => {
    const resolved = resolveDocxTypography({ firstLineIndentChars: 0 });
    expect(resolved.firstLineIndentTwip).toBe(0);
    expect(resolved.tocLevelIndentTwip).toBe(640);
  });

  it.each([
    [{ fontSizesPt: { body: 0 } }, "字号 body"],
    [{ fontSizesPt: { body: Number.NaN } }, "字号 body"],
    [{ fontSizesPt: { body: 16.25 } }, "字号 body"],
    [{ charsPerLine: 28.5 }, "每行字数"],
    [{ charsPerLine: 0 }, "每行字数"],
    [{ lineSpacingPt: 5.5 }, "固定行距"],
    [{ lineSpacingPt: 28.25 }, "固定行距"],
    [{ firstLineIndentChars: -0.5 }, "首行缩进字符数"],
    [{ firstLineIndentChars: 1.25 }, "首行缩进字符数"],
  ])("拒绝非法数值 %j", (overrides, message) => {
    expect(() => resolveDocxTypography(overrides)).toThrow(message);
  });

  it.each([
    [{ body: { eastAsia: "" } }, "body.eastAsia"],
    [{ body: { ascii: "   " } }, "body.ascii"],
    [{ code: { hAnsi: "" } }, "code.hAnsi"],
  ])("拒绝空字体 %j", (fonts, message) => {
    expect(() => resolveDocxTypography({ fonts })).toThrow(message);
  });
});
