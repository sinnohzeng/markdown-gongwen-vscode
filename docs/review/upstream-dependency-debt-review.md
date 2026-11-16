# 上游、依赖与历史债务审查

日期：2026-11-16
分支：`feat/upstream-realignment`
上游：`SeardnaSchmid/markdown-inline-editor-vscode`
审查边界：源码、Git、manifest/lockfile、registry 元数据、官方安全审计与既有 DOCX 外部渲染证据。按用户要求，本轮未编译、未 lint、未运行测试、未做新的外部渲染、未推送或发布。

## 1. 结论

1. **先合并上游、再恢复本仓库能力是正确方向。** 一次性结构迁移比永久选择性移植更能降低未来成本，但必须保留真实双亲祖先。
2. **上游截至 `77d051a` 的变更值得接纳。** 其中缺陷修复、parser 模块化、Vitest 和依赖更新直接降低维护成本；表格预览/highlight/表头着色按公文兼容策略保留，后两者默认关闭。
3. **DOCX 五项配置已模块化实现，但每行字数仍有外部渲染未决异常。** OOXML 公式正确不能替代 Word/WPS/LibreOffice 验收。
4. **直接依赖已升级到当前兼容范围内的最新版本。** 仅保留四项有明确理由的 latest 偏差，不盲目追版本号。
5. **结构合并已完成，但还不能称为已验收或可发布版本。** 第二阶段真实双亲 merge commit 为 `c35a69de60e5134ec0105563d641d09619ed581f`；编译、代码 lint、测试和新的外部渲染仍未恢复。

## 2. Git 与上游事实

### 2.1 真实基线与提交链

| 节点 | 作用 |
|---|---|
| `9365306eff07e061818a20867e959cfd948b2aa5` | 真实 merge-base |
| `aa19e3c7ff6e4c52bfd072b3ca3439cac6c5f047` | 改造前 WIP checkpoint |
| `96fc352493f9590cd79298f598518fed7b5ddd1d` | 第一阶段上游模块化基线 |
| `6f3162f8268b79a57fc928fbd558633dd1ac7ec5` | 第一阶段双亲 merge |
| `5a381f75087ac6829c84bcd6ee2e3e4c1620c296` | 公文语义回迁 |
| `77d051ad5b3c27f6cfe81acfa4939e1b8b87f7ec` | 第二阶段上游尖端 |
| `c35a69de60e5134ec0105563d641d09619ed581f` | 第二阶段双亲 merge；parent 为 `5a381f7` 与 `77d051a` |

`git ls-remote upstream refs/heads/main` 在本次最终核对时仍返回 `77d051a`，且该提交已通过 `c35a69d` 成为本仓库真实祖先。后续同步可直接普通 merge 新的 upstream/main，不需要再次全仓回迁。

### 2.2 近期上游内容及采纳判断

| 上游能力 | 采纳 | 本仓库策略 / 原因 |
|---|---|---|
| parser 模块化 | 是 | 作为长期 merge 的结构基线 |
| 表格 preview 与表格解析修复 | 是 | 默认 `grid`，preview 仅显式启用；解析/导出修复保留 |
| `==highlight==` | 是 | 默认关闭，避免改变公文外观；DOCX 暂按普通文本 |
| 表头单元格高亮 | 是 | 默认关闭，preview 模式下显式启用 |
| 数学扫描排除 code span、遵守段落边界 | 是 | 明确缺陷修复 |
| frontmatter 起始分隔符校验 | 是 | 明确缺陷修复 |
| URL 内括号、fragment 与文件路径分离 | 是 | 与 Remote-SSH 资源模块做语义并集 |
| CRLF 锚点导航 | 是 | 与本仓库 position mapping 共存 |
| Unicode heading anchor、Hangul/fullwidth 表格宽度 | 是 | 改善中文及东亚文字场景 |
| 逐编辑器差异视图检测 | 是 | 避免其他 visible editor 影响当前编辑器 |
| 表格混合/嵌套样式 fallback | 是 | 避免整单元格误着色 |
| 渲染复选框点击与代码块保护 | 是 | 保留上游实现，等待真实编辑器验证 |
| Mermaid 12、Vitest、TypeScript 6、依赖更新 | 兼容升级 | 保留本仓库 CSP/nonce/webview、安全和发布边界 |

## 3. 配置与模块化结果

### 3.1 DOCX 五项真实配置

| 配置 | 约束 | 实现 |
|---|---|---|
| `docx.fonts` | 按语义角色分别设置 | 正文、各级标题、表格、代码、页眉页脚共享解析结果 |
| `docx.fontSizesPt` | 6–72pt，0.5 步进 | 同一解析结果驱动 run/style/grid/图片占位 |
| `docx.charsPerLine` | 1–100 整数 | 通过 `docGrid type=snapToChars` 派生，不截断或补空格 |
| `docx.lineSpacingPt` | 6–144pt，0.5 步进 | 正文、标题间距、代码和图题按统一规则派生 |
| `docx.firstLineIndentChars` | 0–10 字符，0.5 步进 | 按正文字号换算 twip，不影响目录/列表层级 |

