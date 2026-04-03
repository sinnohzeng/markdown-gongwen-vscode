# Markdown 公文

<img src="assets/icon.png" align="right" alt="Markdown 公文" width="120" height="120">

在 VS Code 里编辑和导出党政公文。Markdown 所见即所得编辑，一键导出符合 GB/T 9704 的 Word 文档。

文件始终是标准 Markdown，插件只做视觉渲染，不改动内容。

> 本项目基于 [SeardnaSchmid/markdown-inline-editor-vscode](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode) 二次开发，新增了公文字体风格和 DOCX 导出功能。

## 两件事

**编辑**——打开 `.md` 文件，标题、加粗、链接、图片、表格、公式、Mermaid 图表全部在编辑区行内渲染，不用开预览面板。字体按 GB/T 9704 公文规范自动匹配：公文标题用方正小标宋，一级标题用黑体，二级用楷体，正文用仿宋。

**导出**——点一下编辑器右上角的 Word 图标，当前文档直接导出为 `.docx`。页面尺寸、边距、字体、字号、行距、页码全部按国标来，拿到手就能用。

## 演示

<p align="center">
  <img src="assets/autoplay-demo.gif" alt="Markdown 公文演示" width="900">
</p>

*光标移到某行，语法标记淡入；点击或选中则完全显示原始 Markdown。*

## 安装

1. 在 VS Code 扩展市场搜索 **"Markdown 公文"**，或直接安装 `.vsix`
2. 打开任意 `.md` 文件，插件自动激活
3. 系统要求：VS Code 1.100+（也支持 Cursor）

> **注意**：本插件与原版 Markdown Inline Editor 不能同时安装。如果已装原版，请先卸载。

## 导出 DOCX

编辑器右上角有个 Word 文档图标，点击即导出。也可以用命令面板：

- `导出公文 DOCX` — 弹出保存对话框
- `快速导出公文 DOCX` — 直接保存到 `.md` 文件同目录

### 排版规格

| 项目 | 值 |
|------|-----|
| 纸张 | A4 纵向，上 37mm / 下 35mm / 左 28mm / 右 26mm |
| 正文 | 仿宋 + Times New Roman，三号 16pt，首行缩进 2 字符，两端对齐 |
| 行距 | 固定值 28 磅，每页 22 行 |
| 页码 | 宋体四号，—1— 格式，奇数页右、偶数页左 |

### 标题字体

| Markdown | Word 样式 | 字体 | 字号 |
|----------|-----------|------|------|
| `#` | 标题 | 方正小标宋简体 | 二号 22pt |
| `##` | 标题 1 | 黑体 | 三号 16pt |
| `###` | 标题 2 | 楷体 | 三号 16pt |
| `####` | 标题 3 | 仿宋加粗 | 三号 16pt |
| `#####` | 标题 4 | 仿宋 | 三号 16pt |

`**加粗**` 导出为楷体（不加粗），公文用字体区分强调，不用粗细区分。

详细规格见 [docs/features/docx-export.md](docs/features/docx-export.md)。

## 编辑器配置

安装后建议调整 Markdown 文件的字号和行高。在 `settings.json` 里加：

```json
{
  "[markdown]": {
    "editor.fontSize": 22,
    "editor.lineHeight": 1.8,
    "editor.wordWrap": "bounded",
    "editor.wordWrapColumn": 56,
    "editor.minimap.enabled": false,
    "editor.unicodeHighlight.ambiguousCharacters": false,
    "editor.quickSuggestions": {
      "comments": "off",
      "strings": "off",
      "other": "off"
    }
  }
}
```

这样只影响 `.md` 文件，代码文件不受影响。

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `editor.fontSize` | `22` | 对应公文三号字 |
| `editor.lineHeight` | `1.8` | 参照公文 28 磅行距 |
| `editor.wordWrapColumn` | `56` | 28 个全角字 = 56 列 |

## 三态语法遮蔽

编辑时 Markdown 标记符号自动隐藏，光标靠近时淡入，点击后完全显示。三个状态：

- **渲染态**（默认）：语法标记隐藏，只看到格式化内容
- **幽灵态**（光标所在行）：标记半透明淡入，提供编辑提示
- **原始态**（点击/选中）：完整显示原始 Markdown

表格比较特殊——光标进入表格任意一行，整个表格切换为原始 Markdown。

## 支持的功能

### 文本格式
- [x] **粗体**（`**文本**`）、**斜体**（`*文本*`）、**粗斜体**（`***文本***`）
- [x] **删除线**（`~~文本~~`）、**行内代码**（`` `代码` ``）

