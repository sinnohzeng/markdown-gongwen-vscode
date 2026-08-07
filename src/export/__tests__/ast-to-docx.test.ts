/**
 * ast-to-docx 单元测试。
 *
 * 断言策略：把 Document 打包成真实 DOCX（zip），解出 word/document.xml，
 * 直接对 OOXML 做断言——测的是 Word 实际读到的东西，不是库的中间对象。
 */
import JSZip from "jszip";
import type { Root, Content } from "mdast";
import { convertToDocx, packToBuffer } from "../ast-to-docx";
import { CAPTION_SPACING_TWIP, FIRST_LINE_INDENT_TWIP } from "../constants";
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

async function toDocumentXml(
  ast: Root,
  images: Map<string, ResolvedImage> = new Map(),
): Promise<string> {
  const doc = convertToDocx(ast, images);
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

  it("题注段上下各约半行距，无首行缩进", async () => {
    const xml = await toDocumentXml(figAst);
    const p = paragraphContaining(xml, "图1\u3000总体架构");
    expect(p).toContain(`w:before="${CAPTION_SPACING_TWIP}"`);
    expect(p).toContain(`w:after="${CAPTION_SPACING_TWIP}"`);
    expect(p).not.toMatch(/w:firstLine=/);
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
    expect(p).not.toMatch(/w:firstLine=/); // 无正文首行缩进
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
