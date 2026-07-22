# ADR: 上游同步采用择优移植，放弃全量合并

- 状态：已接受（2026-07-22）
- 关联：[docs/memory/project-fork.md](../../memory/project-fork.md)

## 背景

本仓库 fork 自 `SeardnaSchmid/markdown-inline-editor-vscode`。fork 初期通过逐提交重放跟到了上游约 v1.23.0，之后双方分道：

- 上游 v1.24 系列完成 Jest→Vitest 迁移（d7dd191）、parser/decorator 拆分与 extension 接线重构（234b80d/c89d6dc）、CI 重组
- 本仓库保留重构前架构，新增 `src/export/` DOCX 导出子系统，全面改名（`markdown-gongwen`、`gongwen.*` 命令、`markdownGongwen.*` 配置）并中文化

2026-07-22 实测：`git merge-tree` 干跑 `main` × `upstream/main` 产生 **217 个冲突文件**；双方各 325/330 提交。

## 决策

**放弃全量 `git merge`，改为周期性择优移植（selective port）：**

1. `git fetch upstream` 后审查 `git log <上次同步点>..upstream/main`
2. 只取三类提交：用户可见 bug 修复、用户可见特性、安全修复（含依赖升级）
3. 移植方式按情况选择：早于上游重构的提交可 `git apply --3way` 或 cherry-pick；晚于重构的手写等价补丁
4. 配置键/命令名一律落到 `markdownGongwen.*` / `gongwen.*` 命名空间；上游测试写 Vitest 的改写为 Jest
5. 不取：测试基建迁移、重构、CI、品牌、README/marketing、上游发版簿记
6. 每次同步在 [project-fork.md](../../memory/project-fork.md) 记录同步点与移植清单

## 后果

- 优点：保住本仓库的稳定架构与全部公文特性；每次同步工作量可控且可验证（移植项各自带测试）
- 代价：git 历史与上游永久分叉，无法再用 GitHub fork 同步按钮；上游架构演进（如新 decorator 拆分带来的性能改进）默认拿不到，需要时单独评估
- 已知起点：2026-07-22 同步至 v1.24.2，移植 8 项（详见 project-fork.md）
