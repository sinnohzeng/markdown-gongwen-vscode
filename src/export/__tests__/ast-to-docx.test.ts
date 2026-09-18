/**
 * ast-to-docx 单元测试。
 *
 * 断言策略：把 Document 打包成真实 DOCX（zip），解出 word/document.xml，
 * 直接对 OOXML 做断言——测的是 Word 实际读到的东西，不是库的中间对象。
 */
import JSZip from "jszip";
import type { Root, Content } from "mdast";
import { convertToDocx, packToBuffer } from "../ast-to-docx";
import {
  CAPTION_SPACING_TWIP,
  FIRST_LINE_INDENT_TWIP,
  FONT_SIZE_HALF_PT,
  LINE_SPACING_TWIP,
  SINGLE_LINE_SPACING_TWIP,
  TOC_LEVEL_INDENT_TWIP,
  TOC_TAB_STOP_TWIP,
} from "../constants";
import type { ResolvedImage } from "../image-resolver";

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

async function toPartXml(ast: Root, part: string, images: Map<string, ResolvedImage>): Promise<string> {
  const doc = convertToDocx(ast, images);
  const buffer = await packToBuffer(doc);
  const zip = await JSZip.loadAsync(buffer);
  const file = zip.file(part);
  if (!file) throw new Error(`${part} missing from packed DOCX`);
  return file.async("string");
}

async function toDocumentXml(
  ast: Root,
  images: Map<string, ResolvedImage> = new Map(),
): Promise<string> {
  return toPartXml(ast, "word/document.xml", images);
}

async function toStylesXml(ast: Root = root()): Promise<string> {
  return toPartXml(ast, "word/styles.xml", new Map());
}

async function toSettingsXml(ast: Root): Promise<string> {
  return toPartXml(ast, "word/settings.xml", new Map());
}

/** 取出 styles.xml 里指定 styleId 的 <w:style>…</w:style> 片段 */
function styleWithId(stylesXml: string, styleId: string): string {
  const styles = stylesXml.match(/<w:style\b[^>]*>.*?<\/w:style>/gs) ?? [];
  const hits = styles.filter((s) => s.includes(`w:styleId="${styleId}"`));
  if (hits.length !== 1) throw new Error(`styleId ${styleId} 出现 ${hits.length} 次，期望 1 次`);
  return hits[0];
}

function heading(depth: number, value: string): Content {
  return { type: "heading", depth, children: [text(value)] } as unknown as Content;
}

function gfmTable(align: (string | null)[], rows: string[][]): Content {
  return {
    type: "table",
    align,
    children: rows.map((cells) => ({
      type: "tableRow",
      children: cells.map((c) => ({ type: "tableCell", children: [text(c)] })),
    })),
  } as unknown as Content;
}

/** 取出包含指定文字的 <w:p>…</w:p> 段落 XML 片段 */
function paragraphContaining(xml: string, needle: string): string {
  const paragraphs = xml.match(/<w:p\b[^>]*>.*?<\/w:p>/gs) ?? [];
  const hit = paragraphs.find((p) => p.includes(needle));
  if (!hit) throw new Error(`未找到包含 "${needle}" 的段落`);
  return hit;
}

// ── 图片段行距：固定行距会把图片裁成一条，图片所在段必须让开 ──

