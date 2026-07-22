---
status: DONE
updateDate: 2026-04-03
priority: Core Feature
---

# 标题（Headings）

## 概述

支持 1-6 级标题，具有合适的字号缩放和隐藏的语法标记。支持 **字体族** 、 **字重** 和 **字号** 的自定义。

## 实现

- 语法：`# H1` 到 `###### H6`
- 标记符号（`#`）被隐藏
- 默认字号：H1（180%）、H2（140%）、H3（120%）、H4（110%）、H5（100%）、H6（90%）
- 默认字重：H1-H3 加粗，H4-H6 不加粗
- 支持所有 6 级标题

### 字体自定义

通过 `markdownGongwen.fonts.*` 设置，用户可为每级标题独立配置：

- `fontFamily`：CSS 字体族字符串（例如 `"Arial, SimHei, sans-serif"`）
- `fontWeight`：CSS 字重（`normal`、`bold`、`100`-`900`）
- `fontSize`：CSS 字号（例如 `"137%"`、`"22pt"`、`"1.4em"`）

空值表示使用插件默认值。字体必须安装在用户的操作系统上。

### 党政公文示例配置

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
  "markdownGongwen.fonts.heading4.fontSize": "100%"
}
```

## 验收标准

### 标题层级

```gherkin
Feature: 标题格式化

  Scenario: H1 标题
    When 输入 # Heading 1
    Then 标记被隐藏
    And 文本以 180% 字号显示

  Scenario: H2 标题
    When 输入 ## Heading 2
    Then 标记被隐藏
    And 文本以 140% 字号显示

  Scenario: H3 标题
    When 输入 ### Heading 3
    Then 标记被隐藏
    And 文本以 120% 字号显示

  Scenario: H4 标题
    When 输入 #### Heading 4
    Then 标记被隐藏
    And 文本以 110% 字号显示

  Scenario: H5 标题
    When 输入 ##### Heading 5
    Then 标记被隐藏
    And 文本以 100% 字号显示

  Scenario: H6 标题
    When 输入 ###### Heading 6
    Then 标记被隐藏
    And 文本以 90% 字号显示
```

### 自定义字体

```gherkin
Feature: 标题字体自定义

  Scenario: 设置字体族
    When 设置 "markdownGongwen.fonts.heading1.fontFamily" 为 "Arial, SimHei"
    Then H1 标题使用配置的字体

  Scenario: 设置字重
    When 设置 "markdownGongwen.fonts.heading3.fontWeight" 为 "bold"
    Then H3 标题以粗体显示

  Scenario: 设置字号
    When 设置 "markdownGongwen.fonts.heading2.fontSize" 为 "100%"
    Then H2 标题以 100% 字号显示（覆盖默认 140%）

  Scenario: 空值使用默认
    When "markdownGongwen.fonts.heading1.fontFamily" 未设置
    Then 标题使用编辑器默认字体
```

### 边缘情况

```gherkin
Feature: 标题边缘情况

  Scenario: 标题中包含格式
    When 输入 ## **Bold** heading
    Then 标题标记被隐藏
    And 加粗格式正常应用

  Scenario: 选中时显示原始语法
    Given # Heading 在文件中
    When 选中该标题
    Then 显示原始 Markdown 语法
    When 取消选中
    Then 标记再次隐藏
```

## 备注

- 核心 Markdown 功能
- 支持全部 6 级标题
- 字号提供视觉层级
- 字体自定义通过 CSS 注入技巧实现（`textDecoration` 属性）
- 字体必须安装在操作系统上才能使用

## 示例

- `# Heading 1` → **Heading 1**（180% 字号，标记隐藏）
- `## Heading 2` → **Heading 2**（140% 字号，标记隐藏）
- `### Heading 3` → **Heading 3**（120% 字号，标记隐藏）
- `#### Heading 4` → Heading 4（110% 字号，标记隐藏）
- `##### Heading 5` → Heading 5（100% 字号，标记隐藏）
- `###### Heading 6` → Heading 6（90% 字号，标记隐藏）
