# Markdown Gongwen 公文

<img src="assets/icon.png" align="right" alt="Markdown Gongwen 公文" width="120" height="120">

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/sinnohzeng.markdown-gongwen?label=VS%20Code%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=sinnohzeng.markdown-gongwen)
[![Open VSX](https://img.shields.io/open-vsx/v/sinnohzeng/markdown-gongwen?label=Open%20VSX)](https://open-vsx.org/extension/sinnohzeng/markdown-gongwen)
[![Build & quality](https://github.com/sinnohzeng/markdown-gongwen-vscode/actions/workflows/ci.yaml/badge.svg)](https://github.com/sinnohzeng/markdown-gongwen-vscode/actions/workflows/ci.yaml)

用 Markdown 写党政公文，一键导出符合 GB/T 9704-2012 的 Word 文档。

排版是写公文最费时间的一环：各级标题的字体、正文的 28 磅固定行距、分奇偶页的一字线页码，每份文件都要重设一遍。这套规格插件替你定好了，你用 Markdown 写内容，导出的 Word 直接就是国标版式。

> **For non-Chinese users:** This extension formats **Chinese government documents (党政公文)** per national standard GB/T 9704-2012. If you don't work with Simplified Chinese government documents, it is unlikely to be useful for you.

## 两件事

**编辑**：打开 `.md` 文件，标题、加粗、链接、图片、表格、公式、Mermaid 图表全部在编辑区行内渲染，不用开预览面板。语法标记自动隐藏，光标靠近时淡入，点击后完全显示。文件始终是标准 Markdown，插件只做视觉渲染，不改动内容。

**导出**：点一下编辑器右上角的 Word 图标，当前文档导出为 `.docx`。页面、字体、行距、页码按 GB/T 9704 设定，插图、表格、题注随文导出，正文版式不用再动。

## 排版规格

各项数值的条文出处见 [docs/features/docx-export.md](https://github.com/sinnohzeng/markdown-gongwen-vscode/blob/main/docs/features/docx-export.md)：

| 项目 | 值 |
|------|-----|
| 纸张 | A4 纵向，上 37mm / 下 35mm / 左 28mm / 右 26mm |
| 正文 | 仿宋 + Times New Roman，三号 16pt，首行缩进 2 字符，两端对齐 |
| 行距 | 固定值 28 磅，每页 22 行 |
| 页码 | 宋体四号，数字两侧各一条一字线，奇数页居右、偶数页居左 |
| 表格 | 全框线 0.5pt，表头黑体四号不加粗居中，表体仿宋四号按列对齐，单元格垂直居中，撑满版心 |
| 目录 | “目录”黑体三号居中，条目仿宋三号逐级缩进 2 字 |
| 题注 | 表上图下，黑体小四 12pt，居中，编号与标题间一字空（GB/T 7713 族） |
| 引用 | 楷体正文（无斜体、无底纹，首行缩进与正文一致） |
| 列表 | 首行缩进 2 字符、回行顶格，序号连续编号 |

### 标题字体

| Markdown | Word 样式 | 字体 | 字号 |
|----------|-----------|------|------|
| `#` | 标题 | 方正小标宋简体 | 二号 22pt |
| `##` | 标题 1 | 黑体 | 三号 16pt |
| `###` | 标题 2 | 楷体 | 三号 16pt |
| `####` | 标题 3 | 仿宋加粗 | 三号 16pt |
| `#####` | 标题 4 | 仿宋 | 三号 16pt |

公文用字体区分强调，不用粗细区分：`**加粗**` 导出为楷体（不加粗），`>` 引用导出为楷体正文。导出使用系统字体；方正小标宋为商业字体不随包分发，未安装时 Word 自动回退宋体，不影响使用。

## 安装与兼容

在扩展市场搜索 **“Markdown Gongwen 公文”** 安装：

- **VS Code**（1.100 及以上）：[VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=sinnohzeng.markdown-gongwen)
- **Cursor / Windsurf / Trae / VSCodium**：[Open VSX](https://open-vsx.org/extension/sinnohzeng/markdown-gongwen)，在各自的扩展市场里直接搜索即可

最低支持 VS Code 1.100，Cursor、Trae 这类基于旧内核的编辑器都能直接装。

> 本插件由 Markdown Inline Editor 二次开发而来，两者不能同时启用（会重复渲染）。

## 导出 DOCX

编辑器右上角的 Word 图标一键导出。也可以用命令面板：

- `导出公文 DOCX`：弹出保存对话框，记住上次目录
- `快速导出当前文件为 DOCX`：直接保存到 `.md` 同目录

导出过程带进度条，可以取消。完成后通知里可直接“打开文件”或“在文件管理器中显示”。出错时点“查看日志”可看完整记录。本地图片自动等比缩放到版心宽度。

目录有两种加法。一是在 WPS 或 Word 里插入自动目录，“目录”二字与各级条目的样式已经定义好，不用再手动改字体。二是在 Markdown 里单独写一行 `[TOC]`，导出时生成“目录”标题和目录域，收录 `##` 和 `###` 两级标题，打开 Word 时按提示更新域即可。

## 编辑体验建议

为 Markdown 文件单独设置字号行高，编辑观感更贴近公文（`Cmd/Ctrl+,` 打开设置，进 `settings.json`）：

```json
{
  "[markdown]": {
    "editor.fontSize": 22,
    "editor.lineHeight": 1.8,
    "editor.wordWrap": "bounded",
    "editor.wordWrapColumn": 56,
    "editor.minimap.enabled": false,
    "editor.quickSuggestions": { "comments": "off", "strings": "off", "other": "off" }
  }
}
```

只影响 `.md` 文件，不改代码文件显示。

## 支持的功能

- **文本**：粗体、斜体、删除线、行内代码
- **结构**：六级标题（公文字体风格）、链接、图片、引用、分割线、GFM 表格
- **列表**：无序列表、有序列表（自动连续编号，源文件不动）、任务列表（可点击切换）
- **扩展**：代码块、YAML frontmatter、Emoji 短代码、GitHub @提及 与 #引用
- **图形**：Mermaid 图表行内渲染、LaTeX 公式（`$...$`、`$$...$$`）行内渲染
- **题注**：`表N` 表题（表上方段落）、`图N` 图题（图片 alt）自动按国标排版，导出与图表同页

## 配置项

设置里搜索 **“Markdown Gongwen”**。以下配置只影响编辑视图的渲染观感；导出 DOCX 的版式始终按 GB/T 9704 固定，不受任何配置影响：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `markdownGongwen.decorations.ghostFaintOpacity` | 幽灵态标记透明度 | `0.3` |
| `markdownGongwen.decorations.frontmatterDelimiterOpacity` | frontmatter 分隔线透明度 | `0.3` |
| `markdownGongwen.decorations.codeBlockLanguageOpacity` | 代码块语言标识透明度 | `0.3` |
| `markdownGongwen.defaultBehaviors.diffView.applyDecorations` | 差异视图中启用渲染 | `false` |
| `markdownGongwen.links.singleClickOpen` | 单击打开链接 | `false` |
| `markdownGongwen.links.showEmoji` | 链接后显示 🔗 图标 | `false` |
| `markdownGongwen.orderedLists.autoNumber` | 有序列表自动连续编号 | `true` |
| `markdownGongwen.orderedLists.warnWhenSourceNumberDiffers` | 源序号不一致时警告色提示 | `true` |
| `markdownGongwen.emojis.enabled` | 渲染 Emoji 短代码 | `true` |
| `markdownGongwen.math.enabled` | 渲染 LaTeX 数学公式 | `true` |
| `markdownGongwen.mentions.enabled` | 启用 @提及 和 #引用 | `true` |
| `markdownGongwen.mentions.linksEnabled` | 强制开/关提及链接（默认跟随 git 远程） | 未设置 |
| `markdownGongwen.colors.*` | 15 个颜色自定义 | 跟随主题 |
| `markdownGongwen.fonts.*` | 标题/正文/强调的字体、字重、字号与正文行高 | 内置公文风格 |

## 常见问题

活动栏里为什么有个“Markdown Gongwen”图标（Mermaid 渲染视图）、导出字体、大文件性能等，见 [docs/FAQ.md](https://github.com/sinnohzeng/markdown-gongwen-vscode/blob/main/docs/FAQ.md)。

## 开发者

```bash
git clone https://github.com/sinnohzeng/markdown-gongwen-vscode.git
cd markdown-gongwen-vscode
npm install   # postinstall 自动准备 Mermaid 资源
npm test
```

按 `F5` 启动 Extension Development Host。

| 命令 | 说明 |
|------|------|
| `npm test` | 全部单元测试（Jest） |
| `npm run lint` | ESLint 检查 |
| `npm run validate` | 文档检查、测试与完整构建 |
| `npm run build` | 完整构建并打出 `.vsix` |

```
src/
├── extension.ts          入口
├── parser.ts             Markdown 解析（remark）
├── decorator.ts          装饰协调（三态可见性）
├── export/               DOCX 导出（mdast → GB/T 9704 OOXML）
├── math/                 LaTeX 行内渲染
├── mermaid/              Mermaid 行内渲染（懒加载 webview）
└── */__tests__/          测试
```

## 已知限制

- 导出的是公文主体：标题、正文、表格、插图、题注、页码。版头（发文机关标志、发文字号、密级、签发人等）与版记不生成，需在 Word 里按本单位模板补齐
- GFM 表格暂不支持多行单元格
- Mermaid 图表和 LaTeX 公式导出 DOCX 时为占位文本或源码，导出结束会列出未完整呈现的内容
- 图表题注自动识别仅限以 `图N` / `表N` 开头的写法，其余按普通正文输出
- 超过 1MB 的文件解析可能较慢
- 行间距需手动设置 `editor.lineHeight`（VS Code 不允许插件按语言改行高）

## 许可证与致谢

MIT License，详见 [LICENSE.txt](https://github.com/sinnohzeng/markdown-gongwen-vscode/blob/main/LICENSE.txt)。

行内渲染框架基于 [SeardnaSchmid/markdown-inline-editor-vscode](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode) 二次开发，公文排版与 DOCX 导出为本仓库新增。感谢原作者与贡献者 [@patrick-yip](https://github.com/patrick-yip)、[@bircni](https://github.com/bircni)、[@ssebs](https://github.com/ssebs)、[@IrishBruse](https://github.com/IrishBruse)。