describe("图片段行距", () => {
  const png: ResolvedImage = { buffer: Buffer.alloc(8), width: 10, height: 10, format: "png" };
  const images = new Map<string, ResolvedImage>([["./a.png", png]]);

  it("独占段图片：单倍行距，不继承文档默认的固定 28 磅", async () => {
    const xml = await toDocumentXml(root(paragraph(imageNode("./a.png", "装饰"))), images);
    const p = paragraphContaining(xml, "<w:drawing>");
    expect(p).toContain(`w:line="${SINGLE_LINE_SPACING_TWIP}"`);
    expect(p).toContain('w:lineRule="auto"');
    expect(p).not.toContain(`w:line="${LINE_SPACING_TWIP}"`);
  });

  it("带图题的图片段同样单倍行距，图题段仍在网格上", async () => {
    const xml = await toDocumentXml(root(paragraph(imageNode("./a.png", "图1 架构"))), images);
    expect(paragraphContaining(xml, "<w:drawing>")).toContain('w:lineRule="auto"');
    expect(paragraphContaining(xml, "图1\u3000架构")).not.toContain('w:lineRule="auto"');
  });

  it("文字与图片混排：行距改为最小值 28 磅，文字行不掉网格，图片行可撑开", async () => {
    const ast = root(paragraph(text("见图"), imageNode("./a.png", ""), text("所示")));
    const xml = await toDocumentXml(ast, images);
    const p = paragraphContaining(xml, "<w:drawing>");
    expect(p).toContain(`w:line="${LINE_SPACING_TWIP}"`);
    expect(p).toContain('w:lineRule="atLeast"');
  });

  it("纯文字段落不受影响，仍是固定 28 磅", async () => {
    const xml = await toDocumentXml(root(paragraph(text("正文"))));
    const p = paragraphContaining(xml, "正文");
    expect(p).toContain('w:lineRule="exact"');
  });

  it("表格单元格里的图片：行距改为最小值", async () => {
    const table = {
      type: "table", align: [null],
      children: [
        { type: "tableRow", children: [{ type: "tableCell", children: [text("表头")] }] },
        { type: "tableRow", children: [{ type: "tableCell", children: [imageNode("./a.png", "")] }] },
      ],
    } as unknown as Content;
    const xml = await toDocumentXml(root(table), images);
    expect(paragraphContaining(xml, "<w:drawing>")).toContain('w:lineRule="atLeast"');
    expect(paragraphContaining(xml, "表头")).not.toContain("w:lineRule");
  });
});

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

  it("代码块保留等宽字体与底纹（非公文正文内容），左对齐且无首行缩进", async () => {
    const ast = root({
      type: "code",
      lang: "bash",
      value: "echo hello",
    } as unknown as Content);
    const xml = await toDocumentXml(ast);
    const p = paragraphContaining(xml, "echo hello");
    expect(p).toContain("<w:shd");
    expect(p).toContain('w:ascii="Consolas"');
    expect(p).toContain('<w:jc w:val="left"/>');
    expect(p).toContain('w:firstLine="0"');
  });

  it("空文档兜底生成一个空段落", async () => {
    const xml = await toDocumentXml(root());
    expect(xml).toContain("<w:p");
  });
});

// ── 图表题注（GB/T 7713 族）─────────────────────

function imageNode(url: string, alt: string): Content {
  return { type: "image", url, alt, title: null } as unknown as Content;
}

function tableNode(): Content {
  return {
    type: "table",
    children: [
      {
        type: "tableRow",
        children: [
          { type: "tableCell", children: [text("项目")] },
          { type: "tableCell", children: [text("金额")] },
        ],
      },
    ],
  } as unknown as Content;
}

/** 统计子串出现次数 */
function countOf(xml: string, needle: string): number {
  return xml.split(needle).length - 1;
}

