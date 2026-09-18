/**
 * GB/T 9704 OOXML 样式定义。
 *
 * 样式表全量自定义。docx 库默认会注入 Heading 1-6、Strong、List Paragraph、
 * Hyperlink、脚注 / 尾注等一整套默认样式（蓝色标题、10pt 脚注……），这里用
 * importedStyles 整体替换，导出文件里只有插件明确定义的样式，每一条都按
 * GB/T 9704 或党政机关长文档惯例取值，依据见 docs/features/docx-export.md。
 *
 * 样式 ID 与 w:name 一律用 Word 内建名称（heading 1、TOC Heading、toc 1、
 * footnote text……）。Word / WPS 据此识别为内建样式并显示中文名（标题 1、
 * 目录标题、目录 1、脚注文本……）；自造名称会在样式面板里冒出重复项。
 */
import {
  AlignmentType,
  convertMillimetersToTwip,
  DocumentDefaults,
  Footer,
  ImportedXmlComponent,
  LineRuleType,
  PageOrientation,
  Paragraph,
  SimpleField,
  StyleForCharacter,
  StyleForParagraph,
  TextRun,
  UnderlineType,
  type IParagraphStylePropertiesOptions,
  type IRunStylePropertiesOptions,
  type IStylesOptions,
  type ISectionPropertiesOptions,
} from "docx";
import {
  PAGE,
  FONT_SIZE_HALF_PT,
  LINE_SPACING_TWIP,
  SINGLE_LINE_SPACING_TWIP,
  FIRST_LINE_INDENT_TWIP,
  CAPTION_SPACING_TWIP,
  TOC_LEVEL_INDENT_TWIP,
  TOC_TAB_STOP_TWIP,
  TABLE,
  XiaoBiaoSong, HeiTi, KaiTi, FangSong, SongTi, CaptionFont,
  COLOR_BLACK,
  type FontSpec,
} from "./constants";

// ── 标题级别单一权威源 ──────────────────────────
//
// Markdown 标题层级（H1-H5）→ GB/T 9704 样式的唯一映射表。
// 文档样式（createDocumentStyles）与转换层（ast-to-docx）都从此表派生，防止双源漂移。

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

/** 目录标题样式 ID：Word 内建 "TOC Heading"，中文 Word 显示为"目录标题"。Word 的自动目录把"目录"二字套用此样式 */
export const TOC_HEADING_STYLE_ID = "TOCHeading";

/** 标题 5-7：GB/T 9704 标题层级止于四级，更深层级沿用四级标题外观，不再新增视觉层级 */
const EXTRA_HEADING_LEVELS = [5, 6, 7] as const;

/** 目录条目样式级数：toc 1 到 toc 3（目录域默认只收前两级，第三级备用） */
const TOC_ENTRY_LEVELS = [1, 2, 3] as const;

/** Word 内建样式的 uiPriority，与 Word 自身模板一致，只影响样式面板排序 */
const UI_PRIORITY = { HEADING: 9, TITLE: 10, TOC: 39, HIDDEN: 99 } as const;

// ── 默认样式（OOXML 要求的三个 w:default 样式）────
//
// StyleForParagraph / StyleForCharacter 写不出 w:default="1"，
// 这三条用 ImportedXmlComponent 手工拼。

type XmlAttrs = Record<string, string>;

function rawElement(name: string, attrs?: XmlAttrs, children: ImportedXmlComponent[] = []): ImportedXmlComponent {
  const element = new ImportedXmlComponent(name, attrs);
  for (const child of children) element.push(child);
  return element;
}

function createDefaultStyles(): ImportedXmlComponent[] {
  const cellMargin = (side: string, twip: number) =>
    rawElement(`w:${side}`, { "w:w": String(twip), "w:type": "dxa" });

  return [
    // 正文：所有段落样式的基类，格式全部由 docDefaults 承担
    rawElement("w:style", { "w:type": "paragraph", "w:default": "1", "w:styleId": "Normal" }, [
      rawElement("w:name", { "w:val": "Normal" }),
      rawElement("w:qFormat"),
    ]),
    // 默认段落字体：字符样式的基类，本身无格式（Word 显示为"默认段落字体"）
    rawElement("w:style", { "w:type": "character", "w:default": "1", "w:styleId": "DefaultParagraphFont" }, [
      rawElement("w:name", { "w:val": "Default Paragraph Font" }),
      rawElement("w:uiPriority", { "w:val": "1" }),
      rawElement("w:semiHidden"),
      rawElement("w:unhideWhenUsed"),
    ]),
    // 普通表格：单元格左右边距取 Word 默认值
    rawElement("w:style", { "w:type": "table", "w:default": "1", "w:styleId": "TableNormal" }, [
      rawElement("w:name", { "w:val": "Normal Table" }),
      rawElement("w:semiHidden"),
      rawElement("w:unhideWhenUsed"),
      rawElement("w:tblPr", undefined, [
        rawElement("w:tblInd", { "w:w": "0", "w:type": "dxa" }),
        rawElement("w:tblCellMar", undefined, [
          cellMargin("top", 0),
          cellMargin("left", TABLE.CELL_MARGIN_TWIP),
          cellMargin("bottom", 0),
          cellMargin("right", TABLE.CELL_MARGIN_TWIP),
        ]),
      ]),
    ]),
  ];
}

