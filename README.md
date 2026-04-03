# Markdown 公文视图

<img src="assets/icon.png" align="right" alt="Markdown 公文视图图标" width="120" height="120">

**在 VS Code 中以党政公文字体风格编辑 Markdown 文档。** 类 Typora 的所见即所得编辑体验，内置 GB/T 9704 公文排版风格，支持 GFM 表格、Mermaid 图表、LaTeX 数学公式的行内渲染。

文件始终保持 100% 标准 Markdown 格式。本插件仅使用编辑器装饰（decoration），不会改动文档内容。

## 为什么用这个插件？

- **无需预览面板**：标题、加粗、链接、图片、列表、代码、GFM 表格、数学公式、Mermaid 图表全部在编辑区行内渲染
- **三态语法遮蔽**：Markdown 标记符号在编辑时自动隐藏→淡入→显示，不干扰阅读也不影响编辑
- **公文排版风格**：严格遵循 GB/T 9704《党政机关公文格式》字体规范，安装即用
  - 公文标题（`#`）：宋体粗体，二号 22pt（137%）
  - 一级标题（`##`）：黑体，三号 16pt（100%）
  - 二级标题（`###`）：楷体，三号 16pt（100%）
  - 三级标题（`####`）：仿宋加粗，三号 16pt（100%）
  - 四级标题（`#####`）：仿宋，三号 16pt（100%）
  - 正文：宋体，三号 16pt（100%）

  > **注**：GB/T 9704 规定除公文标题用二号（22pt）外，各级标题和正文均为三号（16pt），仅靠字体区分层级。建议配合 `editor.fontSize: 22` 使用。
- **交互式编辑**：点击任务列表复选框直接切换、悬停链接查看目标、悬停图片预览
- **安全可靠**：文件保持纯 Markdown，差异视图默认显示原始语法

## 演示

<p align="center">
  <img src="assets/autoplay-demo.gif" alt="Markdown 公文视图演示" width="900">
</p>

*提示：将光标移到某行可看到淡入的语法标记；点击/选中则完全显示原始 Markdown。*

## 快速开始

1. **安装**：在 VS Code 扩展市场搜索 **"Markdown 公文视图"** 或直接安装 VSIX
2. **打开** 任意 `.md` 文件，插件自动激活
3. **开始编辑**——格式化内容行内显示，语法标记自动隐藏（**渲染态**）
4. **移动光标**到某行——语法标记淡入显示（**幽灵态**）
5. **点击/选中**格式化文本——原始 Markdown 完全可见（**原始态**）
6. **随时切换**——命令面板 → **Toggle Markdown Decorations** 或点击编辑器标题栏眼睛图标

**系统要求**：VS Code 1.100+（也支持 Cursor）

## 行间距配置教程

> **重要**：安装插件后，由于正文字号放大至 150%，需要同步调整编辑器行间距，否则文字会互相重叠。

### 方法一：编辑 settings.json（推荐）

使用 `[markdown]` 语言作用域，**只影响 Markdown 文件，不改变代码文件的字号和行高**：

1. 按 `Cmd + Shift + P`（macOS）或 `Ctrl + Shift + P`（Windows/Linux）打开命令面板
2. 输入 `Open User Settings (JSON)` 并回车
3. 在打开的 `settings.json` 文件中添加以下配置：