describe("图题（独占段图片 alt 匹配图N）", () => {
  const figAst = root(paragraph(imageNode("./arch.png", "图1 总体架构")));

  it("图题段位于图片段之后", async () => {
    const xml = await toDocumentXml(figAst);
    const imgIdx = xml.indexOf("图片未找到: ./arch.png");
    const capIdx = xml.indexOf("图1\u3000总体架构");
    expect(imgIdx).toBeGreaterThan(-1);
    expect(capIdx).toBeGreaterThan(imgIdx);
  });

  it("已解析图片同样追加图题（图段含 w:drawing）", async () => {
    const images = new Map<string, ResolvedImage>([
      ["./arch.png", { buffer: Buffer.alloc(8), width: 10, height: 10 }],
    ]);
    const xml = await toDocumentXml(figAst, images);
    expect(xml).toContain("<w:drawing>");
    expect(xml.indexOf("<w:drawing>")).toBeLessThan(xml.indexOf("图1\u3000总体架构"));
  });

  it("图题居中", async () => {
    const xml = await toDocumentXml(figAst);
    const p = paragraphContaining(xml, "图1\u3000总体架构");
    expect(p).toContain('<w:jc w:val="center"/>');
  });

  it("图题黑体 + 数字 Times New Roman + 小四 12pt", async () => {
    const xml = await toDocumentXml(figAst);
    const p = paragraphContaining(xml, "图1\u3000总体架构");
    expect(p).toContain('w:eastAsia="SimHei"');
    expect(p).toContain('w:ascii="Times New Roman"');
    expect(p).toContain('<w:sz w:val="24"/>');
  });

  it("图片段设 keepNext，保证图题与图同页", async () => {
    const xml = await toDocumentXml(figAst);
    const p = paragraphContaining(xml, "图片未找到: ./arch.png");
    expect(p).toContain("<w:keepNext/>");
  });

  it("编号与题注间为 1 个汉字空，末尾无标点", async () => {
    const xml = await toDocumentXml(figAst);
    expect(xml).toContain("图1\u3000总体架构");
    expect(xml).not.toContain("图1 总体架构"); // 半角空格被归一为全角
  });

  it("题注段上下各约半行距，首行缩进显式归零", async () => {
    const xml = await toDocumentXml(figAst);
    const p = paragraphContaining(xml, "图1\u3000总体架构");
    expect(p).toContain(`w:before="${CAPTION_SPACING_TWIP}"`);
    expect(p).toContain(`w:after="${CAPTION_SPACING_TWIP}"`);
    expect(p).toContain('w:firstLine="0"');
  });

  it("alt 不匹配图N 的图片不产题注（装饰图不受影响）", async () => {
    const ast = root(paragraph(imageNode("./deco.png", "装饰花纹")));
    const xml = await toDocumentXml(ast);
    expect(xml).toContain("图片未找到: ./deco.png");
    expect(xml).not.toContain("SimHei");
    expect(xml).not.toMatch(/<w:keepNext\/>/);
    // 只有一个段落（占位文字），无题注段
    expect((xml.match(/<w:p\b/g) ?? []).length).toBe(1);
  });

  it("行内混排图片不产题注", async () => {
    const ast = root(paragraph(imageNode("./arch.png", "图1 总体架构"), text("正文混排")));
    const xml = await toDocumentXml(ast);
    expect(xml).toContain("正文混排");
    expect(xml).not.toContain("图1\u3000总体架构");
  });
});

