# 文档索引

按生命周期组织：常驻 SSOT（随代码演进）在前，历史存档在后。被取代的一次性产物直接 `git rm`，靠 git 历史留档。

## 常驻 SSOT

| 位置 | 职责 |
|------|------|
| [features/](features/) | 功能规约。`docx-export.md` 为导出核心规约；`done/` 已实现功能；`todo.md` 路线图 |
| [architecture/ADR/](architecture/ADR/) | 架构决策记录（append-only，改 status 不删） |
| [reference/](reference/) | 外部标准摘要：`gbt9704-typography.md`（GB/T 9704 排版数值溯源） |
| [memory/](memory/) | 项目记忆库：开发规范、Fork 关系与上游同步策略、工具参考 |
| [experience/](experience/) | 踩坑经验沉淀：decoration CSS hack、DOCX 导出、市场发布、Mermaid 渲染 |
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
| [../specs/](../specs/) | 上游 spec-kit 时期的功能规约（002-005），原地冻结；内文配置键为改名前旧值，被 `features/done/` 引为证据 |
