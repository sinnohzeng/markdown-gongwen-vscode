import JSZip from "jszip";
import type { Content, Root } from "mdast";
import { convertToDocx, packToBuffer } from "../ast-to-docx";
import type { DocxTypographyOverrides } from "../typography";

function root(...children: Content[]): Root {
  return { type: "root", children };
}

function text(value: string): Content {
  return { type: "text", value } as unknown as Content;
}

function paragraph(...children: Content[]): Content {
  return { type: "paragraph", children } as unknown as Content;
}

function heading(depth: number, value: string): Content {
  return { type: "heading", depth, children: [text(value)] } as unknown as Content;
}

function table(header: string, body: string): Content {
  return {
    type: "table",
    align: [null],
    children: [
      { type: "tableRow", children: [{ type: "tableCell", children: [text(header)] }] },
      { type: "tableRow", children: [{ type: "tableCell", children: [text(body)] }] },
    ],
  } as unknown as Content;
}

async function pack(ast: Root, overrides: DocxTypographyOverrides = {}): Promise<JSZip> {
  const doc = convertToDocx(ast, new Map(), undefined, overrides);
  return JSZip.loadAsync(await packToBuffer(doc));
}

async function part(zip: JSZip, name: string): Promise<string> {
  const file = zip.file(name);
  if (!file) throw new Error(`${name} missing`);
  return file.async("string");
}

function paragraphContaining(xml: string, needle: string): string {
  const hit = (xml.match(/<w:p\b[^>]*>.*?<\/w:p>/gs) ?? []).find((p) => p.includes(needle));
  if (!hit) throw new Error(`未找到包含 ${needle} 的段落`);
  return hit;
}

function styleWithId(xml: string, id: string): string {
  const hit = (xml.match(/<w:style\b[^>]*>.*?<\/w:style>/gs) ?? [])
    .find((style) => style.includes(`w:styleId="${id}"`));
  if (!hit) throw new Error(`未找到样式 ${id}`);
  return hit;
}

function docGrid(xml: string): string {
  const grid = xml.match(/<w:docGrid\b[^>]*\/>/)?.[0];
  if (!grid) throw new Error("document.xml 缺少 docGrid");
  return grid;
}

const custom: DocxTypographyOverrides = {
  fonts: {
    body: { eastAsia: "BodyCJK", ascii: "BodyLatin" },
    title: { eastAsia: "TitleCJK" },
    heading1: { eastAsia: "Heading1CJK" },
    heading2: { eastAsia: "Heading2CJK" },
    heading3: { eastAsia: "Heading3CJK" },
    emphasis: { eastAsia: "EmphasisCJK" },
    tableHeader: { eastAsia: "TableHeaderCJK" },
    caption: { eastAsia: "CaptionCJK" },
    pageNumber: { eastAsia: "PageNumberCJK" },
    code: { eastAsia: "CodeCJK", ascii: "CodeLatin", hAnsi: "CodeLatin" },
  },
  fontSizesPt: {
    title: 22,
    heading: 18,
    body: 17,
    pageNumber: 14,
    table: 13,
    caption: 12,
    footnote: 9,
    code: 10.5,
  },
  charsPerLine: 30,
  lineSpacingPt: 30,
  firstLineIndentChars: 1.5,
};

