# 贡献指南

开发环境搭建见 [README](README.md#开发者)。

## 开发流程

### 1. 建分支

在特性分支上工作，不要直接往 `main` 上提交：

```bash
git checkout -b feat/my-feature
git checkout -b fix/bug-description
```

分支前缀：`feat/`（新功能）、`fix/`（Bug 修复）、`perf/`（性能）、`docs/`（文档）、`refactor/`（重构）、`test/`（测试）。

### 2. 改代码

- 只动 `src/` 下的文件，`dist/` 是构建产物，不要碰
- TypeScript 严格模式，用接口和联合类型，别用 `any`
- 公共方法加 JSDoc 注释
- 新功能必须写测试

### 3. 代码风格

命名规则：
- 类：`PascalCase`（`MarkdownParser`）
- 函数：`camelCase`（`extractDecorations`）
- 测试文件：`kebab-case`（`parser-bold.test.ts`）
- 常量：`UPPER_SNAKE_CASE` 或 `camelCase`，看场景

TypeScript 要点：用接口定义对象结构，联合类型代替 `any`，参数和返回值加类型注解，善用 `?.` 和 `??`。

### 4. 测试

项目用 Jest，具体规模以 `npm test` 输出为准（目前 56 个测试套件、800+ 个用例）。所有改动必须带测试。

```bash
npm test              # 跑全部测试
npm run test:watch    # 监视模式
npm run test:coverage # 覆盖率报告
```

测试文件放在各模块的 `__tests__/` 目录下，命名用 kebab-case。

端到端测试在真实编辑器里跑：

```bash
npm run test:e2e         # VS Code（自动下载）
npm run test:e2e:cursor  # 本地 Cursor
```

> Cursor 端到端测试仅用于本地开发，CI 只跑 VS Code。

### 5. 提交前检查

```bash
npm run validate
```

这条命令依次执行：文档结构验证 → 全部测试 → 编译打包。通不过就别提交。

### 6. 写提交信息

用 Conventional Commits 格式：

```
<type>(<scope>): <description>
```

type 取值：`feat`（新功能）、`fix`（Bug 修复）、`docs`（文档）、`style`（格式）、`refactor`（重构）、`perf`（性能）、`test`（测试）、`chore`（杂务）。

scope 常用值：`parser`、`decorator`、`extension`、`docs`、`export`。

```bash
git commit -m "feat(parser): add support for definition lists"
git commit -m "fix(decorator): cache decorations on selection change"
```

### 7. 性能

三条红线：
- 选区变化必须即时响应（用缓存，不重新解析）
- 快速打字时不能卡顿
- 1MB 以上的文件仍可用

别在选区变化时解析整个文档。用 Map 和 Set，少做字符串拼接，能批处理就批处理。

### 8. 发 PR

```bash
git push origin feat/my-feature
```

在 GitHub 上建 PR，写清楚标题和描述，关联相关 Issue（`Fixes #123`），UI 改动附截图。

PR 过门槛：测试全过、编译无报错、lint 通过、无性能回归、文档已更新。

## 添加新的 Markdown 特性

1. **改解析器**（`src/parser.ts`）：在 `processAST()` 的 switch 里加分支，写处理方法，提取装饰范围
2. **加装饰类型**（`src/decorations.ts`）：需要新样式就建工厂方法，在 `decoration-type-registry.ts` 注册
3. **写测试**：在对应的 `__tests__/` 目录下建测试文件，覆盖各种边缘情况
4. **更新文档**：面向用户的改动更新 README，架构改动更新 AGENTS.md

## 文档结构

`docs/features/` 下的文件有固定格式，`npm run lint:docs` 会检查：

- YAML 前置元数据（`status`、`updateDate`、`priority`）
- 有且只有一个 H1
- H2 按顺序：Overview → Implementation → Acceptance Criteria → Notes → Examples

## 调试

- 日志在 View → Output → Extension Host
- `console.log()` 调试用完记得删
- 装饰不显示？检查文件后缀是不是 `.md`
- 扩展没激活？查 `package.json` 里的 activationEvents

## 行为准则

尊重他人，提供建设性反馈，关注项目本身。
