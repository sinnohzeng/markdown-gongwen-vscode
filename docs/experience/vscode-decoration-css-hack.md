# VS Code Decoration CSS Hack 经验总结

> 日期：2026-04-03
> 作者：sinnohzeng + Claude Code
> 适用版本：VS Code 1.100+（1.88-1.99 期间此技术曾失效）

## 核心技术：textDecoration CSS 注入

VS Code 的 `DecorationRenderOptions` 原生不支持 `fontSize`、`fontFamily`、`lineHeight` 属性。唯一的方法是利用 `textDecoration` 属性进行 CSS 注入：

```typescript
window.createTextEditorDecorationType({
  textDecoration: 'none; font-size: 200%; font-family: "Songti SC", serif;',
});
```

### 原理

VS Code 将 `textDecoration` 的值拼接到行内样式的 `text-decoration:` 属性中。由于分号 `;` 在 CSS 中是属性分隔符，所以 `text-decoration: none; font-size: 200%;` 会被浏览器（Chromium）解析为两个独立的 CSS 属性。

## 关键踩坑：fontWeight + textDecoration 冲突

### 现象

当一个 decoration 同时设置了原生 `fontWeight` 属性和 `textDecoration` CSS hack 时，**textDecoration hack 完全失效**——font-size、font-family 等注入的 CSS 属性都不会生效。

```typescript
// 错误写法 — textDecoration hack 会失效！
window.createTextEditorDecorationType({
  textDecoration: 'none; font-size: 200%; font-family: "Songti SC", serif;',
  fontWeight: 'bold',  // 原生属性导致 textDecoration hack 失效
});

// 正确写法 — font-weight 也放进 textDecoration 字符串
window.createTextEditorDecorationType({
  textDecoration: 'none; font-size: 200%; font-weight: bold; font-family: "Songti SC", serif;',
});
```

### 验证方法

| 配置 | textDecoration hack | 原生 fontWeight | 结果 |
|------|---------------------|-----------------|------|
| 只用 textDecoration | `'none; font-size: 200%; ...'` | 无 | 生效 |
| 只用 fontWeight | 无 | `'bold'` | 生效 |
| 两者同时使用 | `'none; font-size: 200%; ...'` | `'bold'` | **textDecoration 失效** |
| font-weight 放进 hack | `'none; font-size: 200%; font-weight: bold; ...'` | 无 | 生效 |

### 规则

> **当需要同时使用 textDecoration CSS hack 和 font-weight 时，必须将 font-weight 注入到 textDecoration 字符串内部，绝不能使用原生 `fontWeight` 属性。**

这条规则同样适用于 `fontWeight: 'normal'`——即使是默认值，设置了也会导致 hack 失效。

## 行高和字号限制

### font-size 导致换行错位

通过 textDecoration hack 注入 `font-size: 150%` 时，VS Code 的换行引擎仍按原始字号计算换行位置，导致文字超出视口、出现水平滚动条。

**正确方案**：不用 decoration 放大字号，改用 `editor.fontSize` 在 `[markdown]` 语言作用域中设置：

```json
{
  "[markdown]": {
    "editor.fontSize": 22,
    "editor.lineHeight": 1.8,
    "editor.wordWrap": "on"
  }
}
```

这样 VS Code **原生知道字号变化**，换行、行高、光标位置全部自动适配。

### line-height 限制

CSS `line-height` 通过 textDecoration hack 注入后，**不能控制编辑器的实际行间距**。同样需要使用 `editor.lineHeight` 原生设置。

> VS Code 团队正在开发原生的可变行高支持（Issue #246822），但尚未作为公开 API 发布。

## CJK 字体栈最佳实践

### macOS 可用的中文系统字体

| 字体名 | 类别 | 位置 | CSS 名称 |
|--------|------|------|----------|
| 黑体-简 | 黑体 | /System/Library/Fonts/ | `"Heiti SC"` |
| 华文楷体 | 楷体 | Assets（按需激活） | `STKaiti` |
| 华文仿宋 | 仿宋 | Assets（按需激活） | `STFangsong` |
| 宋体-简 | 宋体 | Supplemental | `"Songti SC"` |
| 华文宋体 | 宋体 | Supplemental | `STSong` |

### 跨平台字体栈模板

```typescript
// 黑体
'SimHei, "Heiti SC", "Microsoft YaHei", sans-serif'

// 楷体
'KaiTi, STKaiti, "KaiTi_GB2312", serif'

// 仿宋
'FangSong, STFangsong, "FangSong_GB2312", serif'

// 宋体
'"Songti SC", "Source Han Serif SC", "Noto Serif CJK SC", "SimSun", serif'
```

### 注意事项

- CSS font-family 中的中文字符名称（如 `"思源宋体"`）可能导致 CSS 解析问题，**建议只使用英文/拉丁名称**
- 单词的字体名无需引号（`SimHei`），含空格的必须加引号（`"Heiti SC"`）
- 英文字体放在中文字体前面，利用 CSS 回退机制实现中英文混排

## 版本兼容性

| VS Code 版本 | textDecoration hack 状态 |
|-------------|-------------------------|
| < 1.88 | 正常工作 |
| 1.88 - 1.99 | **失效**（渲染引擎重构导致） |
| 1.100+ | 恢复工作 |

> 此技术是 **undocumented / unsupported**，可能在未来的 VS Code 版本中再次失效。VS Code 团队正在开发原生的 `fontSize`/`fontFamily` decoration 支持（Issue #253007）。

## 调试技巧

1. **红色背景法**：给 decoration 加 `backgroundColor: 'rgba(255, 0, 0, 0.3)'` 来判断 decoration 是否被应用
2. **对比测试法**：在同一组 decoration 中，有些生效有些不生效时，逐一对比配置差异（本次就是通过 bold/non-bold 的对比发现了 fontWeight 冲突）
3. **Extension Development Host**：使用 `code --extensionDevelopmentPath=<path> --new-window <file>` 启动干净的测试环境，避免已安装的旧版插件干扰
4. **检查已安装的同类插件**：使用 `ls ~/.vscode/extensions/ | grep <keyword>` 确认没有旧版或同功能插件冲突
