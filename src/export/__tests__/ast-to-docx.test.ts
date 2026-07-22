/**
 * ast-to-docx 单元测试。
 *
 * 断言策略：把 Document 打包成真实 DOCX（zip），解出 word/document.xml，
 * 直接对 OOXML 做断言——测的是 Word 实际读到的东西，不是库的中间对象。
 */
import JSZip from "jszip";
import type { Root, Content } from "mdast";
import { convertToDocx, packToBuffer } from "../ast-to-docx";
import { FIRST_LINE_INDENT_TWIP } from "../constants";

// ── 工具 ────────────────────────────────────────

function root(...children: Content[]): Root {
  return { type: "root", children };
}

function text(value: string): Content {
  return { type: "text", value } as unknown as Content;
}

function paragraph(...children: Content[]): Content {
  return { type: "paragraph", children } as unknown as Content;
}

async function toDocumentXml(ast: Root): Promise<string> {
  const doc = convertToDocx(ast, new Map());
  const buffer = await packToBuffer(doc);
  const zip = await JSZip.loadAsync(buffer);
  const file = zip.file("word/document.xml");
  if (!file) throw new Error("word/document.xml missing from packed DOCX");
  return file.async("string");
}

/** 取出包含指定文字的 <w:p>…</w:p> 段落 XML 片段 */
function paragraphContaining(xml: string, needle: string): string {
  const paragraphs = xml.match(/<w:p\b[^>]*>.*?<\/w:p>/gs) ?? [];
  const hit = paragraphs.find((p) => p.includes(needle));
  if (!hit) throw new Error(`未找到包含 "${needle}" 的段落`);
  return hit;
}

// ── 引用块：楷体正文，无底纹、无斜体、首行缩进 ──

describe("blockquote 引用块", () => {
  const quoteAst = root({
    type: "blockquote",
    children: [paragraph(text("本办法所称工作秘密"))],
  } as unknown as Content);

  it("文字使用楷体（eastAsia=KaiTi）", async () => {
    const xml = await toDocumentXml(quoteAst);
    const p = paragraphContaining(xml, "本办法所称工作秘密");
    expect(p).toContain('w:eastAsia="KaiTi"');
  });

  it("不使用斜体", async () => {
    const xml = await toDocumentXml(quoteAst);
    const p = paragraphContaining(xml, "本办法所称工作秘密");
    expect(p).not.toContain("<w:i/>");
    expect(p).not.toContain('<w:i ');
  });

  it("不使用背景底纹", async () => {
    const xml = await toDocumentXml(quoteAst);
    const p = paragraphContaining(xml, "本办法所称工作秘密");
    expect(p).not.toContain("<w:shd");
  });

  it("与正文一致：首行缩进 2 字符，无左缩进", async () => {
    const xml = await toDocumentXml(quoteAst);
    const p = paragraphContaining(xml, "本办法所称工作秘密");
    expect(p).toContain(`w:firstLine="${FIRST_LINE_INDENT_TWIP}"`);
    expect(p).not.toMatch(/<w:ind[^>]*w:left=/);
  });

  it("两端对齐", async () => {
    const xml = await toDocumentXml(quoteAst);
    const p = paragraphContaining(xml, "本办法所称工作秘密");
    expect(p).toContain('<w:jc w:val="both"/>');
  });

  it("引用内嵌套列表同样使用楷体", async () => {
    const ast = root({
      type: "blockquote",
      children: [
        {
          type: "list",
          ordered: true,
          children: [
            { type: "listItem", children: [paragraph(text("嵌套条目"))] },
          ],
        },
      ],
    } as unknown as Content);
    const xml = await toDocumentXml(ast);
    const p = paragraphContaining(xml, "嵌套条目");
    expect(p).toContain('w:eastAsia="KaiTi"');
  });
});

// ── 列表：首行缩进而非"文本之前"左缩进 ──────────

