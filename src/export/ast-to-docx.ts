/**
 * mdast AST → docx Document 纯函数转换。
 *
 * 零 VS Code API 依赖，可直接用 Jest 单元测试。
 * 每个节点处理器独立 try/catch —— 单节点失败只插入诊断文字，不中断整体导出。
 */
import type { Root, Content, Heading, Paragraph as MdParagraph, Table as MdTable, List, ListItem, Blockquote, Code, Image, Link, Text, Strong, Emphasis, InlineCode, Delete, TableRow as MdTableRow, TableCell as MdTableCell, PhrasingContent } from "mdast";
import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  LineRuleType,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableOfContents,
  TableRow,
  TextRun,
  VerticalAlignTable,
  WidthType,
} from "docx";
import type { ResolvedImage } from "./image-dimensions";
import {
  FONT_SIZE_HALF_PT,
  HeiTi, KaiTi, FangSong, CodeFont,
  FIRST_LINE_INDENT_TWIP,
  LINE_SPACING_TWIP,
  SINGLE_LINE_SPACING_TWIP,
  CODE_LINE_SPACING_TWIP,
  LIST_NEST_INDENT_TWIP,
  COLOR_BLACK,
  SHADING,
  TABLE as TABLE_CONST,
  TOC_HEADING_TEXT,
  TOC_HEADING_LEVELS,
  TOC_MARKER_PATTERN,
  type FontSpec,
} from "./constants";
import { createDocumentStyles, createSectionProperties, createDefaultFooter, createEvenFooter, createCaptionParagraph, HEADING_LEVEL_SPEC, TOC_HEADING_STYLE_ID } from "./gbt9704-styles";
import { buildCaptionText } from "./caption";

// ── 类型 ────────────────────────────────────────

type DocxChild = Paragraph | Table | TableOfContents;

// ── 公开入口 ────────────────────────────────────

/**
 * 将 mdast AST 转换为 docx Document 对象。
 * 纯函数，无副作用。
 *
 * @param fidelitySink 可选收集器：被降级呈现（占位/源码文本）的内容会
 *   以一行人类可读描述 push 进来，供导出完成后告知用户。
 */
export function convertToDocx(
  ast: Root,
  resolvedImages: Map<string, ResolvedImage>,
  fidelitySink?: string[],
): Document {
  const children = convertNodes(ast.children, resolvedImages, {}, fidelitySink);

  // 空文档保护：至少一个空段落
  if (children.length === 0) {
    children.push(new Paragraph({}));
  }

  // 只有含目录域时才让 Word 打开即更新域；普通文档不弹"是否更新域"提示
  const hasToc = children.some((child) => child instanceof TableOfContents);

  return new Document({
    styles: createDocumentStyles(),
    features: hasToc ? { updateFields: true } : undefined,
    evenAndOddHeaderAndFooters: true, // 启用奇偶页不同页脚
    sections: [
      {
        properties: createSectionProperties(),
        footers: {
          default: createDefaultFooter(),  // 奇数页：页码靠右
          even: createEvenFooter(),         // 偶数页：页码靠左
        },
        children,
      },
    ],
  });
}

/**
 * 将 Document 打包为 Buffer。
 */
export async function packToBuffer(doc: Document): Promise<Buffer> {
  return Packer.toBuffer(doc) as Promise<Buffer>;
}

// ── 节点转换 ────────────────────────────────────

interface RunContext {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  font?: FontSpec;
  size?: number;
  /** 文字不打直接格式，字体字号由段落样式承担（标题用；否则目录域会把标题字体带进条目） */
  inheritStyle?: boolean;
}

