---
title: Implemented Feature Set Report
focus: Layered Decorations and Active-Line Behavior
date: 2026-01-18
---

# Implemented Feature Set Report

This report summarizes the currently implemented feature set based on:
- Feature docs under `docs/features/done/`
- Decoration types and parsing logic in `src/parser.ts`
- Decoration filtering in `src/decorator.ts`
- Tests in `src/parser/__tests__` and `src/decorator/__tests__`

## Layered Decoration Model (Focus Area)

The editor applies multiple decoration layers per line:
- **Marker/replacement layer**: hides or replaces Markdown syntax markers.
- **Semantic layer**: applies formatting to content (bold, italic, links, etc.).
- **Interaction layer**: supports click behaviors (checkbox toggles, link navigation).

The active-line behavior is implemented to **remove marker/replacement decorations**
while **retaining semantic styling**, so editing does not remove visual meaning.
This is implemented via `isMarkerDecorationType()` and filtering in
`Decorator.filterDecorations()`.

## Implemented Features by Layer

### Marker/Replacement Layer (Syntax Hiding or Replacement)
- **Hide markers** for inline formatting: bold, italic, bold+italic, strikethrough.
- **Hide backticks** for inline code (`transparent` decoration).
- **Hide heading markers** (`#`), including per-level heading decorations.
- **Replace blockquote markers** (`>`) with a visual bar.
- **Replace unordered list markers** (`-`, `*`, `+`) with bullet points.
- **Replace checkbox syntax** (`[ ]`, `[x]`) with checkbox glyphs.
- **Replace horizontal rules** (`---`, `***`, `___`) with a visual separator.
- **Ordered list marker styling**: keeps numeric markers visible but normalizes their
  color via `orderedListItem` decoration (no bullet replacement).

### Semantic Layer (Content Styling)
- **Bold** (`**text**`, `__text__`)
- **Italic** (`*text*`, `_text_`)
- **Bold + Italic** (`***text***`, `___text___`)
- **Strikethrough** (`~~text~~`)
- **Inline code** (monospace styling for `` `code` ``)
- **Code blocks** (background styling for fenced code blocks)
- **Headings** (H1–H6 sizing)
- **Links** (link styling for `[text](url)` with URL hidden)
- **Images** (alt text styling for `![alt](path)` with URL hidden)
- **Blockquotes** (text styling plus nesting indicators)

### Interaction Layer
- **Checkbox toggling**: clicking on the checkbox toggles it without forcing raw
  syntax on the entire line.
- **Link navigation**: Ctrl+Click behavior via link provider.

### Parsing/Document Features
- **Task lists**: unordered and ordered variants (`- [ ]`, `* [ ]`, `1. [ ]`, `1) [ ]`)
  including checked/unchecked and multi-digit numbers.
- **Unordered lists**: marker replacement with nesting support.
- **Ordered lists**: marker detection with `orderedListItem` decoration.
- **Horizontal rules**: multiple marker variants.
- **Blockquotes**: nested levels.
- **YAML frontmatter**: detected at document start and treated as a distinct
  decoration; horizontal rules inside frontmatter are skipped.

## Layered Behavior: Add/Remove Decorations on One Line

When the cursor is on a line (or a selection overlaps it):
- Marker/replacement decorations are **removed** so raw Markdown is visible.
- Semantic decorations are **retained** to preserve formatting.
- Checkbox decorations are **kept** if the cursor is inside the checkbox range to
  preserve click/toggle behavior.

Marker/replacement categories currently include:
`hide`, `transparent`, `blockquote`, `heading`, `heading1`–`heading6`, `listItem`,
`checkboxUnchecked`, `checkboxChecked`, `horizontalRule`.

## Implementation Hotspots (Relevant to Complexity Review)

These are areas where layered behavior adds complexity:
- **Decoration filtering**: selection-aware logic that splits marker vs semantic
  decorations, with checkbox exceptions.
- **Ordered vs unordered lists**: dual handling (bullets vs numeric markers) with
  checkbox integration.
- **Frontmatter and horizontal rules**: overlap handling to avoid false positives.
- **Nested formatting**: multiple decoration ranges overlapping within a single line.

## Notes on Feature Coverage

The implemented feature set above reflects code-level behavior and tests. Any
feature listed under `docs/features/todo/` is not included here unless it is
explicitly present in parsing/decorating logic or tests.

## Recommendations: Complexity Reduction (Syntax Shadowing M2 Complete)

Context: Milestone 1 (keep semantic styling while editing) is implemented. Milestone 2 is also implemented.
- ✅ `docs/features/done/syntax-shadowing-m2-three-state-model.md` (Rendered / Ghost / Raw) - **DONE**

### 1) Introduce an explicit “shadowing state” decision (even before Ghost exists)

Goal: remove implicit “reveal vs not reveal” logic scattered across conditions.

- Add a small internal model like `ShadowingState = Rendered | Raw` now (Ghost later), computed **once** from selections/cursors.
- Make `filterDecorations()` consume `(decorations, text, shadowingStateByLine, interactionContext)` rather than recomputing reveal intent inline.
- When you implement M2, extending `Rendered|Raw` → `Rendered|Ghost|Raw` becomes additive instead of a rewrite.

### 2) Replace the hard-coded “marker set” with a decoration taxonomy map

M2 explicitly calls for splitting today’s single hidden category into buckets (markers vs metadata vs structural tokens).

- Centralize classification in one map, e.g. `DecorationPolicyByType`:
  - **layer**: marker/replacement vs semantic vs interaction vs metadata
  - **bucket**: marker | metadata | structuralToken (future) | semantic
  - **state policy**: whether to apply in Rendered/Ghost/Raw
  - **layout sensitivity**: prefer `transparent` vs `hide` (for future table support)
- Then `isMarkerDecorationType()` becomes a thin query into this map (or can be removed entirely).

This reduces “add a new decoration type” from “update multiple switch/if sites” to “update one policy entry + add tests”.

### 3) Generalize “smart click” as interaction zones (avoid one-off checkbox logic)

Today, checkbox handling is a special-case in filtering (“keep visible if cursor is inside checkbox range”).
This concept could be expanded in the future (e.g. link click intent vs edit intent).

- Model “interaction zones” as first-class data (range + intent), and have one generic rule:
  - **If the cursor is inside an interaction zone**, keep the interaction decoration active regardless of state.
- Apply the same mechanism later to links (navigate intent) and other constructs without duplicating logic.

### 4) Separate “what a decoration means” from “how it is rendered”

Future stability work (tables) would essentially be "choose a different hiding strategy in layout-sensitive contexts".

- Prefer representing “hiding strategy” as data (e.g. compact hide vs transparent hide) chosen by context,
  rather than multiplying decoration types or adding more conditional logic in filtering.
- Add a context classifier (start simple): `isInTableCell(line)` , later extend to other layout-sensitive regions.

### 5) Make precedence/layering rules explicit for nested constructs

M2 calls out nested constructs (e.g. bold inside links, inline code inside emphasis) needing predictable outcomes.

- Document and encode a small set of precedence rules (e.g. “inline code suppresses emphasis parsing inside its range”).
- Enforce via ordering + policy, not by adding more “if type === …” branches.

### 6) Testing strategy to keep complexity bounded

Add tests around the *state decision* and *policy application* (not just end visuals):
- Multi-cursor and multi-selection cases (line-level vs range-level state)
- Nested constructs producing stable/consistent output in Ghost/Raw
- Table examples  to prevent regressions once stability rules land

Net effect: Future improvements become mainly “extend policy/state + add decorations”, rather than “grow conditional logic in filtering”.
