# Contract: Math fence rendering and exclusion

**Feature**: 004-code-block-math-environments  
**Type**: Behavior contract for parse/decorate pipeline  
**Consumers**: Parser/scanner, decorator integration tests

## Purpose

Define how eligible math fences produce math regions and how non-math fences are excluded from math interpretation.

## Region production

For each eligible fence (`math|latex|tex`):
- The **decoration range** is the **entire fenced block** (opening fence line + body + closing fence line). One math region is produced with startPos/endPos spanning that whole block.
- The **source** passed to the renderer is the **fenced body only** (display-math LaTeX).
- The produced region has `displayMode = true` and **numLines** = body line count for height calculation: height = (numLines + 2) × editor line height (same as mermaid).

## Exclusion rules

- Non-math fences (`js`, `ts`, `python`, empty info string, etc.) never produce fence math regions.
- Dollar-delimiter scanning (`$...$`, `$$...$$`) must not produce regions inside non-math fenced blocks.

## Reveal and fallback

- When selection/cursor intersects a rendered fence region, raw fenced source is revealed for editing.
- If rendering fails (invalid/unsupported LaTeX), raw fenced source remains visible and editable.
- Leaving the region triggers normal re-render attempt.

## Setting behavior

- With `markdownInlineEditor.math.enabled = false`, no math decorations are applied (including eligible math fences).
- Re-enabling math restores fence rendering on next decoration refresh.

## Validation examples

1. ` ```math ` + `\begin{align}...\end{align}` -> rendered display math.
2. ` ```js ` + `$x$` and `$$y$$` inside block -> no math rendering.
3. Mixed file (`$x$`, `$$y$$`, ` ```latex `) -> all eligible parts render, none conflict.
4. Invalid LaTeX in ` ```tex ` -> raw text shown, no crash.