function convertNodes(
  nodes: Content[],
  images: Map<string, ResolvedImage>,
  ctx: RunContext,
  fidelitySink?: string[],
): DocxChild[] {
  const result: DocxChild[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    try {
      // 跳过 frontmatter（"toml" 节点由 remark-frontmatter 注入，不在标准 mdast 类型联合中）
      if (node.type === "yaml" || (node as { type: string }).type === "toml") continue;

      switch (node.type) {
        case "heading":
          result.push(convertHeading(node as Heading, images));
          break;
        case "paragraph":
          result.push(...convertParagraph(node as MdParagraph, images, ctx, nodes[i + 1]));
          break;
        case "table":
          result.push(convertTable(node as MdTable, images));
          break;
        case "list":
          result.push(...convertList(node as List, images, 0, ctx));
          break;
        case "blockquote":
          result.push(...convertBlockquote(node as Blockquote, images));
          break;
        case "code":
          result.push(...convertCodeBlock(node as Code, fidelitySink));
          break;
        case "thematicBreak":
          result.push(convertThematicBreak());
          break;
        case "html":
          // HTML 块：作为普通文本输出
          result.push(new Paragraph({
            children: [new TextRun({ text: (node as { value: string }).value, font: CodeFont, size: FONT_SIZE_HALF_PT.BODY })],
          }));
          break;
        default:
          // 未知块级节点：尝试递归子节点
          if ("children" in node && Array.isArray((node as { children: Content[] }).children)) {
            result.push(...convertNodes((node as { children: Content[] }).children, images, ctx));
          }
          break;
      }
    } catch (err) {
      // 错误边界：单节点失败不中断整体导出；错误如实记录到控制台，不静默吞掉
      console.error(`[ast-to-docx] 无法转换 ${node.type} 节点:`, err);
      result.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[导出错误: 无法转换 ${node.type}]`,
              color: COLOR_BLACK,
              font: FangSong,
              size: FONT_SIZE_HALF_PT.BODY,
            }),
          ],
        }),
      );
    }
  }

  return result;
}

// ── 标题 ────────────────────────────────────────

//   Markdown H1 → Title（公文标题）
//   Markdown H2 → Heading1（一级标题 黑体）
//   Markdown H3 → Heading2（二级标题 楷体）
//   Markdown H4 → Heading3（三级标题 仿宋加粗）
//   Markdown H5 → Heading4（四级标题 仿宋）
//
// 标题文字不打直接格式，字体、字号、加粗全部由样式承担：用户在 Word 里改
// "标题 1"样式即可全局生效，目录域（\h \u）也不会把黑体 / 楷体带进条目。
// 标题编号（一、/（一）/1.）是文字内容的一部分，由 Markdown 文本控制。

function convertHeading(node: Heading, images: Map<string, ResolvedImage>): Paragraph {
  // 公文标题层级到 H5（四级标题）为止；更深的 H6 回退到四级标题样式。
  const spec = HEADING_LEVEL_SPEC[node.depth] ?? HEADING_LEVEL_SPEC[5];
  const runs = convertInlineNodes(node.children as PhrasingContent[], images, { inheritStyle: true });

  return new Paragraph({
    style: spec.styleId,
    children: runs,
  });
}

// ── 目录 ────────────────────────────────────────
//
// 独占一段的 [TOC] / [[TOC]] 标记 → "目录"标题段（目录标题样式）+ 目录域。
// 目录域打开文档时由 Word 更新（settings.xml 的 updateFields），WPS 若未自动生成
// 条目，右键目录选"更新域"。

function isTocMarker(node: MdParagraph): boolean {
  // 只认独占一段的纯文本；`[TOC]`（行内代码）、*[toc]*、[[TOC]](url) 都是在讲这个写法，不是标记
  const [only] = node.children;
  return node.children.length === 1 && only.type === "text"
    && TOC_MARKER_PATTERN.test((only as Text).value.trim());
}

function createTocBlock(): DocxChild[] {
  return [
    new Paragraph({
      style: TOC_HEADING_STYLE_ID,
      children: [new TextRun({ text: TOC_HEADING_TEXT })],
    }),
    new TableOfContents(TOC_HEADING_TEXT, {
      hyperlink: true,
      headingStyleRange: TOC_HEADING_LEVELS,
    }),
  ];
}

// ── 段落 ────────────────────────────────────────

function convertParagraph(
  node: MdParagraph,
  images: Map<string, ResolvedImage>,
  ctx: RunContext,
  nextNode?: Content,
): DocxChild[] {
  // 目录标记：整段只有 [TOC]
  if (isTocMarker(node)) {
    return createTocBlock();
  }

  // 表题：紧邻表格上方的段落匹配"表N 标题"时，渲染为表上居中题注段，
  // 不再作为普通正文输出（GB/T 7713.1-2006、CY/T 170-2019 4.2.1.2）
  if (nextNode?.type === "table") {
    const caption = buildCaptionText(plainTextOf(node.children as PhrasingContent[]), "表");
    if (caption) {
      return [createCaptionParagraph(caption, true)];
    }
  }

  // 如果段落只包含一张图片，单独处理；alt 匹配"图N"时图下追加图题
  if (node.children.length === 1 && node.children[0].type === "image") {
    const image = node.children[0] as Image;
    const caption = buildCaptionText(image.alt ?? "", "图");
    if (caption) {
      // 图题在图下方（GB/T 7713.2-2022 5.4.3）。docx 库不暴露
      // keepWithPrevious，等价地在图片段上设 keepNext，保证图题与图同页
      return [convertImageParagraph(image, images, true), createCaptionParagraph(caption)];
    }
    return [convertImageParagraph(image, images)];
  }

  const runs = convertInlineNodes(node.children as PhrasingContent[], images, ctx);

  return [
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      indent: { firstLine: FIRST_LINE_INDENT_TWIP },
      spacing: {
        line: LINE_SPACING_TWIP,
        lineRule: lineRuleFor(runs),
        before: 0,
        after: 0,
      },
      children: runs,
    }),
  ];
}

// ── 行距与图片 ──────────────────────────────────
//
// 固定行距（lineRule=exact）会把行高钉死在 28 磅，比这更高的行内图片只露出
// 一条，Word 与 WPS 都如此。图片独占段直接用单倍行距；文字与图片混排的段
// 用"最小值"：文字行仍落在 28 磅网格上，图片所在行按图高撑开。

/** 图片独占段的行距：单倍，让图片按自身高度撑开 */
const IMAGE_PARAGRAPH_SPACING = {
  line: SINGLE_LINE_SPACING_TWIP,
  lineRule: LineRuleType.AUTO,
  before: 0,
  after: 0,
} as const;

function hasImageRun(runs: InlineChild[]): boolean {
  return runs.some((run) => run instanceof ImageRun);
}

/** 文字段落的行距规则：含图片则最小值，否则固定值 */
function lineRuleFor(runs: InlineChild[]): (typeof LineRuleType)[keyof typeof LineRuleType] {
  return hasImageRun(runs) ? LineRuleType.AT_LEAST : LineRuleType.EXACT;
}

// ── 图表题注 ────────────────────────────────────
//
// 匹配与构造规则集中在 ./caption.ts 单一权威源（实现与测试共用）。

/** 提取内联节点的纯文本拼接（表题匹配用） */
function plainTextOf(nodes: PhrasingContent[]): string {
  let out = "";
  for (const n of nodes) {
    if ("value" in n && typeof (n as { value: unknown }).value === "string") {
      out += (n as { value: string }).value;
    } else if ("children" in n && Array.isArray((n as { children: PhrasingContent[] }).children)) {
      out += plainTextOf((n as { children: PhrasingContent[] }).children);
    }
  }
  return out;
}

// ── 图片 ────────────────────────────────────────

/** 未嵌入图片引用的公共占位文案与样式（块级与内联共用，防文案漂移） */
function imagePlaceholderRun(url: string, ctx: RunContext = {}): TextRun {
  const isRemote = url.startsWith("http://") || url.startsWith("https://");
  const text = isRemote ? `[远程图片: ${url}]` : `[图片未找到: ${url}]`;
  return new TextRun({
    text,
    color: COLOR_BLACK,
    italics: true,
    font: ctx.inheritStyle ? undefined : FangSong,
    size: ctx.inheritStyle ? undefined : FONT_SIZE_HALF_PT.BODY,
  });
}

function convertImageParagraph(
  node: Image,
  images: Map<string, ResolvedImage>,
  keepNext = false,
): Paragraph {
  const resolved = images.get(node.url);

  if (!resolved) {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      indent: { firstLine: 0 },
      keepNext: keepNext || undefined,
      children: [imagePlaceholderRun(node.url)],
    });
  }

  return new Paragraph({
    alignment: AlignmentType.CENTER,
    indent: { firstLine: 0 },
    spacing: IMAGE_PARAGRAPH_SPACING,
    keepNext: keepNext || undefined,
    children: [
      new ImageRun({
        data: resolved.buffer,
        transformation: { width: resolved.width, height: resolved.height },
        type: resolved.format,
      }),
    ],
  });
}

// ── 表格（全框线）───────────────────────────────
//
// 表头黑体四号不加粗、水平居中（黑体本身够重，再加粗反而难看）；
// 表体仿宋四号，按 GFM 列对齐；所有单元格垂直居中。

function convertTable(node: MdTable, images: Map<string, ResolvedImage>): Table {
  const rows = node.children as MdTableRow[];
  const alignments = node.align ?? [];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map((row, rowIdx) => {
      const isHeader = rowIdx === 0;
      return new TableRow({
        tableHeader: isHeader,
        children: (row.children as MdTableCell[]).map((cell, colIdx) => {
          const cellAlign = alignments[colIdx];
          const bodyAlign = cellAlign === "center" ? AlignmentType.CENTER
            : cellAlign === "right" ? AlignmentType.RIGHT
            : AlignmentType.LEFT;

          const runs = convertInlineNodes(
            cell.children as PhrasingContent[],
            images,
            {
              font: isHeader ? HeiTi : FangSong,
              size: FONT_SIZE_HALF_PT.TABLE_CELL,
            },
          );

          return new TableCell({
            verticalAlign: VerticalAlignTable.CENTER,
            children: [
              new Paragraph({
                alignment: isHeader ? AlignmentType.CENTER : bodyAlign,
                indent: { firstLine: 0 },  // 覆盖文档默认的首行缩进 2 字
                spacing: {
                  before: 40,
                  after: 40,
                  // 单元格默认继承文档的固定 28 磅；有图片时改最小值，图片才不被裁
                  ...(hasImageRun(runs) ? { line: LINE_SPACING_TWIP, lineRule: LineRuleType.AT_LEAST } : {}),
                },
                children: runs,
              }),
            ],
            borders: {
              top:    { style: BorderStyle.SINGLE, size: TABLE_CONST.INNER_BORDER_SIZE, color: TABLE_CONST.BORDER_COLOR },
              bottom: { style: BorderStyle.SINGLE, size: TABLE_CONST.INNER_BORDER_SIZE, color: TABLE_CONST.BORDER_COLOR },
              left:   { style: BorderStyle.SINGLE, size: TABLE_CONST.INNER_BORDER_SIZE, color: TABLE_CONST.BORDER_COLOR },
              right:  { style: BorderStyle.SINGLE, size: TABLE_CONST.INNER_BORDER_SIZE, color: TABLE_CONST.BORDER_COLOR },
            },
          });
        }),
      });
    }),
  });
}

// ── 列表 ────────────────────────────────────────

// 列表条目按公文正文段落排版：首行缩进 2 字符、回行顶格（不用 Word 的
// "文本之前"左缩进），序号作为文字内容输出。嵌套层级靠加深首行缩进区分。
function convertList(
  node: List,
  images: Map<string, ResolvedImage>,
  depth: number,
  ctx: RunContext = {},
): Paragraph[] {
  const result: Paragraph[] = [];
  const ordered = node.ordered ?? false;

  (node.children as ListItem[]).forEach((item, index) => {
    for (const child of item.children as Content[]) {
      if (child.type === "paragraph") {
        const prefix = ordered ? `${(node.start ?? 1) + index}. ` : "• ";
        const firstLine = FIRST_LINE_INDENT_TWIP + depth * LIST_NEST_INDENT_TWIP;

        const runs = convertInlineNodes(
          (child as MdParagraph).children as PhrasingContent[],
          images,
          ctx,
        );

        result.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine },
            spacing: {
              line: LINE_SPACING_TWIP,
              lineRule: LineRuleType.EXACT,
              before: 0,
              after: 0,
            },
            children: [
              new TextRun({
                text: prefix,
                font: ctx.font ?? FangSong,
                size: ctx.size ?? FONT_SIZE_HALF_PT.BODY,
              }),
              ...runs,
            ],
          }),
        );
      } else if (child.type === "list") {
        result.push(...convertList(child as List, images, depth + 1, ctx));
      }
    }
  });

  return result;
}

// ── 引用块 ──────────────────────────────────────

// 引用块按正文版式排版（首行缩进、两端对齐、无底纹），文字改用楷体与正文
// 区分——中文公文排版不使用斜体。
function convertBlockquote(node: Blockquote, images: Map<string, ResolvedImage>): DocxChild[] {
  const result: DocxChild[] = [];

  for (const child of node.children as Content[]) {
    if (child.type === "paragraph") {
      const runs = convertInlineNodes(
        (child as MdParagraph).children as PhrasingContent[],
        images,
        { font: KaiTi },
      );

      result.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: FIRST_LINE_INDENT_TWIP },
          spacing: {
            line: LINE_SPACING_TWIP,
            lineRule: LineRuleType.EXACT,
            before: 0,
            after: 0,
          },
          children: runs,
        }),
      );
    } else {
      result.push(...convertNodes([child], images, { font: KaiTi }));
    }
  }

  return result;
}

// ── 代码块 ──────────────────────────────────────

/** 代码类段落（代码行、Mermaid 占位、公式源码）：左对齐、无首行缩进，不继承正文版式 */
const CODE_PARAGRAPH = {
  alignment: AlignmentType.LEFT,
  indent: { firstLine: 0 },
} as const;

function convertCodeBlock(node: Code, fidelitySink?: string[]): Paragraph[] {
  const lang = node.lang ?? "";
  const line = node.position?.start.line;
  const where = line ? `（第 ${line} 行）` : "";

  // Mermaid 代码块：灰色提示
  if (lang.toLowerCase() === "mermaid") {
    fidelitySink?.push(`Mermaid 图表${where}：以占位文字呈现，源码附后`);
    return [
      new Paragraph({
        ...CODE_PARAGRAPH,
        shading: { type: ShadingType.CLEAR, fill: SHADING.PLACEHOLDER },
        children: [
          new TextRun({
            text: "[图表：Mermaid 图表未随文档导出，请见源 Markdown]",
            color: COLOR_BLACK,
            italics: true,
            font: FangSong,
            size: FONT_SIZE_HALF_PT.BODY,
          }),
        ],
      }),
      // 附上图表源码，便于收件人对照或回源文档粘贴
      ...node.value.split("\n").map(
        (line) =>
          new Paragraph({
            ...CODE_PARAGRAPH,
            shading: { type: ShadingType.CLEAR, fill: SHADING.CODE },
            spacing: { line: CODE_LINE_SPACING_TWIP, lineRule: LineRuleType.EXACT },
            children: [
              new TextRun({
                text: line || " ",
                font: CodeFont,
                size: FONT_SIZE_HALF_PT.CODE,
              }),
            ],
          }),
      ),
    ];
  }

  // LaTeX 数学块
  if (lang === "math" || lang === "latex" || lang === "tex") {
    fidelitySink?.push(`LaTeX 公式块${where}：以源码文本呈现`);
    return node.value.split("\n").map(
      (line) =>
        new Paragraph({
          ...CODE_PARAGRAPH,
          shading: { type: ShadingType.CLEAR, fill: SHADING.MATH },
          children: [
            new TextRun({
              text: line || " ",
              font: CodeFont,
              size: FONT_SIZE_HALF_PT.BODY,
            }),
          ],
        }),
    );
  }

  // 普通代码块：逐行输出，灰色背景，等宽字体
  return node.value.split("\n").map(
    (line) =>
      new Paragraph({
        ...CODE_PARAGRAPH,
        shading: { type: ShadingType.CLEAR, fill: SHADING.CODE },
        spacing: { line: CODE_LINE_SPACING_TWIP, lineRule: LineRuleType.EXACT },
        children: [
          new TextRun({
            text: line || " ",
            font: CodeFont,
            size: FONT_SIZE_HALF_PT.CODE,
          }),
        ],
      }),
  );
}

// ── 水平线 ──────────────────────────────────────

function convertThematicBreak(): Paragraph {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: 6,
        color: "CCCCCC",
        space: 1,
      },
    },
    children: [],
  });
}

// ── 内联节点转换 ────────────────────────────────

type InlineChild = TextRun | ImageRun;

function convertInlineNodes(
  nodes: PhrasingContent[],
  images: Map<string, ResolvedImage>,
  ctx: RunContext,
): InlineChild[] {
  const result: InlineChild[] = [];

  for (const node of nodes) {
    try {
      switch (node.type) {
        case "text":
          result.push(createTextRun((node as Text).value, ctx));
          break;

        case "strong":
          // "强调"样式：楷体 + Times New Roman 三号，不加粗（用字体区分而非粗细）。
          // 标题内不打直接格式，强调按标题样式原样输出。
          result.push(
            ...convertInlineNodes(
              (node as Strong).children as PhrasingContent[],
              images,
              ctx.inheritStyle ? ctx : { ...ctx, bold: false, font: KaiTi, size: ctx.size ?? FONT_SIZE_HALF_PT.HEADING },
            ),
          );
          break;

        case "emphasis":
          result.push(
            ...convertInlineNodes(
              (node as Emphasis).children as PhrasingContent[],
              images,
              { ...ctx, italic: true },
            ),
          );
          break;

        case "delete":
          result.push(
            ...convertInlineNodes(
              (node as Delete).children as PhrasingContent[],
              images,
              { ...ctx, strikethrough: true },
            ),
          );
          break;

        case "inlineCode":
          result.push(
            new TextRun({
              text: (node as InlineCode).value,
              font: ctx.inheritStyle ? undefined : CodeFont,
              size: ctx.size ?? (ctx.inheritStyle ? undefined : FONT_SIZE_HALF_PT.BODY),
              bold: ctx.bold,
              italics: ctx.italic,
            }),
          );
          break;

        case "link": {
          // 公文中链接输出为黑色普通文字，不使用蓝色 Hyperlink 样式
          const linkNode = node as Link;
          result.push(
            ...convertInlineNodes(
              linkNode.children as PhrasingContent[],
              images,
              { ...ctx },
            ),
          );
          break;
        }

        case "image": {
          const imgNode = node as Image;
          const resolved = images.get(imgNode.url);
          if (resolved) {
            result.push(
              new ImageRun({
                data: resolved.buffer,
                transformation: { width: resolved.width, height: resolved.height },
                type: resolved.format,
              }),
            );
          } else {
            result.push(imagePlaceholderRun(imgNode.url, ctx));
          }
          break;
        }

        case "break":
          result.push(new TextRun({ break: 1 }));
          break;

        default:
          // 尝试提取文本值
          if ("value" in node && typeof (node as { value: string }).value === "string") {
            result.push(createTextRun((node as { value: string }).value, ctx));
          } else if ("children" in node && Array.isArray((node as { children: PhrasingContent[] }).children)) {
            result.push(...convertInlineNodes((node as { children: PhrasingContent[] }).children, images, ctx));
          }
          break;
      }
    } catch (err) {
      console.error(`[ast-to-docx] 无法转换内联 ${node.type} 节点:`, err);
      result.push(
        new TextRun({
          text: `[转换错误: ${node.type}]`,
          color: COLOR_BLACK,
          font: FangSong,
          size: FONT_SIZE_HALF_PT.BODY,
        }),
      );
    }
  }

  return result;
}

function createTextRun(text: string, ctx: RunContext): TextRun {
  return new TextRun({
    text,
    font: ctx.font ?? (ctx.inheritStyle ? undefined : FangSong),
    size: ctx.size ?? (ctx.inheritStyle ? undefined : FONT_SIZE_HALF_PT.BODY),
    bold: ctx.bold,
    italics: ctx.italic,
    strike: ctx.strikethrough,
  });
}
