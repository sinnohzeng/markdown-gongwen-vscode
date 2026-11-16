# Tasks: Markdown Inline Editor (Project-Level)

**Input**: [Product Spec](.specify/memory/product-spec.md), [Implementation Plan](.specify/memory/implementation-plan.md)  
**Prerequisites**: constitution.md, product-spec.md, implementation-plan.md

**Implementation (2025-03-08)**: Phase 1–5 and automated Phase 6 (T001–T025) verified complete. T026 (CHANGELOG) deferred to release script. T027 (full manual pass) left for maintainer.

**Organization**: Tasks are grouped by product-spec user story (US1–US4) and by technical compliance. Use this list to verify the codebase meets the spec and to guide new feature work. For a single feature, create `specs/###-feature-name/spec.md` and run `/speckit.tasks` to get feature-specific tasks.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1–US4 = product spec user story; **TC** = technical compliance (implementation plan / constitution)

## Path Conventions

- Source: `src/` at repository root
- Tests: `src/**/__tests__/*.test.ts`
- Docs: `docs/`, `.specify/memory/`

---

## Phase 1: Technical Compliance (Foundation)

**Purpose**: Ensure the codebase satisfies implementation plan and constitution. Block any new feature work until these are verified or fixed.

- [x] T001 [P] [TC] Verify all document parsing goes through `src/markdown-parse-cache.ts` (no direct remark parse on keystroke/selection)
- [x] T002 [P] [TC] Verify all decoration and link ranges use position mapping (`src/position-mapping.ts`) for CRLF/LF
- [x] T003 [P] [TC] Run `npm run validate` and fix any failures (lint:docs, test, build)
- [x] T004 [TC] Confirm parser/decorator handle malformed markdown without crashing (add tests if missing)
- [x] T005 [TC] Confirm large-file behavior: no O(n²) in parser path; test or document with >10k lines if parser/decorator changed

**Checkpoint**: Technical foundation verified — feature work can proceed

---

## Phase 2: User Story 1 – Read and edit with less clutter (P1)

**Goal**: Headings, links, lists (and other syntax) appear styled like rendered output; text remains editable; raw can be revealed on selection.

**Independent test**: Open a markdown file with headings, links, lists; confirm syntax is visually subdued/styled; confirm all text is editable and selection works.

### Verification / regression

- [x] T006 [P] [US1] Verify heading decorations in `src/parser.ts` and `src/decorator.ts` (markers hidden/de-emphasized, sizing)
- [x] T007 [P] [US1] Verify link decorations (link text shown, URL/syntax hidden) in parser and decorator
- [x] T008 [P] [US1] Verify list decorations (markers hidden/de-emphasized) in parser and decorator
- [x] T009 [US1] Verify reveal-on-selection (raw markdown shown when cursor in decorated range) via `src/decorator/visibility-model.ts` or equivalent
- [x] T010 [US1] Add or update tests in `src/parser/__tests__/` and `src/decorator/__tests__/` for any changed behavior (per constitution)

**Checkpoint**: US1 acceptance scenarios pass (manual or automated)

---

## Phase 3: User Story 2 – Links and images interactive (P1)

**Goal**: Links are Ctrl+Clickable; hover shows URL/destination for links and preview for images; behavior matches VS Code.

**Independent test**: Add link and image; confirm clickable and hover previews.

### Verification / regression

- [x] T011 [P] [US2] Verify DocumentLinkProvider in `src/link-provider.ts` provides clickable links
- [x] T012 [P] [US2] Verify link hover in `src/link-hover-provider.ts` (URL/destination)
- [x] T013 [P] [US2] Verify image hover in `src/image-hover-provider.ts` (preview where supported)
- [x] T014 [US2] Verify link click handling in `src/link-click-handler.ts` (navigation)
- [x] T015 [US2] Add or update tests in `src/link-provider/__tests__/`, `src/link-hover-provider/__tests__/`, `src/image-hover-provider/__tests__/`, `src/link-click-handler/__tests__/` for any changed behavior

**Checkpoint**: US2 acceptance scenarios pass

---

## Phase 4: User Story 3 – Editing and VS Code behavior preserved (P1)

**Goal**: Normal editing (typing, selection, multi-cursor, find/replace, undo) works; no replacement of editor surface; cursor/positions correct (including CRLF/LF).

**Independent test**: Edit in a decorated markdown file; confirm no broken behavior.

### Verification / regression

- [x] T016 [P] [US3] Verify decorations do not capture input or block typing (TextEditorDecorationType only)
- [x] T017 [US3] Verify position mapping used for all ranges so CRLF/LF do not cause offset bugs (`src/position-mapping.ts`, decorator, link-provider)
- [x] T018 [US3] Add or run tests for CRLF/LF in `src/parser/__tests__/parser-crlf.test.ts`, `src/decorator/__tests__/decorator-crlf.test.ts`, `src/link-provider/__tests__/link-provider-crlf.test.ts` (or equivalent)
- [x] T019 [US3] Smoke-test: multi-cursor, find/replace, undo in decorated file (document result or add regression test if needed)

**Checkpoint**: US3 acceptance scenarios pass

---

## Phase 5: User Story 4 – Consistent, predictable rendering (P2)

**Goal**: Same construct type styled consistently; malformed markdown handled gracefully; settings apply predictably.

**Independent test**: Use various constructs and malformed input; confirm consistency and no crashes.

### Verification / regression

- [x] T020 [P] [US4] Verify decoration categories and registry in `src/decorator/decoration-categories.ts` and `src/decorator/decoration-type-registry.ts` for consistent styling per construct
- [x] T021 [US4] Verify config in `src/config.ts` is applied (e.g. enable/disable, per-language) and document behavior in `docs/` if needed
- [x] T022 [US4] Verify malformed/partial markdown does not crash (parser/decorator); add edge-case tests in `src/parser/__tests__/` if missing
- [x] T023 [US4] Verify diff view behavior in `src/diff-context.ts` (decorations on/off or policy documented)

**Checkpoint**: US4 acceptance scenarios pass

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Documentation, quality, and release readiness.

- [x] T024 [P] Update `docs/features/` and README if behavior or feature set changed
- [x] T025 [P] Run `npm run test:coverage` and ensure coverage maintained or improved (constitution)
- [ ] T026 Ensure CHANGELOG/release notes reflect changes (or rely on release script)
- [ ] T027 Run full manual pass: open markdown file, test headings/links/lists/images, edit, select, hover, Ctrl+Click; confirm no regressions

---

## Dependencies & Execution Order

- **Phase 1 (Technical compliance)**: Do first; unblocks all other phases.
- **Phases 2–5 (US1–US4)**: Can be done in parallel by area (parser/decorator vs link/image providers) or sequentially in order.
- **Phase 6 (Polish)**: After the user stories you care about are verified/fixed.

### Parallel opportunities

- T001, T002, T003 can run in parallel.
- Within US1: T006, T007, T008 can run in parallel.
- Within US2: T011, T012, T013 can run in parallel.
- T016, T017; T020, T021; T024, T025 where marked [P].

---

## Notes

- **[P]** = different files, no dependencies.
- **[Story]** maps to product spec for traceability (US1–US4, TC).
- For **new features** (e.g. new markdown construct): create `specs/###-feature-name/` with spec and plan, then run `/speckit.tasks` to get feature-specific tasks; use this file for project-wide verification.
- Commit after each task or logical group; run `npm run validate` before commit (constitution).
