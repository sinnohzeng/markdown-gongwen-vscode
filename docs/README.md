# 文档索引

按生命周期组织：常驻 SSOT（随代码演进）在前，历史存档在后。被取代的一次性产物直接 `git rm`，靠 git 历史留档。

## 常驻 SSOT

| 位置 | 职责 |
|------|------|
| [features/](features/) | 功能规约。`docx-export.md` 为导出核心规约；`done/` 已实现功能；`todo.md` 路线图 |
| [review/upstream-dependency-debt-review.md](review/upstream-dependency-debt-review.md) | 2026-11-16 上游、依赖、安全审计与历史债务综合审查 |
| [architecture/ADR/](architecture/ADR/) | 架构决策记录；当前上游策略为结构性对齐与普通 merge，见 `upstream-sync.md` |
| [reference/](reference/) | 外部标准摘要：`gbt9704-typography.md`（GB/T 9704 排版数值溯源） |
| [memory/](memory/) | 项目记忆库：开发规范、Fork 关系与上游同步策略、工具参考 |
| [experience/](experience/) | 踩坑经验沉淀：上游结构性对齐、decoration CSS hack、DOCX 导出、市场发布、Mermaid 渲染 |
| [guides/](guides/) | 操作手册：发布到双市场 |
| [FAQ.md](FAQ.md) | 用户常见问题 |
| [coverage-gaps.md](coverage-gaps.md) | 测试覆盖缺口清单 |
| [release-generation.md](release-generation.md) | 版本发布与 CHANGELOG 生成机制 |

## 手测夹具

| 位置 | 职责 |
|------|------|
| [uat/](uat/) | UAT 模板与手测夹具（`examples.md` 全功能样例、`test.png`、mentions 测试文档） |

## 历史存档

| 位置 | 说明 |
|------|------|
| [../specs/](../specs/) | 功能与迁移 SDD；002-005 为旧命名空间历史证据，007 为本次迁移实施记录 |
| [analysis/](analysis/) | 一次性分析快照；其中旧 parser、Jest、网格结论或旧决策不得作为当前实现依据 |
| [plan/](plan/) / [plans/](plans/) | 历史实施计划，原地冻结；当前工作以最新 SDD 与代码为准 |
| [report.md](report.md) / `report-*.md` / `pr-review-*.md` | 历史检查报告；保留当时证据，不代表当前通过率或架构 |
| [issues/](issues/) / [competitors/](competitors/) | 问题与竞品历史材料；行动前需回查当前代码和上游 |
