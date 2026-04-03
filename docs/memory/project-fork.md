# Fork 关系

## 基本信息

- **上游仓库**：`SeardnaSchmid/markdown-inline-editor-vscode`（原始项目，英文版 Markdown Inline Editor）
- **当前仓库**：`sinnohzeng/markdown-inline-editor-vscode`（Fork，重命名为「Markdown 公文视图」）

## 开发策略

开发新功能时，使用仅添加式的修改、功能分支和独立的配置命名空间，减少与上游的合并冲突。

## 差异点

本仓库在上游基础上新增了：

1. **公文排版风格**：内置 GB/T 9704 党政公文字体配置
2. **字体自定义**：各级标题和正文均可独立配置字体、字重、字号
3. **CJK 优化**：中文字体栈、150% 正文字号、行高配置指引
4. **中文文档**：所有用户文档改为简体中文