### 文档结构
- [x] **标题**（`#` 到 `######`）——公文字体风格
- [x] **链接**、**图片**、**引用**、**分割线**、**GFM 表格**
- [x] **GitHub @提及和 #引用**

### 列表
- [x] **无序列表**、**任务列表**（可点击切换）

### 代码与扩展
- [x] **代码块**、**YAML 前置元数据**、**Emoji 短代码**
- [x] **Mermaid 图表**——行内渲染
- [x] **LaTeX 数学公式**（`$...$`、`$$...$$`）——行内渲染

## 配置项

打开设置搜索 **"Markdown Gongwen"**：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `markdownGongwen.decorations.ghostFaintOpacity` | 幽灵态标记透明度 | `0.3` |
| `markdownGongwen.defaultBehaviors.diffView.applyDecorations` | 差异视图中启用装饰 | `false` |
| `markdownGongwen.links.singleClickOpen` | 单击打开链接 | `false` |
| `markdownGongwen.emojis.enabled` | 渲染 Emoji 短代码 | `true` |
| `markdownGongwen.math.enabled` | 渲染 LaTeX 数学公式 | `true` |
| `markdownGongwen.mentions.enabled` | 启用 @提及 和 #引用 | `true` |
| `markdownGongwen.colors.*` | 15 个颜色自定义 | 跟随主题 |
| `markdownGongwen.fonts.*` | 各标题层级字体/字重/字号 | 内置公文风格 |

## 字体

公文里用到的五种字体：

| 名称 | 中文 | 英文搭档 | 用途 |
|------|------|---------|------|
| 方正小标宋简体 | FZXiaoBiaoSong-B05S | Times New Roman | 公文大标题 |
| 黑体 | SimHei | Arial | 一级标题 |
| 楷体 | KaiTi | Arial | 二级标题、强调 |
| 仿宋 | FangSong | Times New Roman | 正文 |
| 宋体 | SimSun | Times New Roman | 页码 |

方正小标宋系统不自带。安装方法：

1. 在 VS Code 命令面板执行 **"Markdown Gongwen: Open Bundled Fonts Folder"**
2. 双击 `FZXBSJW.TTF` 安装到系统
3. 没装的话 Word 导出时会回退到宋体，不影响编辑

## 开发者

```bash
git clone https://github.com/sinnohzeng/markdown-gongwen-vscode.git
cd markdown-gongwen-vscode
npm install
npm test
```

按 `F5` 启动 Extension Development Host。

| 命令 | 说明 |
|------|------|
| `npm run compile` | 编译 TypeScript |
| `npm run bundle` | esbuild 打包 |
| `npm test` | 跑全部测试 |
| `npm run lint` | ESLint 检查 |
| `npm run validate` | 文档检查 + 测试 + 构建 |
| `npm run build` | 完整构建 |
| `npm run package` | 创建 `.vsix` 安装包 |

```
src/
├── extension.ts          入口
├── config.ts             配置
├── parser.ts             Markdown 解析（remark）
├── decorations.ts        装饰类型
├── decorator.ts          装饰协调
├── export/               DOCX 导出模块
├── math/                 LaTeX 渲染
├── mermaid/              Mermaid 渲染
└── */__tests__/          测试
```

## 已知限制

- GFM 表格暂不支持多行单元格
- 行间距需手动设置 `editor.lineHeight`
- 超过 1MB 的文件解析可能较慢
- Mermaid 图表和 LaTeX 公式导出为纯文本（DOCX 暂不支持渲染）

## 许可证

MIT License——详见 [LICENSE.txt](LICENSE.txt)

## 致谢

本项目基于 [SeardnaSchmid](https://github.com/SeardnaSchmid) 的 [markdown-inline-editor-vscode](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode) 开发。感谢原作者建立了出色的 Markdown 行内编辑框架，本项目在此基础上增加了公文字体风格和 DOCX 导出功能。

灵感来源：
- [markdown-inline-preview-vscode](https://github.com/domdomegg/markdown-inline-preview-vscode)
- [Markless](https://github.com/tejasvi/markless)
- [Typora](https://typora.io/)
- [Obsidian](https://obsidian.md/)

原版贡献者：[@patrick-yip](https://github.com/patrick-yip)、[@bircni](https://github.com/bircni)、[@ssebs](https://github.com/ssebs)、[@IrishBruse](https://github.com/IrishBruse)
