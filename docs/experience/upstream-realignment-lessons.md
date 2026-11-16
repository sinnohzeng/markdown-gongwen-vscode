# 上游结构性对齐：标准工作范式与踩坑记录

日期：2026-11-16
对应 SDD：`specs/007-upstream-realignment/`

## 1. 从原始证据开始，不从旧总结开始

一次上游审查至少读取四类原始材料：

1. Git：`merge-base`、双亲历史、真实 upstream commit log、逐提交 diff 和工作区/index 状态。
2. 代码：当前模块入口、parser/decorator/event 接线、导出与渲染实现，而不是旧架构文档。
3. 包管理：`package.json`、lockfile、`npm outdated`、registry `engines` / `peerDependencies` / `dist-tags` 和实际安装树。
4. 外部结果：真实 DOCX ZIP/OOXML、渲染后的 PDF/坐标/FODT；不能把“生成了文件”当“渲染正确”。

仓库里的报告、ADR 和经验是索引与决策记录，不是替代源码、Git 或 registry 的事实来源。

## 2. SDD 把“结构迁移”和“功能验收”分开

本次规约明确：目标是恢复可持续普通 merge 的祖先结构，并在该结构上保留 fork 能力；测试被用户暂停时，可以完成实现、静态审查和文档，但不能宣称可用版本验收。

落地顺序：

1. 记录原发布点、分支和 WIP checkpoint。
2. 先合并模块化基线 `96fc352`，形成 `6f3162f`。
3. 在模块边界上恢复公文能力，形成 `5a381f7`。
4. 再合并最新上游 `77d051a`，避免把“结构迁移”和“同时吸收全部新功能”混成一次不可解释的冲突。
5. 最后做依赖/文档/验证收口，不通过 reset 或整树覆盖伪造迁移。

价值不是“merge 命令成功”，而是下一次冲突可以落在具体模块上。

## 3. 冲突解决要按语义，不按左右两边行数

本次六个冲突的标准处理：

| 冲突 | 范式 |
|---|---|
| `README.md` | 中文产品说明 + 上游新功能/开发要求 + 本仓库配置与未决异常 |
| `docs/features/todo.md` | 已实现能力毕业到 done，不把上游实现重新写成 TODO |
| `package.json` | 扩展身份/命令/DOCX/发布 + 上游功能/schema/scripts；统一 `markdownGongwen.*` |
| `src/decorator.ts` | 保留上游 orchestration，用本仓库装饰注册表与字体构建函数 |
| `decoration-type-registry.ts` | 公文字体/正文 + 上游 highlight/表格等类型并集，统一 disposal |
| `register-event-handlers.ts` | 同一配置变化只走一条刷新路径：重建必要类型，清理内容相关缓存，更新当前编辑器 |

JSON 不用“保留 ours/theirs 整块”的方式碰运气；应解析双方变更字段，最后再做 JSON 解析和 schema 对照。

## 4. 新功能接纳不等于默认外观照单全收

上游的表格预览和 highlight 值得合并，但公文 fork 需要兼容既有视觉：

- 表格解析和导出修复默认启用。
- preview 仅在 `tables.style=preview` 时生效，默认仍为 `grid`。
- `highlight.enabled`、`tables.highlightHeaders` 默认关闭。
- 上游测试如果假定默认开启，应显式开启对应设置，并另加默认关闭用例；不能为了迎合测试改变产品默认值。

这是一般原则：**接能力，显式审默认；修 bug，优先保持开启。**

## 5. 依赖升级先解兼容图，再看 latest

