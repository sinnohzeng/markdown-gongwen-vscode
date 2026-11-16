# 任务清单：上游结构性对齐

- [x] 核对真实 merge-base、上游结构迁移与分叉规模。
- [x] 编写 SDD 规约、实施计划和验收边界。
- [x] 修正零散落点的命令命名并创建本地 WIP checkpoint（`aa19e3c`）。
- [x] 普通 merge `96fc352`，按路径分类解决冲突（merge `6f3162f`）。
- [x] 在上游模块化架构上接回 DOCX、中文命名空间、Mermaid 安全与 Remote-SSH（语义回迁 `8ec737a`，后续补充资源 URI 模块）。
- [ ] 普通 merge 最新 `upstream/main`：`77d051a` 的冲突与新增功能/依赖资产已解决并暂存，`MERGE_HEAD` 存在且 unmerged=0；merge commit 因确认超时未形成。
- [x] 收敛为 Vitest 5.1.0 单栈并迁移测试源码与类型配置，不运行测试。
- [x] 升级依赖到最新兼容版本并记录四项 latest 偏差；生产审计 0，开发链 8 个 moderate，不执行测试。
- [x] 更新 ADR、fork、README、AGENTS、功能、发布、覆盖缺口、经验与综合审查文档。
- [ ] 静态检查合并状态、diff 和文档债务，交付三类清单。
- [ ] （暂停）恢复后执行编译、Vitest、构建、E2E 与外部 DOCX 渲染验收。

## 当前证据边界

- 上游远端尖端最终核对仍为 `77d051ad5b3c27f6cfe81acfa4939e1b8b87f7ec`。
- “冲突已解决并暂存”不等于“双亲 merge commit 已创建”；提交结果以 `git log` / `git status` 为准。
- 依赖安装、lockfile 和 Mermaid 12.3.0 资产生成成功不等于扩展运行兼容。
- 本轮没有新的编译、lint、测试或外部渲染通过结论。
