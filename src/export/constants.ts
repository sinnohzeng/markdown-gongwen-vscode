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

/** 1 毫米 = 1440 / 25.4 twip */
const TWIP_PER_MM = 1440 / 25.4;

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
  /** 小四（图表题注，GB/T 7713.2 附录B：小于或等于正文、重于表内文字） */
  CAPTION: 12,
  /** 小五（脚注 / 尾注文本）。GB/T 9704 未规定，类比 GB/T 7713.2-2022 附录 B 的资料性取值 */
  FOOTNOTE: 9,
} as const;

/** 代码块使用五号（10pt），小于正文以示层级 */
export const CODE_FONT_SIZE_PT = 10;

/** docx 库 `size` 字段使用半磅为单位 */
export const FONT_SIZE_HALF_PT = {
  TITLE: (FONT_SIZE_PT.TITLE * 2) as 44,
  HEADING: (FONT_SIZE_PT.HEADING * 2) as 32,
  BODY: (FONT_SIZE_PT.BODY * 2) as 32,
  PAGE_NUMBER: (FONT_SIZE_PT.PAGE_NUMBER * 2) as 28,
  TABLE_CELL: (FONT_SIZE_PT.TABLE_CELL * 2) as 28,
  CAPTION: (FONT_SIZE_PT.CAPTION * 2) as 24,
  FOOTNOTE: (FONT_SIZE_PT.FOOTNOTE * 2) as 18,
  CODE: CODE_FONT_SIZE_PT * 2,
} as const;

// ── 行距 & 段落 ─────────────────────────────────

/** 固定行距 28pt，实现每页 22 行 */
export const LINE_SPACING_PT = 28;
/** 28pt × 20 = 560 twip */
export const LINE_SPACING_TWIP = LINE_SPACING_PT * 20;
/** 单倍行距（Word 的 line=240、lineRule=auto），脚注 / 尾注文本用 */
export const SINGLE_LINE_SPACING_TWIP = 240;
/** 首行缩进 2 字符 = 2 × 16pt × 20 = 640 twip */
export const FIRST_LINE_INDENT_TWIP = 2 * FONT_SIZE_PT.BODY * 20;
/** 题注段上下间距约半行 = 560 / 2 = 280 twip */
export const CAPTION_SPACING_TWIP = Math.round(LINE_SPACING_TWIP / 2);
/** 代码块固定行距 15pt × 20 = 300 twip（代码行较密） */
export const CODE_LINE_SPACING_TWIP = 300;
/** 列表嵌套每层加深的首行缩进 = 1 字符 = 16pt × 20 = 320 twip */
export const LIST_NEST_INDENT_TWIP = FONT_SIZE_PT.BODY * 20;

// ── 目录（Word 目录域与 toc N 样式）────────────
//
// GB/T 9704 不涉及目录页，取党政机关长文档惯例：
// "目录"二字黑体三号居中，条目与正文同字体同网格，逐级缩进 2 字，
// 页码靠版心右缘、点线前导。

/** 目录条目每级左缩进 2 字符 = 640 twip */
export const TOC_LEVEL_INDENT_TWIP = 2 * FONT_SIZE_PT.BODY * 20;
/** 目录页码制表位：版心右缘（156mm ≈ 8844 twip） */
export const TOC_TAB_STOP_TWIP = Math.round(PAGE.PRINT_AREA_WIDTH_MM * TWIP_PER_MM);
/** 目录标题文字 */
export const TOC_HEADING_TEXT = "目录";
/** 目录域收录的 Word 标题级别：1-2 即 Markdown H2、H3（一级、二级标题） */
export const TOC_HEADING_LEVELS = "1-2";
/** Markdown 目录标记：独占一段的 [TOC] 或 [[TOC]]，大小写不敏感，括号必须成对 */
export const TOC_MARKER_PATTERN = /^(\[toc\]|\[\[toc\]\])$/i;

// ── 颜色与底纹（非 GB 约定，取中性值）─────────────

/** 文档文字颜色（纯黑） */
export const COLOR_BLACK = "000000";

/** 底纹灰阶：占位提示 / 代码块 / LaTeX 源码 */
export const SHADING = {
  PLACEHOLDER: "F0F0F0",
  CODE: "F5F5F5",
  MATH: "F8F8F8",
} as const;

// ── 图片 ─────────────────────────────────────────

export const IMAGE = {
  /** 无法从文件头解析尺寸时的回退宽度（px，96 DPI） */
  FALLBACK_WIDTH_PX: 600,
  /** 无法从文件头解析尺寸时的回退高度（px，96 DPI） */
  FALLBACK_HEIGHT_PX: 400,
} as const;

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

/** 方正小标宋简体 — 公文标题专用（GB/T 9704 标准指定，未安装时 Word 自动回退到宋体） */
export const XiaoBiaoSong: FontSpec = { eastAsia: "FZXiaoBiaoSong-B05S", ascii: "Times New Roman", hAnsi: "Times New Roman" };

/** 黑体 SimHei + Arial — 一级标题、表头、目录标题 */
export const HeiTi: FontSpec = { eastAsia: "SimHei", ascii: "Arial", hAnsi: "Arial" };

/** 楷体 KaiTi + Arial — 二级标题、强调 */
export const KaiTi: FontSpec = { eastAsia: "KaiTi", ascii: "Arial", hAnsi: "Arial" };

/** 仿宋 FangSong + Times New Roman — 正文、三/四级标题、目录条目、脚注 */
export const FangSong: FontSpec = { eastAsia: "FangSong", ascii: "Times New Roman", hAnsi: "Times New Roman" };

/** 黑体 SimHei + Times New Roman — 图表题注（GB/T 7713.2：题注用黑体，数字/字母用 Times New Roman） */
export const CaptionFont: FontSpec = { eastAsia: "SimHei", ascii: "Times New Roman", hAnsi: "Times New Roman" };

/** 宋体 SimSun + Times New Roman — 页码 */
export const SongTi: FontSpec = { eastAsia: "SimSun", ascii: "Times New Roman", hAnsi: "Times New Roman" };

/** 等宽字体 — 代码块 */
export const CodeFont: FontSpec = { eastAsia: "SimSun", ascii: "Consolas", hAnsi: "Consolas" };

// ── 表格样式 ────────────────────────────────────

export const TABLE = {
  /** 边框粗细（0.5pt = 4） */
  INNER_BORDER_SIZE: 4,
  BORDER_COLOR: "000000",
  /** 单元格左右边距 108 twip（0.19cm，Word 默认值） */
  CELL_MARGIN_TWIP: 108,
} as const;
