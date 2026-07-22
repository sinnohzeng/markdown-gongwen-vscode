# VS Code 插件市场发布踩坑记录

> 记录日期：2026-04-04
>
> 本文档记录 Markdown 公文插件首次发布到 VS Code Marketplace 和 Open VSX Registry 过程中遇到的问题和解决方案。

## 1. Azure DevOps 入口跳转

**问题**：教程中写的 `dev.azure.com` 在未登录时会跳转到 Azure 产品营销页面（azure.microsoft.com），找不到 User Settings 和 PAT 入口。

**原因**：微软近期调整了 Azure DevOps 的页面路由，未认证用户会被重定向到 Azure 云服务首页。

**解决**：
- 备用入口：`https://aex.dev.azure.com/` 可以直接进入登录流程
- 必须先进入组织页面 `https://dev.azure.com/{组织名}` 才能看到 User Settings 齿轮图标
- 直达 PAT 页面 URL：`https://dev.azure.com/{组织名}/_usersSettings/tokens`

## 2. PAT 的 Organization 作用域

**问题**：创建 PAT 时如果 Organization 选择了某个具体组织，发布时会遇到 401 / 403 错误。

**解决**：Organization 必须选择 **All accessible organizations**。这是最常见的错误。

## 3. `.vscodeignore` 遗漏导致包体积膨胀

**问题**：首次打包发现 VSIX 包含了 964 个文件（10.17 MB），其中 `.firecrawl/`（3.39 MB）和 `.remember/`（859 个文件）等工具缓存目录被意外打入。

**原因**：这些目录是开发过程中的工具生成物，不在默认的 `.vscodeignore` 排除列表中。

**解决**：
- 在 `.vscodeignore` 中添加 `.firecrawl/**`、`.remember/**`
- 打包前用 `vsce ls --tree` 检查包含的文件列表
- 优化后：91 个文件 / 9.03 MB

**教训**：每次引入新的开发工具（如 firecrawl、remember 等），都要检查其输出目录是否需要加入 `.vscodeignore`。

## 4. Fork 仓库的 GitHub Actions 默认不触发

**问题**：推送代码和 tag 到 fork 仓库后，GitHub Actions 的 workflow 未自动触发，`actions/runs` API 返回空列表。

**原因**：GitHub 出于安全考虑，fork 仓库的 Actions 默认处于禁用状态，需要用户在 GitHub 网页端手动点击 "I understand my workflows, go ahead and enable them" 来启用。

**解决**：使用 `gh workflow run` 命令手动触发 workflow dispatch。

**补充（2026-07-22）**：Actions 早已启用、`workflow_dispatch` 正常，但 push 事件（推 main 分支、推 tag）至今不产生任何 run（`actions/runs?event=push` 为空），原因未查明。发版不要等 push 触发，直接手动 dispatch：`gh workflow run "Build & quality" --ref main -f tag=vX.Y.Z`。

## 5. git tag 的 lightweight vs annotated 问题

**问题**：使用 `git push origin main --follow-tags` 推送后，tag 没有被推上去。

**原因**：`--follow-tags` 只推送 annotated tags（用 `git tag -a` 创建的），而 `git tag v2.0.0` 创建的是 lightweight tag。

**解决**：单独执行 `git push origin v2.0.0` 推送 lightweight tag。

## 6. TypeScript moduleResolution 要求动态 import 带 `.js` 后缀

**问题**：`tsconfig` 使用 `node16` moduleResolution 时，动态 `import("./ast-to-docx")` 编译报错。

**解决**：改为 `import("./ast-to-docx.js")`。即使源文件是 `.ts`，在 `node16` 模式下 import 路径也必须写 `.js` 后缀。

## 7. remark-frontmatter 注入的节点类型不在标准 mdast 类型中

**问题**：`node.type === "toml"` 编译报 TS2367 类型不重叠错误。

**原因**：mdast 标准类型联合中没有 `"toml"` 类型，这是 remark-frontmatter 插件注入的扩展类型。

**解决**：使用 `(node.type as any) === "toml"` 绕过类型检查，并加 eslint-disable 注释说明原因。

## 8. Open VSX 命名空间认领

**问题**：发布到 Open VSX 后，插件页面显示 "unverified" 警告。

