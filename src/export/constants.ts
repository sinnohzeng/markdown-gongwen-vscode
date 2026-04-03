/**
 * GB/T 9704-2012《党政机关公文格式》排版常量。
 *
 * 所有数值溯源到 docs/reference/gbt9704-typography.md。
 * docx 库使用 twip（1/20 磅 = 1/1440 英寸）和半磅（half-point）为单位。
 */

// ── 页面 ─────────────────────────────────────────

export const PAGE = {
  WIDTH_MM: 210,         // A4
  HEIGHT_MM: 297,        // A4
  MARGIN_TOP_MM: 37,
  MARGIN_BOTTOM_MM: 35,
  MARGIN_LEFT_MM: 28,
  MARGIN_RIGHT_MM: 26,
  /** 版心宽度 = 210 - 28 - 26 */
  PRINT_AREA_WIDTH_MM: 156,
  /** 版心高度 = 297 - 37 - 35 */
  PRINT_AREA_HEIGHT_MM: 225,
} as const;

// ── 字号（磅值 & docx 半磅值） ──────────────────

export const FONT_SIZE_PT = {
  /** 二号 */
  TITLE: 22,
  /** 三号（一/二/三/四级标题 & 正文共用） */
  HEADING: 16,
  /** 三号 */
  BODY: 16,
  /** 四号 */
  PAGE_NUMBER: 14,
  /** 四号（表格单元格） */
  TABLE_CELL: 14,
} as const;

/** docx 库 `size` 字段使用半磅为单位 */
export const FONT_SIZE_HALF_PT = {
  TITLE: (FONT_SIZE_PT.TITLE * 2) as 44,
  HEADING: (FONT_SIZE_PT.HEADING * 2) as 32,
  BODY: (FONT_SIZE_PT.BODY * 2) as 32,
  PAGE_NUMBER: (FONT_SIZE_PT.PAGE_NUMBER * 2) as 28,
  TABLE_CELL: (FONT_SIZE_PT.TABLE_CELL * 2) as 28,
} as const;

// ── 行距 & 段落 ─────────────────────────────────

/** 固定行距 28pt，实现每页 22 行 */
export const LINE_SPACING_PT = 28;
/** 28pt × 20 = 560 twip */
export const LINE_SPACING_TWIP = LINE_SPACING_PT * 20;
/** 首行缩进 2 字符 = 2 × 16pt × 20 = 640 twip */
export const FIRST_LINE_INDENT_TWIP = 2 * FONT_SIZE_PT.BODY * 20;

export const CHARS_PER_LINE = 28;
export const LINES_PER_PAGE = 22;

// ── OOXML 字体映射（不使用 _GB2312 编码） ───────

export interface FontSpec {
  readonly eastAsia: string;
  readonly ascii: string;
  readonly hAnsi: string;
}

// ── 公文字体组合 ────────────────────────────────
//
// 党政公文五大基础字体，每种中文字体搭配固定的英文字体：
//   无衬线组：黑体 + Arial、楷体 + Arial
//   衬线组：  仿宋 + Times New Roman、宋体 + Times New Roman
//   标题体：  方正小标宋 + Times New Roman

/** 方正小标宋简体 — 公文标题专用（GB/T 9704 标准指定） */
export const XiaoBiaoSong: FontSpec = { eastAsia: "FZXiaoBiaoSong-B05S", ascii: "Times New Roman", hAnsi: "Times New Roman" };

/** 黑体 SimHei + Arial — 一级标题、表头 */
export const HeiTi: FontSpec = { eastAsia: "SimHei", ascii: "Arial", hAnsi: "Arial" };

/** 楷体 KaiTi + Arial — 二级标题、强调 */
export const KaiTi: FontSpec = { eastAsia: "KaiTi", ascii: "Arial", hAnsi: "Arial" };

/** 仿宋 FangSong + Times New Roman — 正文、三/四级标题 */
export const FangSong: FontSpec = { eastAsia: "FangSong", ascii: "Times New Roman", hAnsi: "Times New Roman" };

/** 宋体 SimSun + Times New Roman — 页码 */
export const SongTi: FontSpec = { eastAsia: "SimSun", ascii: "Times New Roman", hAnsi: "Times New Roman" };

/** 等宽字体 — 代码块 */
export const CodeFont: FontSpec = { eastAsia: "SimSun", ascii: "Consolas", hAnsi: "Consolas" };

// ── 表格样式 ────────────────────────────────────

export const TABLE = {
  /** 顶/底边框粗细（1/8 pt 为单位，1.5pt = 12） */
  OUTER_BORDER_SIZE: 12,
  /** 内部水平线（0.5pt = 4） */
  INNER_BORDER_SIZE: 4,
  BORDER_COLOR: "000000",
} as const;
