# DDD 与 SSOT 原则

## DDD——文档驱动开发（Document Driven Development）

开发过程中同步更新所有相关文档，确保文档始终反映代码的当前状态。

## SSOT——唯一真值（Single Source of Truth）

每类信息只有一个权威来源，避免信息分散和不一致。

## 实施规则

开发功能时，必须同步更新：

1. **功能文档**：`docs/features/` 目录
2. **计划文档**：`docs/plans/` 目录
3. **README**：如果是用户可见的变更
4. **经验文档**：`docs/experience/` 目录（踩坑和成功经验）
5. **记忆库**：`docs/memory/` 目录（长期可复用的知识）

遇到过时的文档（如错误的百分比、过期的配置项），随手修复。