```json
{
  "[markdown]": {
    "editor.fontSize": 22,
    "editor.lineHeight": 1.8,
    "editor.wordWrap": "on",
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

4. 保存文件（`Cmd + S`）即可生效

> **提示**：这样配置后，只有 `.md` 文件受影响，你的代码文件完全不变。

### 配置说明

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `editor.fontSize` | `22` | 对应公文三号字（16pt ≈ 22px），正文基础字号 |
| `editor.lineHeight` | `1.8` | 参照公文 28pt 行距（28/16 ≈ 1.75） |
| `editor.wordWrap` | `"on"` | 长段落自动折行 |
| `editor.minimap.enabled` | `false` | 写文章时小地图没用 |
| `editor.unicodeHighlight.ambiguousCharacters` | `false` | 关闭中文标点的黄色警告 |
| `editor.quickSuggestions` | 全部 `"off"` | 写文章时关闭自动补全弹窗 |

### 方法二：图形化界面

1. 按 `Cmd + ,`（macOS）或 `Ctrl + ,`（Windows/Linux）打开设置界面
2. 在搜索框中输入：`@lang:markdown editor.fontSize`
3. 将 **Editor: Font Size** 修改为 `22`
4. 再搜索 `@lang:markdown editor.lineHeight`，修改为 `1.8`

### 为什么用 editor.fontSize 而不是插件内置放大？

VS Code 的换行和光标定位基于编辑器字号计算。如果用插件 decoration 放大字号（如 150%），VS Code 不知道文字变大了，会导致：
- 换行位置不正确，文字超出视口
- 光标位置计算偏移

使用 `editor.fontSize` 让 VS Code **原生知道字号变化**，换行、行高、光标全部自动适配。插件的标题百分比（如 137%）基于此字号等比缩放。

## 三态语法遮蔽

本插件使用智能的 **三态语法遮蔽系统**，根据编辑上下文自动调整语法标记的可见性：

### 渲染态（默认）
- 语法标记 **隐藏**——只看到格式化后的内容
- 干净、无干扰的阅读体验
- 例如：`**粗体**` 显示为 **粗体**，无可见标记

### 幽灵态（光标所在行）
- 语法标记 **淡入显示**（默认 30% 透明度，可配置）
- 提供编辑提示但不影响阅读
- 仅对光标所在行的构造生效
- 例如：光标在 `**粗体**` 所在行时显示淡入的 `**` 标记

### 原始态（光标/选区在构造内部）
- 语法标记 **完全可见**，可直接编辑
- 精确的范围检测——只有正在编辑的特定构造显示原始语法
- 例如：光标在 `**粗体**` 内部时显示完整的 `**粗体**` 语法

**结构性标记的特殊行为**：
- **引用、列表和复选框**：在光标所在行保持渲染态，除非直接点击标记符号
- **标题**：光标在标题行时显示 `#` 标记并移除样式
- **有序列表数字**：始终可见
- **表格**：光标在表格任意行时，**整个表格** 切换为原始 Markdown

配置幽灵态透明度：`markdownInlineEditor.decorations.ghostFaintOpacity`（默认 0.3）

## 支持的功能

### 文本格式
- [x] **粗体**（`**文本**`）
- [x] **斜体**（`*文本*`）
- [x] **粗斜体**（`***文本***`）
- [x] **删除线**（`~~文本~~`）
- [x] **行内代码**（`` `代码` ``）

### 文档结构
- [x] **标题**（`# H1` 到 `###### H6`）——内置公文字体风格
- [x] **链接**（`[文本](url)`）
- [x] **GitHub @提及和 #引用**（`@user`、`@org/team`、`#123`）
- [x] **图片**（`![描述](img.png)`）
- [x] **引用**（`> 引用`）
- [x] **分割线**（`---`、`***`、`___`）
- [x] **GFM 表格**（管道符表格，支持列对齐）

### 列表
- [x] **无序列表**（`-`、`*`、`+`）
- [x] **任务列表**（`- [ ]` / `- [x]`）——可点击切换