// ── 目录条目样式 toc 1-3 ────────────────────────
//
// 仿宋三号与正文同网格，逐级左缩进 2 字，页码靠版心右缘、点线前导。
// 样式级制表位要带 w:leader="dot"，StyleForParagraph 的 rightTabStop 写不出前导符，
// 这里也用原生 XML。子元素顺序按 OOXML 架构：pPr 内 tabs → spacing → ind → jc。

function createTocEntryStyle(level: number): ImportedXmlComponent {
  const size = String(FONT_SIZE_HALF_PT.BODY);
  return rawElement("w:style", { "w:type": "paragraph", "w:styleId": `TOC${level}` }, [
    rawElement("w:name", { "w:val": `toc ${level}` }),
    rawElement("w:basedOn", { "w:val": "Normal" }),
    rawElement("w:next", { "w:val": "Normal" }),
    rawElement("w:uiPriority", { "w:val": String(UI_PRIORITY.TOC) }),
    rawElement("w:unhideWhenUsed"),
    rawElement("w:pPr", undefined, [
      rawElement("w:tabs", undefined, [
        rawElement("w:tab", { "w:val": "right", "w:leader": "dot", "w:pos": String(TOC_TAB_STOP_TWIP) }),
      ]),
      rawElement("w:spacing", { "w:before": "0", "w:after": "0", "w:line": String(LINE_SPACING_TWIP), "w:lineRule": "exact" }),
      rawElement("w:ind", { "w:left": String((level - 1) * TOC_LEVEL_INDENT_TWIP), "w:firstLine": "0" }),
      rawElement("w:jc", { "w:val": "left" }),
    ]),
    rawElement("w:rPr", undefined, [
      rawElement("w:rFonts", { "w:ascii": FangSong.ascii, "w:hAnsi": FangSong.hAnsi, "w:eastAsia": FangSong.eastAsia }),
      rawElement("w:color", { "w:val": COLOR_BLACK }),
      rawElement("w:sz", { "w:val": size }),
      rawElement("w:szCs", { "w:val": size }),
    ]),
  ]);
}

// ── 文档样式表 ──────────────────────────────────

/** Word 内建标题样式：ID "HeadingN" 对应名称 "heading N"，大纲级别 N-1 */
function headingLevel(styleId: string): number {
  return Number(styleId.replace(/^Heading(\d)$/, "$1"));
}

function headingStyleName(styleId: string): string {
  return `heading ${headingLevel(styleId)}`;
}

