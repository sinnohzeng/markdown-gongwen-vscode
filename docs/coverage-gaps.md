# 测试覆盖缺口

本文对应 `vitest.config.ts` 的当前覆盖配置。历史文档中的 Jest、Puppeteer 或固定通过率不再作为现状依据；实际通过率只能以最新 `npm test` / `npm run test:coverage` 输出为准。

## 覆盖率排除项

| 路径 | 原因 | 应有的验证层级 |
|------|------|----------------|
| `src/extension.ts` | VS Code 激活、provider 注册与资源释放依赖 Extension Host | E2E 激活与导出冒烟 |
| `src/mermaid/**` | 真实 webview、CSP、本地 ESM、SVG/DOM 与生命周期不能只靠 Node mock 证明 | Extension Host 与手测 |
| `src/code-block-hover-provider.ts` | 同时依赖 VS Code HoverProvider 和 Mermaid 渲染管线 | E2E/手测；纯 HTML 逻辑可抽离单测 |
| `src/decorator/decoration-type-registry.ts` | 创建真实 `TextEditorDecorationType` 资源 | 真实编辑器集成测试 |
| `src/math/math-decorations.ts` | 依赖活动主题、编辑器字体与渲染输出 | 编辑器集成；高度计算可纯函数化 |
| `src/forge-context.ts`、`src/github-context.ts` | Git 仓库、远程地址和外部环境状态 | 注入 Git/进程边界后单测，另做仓库集成 |

`src/test/**`、声明文件和 `node_modules` 也不计入覆盖率。

## 已抽离、应优先单测的纯逻辑

- `parser/*.ts`：语法识别与 decoration 元数据。
- `decorator/visibility-model.ts`：三态过滤、范围与表格样式计算。
- `export/typography.ts`、`ast-to-docx.ts`、`image-dimensions.ts`：配置、OOXML 和图片尺寸，不依赖 VS Code。
- `link-targets.ts`、`link-targets/resource-schemes.ts`：本地与 `vscode-remote` URI 解析。
- `math/math-scanner.ts`：代码段排除、段落边界和数学区域识别。
- `svg-processor.ts`：SVG 后处理与尺寸约束。

## 仍需集成或人工证明的风险

1. **Remote-SSH**：URI 单测只能证明 scheme/authority 未丢失，不能证明真实 SSH 文件系统、保存对话框和权限行为。
2. **Mermaid 12.3.0**：资产生成成功不等于首次懒加载、CSP、所有图表类型和销毁路径兼容。
3. **DOCX 外部排版**：ZIP/OOXML 正确不等于 Word/WPS/LibreOffice 换行、字体回退和分页一致。
4. **差异视图与复选框**：需要真实编辑器确认逐编辑器策略和点击位置。
5. **发布链**：VSIX 内容、Node 22 bundle、Marketplace/OpenVSX 凭据和 tag 触发不能由单元测试覆盖。

## 降低缺口的优先顺序

1. 先恢复 TypeScript 编译、ESLint 与 Vitest，消除合并后的未知错误。
2. 再跑 Extension Host E2E，重点覆盖激活、DOCX、Mermaid、差异视图和复选框。
3. 在真实 Remote-SSH 工作区验证链接、图片与导出路径。
4. 以 Word/WPS 为主、LibreOffice 为对照验收 DOCX；定位当前字符网格双倍步进异常。
5. 最后才把 VS Code/Git/渲染边界进一步依赖注入，避免为了覆盖率把 mock 当成产品行为。

本轮按用户要求未执行上述测试、编译或外部渲染。
