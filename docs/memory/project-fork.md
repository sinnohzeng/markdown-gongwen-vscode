# Fork 关系

## 基本信息

- **上游仓库**：`SeardnaSchmid/markdown-inline-editor-vscode`（原始项目，英文版 Markdown Inline Editor）
- **当前仓库**：`sinnohzeng/markdown-gongwen-vscode`（产品名 **Markdown Gongwen 公文**，v2.0.0 起全面改名）

## 同步策略（2026-07-22 起）

**不再做全量 git merge，改为择优移植（selective port）。** 上游 v1.24 起完成了 Jest→Vitest 迁移和 parser/decorator 大重构，本仓库保留旧架构并叠加了导出子系统，双方各 300+ 提交、217 个文件冲突，字面合并已不可行。决策与操作手册见 [ADR: 上游同步策略](../architecture/ADR/upstream-sync.md)。

要点：

- 定期 `git fetch upstream` 后只审查 `git log <上次同步点>..upstream/main` 中**用户可见的修复/特性**与**安全修复**
- 逐项评估后手工移植（cherry-pick 或手写等价补丁），配置键一律改到 `markdownGongwen.*` 命名空间
- 上游的测试基建、CI、品牌、重构类提交一概不取
- 2026-07-22 已同步至上游 v1.24.2（移植 8 项：mermaid 11.15.0、links.showEmoji、有序列表自动编号、零宽链接修复、xmldom/lodash-es overrides、esbuild 0.28、CRLF 修复、dependabot 修复）

## 差异点

本仓库在上游基础上新增了：

1. **一键导出 GB/T 9704 DOCX**：`src/export/` 子系统（mdast → docx，本 fork 核心特性，上游没有）
2. **公文排版风格**：内置 GB/T 9704 党政公文字体配置
3. **字体自定义**：各级标题和正文均可独立配置字体、字重、字号
4. **CJK 优化**：中文字体栈、正文字号、行高配置指引
5. **中文文档与中文 UI 文案**：用户文档与通知均为简体中文
6. **Mermaid 懒加载**：webview 推迟到首个 Mermaid 图表渲染时才初始化（上游仍是激活即抢焦点）