describe("DOCX 自定义排版 OOXML", () => {
  it("默认和自定义配置都生成真实 snapToChars 字符网格", async () => {
    const defaultXml = await part(await pack(root(paragraph(text("正文")))), "word/document.xml");
    expect(docGrid(defaultXml)).toContain('w:type="snapToChars"');
    expect(docGrid(defaultXml)).toContain('w:linePitch="560"');
    expect(docGrid(defaultXml)).toContain('w:charSpace="-848"');

    const customXml = await part(
      await pack(root(paragraph(text("正文"))), { charsPerLine: 30, fontSizesPt: { body: 18 }, lineSpacingPt: 30 }),
      "word/document.xml",
    );
    expect(docGrid(customXml)).toContain('w:type="snapToChars"');
    expect(docGrid(customXml)).toContain('w:linePitch="600"');
    expect(docGrid(customXml)).toContain('w:charSpace="-13353"');
  });

  it("样式表覆盖 Normal、标题、目录、脚注和页码角色", async () => {
    const zip = await pack(root(), custom);
    const xml = await part(zip, "word/styles.xml");
    const defaults = xml.match(/<w:docDefaults>.*?<\/w:docDefaults>/s)?.[0] ?? "";

    expect(defaults).toContain('w:eastAsia="BodyCJK"');
    expect(defaults).toContain('w:ascii="BodyLatin"');
    expect(defaults).toContain('<w:sz w:val="34"/>');
    expect(defaults).toContain('w:line="600"');
    expect(defaults).toContain('w:firstLine="510"');
    expect(styleWithId(xml, "Title")).toContain('w:eastAsia="TitleCJK"');
    expect(styleWithId(xml, "Title")).toContain('<w:sz w:val="44"/>');
    expect(styleWithId(xml, "Heading1")).toContain('w:eastAsia="Heading1CJK"');
    expect(styleWithId(xml, "Heading2")).toContain('w:eastAsia="Heading2CJK"');
    expect(styleWithId(xml, "Heading3")).toContain('w:eastAsia="Heading3CJK"');
    expect(styleWithId(xml, "Heading1")).toContain('<w:sz w:val="36"/>');
    expect(styleWithId(xml, "TOC1")).toContain('w:eastAsia="BodyCJK"');
    expect(styleWithId(xml, "TOC1")).toContain('w:line="600"');
    expect(styleWithId(xml, "TOC2")).toContain('w:left="680"');
    expect(styleWithId(xml, "FootnoteText")).toContain('w:eastAsia="BodyCJK"');
    expect(styleWithId(xml, "FootnoteText")).toContain('<w:sz w:val="18"/>');
    expect(styleWithId(xml, "PageNumber")).toContain('w:eastAsia="PageNumberCJK"');
    expect(styleWithId(xml, "PageNumber")).toContain('<w:sz w:val="28"/>');
  });

  it("正文、强调、行内代码、列表和引用使用解析后的参数", async () => {
    const list = {
      type: "list",
      ordered: false,
      children: [{ type: "listItem", children: [paragraph(text("列表项"))] }],
    } as unknown as Content;
    const ast = root(
      paragraph(text("正文内容")),
      paragraph({ type: "strong", children: [text("强调文本")] } as unknown as Content),
      paragraph({ type: "inlineCode", value: "inline" } as unknown as Content),
      list,
      { type: "blockquote", children: [paragraph(text("引用文本"))] } as unknown as Content,
    );
    const xml = await part(await pack(ast, custom), "word/document.xml");

    const body = paragraphContaining(xml, "正文内容");
    expect(body).toContain('w:eastAsia="BodyCJK"');
    expect(body).toContain('<w:sz w:val="34"/>');
    expect(body).toContain('w:firstLine="510"');
    expect(body).toContain('w:line="600"');
    expect(paragraphContaining(xml, "强调文本")).toContain('w:eastAsia="EmphasisCJK"');
    expect(paragraphContaining(xml, "强调文本")).toContain('<w:sz w:val="34"/>');
    expect(paragraphContaining(xml, "inline")).toContain('w:eastAsia="CodeCJK"');
    expect(paragraphContaining(xml, "列表项")).toContain('w:firstLine="510"');
    expect(paragraphContaining(xml, "引用文本")).toContain('w:eastAsia="EmphasisCJK"');
    expect(paragraphContaining(xml, "引用文本")).toContain('w:firstLine="510"');
  });

  it("表格、代码块、题注、图片占位和页脚没有遗留固定排版", async () => {
    const ast = root(
      table("表头文字", "表体文字"),
      { type: "code", lang: "ts", value: "const x = 1;" } as unknown as Content,
      paragraph(text("表1 指标")),
      table("另一表头", "另一表体"),
      paragraph({ type: "image", url: "missing.png", alt: "图1 架构" } as unknown as Content),
    );
    const zip = await pack(ast, custom);
    const xml = await part(zip, "word/document.xml");

    expect(paragraphContaining(xml, "表头文字")).toContain('w:eastAsia="TableHeaderCJK"');
    expect(paragraphContaining(xml, "表头文字")).toContain('<w:sz w:val="26"/>');
    expect(paragraphContaining(xml, "表体文字")).toContain('w:eastAsia="BodyCJK"');
    expect(paragraphContaining(xml, "const x = 1;")).toContain('w:eastAsia="CodeCJK"');
    expect(paragraphContaining(xml, "const x = 1;")).toContain('<w:sz w:val="21"/>');
    expect(paragraphContaining(xml, "const x = 1;")).toContain('w:line="315"');
    expect(paragraphContaining(xml, "表1　指标")).toContain('w:eastAsia="CaptionCJK"');
    expect(paragraphContaining(xml, "表1　指标")).toContain('<w:sz w:val="24"/>');
    expect(paragraphContaining(xml, "表1　指标")).toContain('w:before="300"');
    expect(paragraphContaining(xml, "[图片未找到: missing.png]")).toContain('w:eastAsia="BodyCJK"');
    expect(paragraphContaining(xml, "图1　架构")).toContain('w:eastAsia="CaptionCJK"');

    const footerParts = Object.keys(zip.files).filter((name) => /^word\/footer\d+\.xml$/.test(name));
    expect(footerParts).toHaveLength(2);
    for (const name of footerParts) {
      const footer = await part(zip, name);
      expect(footer).toContain('<w:pStyle w:val="PageNumber"/>');
      expect(footer).toContain('w:eastAsia="PageNumberCJK"');
      expect(footer).toContain('<w:sz w:val="28"/>');
    }
  });

  it("首行缩进设为 0 不影响目录层级缩进", async () => {
    const zip = await pack(root(paragraph(text("不缩进正文"))), { firstLineIndentChars: 0 });
    const documentXml = await part(zip, "word/document.xml");
    const stylesXml = await part(zip, "word/styles.xml");
    expect(paragraphContaining(documentXml, "不缩进正文")).toContain('w:firstLine="0"');
    expect(styleWithId(stylesXml, "TOC2")).toContain('w:left="640"');
  });
});
