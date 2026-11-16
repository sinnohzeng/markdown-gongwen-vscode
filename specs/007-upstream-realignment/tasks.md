# 任务清单：上游结构性对齐

- [x] 核对真实 merge-base、上游结构迁移与分叉规模。
- [x] 编写 SDD 规约、实施计划和验收边界。
- [x] 修正零散落点的命令命名并创建本地 WIP checkpoint（`aa19e3c`）。
- [x] 普通 merge `96fc352`，按路径分类解决冲突（merge `6f3162f`）。
- [x] 在上游模块化架构上接回 DOCX、中文命名空间、Mermaid 安全与 Remote-SSH（语义回迁 `5a381f7`，后续补充资源 URI 模块）。
- [x] 普通 merge 最新 `upstream/main`：形成双亲 merge commit `c35a69d`，parent 为 `5a381f7` 与 `77d051a`。
- [x] 收敛为 Vitest 5.1.0 单栈并迁移测试源码与类型配置，不运行测试。
- [x] 升级依赖到最新兼容版本并记录四项 latest 偏差；生产审计 0，开发链 8 个 moderate，不执行测试。
- [x] 更新 ADR、fork、README、AGENTS、功能、发布、覆盖缺口、经验与综合审查文档。
- [x] 静态检查合并状态、diff 和文档债务：文档结构、JSON、相对链接、冲突标记、Git whitespace 均通过，交付三类清单。
- [x] 恢复验证并修复合并后问题：完整 `npm run validate` 通过，76 个测试文件、1055 项通过、1 项跳过，TypeScript、esbuild 与 VSIX 打包成功。
- [x] 修正真实扩展 ID，使用本机 VS Code 1.146.0 完成完整 E2E：59 项通过，Mocha 汇总耗时 28 秒。
- [x] 从当前源码生成默认/自定义真实 DOCX，独立检查 90 字正文与 OOXML 网格，并由 LibreOffice 成功转换为单页 A4 PDF；每行字数异常仍未关闭。
- [x] 将验证证据、成功经验和踩坑记录同步到 Git 跟踪文档；代码修复提交为 `7ab5d5d`。

## 当前证据边界

- 上游远端尖端最终核对仍为 `77d051ad5b3c27f6cfe81acfa4939e1b8b87f7ec`，已通过 `c35a69de60e5134ec0105563d641d09619ed581f` 成为本仓库真实祖先。
- 完整 validate 与真实 E2E 已通过，但不证明真实 Remote-SSH、Mermaid 全部可视化行为或 Word/WPS 排版一致。
- 默认/自定义 DOCX 的文本完整性、OOXML 和 LibreOffice 可打开/可转 PDF 已验证；LibreOffice 每行约目标一半字数的异常仍需最小对照实验与 Word/WPS 主验收。
- 默认下载宿主的 E2E 曾出现无 Mocha 汇总/主进程不退出，旧版 1.100.3 在本机 SIGSEGV；最终结论只来自本机 VS Code 1.146.0 的真实 59 项汇总，不把环境故障记为产品通过或失败。
