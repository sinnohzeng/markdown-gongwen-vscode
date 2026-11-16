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

## 2026-11-17 已取得的验证证据

- 完整 `npm run validate` 通过：文档 lint、ESLint、76 个 Vitest 文件、1055 项通过、1 项跳过，以及 TypeScript、生产 bundle 和 VSIX 打包。
- 真实 VS Code 1.146.0 Extension Host 完整 E2E：59 项通过，Mocha 汇总 28 秒，扩展宿主正常退出。测试中的扩展 ID 已从错误的 `sinnohzeng.markdown-gongwen-vscode` 修正为 manifest 真实 ID `sinnohzeng.markdown-gongwen`。
- 当前源码重新生成的默认/自定义 DOCX：完整 90 字正文、OOXML 网格和 LibreOffice 单页 A4 PDF 转换均已独立核对；文本未丢失不等于每行字数排版已验收。

这些结果关闭了合并后的基础编译、单测和真实激活/编辑器行为缺口，但不替代下列环境专项验证。

## 仍需集成或人工证明的风险

1. **Remote-SSH**：URI 单测只能证明 scheme/authority 未丢失，不能证明真实 SSH 文件系统、保存对话框和权限行为。
2. **Mermaid 12.3.0**：资产生成成功不等于首次懒加载、CSP、所有图表类型和销毁路径兼容。
3. **DOCX 外部排版**：ZIP/OOXML 正确不等于 Word/WPS/LibreOffice 换行、字体回退和分页一致。
4. **差异视图与复选框**：需要真实编辑器确认逐编辑器策略和点击位置。
5. **发布链**：VSIX 内容、Node 22 bundle、Marketplace/OpenVSX 凭据和 tag 触发不能由单元测试覆盖。

## 降低缺口的优先顺序

1. 在真实 Remote-SSH 工作区验证链接、图片与导出路径。
2. 以 Word/WPS 为主验收 DOCX，并用最小 OOXML 对照实验定位当前字符网格双倍步进异常；LibreOffice 继续作为对照而非唯一裁决者。
3. 在 CI 或干净下载宿主中取得标准 `npm run test:e2e` 的独立汇总；本机 59 项 E2E 已通过，但默认下载宿主曾出现无汇总/不退出，旧版宿主也有平台崩溃。
4. 验证 Mermaid 首次懒加载、CSP、真实图表和销毁路径；现有 E2E 覆盖 SVG 处理及 Mermaid 文档装饰，不等于所有 webview 渲染行为。
5. 发布前从干净目录检查 VSIX 清单。当前本地验证 VSIX 带入了 `dist/typography-verification/` 与 `.specify/`；发布 CI 会执行 `npm run clean` 清理 `dist`，但 `.specify/` 仍需专门核对，且项目规则禁止未经明确要求修改 `.vscodeignore`。
6. 最后才把 VS Code/Git/渲染边界进一步依赖注入，避免为了覆盖率把 mock 当成产品行为。
