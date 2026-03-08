# Feature Specification: Inline LaTeX Equation Rendering

**Feature Branch**: `003-inline-latex-equations`  
**Created**: 2026-03-08  
**Status**: Implemented  
**Input**: [GitHub issue #6](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/6) — Inline LaTeX rendering implementation (Equation display). Render LaTeX-style math inline with text, similar to Obsidian and to the approach in [Markless](https://github.com/tejasvi/markless) (see [Markless deep dive](../../docs/competitors/markless_deep_dive.md)).

---

## Context and Reference

- **User request (issue #6):** “Add support for displaying inline Markdown equations (LaTeX-style math rendered inline with text). Having proper inline equation rendering would significantly improve the writing and reading experience, especially for technical and scientific notes. (similar to obsidian)”
- **Reference implementation:** Markless renders math **inline** using a math library (e.g. MathJax) → SVG → decoration (see `markless_deep_dive.md` § “LaTeX/Math Rendering”). This spec targets the **same user-visible behavior** (equations shown inline in the editor), while avoiding Markless pitfalls: no line-count limits, use of the existing parse cache, and full test coverage.
- **Out of scope for this spec:** Hover-only math preview (that is a different feature); rendering inside webviews or side panels; support for syntax outside `$...$` and `$$...$$` (e.g. `\(...\)` / `\[...\]`) may be considered in a later spec.

---

## Clarifications

### Session 2026-03-08

- Q: When there are multiple `$` on a line, how should the extension decide what counts as inline math vs plain text (e.g. currency)? → A: Only treat as math when there is non-whitespace immediately after the opening `$` (and typically before the closing `$`), so an unmatched “$100” (single dollar, no closing `$`) and “$ 50” (space after `$`) are not math. A paired `$100$` is valid inline math with content “100” unless a future rule excludes digits-only content.
- Q: When rendering fails (invalid/unsupported LaTeX), what should the user see in the editor? → A: Show raw LaTeX source and delimiters in place (same as revealed state); user can edit to fix.
- Q: For `$ $` or `$$$$` (no meaningful content, or only whitespace), treat as math or plain text? → A: Do not treat as math; leave the text as-is (delimiters visible, no decoration).
- Q: Should block (display) math be visually distinct from inline math in the editor? → A: Yes; block math is centered or clearly block-styled (e.g. on its own line) so it reads as display math. Concretely: use display block and horizontal margin so the rendered equation appears on its own line and is visually distinct from inline text.
- Q: Should users be able to disable math rendering via a setting? → A: Yes; one setting to enable/disable math rendering (default on); when off, $...$ and $$...$$ remain as plain text.
- Q: For theme-appropriate math font color (US5), how should High Contrast theme be handled? → A: Treat High Contrast like Dark (light/white math text).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Inline math displays in place (Priority: P1)

As a user editing markdown with inline math (e.g. `$E = mc^2$`), I see the equation rendered inline in the editor where the raw delimiters and source are hidden or replaced, so that reading and writing technical notes feels like Obsidian or Markless.

**Why this priority**: Delivers the core value of issue #6: “displaying inline Markdown equations” and “proper inline equation rendering.”

**Independent Test**: Open a markdown file containing `$E = mc^2$`, enable the extension, and confirm the formula is shown as rendered math inline (not only on hover).

**Acceptance Scenarios**:

1. **Given** a markdown file with inline math `$...$`, **when** the file is displayed with the extension enabled, **then** the math is rendered inline in the editor and the raw `$...$` and LaTeX source are hidden or replaced.
2. **Given** a paragraph containing both text and inline math (e.g. “The relation $E = mc^2$ is famous”), **when** I view the file, **then** the sentence reads naturally with the equation shown as rendered math inline.
3. **Given** I have multiple inline math expressions on the same or different lines, **when** the file is displayed, **then** each expression is rendered correctly and does not break layout or overlap other content.

---

### User Story 2 – Block (display) math displays inline (Priority: P1)

As a user writing block equations with `$$...$$`, I see the display math rendered in the editor and visually distinct from inline math (e.g. centered or on its own line, block-styled) so that multi-line or large equations are easy to spot and read without opening a preview.

**Why this priority**: Issue #6 asks for “equation display”; block math is standard in technical/scientific notes.

**Independent Test**: Add a block like `$$\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$` to a markdown file and confirm it is rendered as display math in the editor.

**Acceptance Scenarios**:

1. **Given** a markdown file with block math `$$...$$`, **when** the file is displayed, **then** the block math is rendered (e.g. display mode) and the delimiters/source are hidden or replaced.
2. **Given** block math spanning multiple lines (e.g. `\begin{align}...\end{align}` inside `$$...$$`), **when** the file is displayed, **then** the full block is detected and rendered correctly (no truncation or wrong range).
3. **Given** both inline `$...$` and block `$$...$$` in the same file, **when** the file is displayed, **then** both are rendered appropriately and do not interfere with each other.

---

### User Story 3 – Reveal raw LaTeX on selection (Priority: P2)

As a user, when I select or place the cursor in a rendered equation, I can see the raw LaTeX source (and delimiters) so I can edit it; when I deselect, the equation renders again.

**Why this priority**: Matches existing “reveal on select” behavior for other inline syntax; essential for editing.

**Independent Test**: Click inside a rendered equation and confirm the raw `$...$` and LaTeX appear; click outside and confirm it renders again.

**Acceptance Scenarios**:

1. **Given** an inline or block math expression is rendered, **when** I select the range containing the rendered math (or place the cursor within it), **then** the raw delimiters and LaTeX source are shown and I can edit them.
2. **Given** I have revealed the raw math and edited it, **when** I deselect or move the cursor outside, **then** the updated expression is parsed and rendered again (or shows raw LaTeX and delimiters in place if invalid, per FR-008).
3. **Given** the extension uses a “ghost” or “raw” visibility model for other syntax, **when** math is in scope, **then** reveal-on-select behavior for math is consistent with that model (e.g. same interaction pattern).

---

### User Story 4 – No false positives for dollar signs (Priority: P1)

As a user writing normal text with dollar amounts (e.g. “Price is $10”) or escaped dollars (`\$10`), I do not see those treated as math, and layout/editing remain correct.

**Why this priority**: Avoiding false positives is critical for adoption in non-math documents.

**Independent Test**: Type “Cost: $50” and “Use  for dollars” in a markdown file; confirm no math rendering is applied and no errors occur.

**Acceptance Scenarios**:

1. **Given** text like “Price is $10” with a single `$` and no matching pair, **when** the file is displayed, **then** it is not treated as math; the dollar sign remains visible and no decoration replaces it.
2. **Given** an escaped dollar `\$` in the text, **when** the file is displayed, **then** it is not treated as the start or end of math.
3. **Given** ambiguous cases (e.g. “$x$ and $y$” vs “$100 and $200”), **when** the parser applies rules for start/end matching, **then** only `$` followed immediately by non-whitespace starts inline math; an unmatched “$100” and “$ 50” are not treated as math (a paired “$100$” is currently valid inline math with content “100”).

---

### User Story 5 – Theme-appropriate font color for rendered math (Priority: P2) **⚠️ BROKEN**

As a user viewing rendered equations in the editor, I see the math in a font color that matches the active color theme so that equations remain readable: light/white text in dark themes (including High Contrast) and dark text in light themes.

**Status**: *Known issue* — Theme-appropriate font color (US5) is not working correctly in the current implementation; rendered math may not use light/white in dark theme or dark in light theme as specified. To be fixed in a follow-up.

**Why this priority**: Ensures equations are readable in any theme without requiring a separate setting; aligns with common editor defaults.

**Independent Test**: Open a markdown file with `$E = mc^2$` in a dark theme and confirm the rendered formula uses a light/white font color; switch to a light theme and confirm the rendered formula uses a dark font color.

**Acceptance Scenarios**:

1. **Given** the editor uses a dark or High Contrast color theme (e.g. Dark+, Dark Modern, High Contrast), **when** inline or block math is rendered, **then** the rendered math artifact uses a light/white font color so it is readable on the dark background.
2. **Given** the editor uses a light color theme (e.g. Light+, Light Modern), **when** inline or block math is rendered, **then** the rendered math artifact uses a dark font color so it is readable on the light background.
3. **Given** I switch the active color theme, **when** the theme change is applied, **then** rendered math is updated to use the appropriate font color for the new theme (e.g. after a refresh or next decoration update).

---

### Edge Cases

- **Unclosed delimiters:** If a line or document has `$` without a matching `$` or `$$`, or a `$` not immediately followed by non-whitespace (so not starting math), the extension does not treat it as math; no crash and no broken decoration ranges.
- **Invalid or unsupported LaTeX:** If the content between `$...$` or `$$...$$` fails to render (unknown command, syntax error), the extension shows the raw LaTeX source and delimiters in place so the user can edit and fix it; the rest of the document is unaffected.
- **Very long or complex expressions:** Rendering remains stable; no hard limit on file size (unlike Markless’s 500-line skip). Use existing parse cache and incremental updates.
- **CRLF / LF:** Math ranges and decorations respect the same position-mapping and line-ending handling as the rest of the extension.
- **Empty math:** `$$`, `$ $`, or `$$   $$` (no meaningful content or only whitespace between delimiters) are not treated as math; the delimiters remain visible as typed and no decoration is applied.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The extension MUST detect inline math delimited by `$...$` (single dollar on each side, with content in between) and render it inline in the editor, hiding or replacing the delimiters and LaTeX source with the rendered output.
- **FR-002**: The extension MUST detect block (display) math delimited by `$$...$$` and render it in the editor in display mode, visually distinct from inline math (e.g. centered or block-styled on its own line), hiding or replacing the delimiters and LaTeX source.
- **FR-003**: Rendering MUST happen inline in the markdown editor (same document view), not only in a hover or separate preview panel.
- **FR-004**: When the user selects or places the cursor inside a rendered math range, the extension MUST reveal the raw LaTeX and delimiters for editing; when the user deselects or moves outside, it MUST re-render or show the defined error state (raw LaTeX and delimiters in place, same as FR-008).
- **FR-005**: The extension MUST NOT treat a single `$` or unmatched `$`/`$$` as math; escaped dollars (e.g. `\$`) MUST NOT start or end a math region. For pairing: only a `$` that is immediately followed by non-whitespace starts an inline math region (so an unmatched “$100” and “$ 50” are not math; a paired “$100$” is currently treated as inline math with content “100”); behavior for other ambiguous cases MUST be consistent with this rule.
- **FR-006**: The extension MUST use the existing document parse/cache and decoration pipeline where applicable; MUST NOT re-parse the entire document on every keystroke; MUST respect position mapping (e.g. CRLF/LF).
- **FR-007**: The extension MUST work in files of any size (no line-count-based skip or limit that disables math rendering).
- **FR-008**: If LaTeX between delimiters cannot be rendered (syntax error, unsupported command), the extension MUST show the raw LaTeX source and delimiters in place (same as the revealed-editing state) so the user can fix it, and MUST NOT crash or corrupt other decorations.
- **FR-009**: Math detection and decoration MUST be testable in isolation; unit tests MUST cover inline, block, reveal-on-select, and dollar-ambiguity cases.
- **FR-010**: The extension MUST provide a setting to enable or disable math rendering (default: enabled). When disabled, `$...$` and `$$...$$` are left as plain text with no math decoration applied.

- **FR-011**: Rendered math MUST use a theme-appropriate default font color: light/white in dark and High Contrast themes, dark in light themes, so equations remain readable without a separate setting.

### Key Entities

- **Inline math region:** A range of the form `$...$` (single dollars) where the content is parsed as LaTeX and rendered inline (text-style).
- **Block math region:** A range of the form `$$...$$` (double dollars), optionally spanning multiple lines, rendered in display mode and visually distinct from inline math (e.g. display: block with horizontal margin so it appears on its own line).
- **Rendered math output:** The visual representation produced from the LaTeX source, used in place of the raw source in the editor.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can open a markdown file containing `$E = mc^2$` and see the equation rendered inline in the editor without using hover or a separate preview.
- **SC-002**: A user can add block math `$$...$$` (single or multi-line) and see it rendered in the editor; both inline and block math work in the same file.
- **SC-003**: Selecting or focusing inside a rendered equation shows the raw LaTeX for editing; deselecting shows the rendered form again (or raw LaTeX in place if invalid, per FR-008).
- **SC-004**: Text such as “Price is $10” and “100” does not trigger math rendering; no crashes or broken decorations.
- **SC-005**: Math rendering works in large files (e.g. >500 lines) and does not rely on disabling decorations by line count; behavior is consistent with the rest of the extension’s caching and decoration updates.
- **SC-006**: Issue #6’s request for “proper inline equation rendering” and “similar to obsidian” is satisfied for the supported syntax (`$...$`, `$$...$$`).
- **SC-007**: A user can disable math rendering via the extension setting and see `$...$` and `$$...$$` as plain text with no decoration; re-enabling restores inline and block math rendering.

- **SC-008**: Rendered math uses a light/white font color in dark and High Contrast themes and a dark font color in light themes; equations remain readable when the user switches themes.

---

## Relationship to Other Artifacts

- **Product spec** (`.specify/memory/product-spec.md`): Supports technical/scientific note-taking and “inline visual treatment” by rendering equations in place.
- **Constitution** (`.specify/memory/constitution.md`): Implementation must follow existing performance rules (parse cache, no full-doc parse on every change), position mapping, and test coverage; no line-count hacks.
- **AGENTS.md**: New logic should live in appropriate modules; use markdown parse cache; add tests under `__tests__/`.
- **Markless deep dive** (`docs/competitors/markless_deep_dive.md`): Describes the target UX and pitfalls to avoid (e.g. issue #22: multi-line math and large files).
- **Existing feature stub** (`docs/features/todo/latex-math.md`): This spec replaces “hover preview only” with “inline rendering like Markless/Obsidian” for the same syntax; hover can be a later enhancement.

---

## Assumptions

- Users expect Obsidian/Markless-style **inline** equation display; hover-only is not sufficient to close issue #6.
- Supporting `$...$` and `$$...$$` is sufficient for the first release; other delimiters (e.g. `\(...\)`) can be added later.
- A math rendering library will be chosen in the implementation plan; this spec is technology-agnostic.
- The extension continues to avoid webview-per-expression; rendering is done in a way compatible with the existing decoration pipeline.
- Reveal-on-select for math aligns with the existing visibility model (e.g. ghost/raw) used for other inline syntax.
- Rendered math uses a theme-appropriate default foreground (e.g. bright in dark/High Contrast themes, dark in light themes) so equations remain readable without a separate setting.

