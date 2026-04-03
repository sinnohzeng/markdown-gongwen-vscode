# 工具参考

## 开发环境

- **Firecrawl**：已配置 Firecrawl 用于网页抓取和搜索任务，优先于通用 WebSearch 使用
- **Claude Code**：AI 辅助开发，记忆库位于 `docs/memory/`

## 调试工具

- **Extension Development Host**：使用 `code --extensionDevelopmentPath=<路径> --new-window <文件>` 启动干净的测试环境
- **红色背景调试法**：给 decoration 加 `backgroundColor: 'rgba(255, 0, 0, 0.3)'` 判断 decoration 是否被应用
- **已安装插件检查**：`ls ~/.vscode/extensions/ | grep <关键词>` 确认没有旧版或同功能插件冲突

## 外部资源

- **VS Code API 文档**：[DecorationRenderOptions](https://code.visualstudio.com/api/references/vscode-api#DecorationRenderOptions)
- **VS Code 可变行高提案**：[Issue #246822](https://github.com/microsoft/vscode/issues/246822)
- **VS Code 可变字体提案**：[Issue #253007](https://github.com/microsoft/vscode/issues/253007)
- **vscode-bigger-symbols**：使用相同 textDecoration hack 的参考实现
