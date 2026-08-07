/**
 * GB/T 9704 OOXML 样式定义。
 *
 * 使用 Word 内建样式 ID（Title, Heading1-4, Normal）确保
 * 导航窗格、目录生成、大纲视图全部正常工作。
 */
import {
  AlignmentType,
  convertMillimetersToTwip,
  Footer,
  LineRuleType,
  PageOrientation,
  Paragraph,
  SimpleField,
  TextRun,
  type IStylesOptions,
  type ISectionPropertiesOptions,
} from "docx";
import {
  PAGE,
  FONT_SIZE_HALF_PT,
  LINE_SPACING_TWIP,
  FIRST_LINE_INDENT_TWIP,
  CAPTION_SPACING_TWIP,
  XiaoBiaoSong, HeiTi, KaiTi, FangSong, SongTi, CaptionFont,
  COLOR_BLACK,
  type FontSpec,
} from "./constants";

// ── 标题级别单一权威源 ──────────────────────────
//
// Markdown 标题层级（H1-H5）→ GB/T 9704 样式的唯一映射表。
// 文档样式（createDocumentStyles）与转换层（ast-to-docx 的
// HEADING_MAP）都从此表派生，防止双源漂移。

export interface HeadingLevelSpec {
  /** Word 内建样式 ID */
  styleId: string;
  font: FontSpec;
  bold: boolean;
}

export const HEADING_LEVEL_SPEC: Record<number, HeadingLevelSpec> = {
  /** 公文标题 — 方正小标宋 二号 */
  1: { styleId: "Title",    font: XiaoBiaoSong, bold: false },
  /** 一级标题 — 黑体 三号 */
  2: { styleId: "Heading1", font: HeiTi,        bold: false },
  /** 二级标题 — 楷体 三号 */
  3: { styleId: "Heading2", font: KaiTi,        bold: false },
  /** 三级标题 — 仿宋加粗 三号 */
  4: { styleId: "Heading3", font: FangSong,     bold: true },
  /** 四级标题 — 仿宋 三号（更深的 H6 回退到此） */
  5: { styleId: "Heading4", font: FangSong,     bold: false },
};

// ── 文档默认样式 ────────────────────────────────

export function createDocumentStyles(): IStylesOptions {
  // 使用 styles.default.headingN 覆盖 Word 内建样式。
  // 关键：保留 w:name="heading N"（Word 识别为内建样式），
  // 只覆盖字体/字号等格式属性。中文 Word 自动显示为"标题 N"。
  const headingSpacing = {
    line: LINE_SPACING_TWIP,
    lineRule: LineRuleType.EXACT,
    before: 0,
    after: 0,
  };

  // 标题段落通用：首行缩进 2 字符，回行顶格（GB/T 9704 第 7.3.3 条）
  const headingParagraph = {
    spacing: headingSpacing,
    indent: { firstLine: FIRST_LINE_INDENT_TWIP },
    keepNext: true,
  };

  // heading1-4 全部从 HEADING_LEVEL_SPEC 派生（key 为样式 ID 小写）
  const headingStyles = Object.fromEntries(
    Object.entries(HEADING_LEVEL_SPEC)
      .filter(([, spec]) => spec.styleId !== "Title")
      .map(([, spec]) => [
        spec.styleId.toLowerCase(),
        {
          run: {
            font: spec.font,
            size: FONT_SIZE_HALF_PT.HEADING,
            ...(spec.bold ? { bold: true } : {}),
            color: COLOR_BLACK,
          },
          paragraph: headingParagraph,
        },
      ]),
  );

  return {
    default: {
      // ── 文档默认（Normal 样式）──────────────────
      document: {
        run: {
          font: FangSong,
          size: FONT_SIZE_HALF_PT.BODY,
          color: COLOR_BLACK,
        },
        paragraph: {
          spacing: {
            line: LINE_SPACING_TWIP,
            lineRule: LineRuleType.EXACT,
            before: 0,
            after: 0,
          },
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: FIRST_LINE_INDENT_TWIP },
        },
      },
      // ── 公文标题（Markdown H1）── 方正小标宋 二号 居中 不加粗 无缩进
      title: {
        run: {
          font: XiaoBiaoSong,
          size: FONT_SIZE_HALF_PT.TITLE,
          color: COLOR_BLACK,
        },
        paragraph: {
          spacing: headingSpacing,
          alignment: AlignmentType.CENTER,
          indent: { firstLine: 0 },  // 覆盖 document 默认的首行缩进
          keepNext: true,
        },
      },
      ...headingStyles,
    },
  };
}

