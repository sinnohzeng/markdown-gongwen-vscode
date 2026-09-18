# 规约：导出 DOCX 样式表收口与目录标题

**目录**：`specs/006-docx-style-polish/` | **日期**：2026-09-17 | **状态**：已实施（v2.3.0）

## 背景

v2.2.0 导出的 DOCX 在 Word / WPS 的样式面板里混着一批没有设计过的样式：标题 5、标题 6、超链接（蓝色下划线）、脚注文本（10pt 且继承了正文首行缩进）、脚注引用、尾注文本、尾注引用、List Paragraph、Strong。这些不是插件写的，是 `docx` 库无条件注入的默认样式集，插件代码从未给任何段落套用过其中的 List Paragraph 与 Strong。

同时两处代码与规范文档不一致：表头在文档里写的是“黑体四号，居中”，代码实际输出左对齐加粗；文档声称标题 5/6/7 样式“已于 2026-07 删除”，实际库默认值仍在输出。

用户在 WPS 里插入自动目录后，“目录”二字每次都要手动改字体，希望导出文件自带正确设置。

## 目标

1. 导出文件的样式表只含插件明确定义的样式，每一条都按 GB/T 9704-2012 取值；国标没有规定的按党政机关长文档惯例合理设置，并在规范文档里标明依据层级。
2. 表头黑体四号、不加粗、水平居中；表格单元格垂直居中。
3. “目录”标题样式（Word 内建 `TOC Heading`）定义为黑体三号居中；目录条目样式 `toc 1` 到 `toc 3` 与正文同版式。
4. Markdown 里独占一段的 `[TOC]` 标记导出为“目录”标题加目录域，作为不依赖 WPS 自动目录的保底路径（用户已说明主路径是 WPS 自动目录，插件不强制生成）。
5. 只在文档含目录域时写入 `updateFields`，普通文档打开 Word 不再弹“是否更新域”。
6. 标题段落不再给文字打直接格式，字体全部由样式承担，避免目录条目继承黑体 / 楷体。

## 非目标

- 不改标题层级映射：Markdown H6 仍回退到标题 4。
- 不自动插入分页，`[TOC]` 前后是否另起一页由用户在 Word 里决定。
- 不引入脚注 / 尾注的 Markdown 语法，只把样式定义好，供用户在 Word 里加注时使用。

## 样式表规格

| 样式（Word 显示名） | styleId | 字体 | 字号 | 段落 | 依据 |
|---|---|---|---|---|---|
| 正文（文档默认） | Normal / docDefaults | 仿宋 + Times New Roman | 三号 16pt | 固定 28 磅，首行缩进 2 字，两端对齐 | GB/T 9704 7.3.4 |
| 标题 | Title | 方正小标宋 + TNR | 二号 22pt | 居中，无缩进，与下段同页 | GB/T 9704 7.3.1 |
| 标题 1 | Heading1 | 黑体 + Arial | 三号 | 首行缩进 2 字，与下段同页 | GB/T 9704 7.3.3 |
| 标题 2 | Heading2 | 楷体 + Arial | 三号 | 同上 | 同上 |
| 标题 3 | Heading3 | 仿宋加粗 + TNR | 三号 | 同上 | 同上 |
| 标题 4 | Heading4 | 仿宋 + TNR | 三号 | 同上 | 同上 |
| 标题 5 / 6 / 7 | Heading5..7 | 仿宋 + TNR | 三号 | 同标题 4 | 国标止于四级，沿用四级外观（惯例） |
| 目录标题 | TOCHeading（`TOC Heading`） | 黑体 + Arial | 三号 | 居中，无缩进，固定 28 磅，与下段同页 | 用户指定；机关长文档惯例 |
| 目录 1 / 2 / 3 | TOC1..3（`toc 1..3`） | 仿宋 + TNR | 三号 | 左对齐，无首行缩进，左缩进 0 / 2 字 / 4 字，右对齐制表位在版心右缘（156mm）带点线前导，固定 28 磅 | 惯例（与正文同网格） |
| 超链接 | Hyperlink | 继承 | 继承 | 黑色，无下划线 | GB/T 9704 全文纯黑的基调 |
| 脚注文本 / 尾注文本 | FootnoteText / EndnoteText | 仿宋 + TNR | 小五 9pt | 单倍行距，无首行缩进，两端对齐 | GB/T 7713.2-2022 附录 B 类比（资料性） |
| 脚注引用 / 尾注引用 | FootnoteReference / EndnoteReference | 继承 | 继承 | 上标 | Word 惯例 |
| 默认段落字体 | DefaultParagraphFont | 占位，无格式 | | | OOXML 要求的默认字符样式 |
| 普通表格 | TableNormal | | | 单元格左右边距 108 twip | Word 默认值 |

删除：List Paragraph、Strong（插件从未使用）。

## 表格规格

| 项目 | 值 |
|---|---|
| 表头 | 黑体 + Arial 四号，不加粗，水平居中（忽略 GFM 列对齐） |
| 表体 | 仿宋 + TNR 四号，按 GFM 列对齐，默认左对齐 |
| 单元格 | 垂直居中 |
| 边框 | 0.5pt 全框线（不变） |

## `[TOC]` 标记

- 触发：独占一段、纯文本为 `[TOC]` / `[toc]` / `[[TOC]]` / `[[toc]]`。
- 输出：一段“目录”（TOCHeading 样式）+ 目录域 `TOC \o "1-2" \h`，收录 Markdown H2 与 H3（Word 标题 1 与 2）。
- 打开行为：Word 会提示更新域，确认后生成条目；WPS 若未自动生成，右键目录选“更新域”。
- 只在此时写入 `updateFields`。

## 验收

- 单测对 `word/styles.xml` 断言：无 ListParagraph / Strong；Heading5/6/7、TOCHeading、TOC1..3、Hyperlink、FootnoteText、EndnoteText 存在且取值正确；每个 styleId 只出现一次。
- 单测对 `word/document.xml` 断言：表头居中不加粗；`[TOC]` 产出 TOCHeading 段与 `TOC \o "1-2"` 域；无 `[TOC]` 时 settings.xml 无 `updateFields`；标题段的文字 run 不带 `w:rFonts`。
- 既有 853 项测试全绿，`npm run validate` 与 `npm run test:e2e` 通过。
- LibreOffice 无头渲染示例文档为 PNG 目视核对：表头居中、标题字体正确。

## 实施中补充发现

- 文档默认段落的 2 字首行缩进渗入表格单元格、题注段与页码段（偶数页页码被推成“空三字”），三处已显式归零。
- `@tsconfig/node-lts` 24.0.1 新增 `types: ["node"]`，挤掉 jest 全局类型导致 `npm run compile` 报错；`tsconfig.json` 显式声明 `types: ["node", "jest"]`。
- 样式级制表位的点线前导符只能用原生 XML 写，toc 1 到 3 改为 `ImportedXmlComponent` 拼装。
- `scripts/release.js` 原先整体重写 CHANGELOG，改为 `git-cliff --prepend`。
- 评审补修：`[TOC]` 只认单个纯文本节点（行内代码、强调、链接里的不算）；标题内的强调、行内代码、图片占位也不打直接格式；引用块内的表格不再被丢弃；代码类段落左对齐无首行缩进；标题 1 到 7 样式带大纲级别。