核心模块：`export/typography.ts`；转换与样式分别位于 `ast-to-docx.ts`、`gbt9704-styles.ts`，编辑器正文位于 `parser/body.ts`。

### 3.2 Remote-SSH 与资源边界

`link-targets/resource-schemes.ts` 统一 `file` / `vscode-remote` URI；链接、图片、默认保存位置和快速导出保留 scheme/authority，并经 `workspace.fs` 访问。HTTP(S) 图片仍不联网下载。真实 SSH 环境尚未验证。

### 3.3 Mermaid 安全边界

本地 Mermaid 12.3.0 资产已由脚本重建；严格安全级别、CSP、nonce、懒创建 webview、错误中文化和资源清理保留。升级后的真实渲染未运行，不能仅凭资产生成判定兼容。

## 4. 直接依赖最终快照

以下版本来自当前 `package.json` / 安装树；`npm outdated` 最终只报告第 4.3 节四项。

### 4.1 运行依赖

| 包 | 当前 | 判断 |
|---|---:|---|
| `cheerio` | 1.2.0 | 当前 latest |
| `docx` | ^9.15.4 | 当前 latest |
| `katex` | ^0.19.1 | 当前 latest |
| `mathjax-full` | ^3.2.2 | 保留高于 registry latest 的版本 |
| `mermaid` | 12.3.0 | 当前 latest，资产同步生成 |
| `remark-frontmatter` | ^5.0.0 | 当前 latest |
| `remark-gfm` | 4.0.1 | 当前 latest |
| `remark-parse` | 11.0.0 | 当前 latest |
| `unified` | 11.0.5 | 当前 latest |
| `unist-util-visit` | 5.2.0 | 当前 latest |

### 4.2 开发、构建、测试与发布依赖

| 包 | 当前 | 包 | 当前 |
|---|---:|---|---:|
| `@eslint/js` | ^10.0.1 | `@tsconfig/node-lts` | ^24.0.1 |
| `@types/mocha` | ^10.0.10 | `@types/node` | ^26.6.6 |
| `@types/unist` | ^3.0.3 | `@types/vscode` | 1.100.0 |
| `@vitest/coverage-v8` | ^5.1.0 | `@vscode/test-cli` | ^0.0.15 |
| `@vscode/test-electron` | ^3.1.0 | `@vscode/vsce` | ^4.1.1 |
| `esbuild` | ^0.28.2 | `eslint` | ^10.15.0 |
| `git-cliff` | ^2.14.2 | `jszip` | ^3.10.2 |
| `ovsx` | ^1.4.0 | `rimraf` | ^6.1.4 |
| `typescript` | ^6.0.3 | `typescript-eslint` | ^8.73.0 |
| `vitest` | ^5.1.0 |  |  |

`@types/mocha` 仍服务于 VS Code E2E；Node 单元测试统一 Vitest，不是重新引入 Mocha 单测栈。

### 4.3 有意不追 registry latest 的四项

| 包 | 当前 / latest | 原因 |
|---|---|---|
| `@tsconfig/node-lts` | 24.0.1 / 26.0.1 | 与当前 LTS、Node 22 bundle 和开发基线一起管理，不单独跳到 Node 26 配置 |
| `@types/vscode` | 1.100.0 / 1.146.0 | 必须与 `engines.vscode ^1.100.0` 对齐，不能静默提高安装基线 |
| `mathjax-full` | 3.2.2 / 3.2.1 | latest 版本号倒挂，不执行降级 |
| `typescript` | 6.0.3 / 7.0.2 | `typescript-eslint 8.73.0` peer 为 `>=4.8.4 <6.1.0`，TS 7 超出兼容范围 |

安全 overrides 目前包括 `dompurify ^3.4.18`、`undici ^7.30.1`、`@azure/msal-node ^7.1.2`、`diff ^8.0.3`、`serialize-javascript ^7.0.4`、`@xmldom/xmldom ^0.9.10`、`lodash-es ^4.18.1`。后续上游/直接依赖吸收修复后应逐项复核并删除不再需要的 override。

## 5. 安全审计

使用官方 `https://registry.npmjs.org` 审计 endpoint：

