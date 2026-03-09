# Implementation Plan: Code-Block Math Environments

**Branch**: `004-code-block-math-environments` | **Date**: 2026-03-09 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/004-code-block-math-environments/spec.md`

## Summary

Extend math rendering to fenced code blocks tagged `math`, `latex`, or `tex`: treat the fence body as display-math source, render via the existing MathJax pipeline, and apply one decoration over the **whole fenced block** (opening fence line + body + closing fence line). Height uses **body line count** only with formula (numLines + 2) × editor line height (same as mermaid). Preserve existing `$...$` and `$$...$$` behavior; no spec-defined maximum line count.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node 18+  
**Primary Dependencies**: VS Code Extension API (^1.88.0), unified / remark-parse / remark-gfm (existing), mathjax-full (existing)  
**Storage**: N/A (decoration state in memory; parse cache per document)  
**Testing**: Jest; tests in `src/**/__tests__/*.test.ts`  
**Target Platform**: VS Code 1.88+, cross-platform (Windows, macOS, Linux)  
**Project Type**: VS Code extension (markdown inline editor)  
**Performance Goals**: Cache-backed parse/decorate; no extra full-document parse; no regressions for large files (>10k lines); no line-count limit for math fences.  
**Constraints**: Whole-block decoration range; height = (numLines + 2) × line height; position mapping for CRLF/LF; `npm run validate` before commit.  
**Scale/Scope**: Single-document editor; mixed markdown with many code fences and math regions; no cap on fence line count.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Code Quality** | Pass | TypeScript strict; changes under `/src/`; JSDoc for public APIs; validate before commit. |
| **II. Testing Standards** | Pass | Tests in `__tests__/`; cover fence detection, height/range, reveal, fallback, non-math exclusion. |
| **III. UX Consistency** | Pass | Whole-block replacement and reveal match mermaid; errors degrade to raw source. |
| **IV. Performance** | Pass | Parse cache used; no parse on selection; no line-count limit; position mapping. |
| **Quality Gates** | Pass | Parser/decorator tests for new syntax and edge cases; feature documented in specs. |

No violations. Complexity tracking table not required.

## Project Structure

### Documentation (this feature)

```text
specs/004-code-block-math-environments/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── math-fence-language-contract.md
│   ├── math-fence-rendering-contract.md
│   └── math-fence-height-and-range-contract.md
└── tasks.md             # Phase 2 (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── parser.ts                    # ParseResult.mathRegions; optional integration for fence regions from scanner
├── math/
│   ├── math-scanner.ts          # Fence scan: whole-block range, body source, numLines; exclude $ inside non-math fences
│   ├── math-renderer.ts         # Reused for fence body LaTeX
│   ├── math-decorations.ts      # Apply height = (numLines + 2) × line height for fence regions when numLines present
│   └── __tests__/
│       ├── math-scanner.test.ts
│       └── math-renderer.test.ts
├── decorator.ts                 # Apply math decorations; whole-block ranges; reveal on select
├── decorator/__tests__/
│   └── decorator-math.test.ts
└── parser/__tests__/
    └── parser-math.test.ts
```

**Structure Decision**: Implementation stays in existing parser/math/decorator modules. Fence-derived regions supply whole-block range and optional numLines; decorator uses numLines for height when present (mermaid formula). No separate rendering subsystem.

## Complexity Tracking

Not applicable—no constitution violations.
