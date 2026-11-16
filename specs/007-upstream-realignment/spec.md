# 规约：上游结构性对齐与公文能力模块化回迁

**目录**：`specs/007-upstream-realignment/`  
**日期**：2026-11-16  
**状态**：实现与文档已完成；按用户要求暂停代码测试与外部渲染验收

**当前进度**：第一阶段 merge `6f3162f`、语义回迁 `5a381f7` 与第二阶段双亲 merge `c35a69d` 均已形成。依赖、模块、文档和静态检查已收口，代码测试与外部渲染验收仍暂停。

## 背景

本仓库与 `SeardnaSchmid/markdown-inline-editor-vscode` 的真实共同祖先是 `9365306eff07e061818a20867e959cfd948b2aa5`。此后双方形成大量等价但哈希不同的提交，本仓库增加公文 DOCX 导出、中文配置与发布链路，上游则完成解析器、装饰器、扩展接线和测试基建的模块化重构。

既有“永久选择性移植”策略降低了单次改动量，却无法让上游历史成为本仓库祖先，导致同一修复需要反复手工适配。2026-11-16 用户决定改为一次性结构性对齐，再恢复本仓库能力，以换取后续可持续的普通 merge。

## 目标

1. 在独立集成分支保存当前全部未提交工作，不覆盖用户改动，不推送、不发布。
2. 先普通 merge 上游 `96fc352`，接纳其模块化结构与 Vitest/TypeScript 6 基线；再视冲突规模合并 `upstream/main` 最新提交，使后续同步可以使用标准 Git 工作流。
3. 保留并模块化接回公文专属能力：`src/export/`、DOCX 五项排版配置、中文字体与 UI、`markdownGongwen.*` 配置、`gongwen.*` 命令、视图 ID、扩展元数据和发布脚本。
4. 保留安全与运行环境加固：Mermaid CSP/nonce、懒初始化、Remote-SSH 图片读取、错误中文化、资源清理和包体控制。
5. 接纳上游高价值修复：数学扫描、frontmatter、URL 括号、路径与 fragment、CRLF、Unicode/CJK 锚点、逐编辑器差异视图、表格宽度与混合单元格、复选框保护。
6. 对上游新增表格预览、`==highlight==`、表头高亮逐项保留默认行为与配置入口，不静默改变公文默认排版。
7. 依赖尽量升级到最新可集成版本；安全修复优先，但不为了追 latest 降低 `mathjax-full`，也不抬高 `@types/vscode` 所声明的 API 基线。大型依赖迁移与功能回迁分层记录。
8. 将决策、操作步骤、成功经验和踩坑经验写入 Git 跟踪文档，形成后续上游同步的标准范式。

## 非目标

- 本轮不运行单元测试、编译、E2E、LibreOffice/WPS/Word 渲染或完整 `npm run validate`；此前用户明确要求“先不测试”，本规约不擅自恢复。
- 不创建发布标签，不推送远端，不生成正式 release。
- 不以“XML 正确”替代外部排版验收，不宣称 LibreOffice 每行字数异常已经解决。
- 不盲目接受上游品牌、英文 README、仓库地址或许可/发布身份覆盖。

## 功能回迁清单

| 能力 | 权威来源 | 回迁要求 |
|---|---|---|
| DOCX 导出 | checkpoint 的 `src/export/` | 保持纯 mdast→DOCX 转换，VS Code 副作用仅在命令边界 |
| DOCX 排版配置 | `typography.ts` 与 package schema | 五项配置共享同一解析结果；真实 OOXML 网格，不截断文本 |
| 配置与命令命名 | checkpoint `package.json` / `config.ts` | 全部使用 `markdownGongwen.*`、`gongwen.*` |
| Mermaid 安全与生命周期 | checkpoint `src/mermaid/` | CSP、nonce、懒加载、重试、销毁清理不得回退 |
| Remote-SSH 图片 | checkpoint `image-resolver.ts` | 使用 `workspace.fs`，不退回本地 `fs` 单一路径 |
| 发布与包体 | checkpoint `scripts/`、 workflows、`.vscodeignore` | 保留只推 release tag 等防事故约束 |
| 中文体验 | checkpoint README、docs、通知 | 不被上游英文品牌覆盖 |

## 依赖分层

1. **结构基线**：上游 `96fc352` 已含 Vitest 4 与 TypeScript 6；为长期对齐一并接纳，避免维护 Jest/Vitest 双栈。
2. **上游后续**：`1895b9b` 及之后包含 Mermaid 12、生成资产和依赖变化，独立合并与审查。
3. **本项目最新化**：合并完成后依据 npm registry 实际版本处理剩余依赖；记录所有不能升级的兼容性例外。
4. **验证状态**：依赖升级不等于已验证；用户恢复测试前，所有新增与迁移代码均标记为未编译、未测试。

## 验收规约

### 历史与结构

- `git merge-base --is-ancestor 96fc352 HEAD` 成功；若完成第二阶段，`upstream/main` 对应提交也必须是祖先。
- 工作区使用上游模块化 parser/decorator/registration 结构，公文功能保持在独立模块中。
- 不出现 Jest/Vitest 双测试 runner 的长期配置。

### 功能与配置

- package schema 不含 `markdownInlineEditor.*`，运行时代码不注册上游命令或视图 ID。
- DOCX 导出命令、五项配置、样式与图片处理均从同一配置入口接入。
- Mermaid CSP、Remote-SSH、发布防事故规则有明确源码或文档证据。
- 上游可选功能有中文配置说明；默认公文输出不依赖表格预览或高亮功能。

### 文档与经验

- 更新 ADR 与 fork 关系文档，废止“永久不 merge”的旧结论。
- 新增上游结构性对齐经验文档，记录冲突分类、命名空间扫描、生成资产和测试基建迁移方法。
- 综合报告列明上游采纳/拒绝项、依赖版本与例外、历史债务分级及未验证风险。
- 最终回复列出同步文档、长期记忆变更和后续文档债务；目标是文档债务为空。

## 暂停的验证（恢复测试后执行）

1. 静态检查：命名空间扫描、TypeScript 编译、ESLint、依赖树与 lockfile 一致性。
2. 单元测试：Vitest 全量及 DOCX 真实 OOXML 套件。
3. 集成：构建 VSIX、E2E、Mermaid、Remote-SSH 图片与链接导航。
4. 外部 DOCX：Word/WPS/LibreOffice 验证字体、字号、每行字数、行距、图片、目录和页码。
5. 维护性演练：合并一个后续上游提交，确认不再需要手工重放整个公文子系统。
