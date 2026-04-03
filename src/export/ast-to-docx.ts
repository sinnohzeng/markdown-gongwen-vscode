/**
 * mdast AST → docx Document 纯函数转换。
 *
 * 零 VS Code API 依赖，可直接用 Jest 单元测试。
 * 每个节点处理器独立 try/catch —— 单节点失败只插入诊断文字，不中断整体导出。
 */
import type { Root, Content, Heading, Paragraph as MdParagraph, Table as MdTable, List, ListItem, Blockquote, Code, Image, Link, Text, Strong, Emphasis, InlineCode, ThematicBreak, Delete, TableRow as MdTableRow, TableCell as MdTableCell, PhrasingContent, BlockContent } from "mdast";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  ImageRun,
  LineRuleType,
  Packer,
  PageBreak,
  Paragraph,
  ShadingType,
  SimpleField,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  type FileChild,
  type IParagraphOptions,
} from "docx";
import type { ResolvedImage } from "./image-resolver";
import {
  FONT_SIZE_HALF_PT,
  XiaoBiaoSong, HeiTi, KaiTi, FangSong, SongTi, CodeFont,
  FIRST_LINE_INDENT_TWIP,
  LINE_SPACING_TWIP,
  TABLE as TABLE_CONST,
  type FontSpec,
} from "./constants";
import { createDocumentStyles, createSectionProperties, createDefaultFooter, createEvenFooter } from "./gbt9704-styles";

// ── 类型 ────────────────────────────────────────

type DocxChild = Paragraph | Table;

// ── 标题级别 → 样式映射 ─────────────────────────
//   Markdown H1 → Title（公文标题）
//   Markdown H2 → Heading1（一级标题 黑体）
//   Markdown H3 → Heading2（二级标题 楷体）
//   Markdown H4 → Heading3（三级标题 仿宋加粗）
//   Markdown H5 → Heading4（四级标题 仿宋）

interface HeadingStyle {
  styleId: string;
  font: FontSpec;
  bold: boolean;
  size: number;
}

// 标题不设首行缩进——公文中标题编号（一、/（一）/1.）是文字内容的一部分，
// 缩进由 Markdown 文本本身的空格控制，不由 Word 段落样式控制。
const HEADING_MAP: Record<number, HeadingStyle> = {
  1: { styleId: "Title",    font: XiaoBiaoSong,      bold: false, size: FONT_SIZE_HALF_PT.TITLE },
  2: { styleId: "Heading1", font: HeiTi, bold: false, size: FONT_SIZE_HALF_PT.HEADING },
  3: { styleId: "Heading2", font: KaiTi, bold: false, size: FONT_SIZE_HALF_PT.HEADING },
  4: { styleId: "Heading3", font: FangSong,        bold: true,  size: FONT_SIZE_HALF_PT.HEADING },
  5: { styleId: "Heading4", font: FangSong,        bold: false, size: FONT_SIZE_HALF_PT.HEADING },
};

// ── 公开入口 ────────────────────────────────────

/**
 * 将 mdast AST 转换为 docx Document 对象。
 * 纯函数，无副作用。
 */
