---
status: DONE
updateDate: 2026-11-16
priority: Low Priority
---

# 行内 ==高亮==

## 概述

启用 `markdownGongwen.highlight.enabled` 后，编辑器把 `==需要强调的文字==` 渲染为主题色高亮，并按三态模型隐藏或显示两侧 `==`。

本仓库默认 `false`，避免上游新语法在既有公文中静默改变外观。该功能仅属于编辑视图；DOCX 转换没有把 `==...==` 映射为 Word 突出显示，导出仍按普通文本处理。

## 配置

```json
{
  "markdownGongwen.highlight.enabled": false,
  "markdownGongwen.colors.highlightForeground": "",
  "markdownGongwen.colors.highlightBackground": ""
}
```

空颜色值使用 VS Code 当前主题；也可分别指定高亮文字色和背景色。颜色变化只重建装饰类型，语法开关变化会清理解析缓存。

## 实现

- `parser/highlight.ts` 识别合法 `==...==` 范围，拒绝空内容、未闭合标记及不适用上下文。
- `parser/types.ts` 使用 `highlight` 装饰类型；`decorations.ts` 建立文字与背景色。
- `decorator/decoration-categories.ts`、`visibility-model.ts` 和范围过滤逻辑支持编辑时显示原始定界符。
- `registration/register-event-handlers.ts` 在开关变化时清缓存并刷新，在颜色变化时重建装饰类型。

## 验收标准

```gherkin
Feature: 行内高亮

  Scenario: 默认关闭
    When 打开含 ==文字== 的文档
    Then 保留原始文本外观

  Scenario: 显式开启
    Given highlight.enabled 为 true
    When 光标不在高亮范围
    Then 隐藏定界符并显示高亮

  Scenario: 编辑源码
    When 光标进入高亮范围
    Then 按三态模型显示 == 定界符
```

## 验证状态

上游测试已迁入 Vitest 结构，测试套件显式开启功能以覆盖解析，另保留关闭开关的用例；本轮按用户要求未运行测试或编译。

## 边缘情况

- 默认关闭，未启用时不创建高亮装饰。
- 代码块、行内代码、frontmatter、表格和块级 HTML 不参与高亮解析。
- 当前只改变编辑视图；DOCX 按普通文本导出，不映射为 Word 高亮。

## 示例配置

```json
{
  "markdownGongwen.highlight.enabled": true,
  "markdownGongwen.colors.highlightForeground": "#000000",
  "markdownGongwen.colors.highlightBackground": "#fff59d"
}
```