export function createDocumentStyles(): IStylesOptions {
  // 固定行距 28 磅（每页 22 行），段前段后 0
  const fixedLine = {
    line: LINE_SPACING_TWIP,
    lineRule: LineRuleType.EXACT,
    before: 0,
    after: 0,
  };

  // 标题段落通用：首行缩进 2 字符，回行顶格（GB/T 9704 第 7.3.3 条），与下段同页。
  // 大纲级别写进样式，Word 导航窗格与 WPS 目录不依赖样式名推断层级
  const headingParagraph = (level: number): IParagraphStylePropertiesOptions => ({
    spacing: fixedLine,
    indent: { firstLine: FIRST_LINE_INDENT_TWIP },
    keepNext: true,
    outlineLevel: level - 1,
  });
  const headingRun = (font: FontSpec, bold: boolean): IRunStylePropertiesOptions => ({
    font,
    size: FONT_SIZE_HALF_PT.HEADING,
    color: COLOR_BLACK,
    ...(bold ? { bold: true } : {}),
  });

  // 文档默认（Normal 的实际格式）：仿宋三号、固定行距、首行缩进 2 字、两端对齐
  const documentDefaults = new DocumentDefaults({
    run: { font: FangSong, size: FONT_SIZE_HALF_PT.BODY, color: COLOR_BLACK },
    paragraph: {
      spacing: fixedLine,
      alignment: AlignmentType.JUSTIFIED,
      indent: { firstLine: FIRST_LINE_INDENT_TWIP },
    },
  });

  // 公文标题（Markdown H1）：方正小标宋二号，居中，不缩进
  const titleStyle = new StyleForParagraph({
    id: "Title",
    name: "Title",
    basedOn: "Normal",
    next: "Normal",
    uiPriority: UI_PRIORITY.TITLE,
    quickFormat: true,
    run: { font: XiaoBiaoSong, size: FONT_SIZE_HALF_PT.TITLE, color: COLOR_BLACK },
    paragraph: {
      spacing: fixedLine,
      alignment: AlignmentType.CENTER,
      indent: { firstLine: 0 },  // 覆盖 docDefaults 的首行缩进
      keepNext: true,
    },
  });

  // 标题 1-4 全部从 HEADING_LEVEL_SPEC 派生
  const headingStyles = Object.values(HEADING_LEVEL_SPEC)
    .filter((spec) => spec.styleId !== "Title")
    .map((spec) => new StyleForParagraph({
      id: spec.styleId,
      name: headingStyleName(spec.styleId),
      basedOn: "Normal",
      next: "Normal",
      uiPriority: UI_PRIORITY.HEADING,
      quickFormat: true,
      run: headingRun(spec.font, spec.bold),
      paragraph: headingParagraph(headingLevel(spec.styleId)),
    }));

  // 标题 5-7：沿用四级标题（HEADING_LEVEL_SPEC[5]）的字体与段落
  const deepestSpec = HEADING_LEVEL_SPEC[5];
  const extraHeadingStyles = EXTRA_HEADING_LEVELS.map((level) => new StyleForParagraph({
    id: `Heading${level}`,
    name: `heading ${level}`,
    basedOn: "Normal",
    next: "Normal",
    uiPriority: UI_PRIORITY.HEADING,
    quickFormat: true,
    run: headingRun(deepestSpec.font, deepestSpec.bold),
    paragraph: headingParagraph(level),
  }));

  // 目录标题："目录"二字黑体三号居中，不缩进，与下段同页
  const tocHeadingStyle = new StyleForParagraph({
    id: TOC_HEADING_STYLE_ID,
    name: "TOC Heading",
    basedOn: "Normal",
    next: "Normal",
    uiPriority: UI_PRIORITY.TOC,
    unhideWhenUsed: true,
    run: { font: HeiTi, size: FONT_SIZE_HALF_PT.HEADING, color: COLOR_BLACK },
    paragraph: {
      spacing: fixedLine,
      alignment: AlignmentType.CENTER,
      indent: { firstLine: 0 },
      keepNext: true,
    },
  });

  // 目录条目 toc 1-3
  const tocEntryStyles = TOC_ENTRY_LEVELS.map(createTocEntryStyle);

  // 超链接：公文全文纯黑，不用蓝色下划线
  const hyperlinkStyle = new StyleForCharacter({
    id: "Hyperlink",
    name: "Hyperlink",
    basedOn: "DefaultParagraphFont",
    uiPriority: UI_PRIORITY.HIDDEN,
    unhideWhenUsed: true,
    run: { color: COLOR_BLACK, underline: { type: UnderlineType.NONE } },
  });

  // 脚注 / 尾注：仿宋小五、单倍行距、无首行缩进；引用编号上标
  const noteRun: IRunStylePropertiesOptions = { font: FangSong, size: FONT_SIZE_HALF_PT.FOOTNOTE, color: COLOR_BLACK };
  const noteParagraph: IParagraphStylePropertiesOptions = {
    spacing: { line: SINGLE_LINE_SPACING_TWIP, lineRule: LineRuleType.AUTO, before: 0, after: 0 },
    indent: { firstLine: 0 },
  };
  const hidden = { uiPriority: UI_PRIORITY.HIDDEN, semiHidden: true, unhideWhenUsed: true };
  const noteStyles = (["Footnote", "Endnote"] as const).flatMap((kind) => {
    const lower = kind.toLowerCase();
    return [
      new StyleForParagraph({
        id: `${kind}Text`, name: `${lower} text`, basedOn: "Normal", link: `${kind}TextChar`, ...hidden,
        run: noteRun, paragraph: noteParagraph,
      }),
      new StyleForCharacter({
        id: `${kind}TextChar`, name: `${kind} Text Char`, basedOn: "DefaultParagraphFont", link: `${kind}Text`, ...hidden,
        run: noteRun,
      }),
      new StyleForCharacter({
        id: `${kind}Reference`, name: `${lower} reference`, basedOn: "DefaultParagraphFont", ...hidden,
        run: { superScript: true },
      }),
    ];
  });

  return {
    importedStyles: [
      documentDefaults,
      ...createDefaultStyles(),
      titleStyle,
      ...headingStyles,
      ...extraHeadingStyles,
      tocHeadingStyle,
      ...tocEntryStyles,
      hyperlinkStyle,
      ...noteStyles,
    ],
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

/** 题注段通用属性：居中、黑体小四、上下各约半行距，无首行缩进
 * （文档默认段落带 2 字首行缩进，居中段必须显式归零，否则整体右偏 1 字）。
 * keepNext 用于表题（与下方表格同页）。 */
export function createCaptionParagraph(text: string, keepNext = false): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    indent: { firstLine: 0 },
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
    // firstLine 归零：文档默认的 2 字首行缩进会把偶数页页码推成"空三字"
    indent: { ...indent, firstLine: 0 },
    children: [
      new TextRun({
        text: "—",  // Em Dash 一字线
        font: SongTi,
        size: FONT_SIZE_HALF_PT.PAGE_NUMBER,
      }),
      new SimpleField("PAGE"),
      new TextRun({
        text: "—",  // Em Dash 一字线
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
