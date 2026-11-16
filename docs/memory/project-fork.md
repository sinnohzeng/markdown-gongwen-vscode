# 项目身份与上游关系

## 1. Fork 身份

本仓库是 `SeardnaSchmid/markdown-inline-editor-vscode` 的功能 fork，最早从上游 v1.6.6 系列分出。双方真实 Git 共同祖先是 `9365306eff07e061818a20867e959cfd948b2aa5`，不能用 v1.24.2 代替 merge-base。

| 项 | 值 |
|---|---|
| fork 仓库 | `https://github.com/sinnohzeng/markdown-gongwen-vscode.git` |
| 上游仓库 | `https://github.com/SeardnaSchmid/markdown-inline-editor-vscode.git` |
| 扩展 ID | `sinnohzeng.markdown-gongwen` |
| 配置命名空间 | `markdownGongwen.*` |
| 原 `main` 发布检查点 | `4e7bf3f`（v2.3.2） |
| 本次结构迁移分支 | `feat/upstream-realignment` |

## 2. 相对上游的核心能力

1. **DOCX 导出**：mdast → GB/T 9704 风格 Word；支持标题、正文、引用、列表、表格、代码、图片、链接、目录、页码和错误占位。
2. **公文排版配置**：`docx.fonts`、`fontSizesPt`、`charsPerLine`、`lineSpacingPt`、`firstLineIndentChars`，统一由 `export/typography.ts` 合并与校验。
3. **编辑视图中文字体**：标题、正文、引用等使用公文字体，独立于上游主题色装饰。
4. **中文产品界面**：中文设置 schema、命令、导出通知、功能文档和配置刷新。
5. **Remote-SSH**：链接、图片和导出保留 `vscode-remote` scheme/authority，统一经 `workspace.fs` 访问。
6. **Mermaid 安全与离线**：本地 ESM、懒创建 webview、严格安全级别、CSP、nonce 和资源清理。
7. **中文发布身份**：`sinnohzeng` 扩展/命令身份、VSIX、Marketplace/OpenVSX 与 release 自动化。

## 3. 模块边界

- `src/parser/core.ts`：上游 AST 遍历与 decoration 调度；不要把 DOCX 或字体业务重新塞回单体。
- `src/parser/body.ts`：本仓库正文段落装饰。
- `src/decorations.ts`、`src/decorator/decoration-type-registry.ts`：共享装饰工厂与资源生命周期。
- `src/export/`：DOCX 纯转换、排版配置、图片和 VS Code 命令边界；`ast-to-docx.ts` 不依赖 VS Code。
- `src/link-targets/resource-schemes.ts`：本地/远端资源 URI 唯一公共边界。
- `src/mermaid/`：webview 渲染宿主与安全策略；`assets/mermaid/` 只由脚本生成。
- `src/config.ts` + `package.json`：公开配置契约，类型、范围、默认值和 UI 文案必须一致。

## 4. 本次结构性对齐

| 阶段 | 提交 / 目标 | 含义 |
|---|---|---|
| 工作区保护 | `aa19e3c7ff6e4c52bfd072b3ca3439cac6c5f047` | 改造前 WIP checkpoint |
| 第一阶段结构基线 | `96fc352493f9590cd79298f598518fed7b5ddd1d` | 上游模块化结构 |
| 第一阶段真实合并 | `6f3162f8268b79a57fc928fbd558633dd1ac7ec5` | 形成双亲祖先关系 |
| 公文语义回迁 | `8ec737a` | DOCX、中文字体、命名空间、通知和热刷新接回模块结构 |
| 第二阶段上游目标 | `77d051ad5b3c27f6cfe81acfa4939e1b8b87f7ec` | 表格预览、highlight、缺陷修复、Mermaid 12、Vitest 与依赖更新 |

第二阶段冲突已解决并暂存，但 merge commit 尚未形成；暂存、无冲突路径或依赖安装成功都不能写成“已完成合并”。最终以 `git log --merges` 和 `git status` 为准。

## 5. 上游同步标准范式

1. `git fetch upstream --no-tags --prune`，避免上游 tag 混入本仓库发布链。
2. 在 feature 分支普通 merge，保留真实双亲祖先；必要时先做 checkpoint，但不 hard reset 用户工作。
3. JSON manifest 按语义合并：本仓库身份/DOCX/发布 + 上游功能/fixture/测试修复，设置统一翻译并迁移到 `markdownGongwen.*`。
4. 解析、装饰和事件处理按模块做并集；新外观默认不得静默改变公文风格。
5. 依赖按兼容范围升级，VS Code 类型与 engines 对齐，TypeScript 受 lint peer range 约束；lockfile 由 npm 生成。
6. Mermaid 资产由 `npm run copy:mermaid` 重建，禁止手改 vendor chunks。
7. 更新 ADR、README、功能文档、经验、覆盖缺口和审查报告。
8. 恢复验证后运行完整 `npm run validate` 与真实环境验证；未运行就明确未验证。
9. 只提交请求内改动，不自动 push、打 tag 或发布。

2026-11-07 的“永久选择性移植”策略已被上述决策取代，详见 [ADR](../architecture/ADR/upstream-sync.md) 与 [结构性对齐经验](../experience/upstream-realignment-lessons.md)。