describe("表题（表格上方独立段匹配表N）", () => {
  const tblAst = root(paragraph(text("表1 五年成本对照")), tableNode());

  it("表题段位于表格之前", async () => {
    const xml = await toDocumentXml(tblAst);
    const capIdx = xml.indexOf("表1\u3000五年成本对照");
    const tblIdx = xml.indexOf("<w:tbl>");
    expect(capIdx).toBeGreaterThan(-1);
    expect(tblIdx).toBeGreaterThan(-1);
    expect(capIdx).toBeLessThan(tblIdx);
  });

  it("表题居中、黑体小四、数字 Times New Roman", async () => {
    const xml = await toDocumentXml(tblAst);
    const p = paragraphContaining(xml, "表1\u3000五年成本对照");
    expect(p).toContain('<w:jc w:val="center"/>');
    expect(p).toContain('w:eastAsia="SimHei"');
    expect(p).toContain('w:ascii="Times New Roman"');
    expect(p).toContain('<w:sz w:val="24"/>');
  });

  it("表题段 keepNext 与表同页", async () => {
    const xml = await toDocumentXml(tblAst);
    const p = paragraphContaining(xml, "表1\u3000五年成本对照");
    expect(p).toContain("<w:keepNext/>");
  });

  it("编号与题注间为 1 个汉字空，末尾无标点", async () => {
    const xml = await toDocumentXml(tblAst);
    expect(xml).toContain("表1\u3000五年成本对照");
  });

  it("表题段不重复输出为普通正文", async () => {
    const xml = await toDocumentXml(tblAst);
    expect(countOf(xml, "表1\u3000五年成本对照")).toBe(1);
    const p = paragraphContaining(xml, "表1\u3000五年成本对照");
    expect(p).not.toContain(`w:firstLine="${FIRST_LINE_INDENT_TWIP}"`); // 无正文首行缩进
    expect(p).not.toContain('w:eastAsia="FangSong"');
  });

  it("题注段上下各约半行距", async () => {
    const xml = await toDocumentXml(tblAst);
    const p = paragraphContaining(xml, "表1\u3000五年成本对照");
    expect(p).toContain(`w:before="${CAPTION_SPACING_TWIP}"`);
    expect(p).toContain(`w:after="${CAPTION_SPACING_TWIP}"`);
  });

  it("“表N”段后不跟表格时按普通正文输出", async () => {
    const ast = root(paragraph(text("表1 五年成本对照")));
    const xml = await toDocumentXml(ast);
    const p = paragraphContaining(xml, "表1 五年成本对照");
    expect(p).toContain('w:eastAsia="FangSong"');
    expect(p).toContain(`w:firstLine="${FIRST_LINE_INDENT_TWIP}"`);
    expect(p).not.toContain("<w:keepNext/>");
    expect(xml).not.toContain("SimHei");
  });
});


// ── frontmatter 跳过（项20）──────────────────────

describe("frontmatter 解析", () => {
  it("yaml frontmatter 节点不输出到正文", async () => {
    const ast = root(
      { type: "yaml", value: "title: 请示" } as unknown as Content,
      paragraph(text("正文内容")),
    );
    const xml = await toDocumentXml(ast);
    expect(xml).toContain("正文内容");
    expect(xml).not.toContain("title: 请示");
  });

  it("toml frontmatter 节点不输出到正文", async () => {
    const ast = root(
      { type: "toml", value: 'title = "请示"' } as unknown as Content,
      paragraph(text("正文内容")),
    );
    const xml = await toDocumentXml(ast);
    expect(xml).toContain("正文内容");
    expect(xml).not.toContain("请示\"");
  });
});

// ── 保真告警：降级内容收集（项21）────────────────

describe("导出保真告警（fidelitySink）", () => {
  it("mermaid 代码块被记录为占位降级", async () => {
    const ast = root({ type: "code", lang: "mermaid", value: "graph TD; A-->B" } as unknown as Content);
    const sink: string[] = [];
    const doc = convertToDocx(ast, new Map(), sink);
    await packToBuffer(doc);
    expect(sink.length).toBe(1);
    expect(sink[0]).toContain("Mermaid");
  });

  it("LaTeX 公式块被记录为源码降级", async () => {
    const ast = root({ type: "code", lang: "math", value: "E = mc^2" } as unknown as Content);
    const sink: string[] = [];
    const doc = convertToDocx(ast, new Map(), sink);
    await packToBuffer(doc);
    expect(sink.length).toBe(1);
    expect(sink[0]).toContain("LaTeX");
  });

  it("普通代码块不产生降级记录", async () => {
    const ast = root({ type: "code", lang: "python", value: "print(1)" } as unknown as Content);
    const sink: string[] = [];
    const doc = convertToDocx(ast, new Map(), sink);
    await packToBuffer(doc);
    expect(sink).toHaveLength(0);
  });

  it("降级记录携带源码行号", async () => {
    const ast = root({
      type: "code",
      lang: "mermaid",
      value: "pie",
      position: {
        start: { line: 7, column: 1, offset: 0 },
        end: { line: 9, column: 1, offset: 0 },
      },
    } as unknown as Content);
    const sink: string[] = [];
    convertToDocx(ast, new Map(), sink);
    expect(sink[0]).toContain("第 7 行");
  });
});

