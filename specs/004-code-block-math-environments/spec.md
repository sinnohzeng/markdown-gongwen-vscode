# Feature Specification: Code-Block Math Environments

**Feature Branch**: `004-code-block-math-environments`  
**Created**: 2026-03-09  
**Status**: Draft  
**Input**: Extend inline LaTeX rendering to support fenced code-block math environments (`math`, `latex`, `tex`) while preserving existing `$...$` and `$$...$$` behavior.

---

## Clarifications

### Session 2026-03-09

- Q: For fence height calculation, which lines should be counted and which formula should be used? → A: Body lines only; height = (numLines + 2) × line height (same formula as mermaid).
- Q: Should the decoration range include the whole fenced block or only the body? → A: Whole block (opening fence line + body + closing fence line); one replacement like mermaid.
- Q: Should there be an upper bound on the number of lines in a math fence? → A: No limit; rely on existing performance constraints (parse cache, large-file behavior).

---

## Context and Source Extraction (from 003 spec set)

The current `003-inline-latex-equations` feature already defines:

- Inline math rendering for `$...$`
- Block math rendering for `$$...$$` (including multi-line content)
- Rendering inline in the editor via decorations (not hover-only)
- Reveal raw source on selection/cursor for editing
- Fallback to raw source when LaTeX is invalid
- Theme-aware foreground behavior
- Settings toggle: `markdownInlineEditor.math.enabled`

Relevant extracted point for environments:

- Multi-line `\begin{align}...\end{align}` is expected to render when inside `$$...$$`.

---

## Findings (Current Gaps)