- Vitest 5 的 Node 范围是 `^22.12 || ^24 || >=26`，因此 engines 使用 `>=22.12.0`，CI 固定 22.12.0/24.x/26.x，不跟随可能落到奇数 Node 25 的 `current`。
- `@types/vscode` 固定 1.100.0，与 `engines.vscode ^1.100.0` 对齐；latest 1.146.0 会引入当前 API 基线无法承诺的类型。
- TypeScript 6.0.3 是当前 lint 工具链兼容上限内的选择；registry latest 7.0.2 超出 `typescript-eslint >=4.8.4 <6.1.0`，不能为了数字最新强升。
- `@tsconfig/node-lts` 保持 24.0.1，与当前 LTS 基线和 Node 22 bundle 兼容策略一起审查，不独立追 26。
- `mathjax-full` 已安装/声明 3.2.2 时，registry latest 3.2.1 属于版本号倒挂，不能机械“升级”成旧版本。
- Mermaid 12.3.0 升级后必须重新执行资产复制脚本；手动编辑带 hash 的 vendor chunks 会造成不可复现构建。
- 安全 override 是兼容范围内的最低修复边界，不是越多越好；每次升级后应重新审计，能移除的 override 再移除。

## 6. npm 镜像与审计踩坑

默认 `registry.npmmirror.com` 的 audit quick endpoint 曾返回 404/`NOT_IMPLEMENTED`。这是镜像能力缺失，不是本地权限问题，也不是“没有漏洞”。改用官方 `https://registry.npmjs.org/-/npm/v1/security/audits/quick` 才得到有效结果。

不要用 `npm audit fix --force` 把开发链问题自动变成主版本降级或破坏性升级。先区分生产/开发依赖、直接/传递依赖和可利用场景，再决定升级、override 或接受剩余风险。

## 7. Git 合并提交受阻后的处理

一次组合命令 `git add -A && git commit ...` 因确认等待超时返回“本次未执行”。正确处理是：

1. 把它视为该命令未执行，不宣称 merge commit 已创建。
2. 单独完成可逆的 `git add -A`，将冲突标记为 resolved。
3. 用 `git rev-parse MERGE_HEAD`、`git diff --name-only --diff-filter=U`、`git status` 和 index 核对真实状态。
4. 不重复假设提交成功，也不通过 reset 清理；后续 merge commit 与文档修改可分开处理。

`MERGE_HEAD` 存在 + unmerged=0 只表示“可以提交”，不表示“已有双亲提交”。本次随后单独执行 commit 成功，形成 `c35a69de60e5134ec0105563d641d09619ed581f`，并通过 `%P` 核对两个 parent；这也说明受阻后应验证状态、拆分可逆暂存与提交，而不是重放整组命令或 reset。

## 8. Remote-SSH 修复必须覆盖完整资源链

只在 `image-resolver.ts` 内把 `Uri.file()` 改掉不够。链接、相对图片、绝对路径、默认保存位置和快速导出都必须保留 scheme/authority；统一 URI 构造后再交给 `workspace.fs`。

 mock 若只有 `fsPath` 而没有 `scheme`、`path`、`authority`、`with()`、`joinPath()`，会把远端资源重新伪装成本地文件。测试基础设施必须随产品语义升级。

## 9. 文档分“现行契约”和“历史证据”

README、AGENTS、功能 done、ADR、发布、覆盖缺口和项目关系必须与当前代码一致。`analysis/`、`plan/`、`plans/`、旧 PR 报告和 specs 归档保留当时命名空间、Jest 或决策，不应大规模改写历史；索引要标明它们是冻结证据，不能作为当前操作手册。

每次结构改造至少同步：ADR、fork 关系、README、受影响功能、测试/发布说明、经验和债务报告。只写全局记忆而不写仓库文档，不算项目经验交付。

## 10. 证据等级与完成定义

| 等级 | 能证明什么 | 不能证明什么 |
|---|---|---|
| 静态扫描 / JSON 解析 / 无冲突路径 | 文本和结构一致性 | 类型、运行、渲染正确 |
| 依赖安装 / 资产生成 | lockfile 与文件可生成 | 扩展能激活或 Mermaid 兼容 |
| merge commit | Git 祖先关系已落地 | 功能已验收 |
| `npm run validate` | 文档、lint、单测、编译、打包通过 | 真实 VS Code/远端/外部渲染行为 |
| Extension Host / Remote-SSH / Word/WPS/LibreOffice | 对应环境的真实行为 | 其他环境天然一致 |

用户暂停测试时，最高只能交付“实现与静态审查检查点”。把每一级证据说清楚，是避免过度承诺的一部分，而不是附加说明。
