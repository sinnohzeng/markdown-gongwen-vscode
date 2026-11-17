import { convertMillimetersToTwip } from "docx";
import {
  CHARS_PER_LINE,
  CODE_FONT_SIZE_PT,
  FIRST_LINE_INDENT_CHARS,
  XiaoBiaoSong,
  HeiTi,
  KaiTi,
  FangSong,
  CaptionFont,
  SongTi,
  CodeFont,
  FONT_SIZE_PT,
  LINE_SPACING_PT,
  PAGE,
} from "./constants";

/** OOXML 字体槽位；东亚文字与拉丁文字可分别指定。 */
export interface DocxFont {
  eastAsia: string;
  ascii: string;
  hAnsi?: string;
  cs?: string;
}

export const DOCX_FONT_ROLES = [
  "body",
  "title",
  "heading1",
  "heading2",
  "heading3",
  "emphasis",
  "tableHeader",
  "caption",
  "pageNumber",
  "code",
] as const;

export type DocxFontRole = (typeof DOCX_FONT_ROLES)[number];

export const DOCX_FONT_SIZE_ROLES = [
  "title",
  "heading",
  "body",
  "pageNumber",
  "table",
  "caption",
  "footnote",
  "code",
] as const;

export type DocxFontSizeRole = (typeof DOCX_FONT_SIZE_ROLES)[number];

/** 用户侧可选覆盖项；缺省值始终由 GB/T 9704 常量补齐。 */
export interface DocxTypographyOverrides {
  fonts?: Partial<Record<DocxFontRole, Partial<DocxFont>>>;
  fontSizesPt?: Partial<Record<DocxFontSizeRole, number>>;
  charsPerLine?: number;
  lineSpacingPt?: number;
  firstLineIndentChars?: number;
}

/** 转换层使用的完整排版参数，避免在样式函数中重复换算和读取配置。 */
export interface ResolvedDocxTypography {
  fonts: Record<DocxFontRole, DocxFont>;
  fontSizesPt: Record<DocxFontSizeRole, number>;
  fontSizeHalfPt: Record<DocxFontSizeRole, number>;
  charsPerLine: number;
  lineSpacingPt: number;
  lineSpacingTwip: number;
  firstLineIndentTwip: number;
  captionSpacingTwip: number;
  codeLineSpacingTwip: number;
  listNestIndentTwip: number;
  tocLevelIndentTwip: number;
  docGridCharSpace: number;
}

const DEFAULT_FONTS: Record<DocxFontRole, DocxFont> = {
  body: FangSong,
  title: XiaoBiaoSong,
  heading1: HeiTi,
  heading2: KaiTi,
  heading3: FangSong,
  emphasis: KaiTi,
  tableHeader: HeiTi,
  caption: CaptionFont,
  pageNumber: SongTi,
  code: CodeFont,
};

const DEFAULT_FONT_SIZES_PT: Record<DocxFontSizeRole, number> = {
  title: FONT_SIZE_PT.TITLE,
  heading: FONT_SIZE_PT.HEADING,
  body: FONT_SIZE_PT.BODY,
  pageNumber: FONT_SIZE_PT.PAGE_NUMBER,
  table: FONT_SIZE_PT.TABLE_CELL,
  caption: FONT_SIZE_PT.CAPTION,
  footnote: FONT_SIZE_PT.FOOTNOTE,
  code: CODE_FONT_SIZE_PT,
};

function readNumber(
  value: number | undefined,
  fallback: number,
  name: string,
  minimum: number,
  maximum: number,
  step?: number,
): number {
  const resolved = value === undefined ? fallback : value;
  if (
    typeof resolved !== "number" ||
    !Number.isFinite(resolved) ||
    resolved < minimum ||
    resolved > maximum ||
    (step !== undefined && Math.abs(resolved / step - Math.round(resolved / step)) > 1e-9)
  ) {
    const stepText = step === undefined ? "" : `，且必须是 ${step} 的倍数`;
    throw new Error(`${name} 必须在 ${minimum}–${maximum} 之间${stepText}`);
  }
  return resolved;
}

function readFont(role: DocxFontRole, override?: Partial<DocxFont>): DocxFont {
  const defaultFont = DEFAULT_FONTS[role];
  const merged: DocxFont = {
    ...defaultFont,
    ...override,
    hAnsi: override?.hAnsi ?? defaultFont.hAnsi ?? override?.ascii ?? defaultFont.ascii,
  };

  for (const key of ["eastAsia", "ascii", "hAnsi", "cs"] as const) {
    const value = merged[key];
    if (value !== undefined && (typeof value !== "string" || value.trim().length === 0)) {
      throw new Error(`字体 ${role}.${key} 不能为空`);
    }
    if (typeof value === "string") {
      merged[key] = value.trim();
    }
  }
  return merged;
}

/**
 * 合并并校验 DOCX 排版参数。
 *
 * `docGridCharSpace` 按 ECMA-376 的定义，以 Normal（正文）字号为基准：
 * `(版心宽度 / 每行字数 - 正文字号) × 4096`。
 */
export function resolveDocxTypography(
  overrides: DocxTypographyOverrides = {},
): ResolvedDocxTypography {
  const fonts = Object.fromEntries(
    DOCX_FONT_ROLES.map((role) => [role, readFont(role, overrides.fonts?.[role])]),
  ) as Record<DocxFontRole, DocxFont>;

  const fontSizesPt = Object.fromEntries(
    DOCX_FONT_SIZE_ROLES.map((role) => [
      role,
      readNumber(overrides.fontSizesPt?.[role], DEFAULT_FONT_SIZES_PT[role], `字号 ${role}`, 6, 72, 0.5),
    ]),
  ) as Record<DocxFontSizeRole, number>;

  const fontSizeHalfPt = Object.fromEntries(
    DOCX_FONT_SIZE_ROLES.map((role) => [role, Math.round(fontSizesPt[role] * 2)]),
  ) as Record<DocxFontSizeRole, number>;

  const charsPerLine = readNumber(overrides.charsPerLine, CHARS_PER_LINE, "每行字数", 1, 100, 1);
  const lineSpacingPt = readNumber(overrides.lineSpacingPt, LINE_SPACING_PT, "固定行距", 6, 144, 0.5);
  const firstLineIndentChars = readNumber(
    overrides.firstLineIndentChars,
    FIRST_LINE_INDENT_CHARS,
    "首行缩进字符数",
    0,
    10,
    0.5,
  );

  const printableWidthTwip =
    convertMillimetersToTwip(PAGE.WIDTH_MM) -
    convertMillimetersToTwip(PAGE.MARGIN_LEFT_MM) -
    convertMillimetersToTwip(PAGE.MARGIN_RIGHT_MM);
  const desiredCharacterPitchPt = printableWidthTwip / 20 / charsPerLine;
  const lineSpacingTwip = Math.round(lineSpacingPt * 20);
  const firstLineIndentTwip = Math.round(firstLineIndentChars * fontSizesPt.body * 20);

  return {
    fonts,
    fontSizesPt,
    fontSizeHalfPt,
    charsPerLine,
    lineSpacingPt,
    lineSpacingTwip,
    firstLineIndentTwip,
    captionSpacingTwip: Math.round(lineSpacingTwip / 2),
    codeLineSpacingTwip: Math.round(fontSizesPt.code * 30),
    listNestIndentTwip: Math.round(fontSizesPt.body * 20),
    tocLevelIndentTwip: Math.round(2 * fontSizesPt.body * 20),
    docGridCharSpace: Math.round((desiredCharacterPitchPt - fontSizesPt.body) * 4096),
  };
}