export function convertToDocx(
  ast: Root,
  resolvedImages: Map<string, ResolvedImage>,
): Document {
  const children = convertNodes(ast.children, resolvedImages, {});

  // 空文档保护：至少一个空段落
  if (children.length === 0) {
    children.push(new Paragraph({}));
  }

  return new Document({
    styles: createDocumentStyles(),
    features: { updateFields: true },
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
}

function convertNodes(
  nodes: Content[],
  images: Map<string, ResolvedImage>,
  ctx: RunContext,
): DocxChild[] {
  const result: DocxChild[] = [];

  for (const node of nodes) {
    try {
      // 跳过 frontmatter
      if (node.type === "yaml" || node.type === "toml") continue;

      switch (node.type) {
        case "heading":
          result.push(convertHeading(node as Heading, images));
          break;
        case "paragraph":
          result.push(convertParagraph(node as MdParagraph, images, ctx));
          break;
        case "table":
          result.push(convertTable(node as MdTable, images));
          break;
        case "list":
          result.push(...convertList(node as List, images, 0));
          break;
        case "blockquote":
          result.push(...convertBlockquote(node as Blockquote, images));
          break;
        case "code":
          result.push(...convertCodeBlock(node as Code));
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
      // 错误边界：插入诊断文字
      result.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[导出错误: 无法转换 ${node.type}]`,
              color: "000000",
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

function convertHeading(node: Heading, images: Map<string, ResolvedImage>): Paragraph {
  const style = HEADING_MAP[node.depth] ?? HEADING_MAP[5];
  const runs = convertInlineNodes(node.children as PhrasingContent[], images, {
    font: style.font,
    size: style.size,
    bold: style.bold,
  });

  return new Paragraph({
    style: style.styleId,
    children: runs,
  });
}

// ── 段落 ────────────────────────────────────────

function convertParagraph(
  node: MdParagraph,
  images: Map<string, ResolvedImage>,
  ctx: RunContext,
): Paragraph {
  // 如果段落只包含一张图片，单独处理
  if (node.children.length === 1 && node.children[0].type === "image") {
    return convertImageParagraph(node.children[0] as Image, images);
  }

  const runs = convertInlineNodes(node.children as PhrasingContent[], images, ctx);

  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: FIRST_LINE_INDENT_TWIP },
    spacing: {
      line: LINE_SPACING_TWIP,
      lineRule: LineRuleType.EXACT,
      before: 0,
      after: 0,
    },
    children: runs,
  });
}

// ── 图片 ────────────────────────────────────────

function convertImageParagraph(node: Image, images: Map<string, ResolvedImage>): Paragraph {
  const resolved = images.get(node.url);

  if (!resolved) {
    // 占位文字
    const isRemote = node.url.startsWith("http://") || node.url.startsWith("https://");
    const text = isRemote
      ? `[远程图片: ${node.url}]`
      : `[图片未找到: ${node.url}]`;
    const color = "000000";

    return new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, color, italics: true, font: FangSong, size: FONT_SIZE_HALF_PT.BODY })],
    });
  }

  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new ImageRun({
        data: resolved.buffer,
        transformation: { width: resolved.width, height: resolved.height },
        type: "png",
      }),
    ],
  });
}

// ── 表格（三线表）───────────────────────────────

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
          const docxAlign = cellAlign === "center" ? AlignmentType.CENTER
            : cellAlign === "right" ? AlignmentType.RIGHT
            : AlignmentType.LEFT;

          const runs = convertInlineNodes(
            cell.children as PhrasingContent[],
            images,
            {
              bold: isHeader,
              font: isHeader ? HeiTi : FangSong,
              size: FONT_SIZE_HALF_PT.TABLE_CELL,
            },
          );

          return new TableCell({
            children: [
              new Paragraph({
                alignment: docxAlign,
                spacing: { before: 40, after: 40 },
                children: runs,
              }),
            ],
            borders: {
              top: {
                style: BorderStyle.SINGLE,
                size: rowIdx === 0 ? TABLE_CONST.OUTER_BORDER_SIZE : TABLE_CONST.INNER_BORDER_SIZE,
                color: TABLE_CONST.BORDER_COLOR,
              },
              bottom: {
                style: BorderStyle.SINGLE,
                size: rowIdx === rows.length - 1 ? TABLE_CONST.OUTER_BORDER_SIZE : TABLE_CONST.INNER_BORDER_SIZE,
                color: TABLE_CONST.BORDER_COLOR,
              },
              left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
          });
        }),
      });
    }),
  });
}

// ── 列表 ────────────────────────────────────────

function convertList(
  node: List,
  images: Map<string, ResolvedImage>,
  depth: number,
): Paragraph[] {
  const result: Paragraph[] = [];
  const ordered = node.ordered ?? false;

  (node.children as ListItem[]).forEach((item, index) => {
    for (const child of item.children as Content[]) {
      if (child.type === "paragraph") {
        const prefix = ordered ? `${(node.start ?? 1) + index}. ` : "• ";
        const indent = FIRST_LINE_INDENT_TWIP + depth * 320; // 额外缩进

        const runs = convertInlineNodes(
          (child as MdParagraph).children as PhrasingContent[],
          images,
          {},
        );

        result.push(
          new Paragraph({
            indent: { left: indent },
            spacing: {
              line: LINE_SPACING_TWIP,
              lineRule: LineRuleType.EXACT,
              before: 0,
              after: 0,
            },
            children: [
              new TextRun({ text: prefix, font: FangSong, size: FONT_SIZE_HALF_PT.BODY }),
              ...runs,
            ],
          }),
        );
      } else if (child.type === "list") {
        result.push(...convertList(child as List, images, depth + 1));
      }
    }
  });

  return result;
}

// ── 引用块 ──────────────────────────────────────

function convertBlockquote(node: Blockquote, images: Map<string, ResolvedImage>): Paragraph[] {
  const result: Paragraph[] = [];

  for (const child of node.children as Content[]) {
    if (child.type === "paragraph") {
      const runs = convertInlineNodes(
        (child as MdParagraph).children as PhrasingContent[],
        images,
        { italic: true },
      );

      result.push(
        new Paragraph({
          indent: { left: FIRST_LINE_INDENT_TWIP },
          spacing: {
            line: LINE_SPACING_TWIP,
            lineRule: LineRuleType.EXACT,
          },
          shading: { type: ShadingType.CLEAR, fill: "F5F5F5" },
          children: runs,
        }),
      );
    } else {
      result.push(...convertNodes([child], images, { italic: true }));
    }
  }

  return result;
}

// ── 代码块 ──────────────────────────────────────

function convertCodeBlock(node: Code): Paragraph[] {
  const lang = node.lang ?? "";

  // Mermaid 代码块：灰色提示
  if (lang.toLowerCase() === "mermaid") {
    return [
      new Paragraph({
        shading: { type: ShadingType.CLEAR, fill: "F0F0F0" },
        children: [
          new TextRun({
            text: "[图表请在 VS Code 中预览]",
            color: "000000",
            italics: true,
            font: FangSong,
            size: FONT_SIZE_HALF_PT.BODY,
          }),
        ],
      }),
    ];
  }

  // LaTeX 数学块
  if (lang === "math" || lang === "latex" || lang === "tex") {
    return node.value.split("\n").map(
      (line) =>
        new Paragraph({
          shading: { type: ShadingType.CLEAR, fill: "F8F8F8" },
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
        shading: { type: ShadingType.CLEAR, fill: "F5F5F5" },
        spacing: { line: 300, lineRule: LineRuleType.EXACT },
        children: [
          new TextRun({
            text: line || " ",
            font: CodeFont,
            size: 20, // 10pt for code
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
          // "强调"样式：楷体 + Times New Roman 三号，不加粗（用字体区分而非粗细）
          result.push(
            ...convertInlineNodes(
              (node as Strong).children as PhrasingContent[],
              images,
              { ...ctx, bold: false, font: KaiTi, size: ctx.size ?? FONT_SIZE_HALF_PT.HEADING },
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
              font: CodeFont,
              size: ctx.size ?? FONT_SIZE_HALF_PT.BODY,
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
                type: "png",
              }),
            );
          } else {
            const isRemote = imgNode.url.startsWith("http");
            result.push(
              new TextRun({
                text: isRemote ? `[远程图片]` : `[图片]`,
                color: "000000",
                italics: true,
                font: FangSong,
                size: ctx.size ?? FONT_SIZE_HALF_PT.BODY,
              }),
            );
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
    } catch {
      result.push(
        new TextRun({
          text: `[转换错误: ${node.type}]`,
          color: "000000",
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
    font: ctx.font ?? FangSong,
    size: ctx.size ?? FONT_SIZE_HALF_PT.BODY,
    bold: ctx.bold,
    italics: ctx.italic,
    strike: ctx.strikethrough,
  });
}
