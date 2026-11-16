---
status: 已接受（取代 2026-11-07 选择性同步策略）
date: 2026-11-16
feature: upstream-realignment
author: Hubby + AI
---

# 通过真实祖先合并持续跟踪上游，而不是永久选择性移植

## 背景

2026-11-07 的 ADR 曾选择“永久选择性移植”，理由是本仓库已有 DOCX、中文命名空间和编辑器中文字体，上游 v1.24.2 不值得整体合并。该决策后来暴露出两个事实问题：

1. `v1.24.2` 不是双方真实共同基线；真实 `git merge-base` 是 `9365306eff07e061818a20867e959cfd948b2aa5`。
2. 上游 v1.24.2 已开始 parser 模块化，而本仓库仍保留大量单体结构。继续复制补丁会反复重写同一接线，不能降低长期维护成本。

上游随后继续合入表格预览、`==highlight==`、表头着色、数学/链接/CRLF/CJK/差异视图/复选框修复，以及 Mermaid 12、TypeScript 6 与 Vitest 更新。永久选择性同步已不再符合“未来方便继续合并上游”的目标。

## 决策

采用**一次性结构性对齐 + 独立模块恢复 fork 能力 + 后续普通 merge**：

1. 保留 Git 祖先关系，通过双亲 merge commit 跟踪 `SeardnaSchmid/markdown-inline-editor-vscode`，不以 squash、整树覆盖或永久 cherry-pick 替代祖先关系。
2. 第一阶段合并上游模块化基线 `96fc352493f9590cd79298f598518fed7b5ddd1d`，形成结构迁移提交 `6f3162f8268b79a57fc928fbd558633dd1ac7ec5`。
3. 在该结构上恢复 DOCX、编辑器公文字体、正文段落装饰、中文通知、配置热刷新与 `config.debug`，形成语义回迁提交 `8ec737a`。
4. 第二阶段目标为 `77d051ad5b3c27f6cfe81acfa4939e1b8b87f7ec`，在保留上游新能力的同时解决 fork 冲突。目标提交是否已经形成真实 merge commit，以 Git 历史为准；解决冲突或暂存不等于合并完成。
5. 后续同步继续使用普通 `git merge upstream/main`，按功能模块解决冲突，不再重复全仓回迁。

## 不可被上游覆盖的 fork 边界

- 扩展与命令身份：`sinnohzeng.markdown-gongwen`、`gongwen.exportDocx`、`gongwen.exportDocxQuick`。
- 设置命名空间：`markdownGongwen.*`；DOCX 与字体配置不得被改回上游旧命名空间。
- 中文 UI、错误提示、功能说明和发布元数据。
- DOCX：`src/export/`、`src/parser/body.ts`、页眉页脚与字体/字号/网格配置。
- Mermaid：本地资产、严格安全级别、随机 nonce、CSP、懒创建 webview 与资源清理。
- Remote-SSH：`file` / `vscode-remote` 的 scheme、authority、workspace 路径和 `workspace.fs` 语义。
- 发布：release 脚本、完整 `npm run validate`、Marketplace/OpenVSX 流程和只推指定 release tag 的约束。

## 上游能力的接纳策略

默认接纳缺陷修复、模块化与可兼容依赖升级。新外观不能静默改变公文输出：

- 表格解析/导出增强默认保留。
- `tables.style` 默认 `grid`，仅显式启用 `preview` 时使用预览装饰。
- `highlight.enabled` 和 `tables.highlightHeaders` 默认 `false`，用户显式开启后才改变编辑视图。
- `==highlight==` 当前只作用于编辑器，DOCX 按普通文本导出；这是已记录边界，不暗中宣称导出支持。

## 依赖与运行基线

- 开发运行时为 Node `>=22.12.0`；bundle target 为 Node 22。
- VS Code `engines.vscode` 与 `@types/vscode` 同基线，不能为追 latest 静默提高用户安装要求。
- 单测统一 Vitest；不得重新引入 Jest/ts-jest 双栈。
- TypeScript 选择受 `typescript-eslint` peer range 约束的最新兼容版本，而非盲目使用 registry latest。
- Mermaid 版本与 `assets/mermaid/` 同步生成，vendor chunk 不手工编辑。

## 正向后果

- 后续冲突集中在命名空间、装饰注册、事件接线和 package manifest 等明确边界，不必重新移植整个 parser。
- 上游模块化与测试更新成为真实祖先，可直接比较、merge 和回溯。
- DOCX、正文排版、资源 URI、Mermaid 安全等 fork 能力保持独立，降低互相覆盖风险。
- Node/VS Code/测试/发布基线成为显式约束，而不是隐含在 lockfile 中。

## 代价与剩余风险

- 本次一次承担两阶段迁移、Vitest 迁移、测试 mock 扩充和依赖升级的审查成本。
- 上游 `parser/core.ts` 仍是较大的编排文件；本轮不继续无关拆分，以免扩大下一次合并冲突面。
- 表格预览、highlight、Mermaid 12 和 Remote-SSH 均需要真实运行验证；源码回迁和静态检查不是可用版本验收。
- DOCX 的 LibreOffice 字符网格双倍步进异常仍未定位，不能用 OOXML 正确替代外部渲染结论。

## 标准操作

1. `git fetch upstream --no-tags --prune`，避免上游历史 tag 进入本仓库发布链。
2. 确认真实 merge-base、工作区 checkpoint 和当前上游尖端，记录 SDD 目标与暂停测试边界。
3. 普通 merge；按模块做语义并集，遇到 JSON 用 schema/脚本/依赖语义合并，不机械拼接冲突文本。
4. 保留上述 fork 边界，重新生成 Mermaid 资产和 lockfile。
5. 获得验证授权后运行 `npm run validate`、Extension Host、Remote-SSH 与外部 DOCX 渲染。
6. 更新本文、fork 关系、功能文档、依赖/债务报告与经验文档；提交但不擅自 push、打 tag 或发布。

完整过程见 [上游结构性对齐经验](../../experience/upstream-realignment-lessons.md)，现状见 [上游、依赖与历史债务审查](../../review/upstream-dependency-debt-review.md)。
