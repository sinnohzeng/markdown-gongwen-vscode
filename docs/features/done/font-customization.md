---
status: DONE
updateDate: 2026-04-03
priority: Enhancement
---

# 字体自定义（Font Customization）

## 概述

为 Markdown 标题、加粗/斜体文本和正文段落提供可选的字体族（font-family）、字重（font-weight）和字号（font-size）覆盖设置。当设置为空或无效时，回退到插件默认值。本功能是 **可自定义语法颜色** 功能的姊妹功能。

## 实现

- **配置项** ：22 项可选字体属性，位于 `markdownGongwen.fonts` 命名空间下
  - `heading1~6.fontFamily`、`heading1~6.fontWeight`、`heading1~6.fontSize`（18 项）
  - `emphasis.fontFamily`、`emphasis.fontWeight`（2 项）
  - `body.fontFamily`、`body.fontWeight`（2 项）
- **配置读取** ：`src/config.ts` 中的 `fonts` 区域，包含字重验证（`normal`、`bold`、`100`-`900`）和字号验证（CSS 单位）
- **CSS 注入** ：通过 `textDecoration` 属性注入 `font-family` 和 `font-size`（与现有字号缩放使用相同的技巧）
- **正文样式** ：Parser 为段落节点发射 `body` 类型装饰范围，仅在配置正文字体时生效
- **实时刷新** ：修改字体设置或主题时自动重建装饰类型

### 技术架构

```
用户设置 → config.ts（验证） → decorator.ts（注入 RegistryOptions）
  → decoration-type-registry.ts（创建 DecorationType）
  → decorations.ts（CSS 注入 textDecoration hack）
  → VS Code 编辑器渲染
```

### 字体来源

插件不捆绑字体文件（2026-07 起移除了原"打开捆绑字体目录"命令与 `fonts/` 目录）。编辑器渲染使用系统已安装字体；DOCX 导出同样依赖系统字体，未安装时 Word 自动回退。

## 验收标准

```gherkin
Feature: 字体自定义

  Scenario: 设置标题字体族
    When 设置 "markdownGongwen.fonts.heading1.fontFamily" 为 "Arial, SimHei, sans-serif"
    And 打开包含 "# 标题" 的 Markdown 文件
    Then 标题使用配置的字体渲染

  Scenario: 设置正文字体
    When 设置 "markdownGongwen.fonts.body.fontFamily" 为 "\"Times New Roman\", \"Source Han Serif SC\", serif"
    Then 正文段落使用配置的字体渲染

  Scenario: 空值回退到默认
    When "markdownGongwen.fonts.heading1.fontFamily" 未设置
    Then 标题使用编辑器默认字体

  Scenario: 无效字重被忽略
    When 设置 "markdownGongwen.fonts.heading1.fontWeight" 为 "invalid"
    Then 使用插件默认字重
    And 插件不崩溃

  Scenario: 实时刷新
    When 修改字体设置
    Then 打开的 Markdown 编辑器立即更新装饰
```

## 备注

- 所有字体必须安装在用户的操作系统上（VS Code 无法加载自定义字体文件或远程 Google Fonts）
- 思源宋体 = Google Fonts 上的 Noto Serif SC（Same font, different name）
- 插件既不捆绑字体也不提供字体下载，用户需自行在操作系统安装所需字体（详见上文"字体来源"）
- 正文字体装饰的优先级低于标题和加粗装饰（VS Code 后应用的装饰覆盖先应用的）

## 示例配置

### 党政公文风格（GB/T 9704-2012）

```json
{
  "markdownGongwen.fonts.heading1.fontFamily": "Arial, SimHei, Heiti SC, sans-serif",
  "markdownGongwen.fonts.heading1.fontWeight": "normal",
  "markdownGongwen.fonts.heading1.fontSize": "137%",
  "markdownGongwen.fonts.heading2.fontFamily": "Arial, KaiTi, STKaiti, serif",
  "markdownGongwen.fonts.heading2.fontWeight": "normal",
  "markdownGongwen.fonts.heading2.fontSize": "100%",
  "markdownGongwen.fonts.heading3.fontFamily": "\"Times New Roman\", FangSong, STFangsong, serif",
  "markdownGongwen.fonts.heading3.fontWeight": "bold",
  "markdownGongwen.fonts.heading3.fontSize": "100%",
  "markdownGongwen.fonts.heading4.fontFamily": "\"Times New Roman\", FangSong, STFangsong, serif",
  "markdownGongwen.fonts.heading4.fontWeight": "normal",
  "markdownGongwen.fonts.heading4.fontSize": "100%",
  "markdownGongwen.fonts.body.fontFamily": "\"Times New Roman\", \"Source Han Serif SC\", \"Noto Serif SC\", serif",
  "markdownGongwen.fonts.body.fontWeight": "300"
}
```

## 参考

- 姊妹功能：[可自定义语法颜色](customizable-syntax-colors.md)
- 标题功能：[标题](headings.md)
- 导出字体规格：[DOCX 导出](../docx-export.md)