**原因**：创建命名空间时只获得了 contributor 角色，不是 owner。命名空间没有 owner 就不会被标记为 verified。

**解决**：到 `https://github.com/EclipseFdn/open-vsx.org/issues/new/choose` 提 issue 认领命名空间。标题格式为 `Claiming namespace <name>`，描述中证明 GitHub 用户名与命名空间一致。审核周期约 1-3 个工作日。

## 9. 敏感文件的 git 历史清理

**问题**：需要从 git 历史中彻底删除版权敏感的字体文件和含敏感信息的测试文件。

**工具**：`git-filter-repo`（`pip3 install git-filter-repo`）

**命令**：
```bash
git filter-repo --invert-paths --path fonts/FZXBSJW.TTF --path test-preview.md --path test-preview.docx --force
```

**注意事项**：
- `filter-repo` 会自动移除 `origin` remote，需要手动重新添加
- 所有 commit hash 和 tag hash 都会改变，必须 `git push --force --all` 和 `git push --force --tags`
- 这是破坏性操作，其他协作者需要重新 clone

## 10. feature 文档中英文章节名不兼容

**问题**：项目全量中文重命名后，feature 文档的章节标题从英文（Overview/Implementation...）改成了中文（概述/实现...），但校验脚本仍检查英文标题。

**解决**：在 `validate-feature-outline.js` 的 `REQUIRED_SECTIONS` 中为每个必需章节添加 `aliases` 数组，支持中英文别名匹配。

## 11. VSIX 里最大的文件是没人用的演示 GIF（2026-07-22）

**问题**：`npx vsce ls` 实测发现 9.4MB 的包里 6.7MB 是 `assets/autoplay-demo.gif`。市场页展示 README 时，vsce 会把相对图片路径改写成 GitHub 仓库地址，包里那份 GIF 根本不会被读到——纯粹的死重。同批还发现 `assets/icon.png~` 备份文件也进了包。

**解决**：删掉演示 GIF（README 不再引用上游素材）；发版前把 `npx vsce ls` 当验收步骤，逐行看清单。清理后 93 文件 / 2.4MB。

**教训**：`.vscodeignore` 是排除法清单，fork 改名后新增的资源不会被旧条目覆盖。每次资产改名/新增都要重新跑 `vsce ls` 核对。

## 12. 生成物不入库：assets/mermaid 改由 postinstall 重建（2026-07-22）

**问题**：`assets/mermaid/`（约 14MB，含 75 个 .map）是 `scripts/copy-mermaid.js` 从 node_modules 复制出来的构建产物，却被 git 追踪，mermaid 每次升级都产生巨量 diff。

**解决**：`git rm -r --cached assets/mermaid` + 加入 `.gitignore`，并在 package.json 加 `"postinstall": "node scripts/copy-mermaid.js"`——本地 `npm install`、CI 的 `npm ci` 都会自动重建，F5 调试和 e2e 也不受影响。

**教训**：判断一个目录该不该入库，问一句"它能不能由脚本从依赖里确定性重建"。能，就交给 postinstall。

## 13. `--follow-tags` 推送会把上游历史标签全带上去（2026-07-22）

**问题**：`git push origin main --follow-tags` 会把本地所有可达的 annotated tags 一起推到 origin。本克隆配了 upstream remote，fetch 下来的上游发布标签（v1.3.2–v1.24.2，共 57 个）全是 annotated tag；而 CI 对每个 `v*` tag push 都当作发布触发——相当于一次性触发几十个旧版本发布。

**更隐蔽的是**：`--follow-tags` 恰恰不会推我们自己的发布标签——`scripts/release.js` 创建的 `vX.Y.Z` 是 lightweight tag，不在 `--follow-tags` 推送范围内（见 §5）。这条命令的实际效果是"该推的不推，不该推的全推"。

**解决**：
- 发布只显式推当前标签：`git push origin main && git push origin vX.Y.Z`
- 若本地又 fetch 了上游标签，推送前清掉（只保留 origin 上已有的）：
  ```bash
  comm -23 <(git tag | sort) <(git ls-remote --tags origin | awk '{print $2}' | sed 's|refs/tags/||' | grep -v '\^{}' | sort) | xargs git tag -d
  ```
- 推送后一分钟内没有 "Build & quality" run 就手动 dispatch（见 §4 补充）。