1. The current feature spec does not define math rendering inside fenced code blocks (e.g. ```` ```math ```` / ```` ```latex ```` / ```` ```tex ````).
2. The current math scanner (`src/math/math-scanner.ts`) scans normalized text directly for `$`/`$$`, independent of Markdown AST node type.
3. Parser tests for math regions cover inline/block/currency/escape/large-file behavior, but do not define behavior for fenced code-block math inputs.
4. Because no contract exists for code-block math, expected behavior is currently ambiguous (render vs keep raw code).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Render math environments in math fences (Priority: P1)

As a user writing technical markdown, I can place LaTeX environments inside a fenced code block labeled `math`, `latex`, or `tex`, and I see the equation rendered as display math in the editor.

**Why this priority**: Extends the existing equation workflow to a common authoring pattern for multi-line environments.

**Independent Test**: Open a markdown file with a ` ```math ` fence containing an `align` environment and confirm it renders as display math in-editor.

**Acceptance Scenarios**:

1. **Given** a fenced block with info string `math`, **when** it contains valid LaTeX (including `\begin{align}...\end{align}`), **then** the block renders as display math in the editor.
2. **Given** a fenced block with info string `latex` or `tex`, **when** it contains valid LaTeX, **then** the block renders as display math in the editor.
3. **Given** multiple math fences in one file, **when** the file is displayed, **then** each fence renders correctly without layout overlap or corruption.
4. **Given** a multi-line math fence, **when** it is rendered, **then** the vertical space reserved uses body line count and the formula (numLines + 2) × line height (same as mermaid diagram rendering).

---

### User Story 2 – Keep non-math code fences as regular code (Priority: P1)

As a user, I can keep writing normal code fences (`js`, `ts`, `python`, etc.) containing dollar signs without them being interpreted as math.

**Why this priority**: Prevents regressions in standard markdown code editing.

**Independent Test**: Open a ` ```js ` block that includes `$x$` and `$$y$$` and verify it remains a regular code block.

**Acceptance Scenarios**:

1. **Given** a non-math fenced code block (e.g. `js`), **when** it contains `$...$` or `$$...$$`, **then** no math rendering is applied inside that fence.
2. **Given** a file with mixed fence languages, **when** displayed, **then** only `math|latex|tex` fences are eligible for code-block math rendering.

---

### User Story 3 – Reveal/edit and fallback behavior for math fences (Priority: P1)

As a user, I can reveal and edit raw fenced LaTeX when selecting/cursoring the rendered region, and invalid fenced LaTeX safely falls back to raw text.

**Why this priority**: Must remain consistent with existing reveal and error behavior from 003.

**Independent Test**: Place cursor in a rendered math fence to reveal raw fenced content; introduce invalid LaTeX and verify raw text is shown instead of broken rendering.

**Acceptance Scenarios**:

1. **Given** a rendered math fence, **when** selection/cursor is inside its range, **then** raw fenced source is revealed for editing.
2. **Given** invalid LaTeX in a `math|latex|tex` fence, **when** rendering is attempted, **then** raw fenced source remains visible and editable, with no crash.
3. **Given** the user leaves the edited region and LaTeX becomes valid, **when** decorations refresh, **then** rendered math appears again.

---

### User Story 4 – Respect math enable/disable setting (Priority: P1)

As a user, when math rendering is disabled via settings, code-block math environments are shown as plain fenced text with no math decoration.

**Why this priority**: Maintains a single, predictable switch for all math rendering behavior.

**Independent Test**: Disable `markdownInlineEditor.math.enabled` and verify a ` ```math ` block is not rendered as math.

**Acceptance Scenarios**:

1. **Given** `markdownInlineEditor.math.enabled = false`, **when** opening a markdown file with `math|latex|tex` fences, **then** no math rendering is applied.
2. **Given** math is re-enabled, **when** decorations refresh, **then** fenced math renders again.

---

### Edge Cases

- Fenced math with empty/whitespace-only content: no rendered artifact; raw fenced content remains visible.
- Unclosed fenced blocks: no crashes; preserve raw text behavior.
- Language tags with surrounding whitespace/case variants (e.g. `Math`, ` latex `): behavior must be explicitly normalized by implementation and tested.
- Files mixing `$...$`, `$$...$$`, mermaid, and code-block math: all eligible features render without interfering with one another.
- Multi-line math fences: rendered block height MUST use body line count and formula (numLines + 2) × line height (same as mermaid) to avoid overlapping following content.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The extension MUST detect fenced code blocks whose info string is `math`, `latex`, or `tex`.
- **FR-002**: The extension MUST treat the fenced body of `math|latex|tex` blocks as display-math source and render it using the existing math rendering pipeline.
- **FR-002a**: The extension MUST size the vertical space of rendered code-block math using the **body line count** only (excluding opening/closing fence lines) and the same formula as mermaid: height = (numLines + 2) × editor line height, so multi-line fences do not overlap following content.
- **FR-003**: When rendered, the **decoration range** MUST be the entire fenced block (opening fence line + body + closing fence line). Opening/closing fence markers and raw fenced source MUST be hidden/replaced by that single decoration, consistent with mermaid block behavior and existing reveal behavior.
- **FR-004**: Selection/cursor inside a rendered code-block math region MUST reveal raw fenced source for editing; moving outside MUST re-render when valid.
- **FR-005**: Invalid or unsupported LaTeX in a math fence MUST fall back to raw fenced text in place and MUST NOT crash or corrupt other decorations.
- **FR-006**: Non-math fenced code blocks (all languages other than `math|latex|tex`) MUST preserve existing code-block behavior and MUST NOT be interpreted as math.
- **FR-007**: `markdownInlineEditor.math.enabled` MUST gate code-block math rendering; when disabled, math fences remain plain text/code fences.
- **FR-008**: Existing `$...$` and `$$...$$` behavior outside code fences MUST remain unchanged.
- **FR-009**: Detection, rendering, and reveal behavior for code-block math MUST be covered by unit tests (parser/scanner, decorator integration, and renderer error paths).

### Key Entities

- **Math fence region**: A fenced markdown code block whose normalized info string is `math`, `latex`, or `tex`. The region used for the math decoration spans the **whole block** (opening fence line + body + closing fence line), as for mermaid.
- **Fence math source**: The raw fenced block body, interpreted as display-math LaTeX input.
- **Rendered fence math output**: The SVG/data-URI artifact shown in place of raw fenced source during rendered state. Its vertical extent MUST use body line count and the formula (numLines + 2) × line height, as for mermaid blocks.

---

## Assumptions

- Math fences map to display-math behavior (not inline-math behavior).
- Existing renderer (MathJax + SVG) remains the rendering backend.
- The implementation may add AST-scoped fence detection and keep current `$...$`/`$$...$$` scanning for non-code regions.
- Existing code-block/mermaid behavior remains authoritative unless explicitly superseded by `math|latex|tex` fence rules.
- Height for code-block math follows the same approach as mermaid: count **body lines only** (numLines) and use height = (numLines + 2) × editor line height so the rendered block occupies the same vertical space as the original code environment.
- There is no spec-defined maximum line count for math fences; existing parse-cache and large-file behavior apply (no skip-render or height-cap rule).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A markdown file containing a valid ` ```math ` or ` ```latex ` or ` ```tex ` environment renders in-editor as display math without using hover/preview.
- **SC-001a**: A multi-line math fence reserves vertical space using body line count and formula (numLines + 2) × line height (same as mermaid); no overlap with following content.
- **SC-002**: A non-math fence (e.g. ` ```js `) containing `$...$` text remains regular code and shows no math rendering.
- **SC-003**: Invalid LaTeX in a math fence shows raw fenced source and does not crash or break other markdown decorations.
- **SC-004**: Selection/cursor reveal behavior for math fences matches current math reveal interaction.
- **SC-005**: Disabling `markdownInlineEditor.math.enabled` disables all code-block math rendering; re-enabling restores it.

---

## Relationship to Other Artifacts

- **003 spec** (`specs/003-inline-latex-equations/spec.md`): This feature extends math rendering coverage from `$...$`/`$$...$$` to explicit math fences.
- **Contracts** (`specs/003-inline-latex-equations/contracts/*`): Existing delimiter grammar remains valid; this feature introduces fence-language-based eligibility in addition to delimiter scanning.
- **AGENTS.md**: Implementation should follow parse cache, decoration pipeline, position mapping, and test coverage expectations.

