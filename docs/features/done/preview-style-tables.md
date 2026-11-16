---
status: DONE
updateDate: 2026-11-16
priority: Medium Priority
---

# 预览风格表格

## 概述

`markdownGongwen.tables.style` 提供两种编辑视图：`grid` 沿用字符网格，`preview` 隐藏管道符，以固定宽度 CSS 单元格渲染。公文默认仍为 `grid`，不会静默改变既有外观；`preview` 只影响编辑器，不改变 DOCX 表格。

`grid` 通过空白补齐宽度，依赖编辑器字体对全角/半角字符的实际测量；中英混排或比例字体可能错位。`preview` 为同列单元格设置相同的 `ch` 宽度，字体不再决定边框是否对齐。

## 配置

```json
{
  "markdownGongwen.tables.style": "grid",
  "markdownGongwen.tables.cjkWidthRatio": 2,
  "markdownGongwen.tables.maxColumnWidth": 48,
  "markdownGongwen.tables.highlightHeaders": false,
  "markdownGongwen.tables.rowSeparators": true
}
```

- `cjkWidthRatio`：全角字符相对半角字符的宽度比，范围 1–3；全角标点也按该比例估算。
- `maxColumnWidth`：预览单元格最大字符宽度，范围 8–200；超出内容在渲染视图中裁切，光标进入表格仍显示完整源码。
- `highlightHeaders`：是否给表头增加主题链接色。为保持本仓库既有外观默认 `false`；表头的粗体语义不受影响。
- `rowSeparators`：仅在 `preview` 中绘制数据行下分隔线。

## 实现

- `parser/core.ts` 的 `processTable()` 按 `tables.style` 分支。
- `parser/tables.ts` 负责单元格文本、CJK 宽度、表头着色与行分隔元数据。
- 预览路径隐藏 `tablePipe` / `tableSeparatorPipe`，输出带 `boxWidth`、`cellAlign`、`isHeaderCell`、`drawRowSeparator` 的 `tableCell`，并以 `tableRule` 替换分隔行。
- `decorator/visibility-model.ts` 把元数据转换为 `inline-block`、固定 `ch` 宽度、对齐和边框样式。
- 表格配置变化在 `registration/register-event-handlers.ts` 中清理解析缓存并刷新；不能只换装饰颜色，因为宽度元数据来自解析结果。
- 光标位于表格内时仍展示完整原始 Markdown。

## 验收标准

```gherkin
Feature: 预览风格表格

  Scenario: 默认保持字符网格
    Given tables.style 为 grid
    When 打开 GFM 表格
    Then 沿用既有管道符与字符对齐

  Scenario: 预览列对齐
    Given tables.style 为 preview
    When 一列同时含中英文
    Then 同列单元格使用相同 CSS 宽度

  Scenario: 表头着色需显式开启
    Given tables.highlightHeaders 为 false
    When 渲染表格
    Then 表头不增加链接色

  Scenario: 编辑时还原源码
    When 光标进入表格
    Then 显示完整原始 Markdown
```

## 已知限制与验证状态

- 单元格不能软换行；超宽表格建议关闭 `editor.wordWrap`，否则单元格盒会跨视觉行断开。
- 固定宽度只决定盒子，不保证被裁切内容全部可见；源码始终保留。
- 上游原始用例已随 Vitest 单栈迁移，并按本仓库默认关闭表头着色调整；本轮按用户要求未运行测试或编译。
- 上游相关背景：[issue #21](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/21)、[issue #41](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/41)、[issue #76](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/76)、[PR #116](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/pull/116)。

## 边缘情况

- preview 单元格内容按纯文本处理，不再嵌套行内链接或富文本装饰。
- 非规则表格、混合/嵌套格式和宽度不足时需要回退或保持可读，不能为了隐藏标记破坏编辑。
- preview 样式只影响编辑器；DOCX 继续使用原有表格转换。

## 示例配置

```json
{
  "markdownGongwen.tables.style": "preview",
  "markdownGongwen.tables.rowSeparators": true,
  "markdownGongwen.tables.highlightHeaders": true
}
```
