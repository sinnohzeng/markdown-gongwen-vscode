# Tasks: Code-Block Math Environments

**Input**: Design documents from `/specs/004-code-block-math-environments/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included per FR-009 (parser/scanner, decorator integration, renderer error paths).  
**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1–US4) for story-phase tasks only
- Every task includes an exact file path

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm feature context and task checklist.

- [X] T001 Ensure feature branch and task list context in `specs/004-code-block-math-environments/tasks.md`
- [X] T002 Review plan.md and contracts (math-fence-language, math-fence-rendering, math-fence-height-and-range) in `specs/004-code-block-math-environments/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Data model and scanner/decorator behavior required before user stories.

**⚠️ CRITICAL**: No user story work until this phase is complete.

- [X] T003 Add optional `numLines` to MathRegion and ensure ParseResult passes mathRegions in `src/parser.ts`
- [X] T004 Emit fence-derived regions with whole-block startPos/endPos, body as source, and numLines in `src/math/math-scanner.ts`
- [X] T005 Use height = (numLines + 2) × line height for regions with numLines in `src/math/math-decorations.ts`
- [X] T006 Ensure parser uses scanner output for mathRegions (whole-block fence regions merged with delimiter regions) in `src/parser.ts`

**Checkpoint**: Scanner emits whole-block range + numLines; math-decorations apply height formula; parser exposes mathRegions.

---

## Phase 3: User Story 1 – Render math environments in math fences (Priority: P1) 🎯 MVP

**Goal**: Render `math`/`latex`/`tex` fences as display math over the whole block with correct vertical height.

**Independent Test**: Open markdown with ```math fence containing `\begin{align}...\end{align}`; confirm display math and no overlap with following content.

### Tests for User Story 1

- [X] T007 [P] [US1] Add parser tests for whole-block range and numLines for math fences in `src/parser/__tests__/parser-math.test.ts`
- [X] T008 [P] [US1] Add scanner tests for whole-block range and numLines emission in `src/math/__tests__/math-scanner.test.ts`
- [X] T009 [P] [US1] Add decorator tests for multi-fence rendering and height behavior in `src/decorator/__tests__/decorator-math.test.ts`

### Implementation for User Story 1

- [X] T010 [US1] Verify fence-derived regions use whole-block range and numLines end-to-end in `src/math/math-scanner.ts` and `src/decorator.ts`
- [X] T011 [US1] Ensure block height from numLines is applied for fence regions in `src/math/math-decorations.ts`

**Checkpoint**: US1 independently testable; math fences render over whole block with (numLines + 2) × line height.

---

## Phase 4: User Story 2 – Keep non-math code fences as regular code (Priority: P1)

**Goal**: No math rendering inside non-math fences; dollar signs in e.g. ```js remain plain code.

**Independent Test**: Open ```js block with `$x$` and `$$y$$`; verify no math rendering.

### Tests for User Story 2

- [X] T012 [P] [US2] Add tests that non-math fences never emit math regions in `src/math/__tests__/math-scanner.test.ts`
- [X] T013 [P] [US2] Add parser mixed-fence tests (js + math) in `src/parser/__tests__/parser-math.test.ts`

### Implementation for User Story 2

- [X] T014 [US2] Enforce allowlist (math|latex|tex) and exclude $ scanning inside all fenced blocks in `src/math/math-scanner.ts`

**Checkpoint**: US2 independently testable; non-math fences unchanged.

---

## Phase 5: User Story 3 – Reveal/edit and fallback behavior (Priority: P1)

**Goal**: Selection/cursor inside rendered math fence reveals raw whole block; invalid LaTeX falls back to raw without crash.

**Independent Test**: Place cursor in rendered math fence to reveal raw; add invalid LaTeX and confirm raw fallback.

### Tests for User Story 3

- [X] T015 [P] [US3] Add reveal-on-select tests for whole-block math fence range in `src/decorator/__tests__/decorator-math.test.ts`
- [X] T016 [P] [US3] Add invalid fence LaTeX fallback tests in `src/decorator/__tests__/decorator-math.test.ts`
- [X] T017 [P] [US3] Add renderer error-path tests for fence body input in `src/math/__tests__/math-renderer.test.ts`

### Implementation for User Story 3

- [X] T018 [US3] Ensure selection/cursor inside whole-block range reveals raw fenced source in `src/decorator.ts`
- [X] T019 [US3] Ensure render failure for fence region leaves raw visible and does not crash in `src/decorator.ts` and `src/math/math-decorations.ts`

**Checkpoint**: US3 independently testable; reveal and fallback work for math fences.

---

## Phase 6: User Story 4 – Respect math enable/disable setting (Priority: P1)

**Goal**: `markdownInlineEditor.math.enabled` gates all math including code-block math.

**Independent Test**: Disable setting and confirm ```math blocks are plain text; re-enable and confirm rendering returns.

### Tests for User Story 4

- [X] T020 [P] [US4] Add decorator setting-gate tests for fence math in `src/decorator/__tests__/decorator-math.test.ts`

### Implementation for User Story 4

- [X] T021 [US4] Ensure config.math.enabled gates fence math the same as delimiter math in `src/decorator.ts`

**Checkpoint**: US4 independently testable; single setting controls all math.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, regression coverage, and validation.

- [X] T022 [P] Add edge-case tests (empty/whitespace-only body, unclosed fence) in `src/math/__tests__/math-scanner.test.ts`
- [X] T023 [P] Add mixed-feature regression tests (delimiter math + mermaid + math fences) in `src/decorator/__tests__/decorator-math.test.ts`
- [X] T024 Update implementation notes and validation commands in `specs/004-code-block-math-environments/quickstart.md`
- [X] T025 Run `npm run validate` and confirm all checks pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories.
- **Phases 3–6 (User Stories)**: Depend on Phase 2; can proceed in order or in parallel after foundation.
- **Phase 7 (Polish)**: Depends on completion of desired user stories.

### User Story Dependencies

- **US1**: After Foundational; MVP scope (whole-block range + height).
- **US2**: After Foundational; scanner allowlist and $ exclusion.
- **US3**: After US1 integration; reveal/fallback for whole-block range.
- **US4**: After US1; single setting gate.

### Within Each User Story

- Test tasks before implementation where practical.
- Scanner/parser changes before decorator when they share the same story.

### Parallel Opportunities

- T007, T008, T009 can run in parallel (different test files).
- T012, T013 can run in parallel.
- T015, T016, T017 can run in parallel.
- T022, T023 can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Run US1 test tasks in parallel:
# T007 parser tests in src/parser/__tests__/parser-math.test.ts
# T008 scanner tests in src/math/__tests__/math-scanner.test.ts
# T009 decorator tests in src/decorator/__tests__/decorator-math.test.ts
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1); validate with independent test.
3. Demo: math fences render over whole block with correct height.

### Incremental Delivery

1. Foundation (Phase 2) → US1 (Phase 3) → validate.
2. US2 (Phase 4) → US3 (Phase 5) → US4 (Phase 6) → validate each.
3. Polish (Phase 7) → full validate.

### Parallel Team Strategy

- After Phase 2: one developer on US1, another on US2; then US3/US4.
- Test tasks marked [P] within a story can be implemented in parallel.

---

## Notes

- All tasks use checklist format: `- [ ]`, Task ID, optional [P], [US#] for story phases, and file paths.
- Changes stay in `src/parser.ts`, `src/math/*`, `src/decorator.ts` and their tests.
- Whole-block range and numLines come from spec clarifications and contracts.
