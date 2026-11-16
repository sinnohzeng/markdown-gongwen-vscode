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
- [ ] （暂停）恢复后执行编译、代码 ESLint、Vitest、构建、E2E 与外部 DOCX 渲染验收。

## 当前证据边界

- 上游远端尖端最终核对仍为 `77d051ad5b3c27f6cfe81acfa4939e1b8b87f7ec`，已通过 `c35a69de60e5134ec0105563d641d09619ed581f` 成为本仓库真实祖先。
- merge commit 只证明祖先关系与合并内容已落地，不证明运行功能已验收。
- 依赖安装、lockfile 和 Mermaid 12.3.0 资产生成成功不等于扩展运行兼容。
- 本轮没有新的编译、代码 ESLint、Vitest 或外部渲染通过结论；`lint:docs` 仅覆盖文档结构。
