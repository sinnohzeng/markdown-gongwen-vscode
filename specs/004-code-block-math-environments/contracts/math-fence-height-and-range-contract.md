# Contract: Math fence height and decoration range

**Feature**: 004-code-block-math-environments  
**Type**: Behavior contract for scanner and decorator  
**Consumers**: `src/math/math-scanner.ts`, `src/math/math-decorations.ts`, `src/decorator.ts`, tests

## Purpose

Define the decoration range and rendered height for code-block math so implementation matches mermaid and spec clarifications.

## Decoration range

- The **decoration range** for a math fence is the **entire fenced block**: from the start of the opening fence line through the end of the closing fence line (inclusive of the closing newline if present).
- One decoration replaces the whole block (opening fence + body + closing fence); same pattern as mermaid.
- When selection/cursor is inside this range, the whole block is revealed as raw text for editing.

## Height formula

- **Line count**: Count **body lines only** (content between opening and closing fence lines). Do not count the opening or closing fence lines.
- **Formula**: `height = (numLines + 2) × editor line height`, where `numLines` is the body line count and editor line height is resolved from VS Code editor settings (same as mermaid).
- The rendered SVG/decoration vertical extent MUST use this height so multi-line fences do not overlap following content.

## Limits

- No spec-defined maximum line count for math fences. Implementation relies on existing parse-cache and large-file behavior; no skip-render or height-cap rule.

## Validation examples

- Single-line body (`\frac{1}{2}`): numLines = 1, height = 3 × line height.
- Three-line body (e.g. `\begin{align}...\end{align}`): numLines = 3, height = 5 × line height.
- Whole-block range for `` ```math\nE=mc^2\n``` ``: startPos at `` ``` ``, endPos after final `` ``` `` (or newline after it).