describe("list 列表段落", () => {
  const orderedAst = root({
    type: "list",
    ordered: true,
    start: 1,
    children: [
      { type: "listItem", children: [paragraph(text("分区承载"))] },
      { type: "listItem", children: [paragraph(text("分级防护"))] },
    ],
  } as unknown as Content);

  it("有序列表使用首行缩进，不使用左缩进", async () => {
    const xml = await toDocumentXml(orderedAst);
    const p = paragraphContaining(xml, "分区承载");
    expect(p).toContain(`w:firstLine="${FIRST_LINE_INDENT_TWIP}"`);
    expect(p).not.toMatch(/<w:ind[^>]*w:left=/);
  });

  it("有序列表序号连续编号", async () => {
    const xml = await toDocumentXml(orderedAst);
    expect(paragraphContaining(xml, "分区承载")).toContain("1.");
    expect(paragraphContaining(xml, "分级防护")).toContain("2.");
  });

  it("有序列表尊重 start 起始值", async () => {
    const ast = root({
      type: "list",
      ordered: true,
      start: 4,
      children: [
        { type: "listItem", children: [paragraph(text("合同管理"))] },
      ],
    } as unknown as Content);
    const xml = await toDocumentXml(ast);
    expect(paragraphContaining(xml, "合同管理")).toContain("4.");
  });

  it("无序列表同样使用首行缩进", async () => {
    const ast = root({
      type: "list",
      ordered: false,
      children: [
        { type: "listItem", children: [paragraph(text("要点一"))] },
      ],
    } as unknown as Content);
    const xml = await toDocumentXml(ast);
    const p = paragraphContaining(xml, "要点一");
    expect(p).toContain(`w:firstLine="${FIRST_LINE_INDENT_TWIP}"`);
    expect(p).not.toMatch(/<w:ind[^>]*w:left=/);
  });

  it("嵌套列表加深首行缩进以示层级", async () => {
    const ast = root({
      type: "list",
      ordered: true,
      children: [
        {
          type: "listItem",
          children: [
            paragraph(text("父条目")),
            {
              type: "list",
              ordered: false,
              children: [
                { type: "listItem", children: [paragraph(text("子条目"))] },
              ],
            },
          ],
        },
      ],
    } as unknown as Content);
    const xml = await toDocumentXml(ast);
    const parent = paragraphContaining(xml, "父条目");
    const child = paragraphContaining(xml, "子条目");
    const firstLineOf = (p: string): number =>
      Number(/w:firstLine="(\d+)"/.exec(p)?.[1] ?? NaN);
    expect(firstLineOf(child)).toBeGreaterThan(firstLineOf(parent));
    expect(child).not.toMatch(/<w:ind[^>]*w:left=/);
  });

  it("列表段落两端对齐", async () => {
    const xml = await toDocumentXml(orderedAst);
    const p = paragraphContaining(xml, "分区承载");
    expect(p).toContain('<w:jc w:val="both"/>');
  });
});

// ── 既有行为回归保护 ────────────────────────────

describe("既有导出行为回归", () => {
  it("H1 使用 Title 样式（公文标题）", async () => {
    const ast = root({
      type: "heading",
      depth: 1,
      children: [text("关于某事项的说明")],
    } as unknown as Content);
    const xml = await toDocumentXml(ast);
    const p = paragraphContaining(xml, "关于某事项的说明");
    expect(p).toContain('<w:pStyle w:val="Title"/>');
  });

  it("H5 使用四级标题样式 Heading4", async () => {
    const ast = root({
      type: "heading",
      depth: 5,
      children: [text("四级标题项")],
    } as unknown as Content);
    const xml = await toDocumentXml(ast);
    const p = paragraphContaining(xml, "四级标题项");
    expect(p).toContain('<w:pStyle w:val="Heading4"/>');
  });

  it("H6 回退到四级标题样式 Heading4（公文标题止于四级）", async () => {
    const ast = root({
      type: "heading",
      depth: 6,
      children: [text("更深层级项")],
    } as unknown as Content);
    const xml = await toDocumentXml(ast);
    const p = paragraphContaining(xml, "更深层级项");
    expect(p).toContain('<w:pStyle w:val="Heading4"/>');
  });

  it("加粗导出为楷体不加粗（公文用字体区分强调）", async () => {
    const ast = root(
      paragraph({
        type: "strong",
        children: [text("重点内容")],
      } as unknown as Content),
    );
    const xml = await toDocumentXml(ast);
    const p = paragraphContaining(xml, "重点内容");
    expect(p).toContain('w:eastAsia="KaiTi"');
    expect(p).not.toContain("<w:b/>");
  });

  it("正文段落使用仿宋 + 首行缩进", async () => {
    const ast = root(paragraph(text("正文内容示例")));
    const xml = await toDocumentXml(ast);
    const p = paragraphContaining(xml, "正文内容示例");
    expect(p).toContain('w:eastAsia="FangSong"');
    expect(p).toContain(`w:firstLine="${FIRST_LINE_INDENT_TWIP}"`);
  });

  it("代码块保留等宽字体与底纹（非公文正文内容）", async () => {
    const ast = root({
      type: "code",
      lang: "bash",
      value: "echo hello",
    } as unknown as Content);
    const xml = await toDocumentXml(ast);
    const p = paragraphContaining(xml, "echo hello");
    expect(p).toContain("<w:shd");
    expect(p).toContain('w:ascii="Consolas"');
  });

  it("空文档兜底生成一个空段落", async () => {
    const xml = await toDocumentXml(root());
    expect(xml).toContain("<w:p");
  });
});