// ── 图表题注段 ──────────────────────────────────
//
// GB/T 7713 族：表题在表上、图题在图下，均与图表同页不拆分、
// 居中、黑体小四（数字/字母 Times New Roman），上下约半行距。
//
// 同页控制的等价实现：docx 库的段落属性只暴露 keepNext，不暴露
// keepWithPrevious。"题注与前一段（图）同页"与"前一段与题注同页"
// 语义等价，故表题在题注段上设 keepNext、图题在图片段上设 keepNext。

/** 题注段通用属性：居中、黑体小四、上下各约半行距，无首行缩进。
 * keepNext 用于表题（与下方表格同页）。 */
export function createCaptionParagraph(text: string, keepNext = false): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    keepNext: keepNext || undefined,
    spacing: { before: CAPTION_SPACING_TWIP, after: CAPTION_SPACING_TWIP },
    children: [
      new TextRun({
        text,
        font: CaptionFont,
        size: FONT_SIZE_HALF_PT.CAPTION,
        color: COLOR_BLACK,
      }),
    ],
  });
}

// ── 页面布局（Section Properties）───────────────

/** 一字线距版心下边缘 7mm（GB/T 9704 第 7.5 条） */
const PAGE_NUMBER_OFFSET_MM = 7;
/** "空一字"≈ 一个三号汉字宽度（16pt ≈ 5.64mm），用于页码缩进 */
const ONE_CHAR_TWIP = FONT_SIZE_HALF_PT.BODY * 10; // 半磅 × 10 = twip

export function createSectionProperties(): ISectionPropertiesOptions {
  return {
    page: {
      size: {
        orientation: PageOrientation.PORTRAIT,
        width: convertMillimetersToTwip(PAGE.WIDTH_MM),
        height: convertMillimetersToTwip(PAGE.HEIGHT_MM),
      },
      margin: {
        top: convertMillimetersToTwip(PAGE.MARGIN_TOP_MM),
        bottom: convertMillimetersToTwip(PAGE.MARGIN_BOTTOM_MM),
        left: convertMillimetersToTwip(PAGE.MARGIN_LEFT_MM),
        right: convertMillimetersToTwip(PAGE.MARGIN_RIGHT_MM),
        footer: convertMillimetersToTwip(PAGE.MARGIN_BOTTOM_MM - PAGE_NUMBER_OFFSET_MM),
      },
    },
  };
}

// ── 页脚（页码格式 —1—）────────────────────────
//
// GB/T 9704 第 7.5 条：
//   "一般用 4 号半角宋体阿拉伯数字，编排在公文版心下边缘之下，
//    数字左右各放一条一字线；一字线上距版心下边缘 7mm。
//    单页码居右空一字，双页码居左空一字。"
//
// 一字线 = U+2014 Em Dash（占一个汉字宽度）

function createPageNumberParagraph(
  alignment: (typeof AlignmentType)[keyof typeof AlignmentType],
  indent: { left?: number; right?: number },
): Paragraph {
  return new Paragraph({
    alignment,
    indent,
    children: [
      new TextRun({
        text: "\u2014",  // Em Dash 一字线
        font: SongTi,
        size: FONT_SIZE_HALF_PT.PAGE_NUMBER,
      }),
      new SimpleField("PAGE"),
      new TextRun({
        text: "\u2014",  // Em Dash 一字线
        font: SongTi,
        size: FONT_SIZE_HALF_PT.PAGE_NUMBER,
      }),
    ],
  });
}

/** 奇数页页脚：页码居右空一字 */
export function createDefaultFooter(): Footer {
  return new Footer({
    children: [createPageNumberParagraph(AlignmentType.RIGHT, { right: ONE_CHAR_TWIP })],
  });
}

/** 偶数页页脚：页码居左空一字 */
export function createEvenFooter(): Footer {
  return new Footer({
    children: [createPageNumberParagraph(AlignmentType.LEFT, { left: ONE_CHAR_TWIP })],
  });
}