- 生产依赖：**0**（info/low/moderate/high/critical 均为 0）。
- 完整依赖：**8 个 moderate，0 high，0 critical**。
- 8 项均位于开发/发布链：`@vscode/test-cli`、`@vscode/vsce`、`ovsx`、`c8`、`glob`、`minimatch`、`mocha`、`test-exclude`。
- 两个公告分别为 [Glob AbortSignal cancellation bypass](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) 与 [minimatch globparts amplification DoS](https://github.com/advisories/GHSA-g3hv-75wg-m249)。

相关直接工具已经在当前 latest；未采用 `npm audit fix --force`、破坏性 override 或降级。剩余风险需要在后续工具链升级时复测，不应把开发链 8 项写成生产漏洞。

## 6. 历史债务分级

### P0：交付前必须解决，但本轮被明确暂停

| 债务 | 当前证据 | 下一步 |
|---|---|---|
| 合并后未编译、代码 lint、测试 | 本轮无任何最新通过结果 | 用户恢复验证后运行完整 `npm run validate` |
| DOCX 外部字符网格异常 | LibreOffice 实际步进约为目标两倍 | 最小 OOXML 对照实验 + Word/WPS 主验收 |

### P1：高相关剩余风险

| 债务 | 当前处理 | 未关闭部分 |
|---|---|---|
| Remote-SSH URI 丢失 | 已统一资源模块并补 mock/用例源码 | 真实 SSH 文件系统与保存对话框 |
| Mermaid 大版本迁移 | 已升级 12.3.0、重建资产、保留安全策略 | Extension Host 渲染、CSP、生命周期 |
| 开发链 8 个 moderate | 已区分生产/开发并升级直接工具 | 等待上游传递依赖修复，定期重审 |
| VS Code mock 语义扩张 | 已补 URI、workspace.fs、输出通道和导出对话框 | mock 仍不能代替真实 Extension Host |

### P2：结构性、可渐进偿还

1. `parser/core.ts` 仍承担大量遍历和编排，表格/装饰过程可继续抽离；本轮不额外重构，避免扩大冲突面。
2. DOCX 转换、VS Code 命令和外部验收已分层，但 Word 样式兼容矩阵应进一步自动化，而不是只增长 snapshot。
3. Mermaid vendor chunks 纳入 Git 保证离线可复现，同时制造大量 hash 文件 diff；必须坚持脚本生成和版本审查，不手工维护。
4. `==highlight==` 仅编辑视图、DOCX 不支持，是当前明确产品边界；如未来需要导出，应单独写 SDD，而不是隐式映射成 Word highlight。
5. 差异视图、复选框、链接点击等仍需要真实编辑器 E2E，Node mock 覆盖率不能替代用户行为。

### P3：文档与历史材料

- 旧 `analysis/`、`plan/`、`plans/`、PR 报告和 specs 归档中的旧命名空间/Jest/旧决策是历史证据，不应批量改写成“当时就已采用新方案”。
- 当前操作文档必须保持新鲜：README、AGENTS、ADR、fork 关系、功能 done、发布、覆盖缺口和经验已同步；文档索引标明历史材料边界。
- 历史 DOCX 网格分析曾混入自造图示或错误结论，已废弃；当前只以真实 DOCX XML、渲染 PDF/坐标/FODT 为证据。

## 7. DOCX 外部排版未决异常

真实 ZIP/OOXML 曾测得：

- 缺省：`type=snapToChars`、`linePitch=560`、`charSpace=-848`。
- 自定义 30 字/18pt：`linePitch=600`、`charSpace=-13353`。
- 版心宽 8844 twip；缺省公式 `(8844/20/28-16)×4096≈-848`。

但 LibreOffice 对 90 个连续中文字符排出 `13+14×5+7` 与 `14+15×5+1`；MuPDF 步进约 31.488pt / 29.376pt，接近目标两倍。FODT `layout-grid-base-width` 却约 15.7608pt / 14.7096pt，接近目标值，因此不能简单断言“导入网格宽度翻倍”。

后续应分别控制 Normal 字号、`snapToChars`、段落 `snapToGrid`、行距规则和渲染器做最小对照，并以 Word/WPS 为主验收。当前不得宣称“每行 28/30 字已通过外部验收”。规范参考：[ECMA docGrid](https://webapp.docx4java.org/OnlineDemo/ecma376/WordML/docGrid.html)。

## 8. 后续验证顺序

第二阶段 merge commit `c35a69d` 已完成并核对双亲，文档收尾独立提交。

1. 经用户恢复授权后运行 `npm run validate`；先修静态/类型/单测，再进入 E2E。
2. 跑 Extension Host：激活、差异视图、复选框、表格、highlight、Mermaid、DOCX。
3. 在真实 Remote-SSH 中验证链接、图片、快速/普通导出。
4. 用 Word/WPS/LibreOffice 验收 DOCX，并解决字符网格异常。
5. 最后才构建发布 VSIX；push、tag、发布继续单独授权。

长期同步规则见 [ADR](../architecture/ADR/upstream-sync.md) 与 [标准工作范式](../experience/upstream-realignment-lessons.md)。