### 代码与扩展
- [x] **代码块**（` ```lang `）
- [x] **YAML 前置元数据**
- [x] **Emoji 短代码**（`:smile:`）
- [x] **Mermaid 图表**（` ```mermaid `）——行内渲染
- [x] **LaTeX 数学公式**（`$...$`、`$$...$$`、` ```math `）——行内渲染

## 自定义配置

所有功能开箱即用。如需调整，打开设置（`Cmd + ,`）搜索 **"Markdown Inline Editor"**：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `decorations.ghostFaintOpacity` | 幽灵态标记透明度 | `0.3` |
| `defaultBehaviors.diffView.applyDecorations` | 差异视图中启用装饰 | `false` |
| `links.singleClickOpen` | 单击打开链接 | `false` |
| `emojis.enabled` | 渲染 Emoji 短代码 | `true` |
| `math.enabled` | 渲染 LaTeX 数学公式 | `true` |
| `mentions.enabled` | 启用 @提及 和 #引用 样式 | `true` |
| `fonts.body.fontSize` | 正文字号（如 `150%`） | 内置 `150%` |
| `fonts.body.lineHeight` | 正文行高（如 `1.8`） | 内置 `1.8` |
| `fonts.body.fontFamily` | 正文字体 | 内置宋体系列 |
| `colors.heading1` ~ `colors.checkbox` | 15 个颜色自定义选项 | 跟随主题 |

### 字体配置

每个标题层级都可以独立配置字体、字重和字号：

```json
{
  "markdownInlineEditor.fonts.heading1.fontFamily": "\"Songti SC\", serif",
  "markdownInlineEditor.fonts.heading1.fontWeight": "bold",
  "markdownInlineEditor.fonts.heading1.fontSize": "200%",
  "markdownInlineEditor.fonts.body.fontFamily": "\"Songti SC\", serif",
  "markdownInlineEditor.fonts.body.fontSize": "150%"
}
```

## 开发者指南

### 快速上手

```bash
git clone https://github.com/sinnohzeng/markdown-inline-editor-vscode.git
cd markdown-inline-editor-vscode
npm install
npm run compile
npm test
```

按 `F5` 启动 Extension Development Host 测试你的更改。

### 常用命令

| 命令 | 说明 |
|------|------|
| `npm run compile` | 编译 TypeScript |
| `npm run bundle` | 用 esbuild 打包 |
| `npm test` | 运行所有测试 |
| `npm run test:watch` | 监视模式运行测试 |
| `npm run lint` | 运行 ESLint |
| `npm run validate` | 文档检查 + 测试 + 构建 |
| `npm run package` | 创建 `.vsix` 安装包 |
| `npm run build` | 完整构建 |

### 项目结构

```
src/
├── extension.ts          # 插件入口
├── config.ts             # 配置管理
├── parser.ts             # Markdown AST 解析（基于 remark）
├── decorations.ts        # VS Code 装饰类型定义
├── decorator.ts          # 装饰协调器
├── decorator/
│   ├── decoration-type-registry.ts  # 装饰类型生命周期
│   ├── visibility-model.ts          # 三态过滤逻辑
│   └── checkbox-toggle.ts           # 复选框点击处理
├── math/                 # LaTeX 数学公式渲染
├── mermaid/              # Mermaid 图表渲染
└── */__tests__/          # 测试套件（560+ 测试用例）
```

## 已知限制

- **GFM 表格**：暂不支持多行单元格和嵌套块内容
- **行间距**：插件无法自动调整行间距，需手动设置 `editor.lineHeight`（详见上方教程）
- **H1 标题裁切**：当 H1 在首行时文字可能超出窗口
- **超大文件**：超过 1MB 的文件解析可能较慢

## 许可证

MIT License——详见 [LICENSE.txt](LICENSE.txt)

## 致谢

感谢以下项目的启发：

- [markdown-inline-preview-vscode](https://github.com/domdomegg/markdown-inline-preview-vscode)——原始概念
- [Markless](https://github.com/tejasvi/markless)——高级装饰方案
- [Typora](https://typora.io/)——行内编辑灵感
- [Obsidian](https://obsidian.md/)——知识管理编辑体验

### 贡献者

- [@patrick-yip](https://github.com/patrick-yip)
- [@bircni](https://github.com/bircni)
- [@ssebs](https://github.com/ssebs)
- [@IrishBruse](https://github.com/IrishBruse)
