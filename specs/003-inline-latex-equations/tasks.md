# Tasks: Inline LaTeX Equation Rendering

**Input**: Design documents from `specs/003-inline-latex-equations/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md  

**Tests**: Included per FR-009 (unit tests MUST cover inline, block, reveal-on-select, and dollar-ambiguity cases).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Source: `src/` at repository root; tests: `src/**/__tests__/*.test.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add dependency and verify build

- [X] T001 Add math rendering dependency (mathjax-full) to package.json and run npm install
- [X] T002 [P] Verify npm run compile and npm test still pass (no new code yet)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Config, data model, and math detection MUST be complete before any user story can render math

**Independent Test**: Math regions are detected from document text per contracts/math-delimiter-grammar.md; config.math.enabled() is readable.

- [X] T003 Add math.enabled setting to package.json (markdownInlineEditor.math.enabled, default true) and config.math.enabled() in src/config.ts
- [X] T004 Extend ParseResult with mathRegions: MathRegion[] and define MathRegion interface (startPos, endPos, source, displayMode) in src/parser.ts
- [X] T005 Implement math scanner per specs/003-inline-latex-equations/contracts/math-delimiter-grammar.md: scan normalized text for $...$ and $$...$$, emit MathRegion[]; call from parser when producing ParseResult in src/parser.ts or new src/math/math-scanner.ts
- [X] T006 [P] Add unit tests for math detection in src/parser/__tests__/parser-math.test.ts (inline, block, empty/whitespace-only, unclosed, position bounds)

**Checkpoint**: ParseResult includes mathRegions; config.math.enabled() works; parser-math tests pass. Per FR-007: no line-count limit—math detection/decoration is not disabled for large documents; add or run a sanity check for a document with >500 lines (or rely on existing large-file parser tests) if touching scanner/parser.

---

## Phase 3: User Story 1 – Inline math displays in place (Priority: P1) MVP

**Goal**: User sees inline math (e.g. `$E = mc^2$`) rendered in the editor; raw delimiters and LaTeX are hidden or replaced.

**Independent Test**: Open a markdown file containing `$E = mc^2$` with extension enabled; formula is shown as rendered math inline.

### Implementation for User Story 1

- [X] T007 [US1] Implement math renderer: LaTeX string → SVG → data URI in src/math/math-renderer.ts (MathJax SVG output); on error return null so decorator can show raw source
- [X] T008 [P] [US1] Add unit tests for math-renderer in src/math/__tests__/math-renderer.test.ts (valid LaTeX, invalid LaTeX, displayMode true/false)
- [X] T009 [US1] Implement inline math decoration application in src/math/math-decorations.ts: given MathRegion[] with displayMode false, render each, create decoration type (transparent text + before.contentIconPath with data URI), apply to ranges using position mapping; cache by content key (e.g. source + displayMode)
- [X] T010 [US1] Wire math into decorator in src/decorator.ts: when config.math.enabled() and parse result has mathRegions, call math decorations module for inline regions only; convert normalized positions to editor ranges via position-mapping

**Checkpoint**: Inline math like `$E = mc^2$` renders in the editor; invalid LaTeX shows raw source.

---

## Phase 4: User Story 2 – Block (display) math displays (Priority: P1)

**Goal**: Block math `$$...$$` is rendered and visually distinct (e.g. centered or on its own line).

**Independent Test**: Add `$$\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$` to a markdown file; it renders as display math and looks distinct from inline.

### Implementation for User Story 2

- [X] T011 [P] [US2] Add block math decoration type in src/math/math-decorations.ts (or decorator/): same contentIconPath pattern as inline but with block/centered styling (e.g. display: block, margin) so block math is visually distinct
- [X] T012 [US2] Apply block math regions (displayMode true) in src/math/math-decorations.ts and src/decorator.ts; use block decoration type for those ranges; multi-line block math supported
- [X] T013 [P] [US2] Add tests for block math detection and rendering in src/parser/__tests__/parser-math.test.ts and src/math/__tests__/math-renderer.test.ts (multi-line $$...$$)

**Checkpoint**: Inline and block math both render; block math is visually distinct.

---

## Phase 5: User Story 4 – No false positives for dollar signs (Priority: P1)

**Goal**: "Price is $10", `\$10`, and "$100" do not trigger math rendering.

**Independent Test**: Type "Cost: $50" and "Use \$ for dollars" in a markdown file; no math decoration applied.

### Implementation for User Story 4

- [X] T014 [P] [US4] Expand src/parser/__tests__/parser-math.test.ts for dollar-ambiguity cases per contract: single $ with no pair, $ not followed by non-whitespace, escaped \$, "$100", "$ 50"; assert no math regions or correct regions

**Checkpoint**: Currency and escaped dollars do not produce math regions.

---

## Phase 6: User Story 3 – Reveal raw LaTeX on selection (Priority: P2)

**Goal**: When the user selects or places the cursor inside a rendered equation, raw LaTeX and delimiters are shown; when they deselect, the equation renders again.

**Independent Test**: Click inside a rendered equation; raw `$...$` or LaTeX appears; click outside; rendered form reappears.

### Implementation for User Story 3

- [X] T015 [US3] Integrate math ranges into visibility model in src/decorator.ts and src/decorator/visibility-model.ts: when selection intersects a math region, do not apply math decoration (show raw text); when selection does not intersect, apply math decoration; reuse existing ghost/raw logic for other syntax
- [X] T016 [P] [US3] Add tests for reveal-on-select behavior for math in src/decorator/__tests__/ (mock selection, assert raw vs rendered by selection state)

**Checkpoint**: Selecting inside math shows raw LaTeX; deselecting shows rendered form.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Setting wiring, docs, validation

- [X] T017 Ensure math.enabled is read when building decorations in src/decorator.ts so when disabled no math decorations are applied (if not already done in T010)
- [X] T018 [P] Update docs/features/done/latex-math.md and/or README to reflect inline LaTeX rendering (003)
- [X] T019a [P] Sanity-check math in a large document: create or use an existing test with a document of >500 lines containing math; assert math regions are detected and decorations applied (FR-007 / constitution IV).
- [X] T019 Run npm run validate (lint:docs, test, build) and fix any issues; ensure no regression in existing tests

---

## Phase 8: Rendering and UX Refinements

**Purpose**: Align implementation with working SVG-in-decoration approach and theme-aware defaults (post-MVP).

- [X] T020 Use MathJax (mathjax-full) SVG output for math decorations in src/math/math-renderer.ts; invalid LaTeX → show raw source (no HTML/foreignObject in contentIconPath)
- [X] T021 Use theme-appropriate default foreground for rendered math in src/math/math-decorations.ts and math-renderer.ts (dark theme → light, light theme → dark; VS Code defaults)
- [X] T022 Use editor font size/line height for math sizing; clear math decoration cache when editor.fontSize or editor.lineHeight changes (src/math/math-decorations.ts, src/decorator.ts, src/extension.ts)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1. BLOCKS all user stories.
- **Phase 3 (US1)**: Depends on Phase 2. Delivers MVP (inline math).
- **Phase 4 (US2)**: Depends on Phase 2 and Phase 3 (shared renderer and decorator wiring).
- **Phase 5 (US4)**: Depends on Phase 2 (scanner); tests only, can run in parallel with Phase 3/4.
- **Phase 6 (US3)**: Depends on Phase 3 and Phase 4 (math decorations applied); visibility integration.
- **Phase 7 (Polish)**: Depends on all story phases.
- **Phase 8 (Refinements)**: Depends on Phase 7; rendering and theme/sizing improvements.

### User Story Completion Order

- **US1 (P1)**: After Phase 2 → Phase 3. No dependency on US2/US3/US4.
- **US2 (P1)**: After Phase 2 and Phase 3 (reuse renderer and decorator path).
- **US4 (P1)**: Satisfied by Phase 2 scanner + Phase 5 tests; no new runtime behavior.
- **US3 (P2)**: After US1 and US2 (decorations applied); Phase 6.

### Parallel Opportunities

- T002, T006, T008, T011, T013, T014, T016, T018: marked [P] where different files and no dependency on same-phase incomplete tasks.
- After Phase 2, T007–T010 (US1) can proceed; then T011–T013 (US2); T014 (US4 tests) can run in parallel with T007+.

---

## Parallel Example: User Story 1

```text
# After T005 (scanner) and T004 (ParseResult) are done:
T007 Implement math renderer in src/math/math-renderer.ts
T008 (parallel) Add math-renderer tests in src/math/__tests__/math-renderer.test.ts
# Then:
T009 Implement inline math decorations in src/math/math-decorations.ts
T010 Wire math into decorator in src/decorator.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (Foundational).
3. Complete Phase 3 (US1 – inline math).
4. **STOP and VALIDATE**: Open a .md file with `$E = mc^2$`, confirm it renders.
5. Optionally run Phase 5 (US4 tests) to lock dollar-ambiguity behavior.

### Incremental Delivery

1. Phase 1 + 2 → foundation.
2. Phase 3 → inline math (MVP).
3. Phase 4 → block math.
4. Phase 5 → dollar-ambiguity tests.
5. Phase 6 → reveal on select.
6. Phase 7 → polish and validate.
7. Phase 8 → rendering and theme/sizing refinements (post-MVP).

### Format Validation

- All tasks use `- [ ] [TaskID] [P?] [Story?] Description with file path`.
- [P] only where parallelizable; [USn] only in Phases 3–6.

---

## Notes

- [P] = different files, no dependency on incomplete same-phase tasks.
- [USn] maps to spec.md user stories for traceability.
- Each user story phase is independently testable per Independent Test above.
- Run `npm run validate` before commit (constitution).
- Math detection uses normalized (LF) text; decorator uses position-mapping for editor ranges.
- Phase 8 documents post-MVP refinements: MathJax SVG output, theme-aware math color, and editor-based sizing with config-triggered cache clear.
