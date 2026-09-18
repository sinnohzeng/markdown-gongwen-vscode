# 实施计划：导出 DOCX 样式表收口与目录标题

**规约**：[spec.md](./spec.md) | **日期**：2026-09-17

## 关键事实

- `docx` 9.7.1 的 `Document({ styles })` 内部是 `new Styles({ ...defaultStyles, ...options.styles })`：传入 `importedStyles` 会整体替换库的默认样式数组，`default.*` 随之失效，docDefaults 需自己用 `DocumentDefaults` 发射。
- `StyleForParagraph` / `StyleForCharacter` 不能写 `w:default="1"`；Normal、Default Paragraph Font、Normal Table 三个默认样式用 `ImportedXmlComponent(rootKey, attrs)` 手工拼。`ImportedXmlComponent.fromXmlString` 会包一层 `<undefined>`，不能用。
- 目录域用库自带的 `TableOfContents`，输出 `w:dirty="true"` 的 TOC 域；`features.updateFields` 决定 settings.xml 是否写 `<w:updateFields/>`。
- 带 `\h \u` 的目录域会把标题文字的直接格式带进目录条目，所以标题 run 不能再打字体。

## 改动清单

1. `src/export/constants.ts`：新增脚注字号（小五）、目录缩进步长、制表位位置（版心宽 156mm → twip）、表格单元格边距常量。
2. `src/export/gbt9704-styles.ts`：`createDocumentStyles()` 改为返回 `importedStyles` 全量列表；新增 `TOC_HEADING_STYLE_ID`、`TOC_MARKER_PATTERN` 等导出；`HEADING_LEVEL_SPEC` 不变。
3. `src/export/ast-to-docx.ts`：
   - `convertTable`：表头 `bold: false`、`AlignmentType.CENTER`，单元格 `verticalAlign: CENTER`；
   - `convertHeading`：run 上下文加 `inheritStyle: true`，`createTextRun` 在该模式下不写 font / size；
   - `convertParagraph`：识别 `[TOC]` 标记，返回 TOCHeading 段 + `TableOfContents`；
   - `convertToDocx`：`updateFields` 由是否含 `TableOfContents` 决定；`DocxChild` 类型加 `TableOfContents`。
4. `src/export/export-command.ts`：Output Channel 改为 `createOutputChannel(name, { log: true })`，用 `info` / `error` 代替手工时间戳（引擎 1.100 已支持）。`src/test/__mocks__/vscode.ts` 的 mock 补 `info` / `warn` / `error`。
5. 测试：`src/export/__tests__/ast-to-docx.test.ts` 新增 styles.xml、表头、`[TOC]`、updateFields、标题 run 断言；`constants.test.ts` 补新常量关系。
6. 文档：`docs/features/docx-export.md`（样式表、表格、目录、更新域）、`docs/experience/docx-export-lessons.md`（库默认样式泄漏、importedStyles 替换、标题直接格式与目录）、`docs/FAQ.md`（目录问答）、README（规格表与商店文案）、`docs/guides/publish-to-marketplace.md`（Azure DevOps 全局 PAT 2026-12-01 停用、vsce 4 / ovsx 1 版本说明）、CHANGELOG。
7. 依赖：`npm update --save` 的兼容版本更新（esbuild、eslint、jest、typescript-eslint 等），`@vscode/test-cli` 升 0.0.15；不升 vsce 4 / ovsx 1 / mermaid 12 / TypeScript 7。
8. 发布：版本 2.3.0，手写 CHANGELOG，`chore(release): v2.3.0` 提交并打 tag，推 main 与 tag，CI 发布到 VS Code Marketplace 与 Open VSX。

## 验证顺序

1. 本地脚手架（`scratchpad/harness/run.mjs`）导出示例 Markdown，检查 styles.xml / document.xml / settings.xml。
2. `npm run lint && npm test`。
3. `npm run build` 与 `npm run test:e2e`。
4. LibreOffice 无头转 PDF 再转 PNG 目视核对。
5. 清洁上下文评审一轮（子智能体），只修实质问题。
