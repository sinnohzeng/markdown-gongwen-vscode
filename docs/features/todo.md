# 功能路线图（TODO）

Markdown Gongwen 公文的候选功能清单。已实现的条目移入 [done/](done/)；新功能开工前先在 `specs/<feature>/` 写规约（用 `markdownGongwen.*` 命名空间）。

---

## 默认渲染开关

允许配置 Markdown 文件打开时默认开启还是关闭渲染。

- 在 `markdownGongwen.defaultBehaviors` 下加 `decorations.enabledByDefault`（默认 `true`）
- 打开文件/激活时生效；眼睛图标的按文件切换仍可覆盖
- 可选优化：默认关闭时跳过解析，多文件场景省 CPU/内存
- 与现有 `defaultBehaviors.diffView.applyDecorations` 命名对齐

---

## 按功能分组的开关

允许按类别（标题、链接、列表、代码、表格、Emoji）默认启用/禁用渲染。

- 配置作用在装饰层而非解析层，避免配置变化触发重新解析
- 被禁用的功能显示原始 Markdown；三态可见性对启用的功能照常工作
- 与差异视图策略保持一致（diff 默认原始）

---

## DOCX 导出增强（公文场景特有）

- Mermaid 图表导出为位图（当前导出为提示文字）
- LaTeX 公式导出为 OMML 或位图（当前导出为源码文本）
- 版记、发文机关标志等 GB/T 9704 版头/版记元素的 frontmatter 驱动生成
- 多级标题编号自动生成（一、/（一）/1. /（1））

---

## 图片体验改进

- 第一阶段：图片可点击（alt 文字点开在 VS Code 查看器中显示）
- 第二阶段：悬停显示尺寸/大小/路径与"打开图片"按钮
- 后续：图片与链接的视觉区分、状态指示、行内缩略图（性能优先评估）

---

## 表格

完整 GFM 表格渲染：隐藏管道符、对齐样式、多行单元格、选中还原。

- 隐藏 `|` 分隔符；渲染 `:---` / `:---:` / `---:` 对齐
- 格式化文本（加粗/代码）导致的列宽错位需要文本测量方案，难度较高
- 公文正文表格多，需求真实；边缘情况多，风险中等

---

## 已实现（从本清单毕业）

- 提及与引用样式 → [done/mentions-references.md](done/mentions-references.md)
- 有序列表自动编号 → 2026-07 自上游 #31 移植（`markdownGongwen.orderedLists.*`）
- 按文件记忆渲染开关 → 已实现（workspaceState 持久化）
