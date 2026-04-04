# 发布到 VS Code 应用市场教程

> 更新日期：2026-04-04
>
> 本文档适用于将 **Markdown 公文** 插件发布到 VS Code Marketplace（微软官方市场）和 Open VSX Registry（开源替代市场）。

---

## 目录

1. [前置条件](#1-前置条件)
2. [注册 Azure DevOps 并创建个人访问令牌](#2-注册-azure-devops-并创建个人访问令牌)
3. [创建 Marketplace 发布者](#3-创建-marketplace-发布者)
4. [发布前检查清单](#4-发布前检查清单)
5. [打包与发布](#5-打包与发布)
6. [版本更新与后续发布](#6-版本更新与后续发布)
7. [发布到 Open VSX Registry](#7-发布到-open-vsx-registry)
8. [常见问题与排错](#8-常见问题与排错)

---

## 1. 前置条件

- **Node.js** 18 及以上版本
- **npm** 或 **yarn**
- 一个 **Microsoft 账号** （用于 Azure DevOps 和 Marketplace）
- 安装发布工具：

```bash
npm install -g @vscode/vsce
```

当前最新版本为 `3.7.1`。也可以不全局安装，使用 `npx @vscode/vsce` 代替。

---

## 2. 注册 Azure DevOps 并创建个人访问令牌

### 2.1 创建 Azure DevOps 组织

> **⚠️ 注意** ：直接访问 `dev.azure.com` 在未登录时可能会跳转到 Azure 产品营销页面（azure.microsoft.com），而不是 Azure DevOps 控制台。这是微软近期的页面调整，请按以下步骤操作。

1. 访问 **https://dev.azure.com/** ，点击页面上的 **Sign in to Azure DevOps** 按钮（如果被重定向到 Azure 首页，请直接访问 **https://aex.dev.azure.com/** 进入登录流程）
2. 使用 Microsoft 账号（个人账号或工作账号均可）登录
3. 如果没有组织，系统会提示你创建一个新组织（Organization）。填写组织名称后点击 **Continue**
4. 创建完成后，你会进入组织主页：`https://dev.azure.com/{你的组织名}`

### 2.2 创建个人访问令牌（PAT，Personal Access Token）

> **安全提示** ：微软官方已建议在条件允许时优先使用 [Microsoft Entra tokens](https://learn.microsoft.com/en-us/azure/devops/integrate/get-started/authentication/entra) 替代 PAT，因为 PAT 属于长期凭据，存在泄露风险。但对于 VS Code 插件发布场景，`vsce` 工具目前仅支持 PAT 认证，因此仍需创建 PAT。

1. 进入你的组织页面 **https://dev.azure.com/{你的组织名}**
2. 点击页面 **右上角** 的用户设置图标（齿轮形状 ⚙️，位于个人头像旁边）→ 在下拉菜单中选择 **Personal access tokens**

   > 如果找不到齿轮图标，也可以直接访问：`https://dev.azure.com/{你的组织名}/_usersSettings/tokens`

3. 点击 **+ New Token** ，按以下设置填写：

| 设置项 | 值 |
|--------|-----|
| Name | 任意描述性名称（例如 `VS Code Extension Publishing`） |
| Organization | **⚠️ 必须选择 All accessible organizations**（不要选择某个具体组织） |
| Expiration | 自定义，最长 1 年 |
| Scopes | 选择 **Custom defined** → 点击 **Show all scopes** → 找到 **Marketplace** → 勾选 **Manage** |

4. 点击 **Create**
5. **⚠️ 立即复制令牌并妥善保存** ——令牌只显示一次，关闭页面后无法再次查看

> **最常见的错误** ：Organization 选项如果选择了某个具体的组织（而非 All accessible organizations），发布时会遇到 401 或 403 错误。请务必选择 **All accessible organizations** 。

---

## 3. 创建 Marketplace 发布者

### 3.1 注册发布者

1. 访问 **https://marketplace.visualstudio.com/manage**
2. 用与创建 PAT 相同的 Microsoft 账号登录
3. 点击左侧 **Create publisher**
4. 填写以下信息：

| 字段 | 说明 |
|------|------|
| ID | 发布者唯一标识符（本项目使用 `sinnohzeng`）。 **创建后不可更改** 。 |
| Name | 显示名称，会展示在市场页面上 |

5. 点击 **Create** 完成创建

### 3.2 验证发布者身份（可选）

验证后会在市场页面显示蓝色认证徽标。需满足以下条件：

- 插件已在市场上线 6 个月以上
- 拥有一个注册 6 个月以上的域名
- 在域名 DNS（Domain Name System，域名系统）中添加 TXT 记录完成验证
- 审核需要最多 5 个工作日

### 3.3 验证 PAT 是否有效

```bash
vsce login sinnohzeng
# 输入上一步保存的 PAT

# 或者直接验证
vsce verify-pat sinnohzeng
```

---

## 4. 发布前检查清单

### 4.1 `package.json` 必需字段

| 字段 | 要求 | 当前值 |
|------|------|--------|
| `name` | 全小写，无空格，市场中唯一 | `markdown-gongwen` ✅ |
| `version` | SemVer（Semantic Versioning，语义化版本）格式 | `1.1.0` ✅ |
| `publisher` | 与注册的发布者 ID 完全一致 | `sinnohzeng` ✅ |
| `engines.vscode` | 最低 VS Code 版本，不能为 `*` | `^1.100.0` ✅ |
| `displayName` | 市场中唯一的显示名称 | `Markdown 公文` ✅ |
| `description` | 简短描述 | ✅ |
| `categories` | 合法分类值 | `["Formatters", "Visualization", "Other"]` ✅ |

### 4.2 必需文件

| 文件 | 说明 | 状态 |
|------|------|------|
| `README.md` | 市场详情页内容。图片链接必须使用 HTTPS，不能使用 SVG | ✅ |
| `LICENSE` | 开源许可证 | ✅ |
| `CHANGELOG.md` | 更新日志（强烈推荐） | 需确认 |
| `assets/icon.png` | 插件图标。 **必须是 PNG 格式，至少 128×128 像素** （建议 256×256）。不支持 SVG | ✅ |

### 4.3 `.vscodeignore` 检查

确保排除了不必要的文件以减小包体积：

```bash
# 查看将被打包的文件列表
vsce ls
```

当前已排除：`src/`、`docs/`、`fonts/`（69MB）、`node_modules/`、测试文件、Source Map 等。

### 4.4 关键注意事项

- **关键词上限** ：`keywords` 最多 **30** 个
- **密钥扫描** ：`vsce` 3.x 版本会自动扫描泄露的密钥（API Key、Token 等），如果检测到会阻止发布
- **`.env` 文件** ：默认不允许打包 `.env` 文件
- **SVG 限制** ：README 中的图片不能使用 SVG 格式（除信任的徽标服务商如 shields.io 外）

---

## 5. 打包与发布

### 5.1 构建项目

```bash
# 完整构建（编译 + 打包 + 复制资源）
npm run build
```

### 5.2 本地打包测试

```bash
# 打包为 .vsix 文件（不发布）
vsce package

# 指定输出路径
vsce package -o dist/markdown-gongwen-1.0.0.vsix
```

打包后可以本地安装测试：

```bash
# 命令行安装
code --install-extension markdown-gongwen-1.0.0.vsix
```

或在 VS Code 中：扩展面板 → 右上角 `...` → 「从 VSIX 安装…」

### 5.3 发布到市场

```bash
# 方式一：先登录再发布
vsce login sinnohzeng
vsce publish

# 方式二：直接用 PAT 发布（适合 CI/CD）
vsce publish -p <你的PAT>
```

发布成功后，插件通常在 **几分钟内** 出现在市场搜索结果中。无需人工审核。

### 5.4 验证发布成功

发布后访问以下地址确认：

```
https://marketplace.visualstudio.com/items?itemName=sinnohzeng.markdown-gongwen
```

---

## 6. 版本更新与后续发布

### 6.1 自动版本号递增

```bash
# 补丁版本：1.0.0 → 1.0.1
vsce publish patch

# 次版本：1.0.0 → 1.1.0
vsce publish minor

# 主版本：1.0.0 → 2.0.0
vsce publish major

# 指定版本号
vsce publish 1.2.3
```

### 6.2 预发布版本

```bash
vsce publish --pre-release
```

预发布版本的版本号约定：主版本号.奇数次版本号.补丁号（例如 `1.1.0`）。正式版本使用偶数次版本号（例如 `1.0.0`、`1.2.0`）。

### 6.3 下架插件（谨慎操作）

```bash
vsce unpublish sinnohzeng.markdown-gongwen
```

**⚠️ 警告** ：下架后，插件名称将被永久保留，任何人都无法再使用该名称。请谨慎操作。

---

## 7. 发布到 Open VSX Registry

Open VSX 是由 Eclipse Foundation（Eclipse 基金会）运营的开源扩展市场，被 VSCodium、Gitpod、Eclipse Theia 等非微软编辑器使用。如果希望更多用户能使用你的插件，建议同时发布到 Open VSX。

### 7.1 注册账号

1. 注册 Eclipse 账号：**https://accounts.eclipse.org/user/register** （填写 GitHub Username 字段）
2. 访问 **https://open-vsx.org/** ，使用 GitHub 登录
3. 点击「Log in with Eclipse」完成关联
4. 阅读并同意 Publisher Agreement

### 7.2 生成访问令牌

访问 **https://open-vsx.org/user-settings/tokens** ，生成一个新令牌。

### 7.3 发布

```bash
# 安装工具
npm install -g ovsx

# 首次发布前：创建命名空间（与 publisher ID 一致，只需一次）
npx ovsx create-namespace sinnohzeng -p <Open-VSX-Token>

# 发布
npx ovsx publish -p <Open-VSX-Token>

# 或者发布已打包的 .vsix 文件
npx ovsx publish markdown-gongwen-1.0.0.vsix -p <Open-VSX-Token>
```

### 7.4 同时发布到两个市场（CI/CD 示例）

```yaml
# GitHub Actions 示例
- name: Publish to VS Code Marketplace
  run: npx @vscode/vsce publish -p ${{ secrets.VSCE_PAT }}

- name: Publish to Open VSX
  run: npx ovsx publish -p ${{ secrets.OVSX_TOKEN }}
```

---

## 8. 常见问题与排错

### 8.1 401 / 403 错误

**原因** ：创建 PAT 时 Organization 选择了具体组织，而非 「All accessible organizations」。

**解决** ：重新创建 PAT，Organization 选择 **All accessible organizations** ，Scopes 勾选 **Marketplace > Manage** 。

### 8.2 「Extension name already exists」

**原因** ：`name` 或 `displayName` 与市场上已有的插件重复。

**解决** ：修改 `package.json` 中的 `name` 或 `displayName` 为唯一值。

### 8.3 「Exceeded 30 tags」

**原因** ：`keywords` 数组超过 30 个。

**解决** ：精简关键词数量至 30 个以内。

### 8.4 包体积过大

**原因** ：未正确配置 `.vscodeignore` ，或未使用打包工具。

**解决** ：
1. 运行 `vsce ls` 检查包含的文件
2. 确保 `.vscodeignore` 排除了 `src/`、`node_modules/`、`fonts/`、测试文件等
3. 使用 esbuild 或 webpack 打包，减小产物体积

### 8.5 密钥泄露检测被阻止

**原因** ：`vsce` 3.x 自动扫描并拦截了可能的密钥泄露。

**解决** ：
- 检查并移除泄露的密钥
- 如确认安全，可使用 `--allow-package-secrets <type>` 跳过特定类型的检测

---

## 参考链接

| 资源 | 地址 |
|------|------|
| VS Code 官方发布文档 | https://code.visualstudio.com/api/working-with-extensions/publishing-extension |
| 扩展清单参考 | https://code.visualstudio.com/api/references/extension-manifest |
| Azure DevOps 登录入口 | https://aex.dev.azure.com/ |
| Azure DevOps PAT 官方文档 | https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate |
| Marketplace 发布者管理 | https://marketplace.visualstudio.com/manage |
| Open VSX Registry | https://open-vsx.org/ |
| `@vscode/vsce` npm 包 | https://www.npmjs.com/package/@vscode/vsce |
| `ovsx` npm 包 | https://www.npmjs.com/package/ovsx |
