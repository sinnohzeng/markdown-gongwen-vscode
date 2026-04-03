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
  Header,
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
  XiaoBiaoSong, HeiTi, KaiTi, FangSong, SongTi,
} from "./constants";

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
  };

  // 标题 5/6/7 及更低级别：三号FangSong，不加粗（标准未明确规定，统一设定）
  const lowerHeadingStyle = {
    run: {
      font: FangSong,
      size: FONT_SIZE_HALF_PT.HEADING,
      color: "000000",
    },
    paragraph: headingParagraph,
  };

  return {
    default: {
      // ── 文档默认（Normal 样式）──────────────────
      document: {
        run: {
          font: FangSong,
          size: FONT_SIZE_HALF_PT.BODY,
          color: "000000",
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
          color: "000000",
        },
        paragraph: {
          spacing: headingSpacing,
          alignment: AlignmentType.CENTER,
          indent: { firstLine: 0 },  // 覆盖 document 默认的首行缩进
        },
      },
      // ── 一级标题（Markdown H2）── HeiTi 三号
      heading1: {
        run: {
          font: HeiTi,
          size: FONT_SIZE_HALF_PT.HEADING,
          color: "000000",
        },
        paragraph: headingParagraph,
      },
      // ── 二级标题（Markdown H3）── KaiTi 三号
      heading2: {
        run: {
          font: KaiTi,
          size: FONT_SIZE_HALF_PT.HEADING,
          color: "000000",
        },
        paragraph: headingParagraph,
      },
      // ── 三级标题（Markdown H4）── FangSong加粗 三号
      heading3: {
        run: {
          font: FangSong,
          size: FONT_SIZE_HALF_PT.HEADING,
          bold: true,
          color: "000000",
        },
        paragraph: headingParagraph,
      },
      // ── 四级标题（Markdown H5）── FangSong 三号
      heading4: lowerHeadingStyle,
      // ── 标题 5/6（标准未规定，统一三号FangSong不加粗）
      heading5: lowerHeadingStyle,
      heading6: lowerHeadingStyle,
    },
    // Heading 7：docx 库 default 不支持 heading7，用 paragraphStyles 补充
    paragraphStyles: [
      {
        id: "Heading7",
        name: "heading 7",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: {
          font: FangSong,
          size: FONT_SIZE_HALF_PT.HEADING,
          color: "000000",
        },
        paragraph: headingParagraph,
      },
    ],
    // ── "强调"字符样式 ── KaiTi + Times New Roman 三号，不加粗
    characterStyles: [
      {
        id: "Strong",
        name: "Strong",
        run: {
          font: KaiTi,  // eastAsia: KaiTi, ascii: Times New Roman
          size: FONT_SIZE_HALF_PT.HEADING,
          bold: false,
          color: "000000",
        },
      },
    ],
  };
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