// ── 样式表（styles.xml）：只含插件明确定义的样式 ──

describe("样式表 styles.xml", () => {
  it("不再带 docx 库默认注入的 List Paragraph / Strong", async () => {
    const xml = await toStylesXml();
    expect(xml).not.toContain('w:styleId="ListParagraph"');
    expect(xml).not.toContain('w:styleId="Strong"');
    expect(xml).not.toContain("List Paragraph");
  });

  it("每个 styleId 只定义一次", async () => {
    const xml = await toStylesXml();
    const ids = [...xml.matchAll(/w:styleId="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("Normal / 默认段落字体 / 普通表格三个默认样式带 w:default", async () => {
    const xml = await toStylesXml();
    expect(styleWithId(xml, "Normal")).toContain('w:default="1"');
    expect(styleWithId(xml, "DefaultParagraphFont")).toContain('w:name w:val="Default Paragraph Font"');
    expect(styleWithId(xml, "DefaultParagraphFont")).toContain('w:default="1"');
    expect(styleWithId(xml, "TableNormal")).toContain('w:default="1"');
  });

  it("文档默认：仿宋三号、固定 28 磅、首行缩进 2 字、两端对齐", async () => {
    const xml = await toStylesXml();
    const defaults = xml.match(/<w:docDefaults>.*?<\/w:docDefaults>/s)?.[0] ?? "";
    expect(defaults).toContain('w:eastAsia="FangSong"');
    expect(defaults).toContain(`<w:sz w:val="${FONT_SIZE_HALF_PT.BODY}"/>`);
    expect(defaults).toContain(`w:line="${LINE_SPACING_TWIP}"`);
    expect(defaults).toContain(`w:firstLine="${FIRST_LINE_INDENT_TWIP}"`);
    expect(defaults).toContain('<w:jc w:val="both"/>');
  });

  it("标题 1-4 沿用 Word 内建名称 heading N（中文 Word 显示为标题 N），带大纲级别", async () => {
    const xml = await toStylesXml();
    expect(styleWithId(xml, "Heading1")).toContain('<w:name w:val="heading 1"/>');
    expect(styleWithId(xml, "Heading1")).toContain('<w:outlineLvl w:val="0"/>');
    expect(styleWithId(xml, "Heading4")).toContain('<w:outlineLvl w:val="3"/>');
    expect(styleWithId(xml, "Heading7")).toContain('<w:outlineLvl w:val="6"/>');
    expect(styleWithId(xml, "Title")).not.toContain("w:outlineLvl");
    expect(styleWithId(xml, "Heading1")).toContain('w:eastAsia="SimHei"');
    expect(styleWithId(xml, "Heading2")).toContain('w:eastAsia="KaiTi"');
    expect(styleWithId(xml, "Heading3")).toContain("<w:b/>");
    expect(styleWithId(xml, "Heading4")).not.toContain("<w:b/>");
  });

  it("标题 5/6/7 定义为仿宋三号不加粗，与标题 4 同外观", async () => {
    const xml = await toStylesXml();
    for (const level of [5, 6, 7]) {
      const style = styleWithId(xml, `Heading${level}`);
      expect(style).toContain(`<w:name w:val="heading ${level}"/>`);
      expect(style).toContain('w:eastAsia="FangSong"');
      expect(style).toContain(`<w:sz w:val="${FONT_SIZE_HALF_PT.HEADING}"/>`);
      expect(style).not.toContain("<w:b/>");
    }
  });

  it("目录标题：黑体三号居中，无首行缩进，样式面板里可见", async () => {
    const xml = await toStylesXml();
    const style = styleWithId(xml, "TOCTitle");
    expect(style).toContain('<w:name w:val="目录标题"/>');
    expect(style).toContain('w:eastAsia="SimHei"');
    expect(style).toContain(`<w:sz w:val="${FONT_SIZE_HALF_PT.HEADING}"/>`);
    expect(style).toContain('<w:jc w:val="center"/>');
    expect(style).toContain('w:firstLine="0"');
    expect(style).not.toContain("<w:b/>");
    expect(style).not.toContain("<w:semiHidden/>");
  });

  it("Word 自动目录用的 TOC Heading：外观全部继承目录标题，平时隐藏不占样式面板", async () => {
    const xml = await toStylesXml();
    const style = styleWithId(xml, "TOCHeading");
    expect(style).toContain('<w:name w:val="TOC Heading"/>');
    expect(style).toContain('<w:basedOn w:val="TOCTitle"/>');
    expect(style).toContain("<w:semiHidden/>");
    expect(style).toContain("<w:unhideWhenUsed/>");
    expect(style).not.toContain("<w:rPr>");
    expect(xml).not.toContain("TOCHeadingWPS");
  });

  it("目录条目 toc 1-3：仿宋三号，逐级左缩进 2 字，版心右缘点线制表位", async () => {
    const xml = await toStylesXml();
    for (const level of [1, 2, 3]) {
      const style = styleWithId(xml, `TOC${level}`);
      expect(style).toContain(`<w:name w:val="toc ${level}"/>`);
      expect(style).toContain('w:eastAsia="FangSong"');
      expect(style).toContain(`w:left="${(level - 1) * TOC_LEVEL_INDENT_TWIP}"`);
      expect(style).toContain(`<w:tab w:val="right" w:leader="dot" w:pos="${TOC_TAB_STOP_TWIP}"/>`);
      expect(style).toContain(`w:line="${LINE_SPACING_TWIP}"`);
    }
  });

  it("超链接：黑色、无下划线", async () => {
    const xml = await toStylesXml();
    const style = styleWithId(xml, "Hyperlink");
    expect(style).toContain('<w:color w:val="000000"/>');
    expect(style).toContain('<w:u w:val="none"/>');
  });

  it("脚注 / 尾注文本：仿宋小五、单倍行距、无首行缩进；引用编号上标", async () => {
    const xml = await toStylesXml();
    for (const kind of ["Footnote", "Endnote"]) {
      const textStyle = styleWithId(xml, `${kind}Text`);
      expect(textStyle).toContain(`<w:name w:val="${kind.toLowerCase()} text"/>`);
      expect(textStyle).toContain('w:eastAsia="FangSong"');
      expect(textStyle).toContain(`<w:sz w:val="${FONT_SIZE_HALF_PT.FOOTNOTE}"/>`);
      expect(textStyle).toContain('w:line="240"');
      expect(textStyle).toContain('w:firstLine="0"');
      expect(styleWithId(xml, `${kind}Reference`)).toContain('<w:vertAlign w:val="superscript"/>');
    }
  });
});

// ── 表格：表头黑体不加粗居中，单元格垂直居中 ──

describe("表格表头与单元格", () => {
  const tableAst = root(gfmTable([null, "right"], [["系统", "数量"], ["行业系统", "12"]]));

  it("表头黑体、不加粗、水平居中（忽略列对齐）", async () => {
    const xml = await toDocumentXml(tableAst);
    const p = paragraphContaining(xml, "数量");
    expect(p).toContain('w:eastAsia="SimHei"');
    expect(p).toContain('<w:jc w:val="center"/>');
    expect(p).not.toContain("<w:b/>");
  });

  it("表体仿宋四号，按 GFM 列对齐，默认左对齐", async () => {
    const xml = await toDocumentXml(tableAst);
    const left = paragraphContaining(xml, "行业系统");
    const right = paragraphContaining(xml, "12");
    expect(left).toContain('w:eastAsia="FangSong"');
    expect(left).toContain(`<w:sz w:val="${FONT_SIZE_HALF_PT.TABLE_CELL}"/>`);
    expect(left).toContain('<w:jc w:val="left"/>');
    expect(right).toContain('<w:jc w:val="right"/>');
  });

  it("单元格垂直居中，段落首行缩进归零", async () => {
    const xml = await toDocumentXml(tableAst);
    expect(countOf(xml, '<w:vAlign w:val="center"/>')).toBe(4);
    expect(paragraphContaining(xml, "行业系统")).toContain('w:firstLine="0"');
  });
});

// ── 标题：文字不打直接格式，字体由样式承担 ──

describe("标题文字继承样式", () => {
  it("标题 run 不写字体字号（目录域不会把标题字体带进条目）", async () => {
    const xml = await toDocumentXml(root(heading(2, "一、总体说明"), heading(4, "三级标题项")));
    const h1 = paragraphContaining(xml, "一、总体说明");
    expect(h1).toContain('<w:pStyle w:val="Heading1"/>');
    expect(h1).not.toContain("w:rFonts");
    expect(h1).not.toContain("<w:sz ");
    const h3 = paragraphContaining(xml, "三级标题项");
    expect(h3).toContain('<w:pStyle w:val="Heading3"/>');
    expect(h3).not.toContain("<w:b/>");
  });

  it("标题内的强调与行内代码同样不打直接格式", async () => {
    const ast = root({
      type: "heading",
      depth: 2,
      children: [
        text("关于"),
        { type: "strong", children: [text("重点")] },
        { type: "inlineCode", value: "code" },
      ],
    } as unknown as Content);
    const xml = await toDocumentXml(ast);
    const p = paragraphContaining(xml, "重点");
    expect(p).not.toContain("w:rFonts");
    expect(p).not.toContain("<w:sz ");
    expect(p).not.toContain("<w:b");
  });
});

// ── [TOC] 标记：目录标题段 + 目录域 ──

describe("[TOC] 目录标记", () => {
  const tocAst = root(paragraph(text("[TOC]")), heading(2, "一、总体说明"));

  it("独占段 [TOC] 输出目录标题段（目录标题样式）与目录域", async () => {
    const xml = await toDocumentXml(tocAst);
    const title = paragraphContaining(xml, "目录");
    expect(title).toContain('<w:pStyle w:val="TOCTitle"/>');
    expect(xml).toContain("TOC \\h \\o &quot;1-2&quot;");
    expect(xml).not.toContain("[TOC]");
  });

  it("[[toc]] 同样识别，大小写不敏感", async () => {
    const xml = await toDocumentXml(root(paragraph(text("[[toc]]"))));
    expect(xml).toContain('<w:pStyle w:val="TOCTitle"/>');
  });

  it("带其他文字的段落不是目录标记", async () => {
    const xml = await toDocumentXml(root(paragraph(text("[TOC] 见下"))));
    expect(xml).not.toContain("TOCTitle");
    expect(xml).toContain("[TOC] 见下");
  });

  it("行内代码、强调、链接里的 [TOC] 不是目录标记（讲解这个写法的文档不会冒出目录）", async () => {
    const ast = root(
      paragraph({ type: "inlineCode", value: "[TOC]" } as unknown as Content),
      paragraph({ type: "emphasis", children: [text("[toc]")] } as unknown as Content),
      paragraph({ type: "link", url: "https://example.com", children: [text("[[TOC]]")] } as unknown as Content),
    );
    const xml = await toDocumentXml(ast);
    expect(xml).not.toContain("TOCTitle");
    expect(xml).not.toContain("<w:sdt>");
    for (const literal of ["[TOC]", "[toc]", "[[TOC]]"]) expect(xml).toContain(literal);
  });

  it("含目录域时 settings.xml 写 updateFields，否则不写", async () => {
    expect(await toSettingsXml(tocAst)).toContain("<w:updateFields/>");
    expect(await toSettingsXml(root(paragraph(text("普通正文"))))).not.toContain("<w:updateFields");
  });
});
