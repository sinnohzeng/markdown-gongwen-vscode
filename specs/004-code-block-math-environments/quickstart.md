# Quickstart: Code-Block Math Environments (004)

**Feature**: 004-code-block-math-environments  
**Audience**: Developers implementing and testing fenced math rendering.

## Prerequisites

- Node 18+, npm, VS Code 1.88+.
- Baseline build success: `npm install && npm run compile`.
- Familiarity with `src/parser.ts`, `src/math/math-scanner.ts`, and `src/decorator.ts`.

## Files to update

| Area | File(s) | Purpose |
|------|---------|---------|
| Parser output | `src/parser.ts` | Ensure `mathRegions` includes eligible fence-derived display regions. |
| Scanner logic | `src/math/math-scanner.ts` | Fence scan: whole-block range, body source, numLines; exclude $ inside non-math fences. |
| Math decorations | `src/math/math-decorations.ts` | Use numLines for block height (numLines + 2) × line height when present. |
| Decoration integration | `src/decorator.ts` | Reuse existing math rendering/reveal behavior for fence regions. |
| Parser tests | `src/parser/__tests__/parser-math.test.ts` | Verify fence eligibility and mixed-content outputs. |
| Scanner tests | `src/math/__tests__/...` | Verify language normalization and non-math-fence exclusion. |
| Decorator tests | `src/decorator/__tests__/decorator-math.test.ts` | Verify reveal/edit/fallback behavior for fenced math. |

## Suggested implementation sequence

1. Implement fence language normalization (`math|latex|tex`) per contract.
2. Emit fence-derived regions with **whole-block** startPos/endPos, body as `source`, and **numLines** (body line count).
3. Ensure dollar scanning skips all fenced code blocks (non-math and math).
4. In math-decorations: when a region has `numLines`, use height = (numLines + 2) × line height for that region’s block rendering.
5. Reuse setting gate and fallback; add tests for height, whole-block range, and reveal.

## Implementation notes

- Fence language normalization: `trim -> lower-case -> first token` in `src/math/math-scanner.ts`.
- **Clarified spec**: (1) Decoration range = **whole fenced block** (opening + body + closing). (2) Height = **(numLines + 2) × line height**, numLines = body line count only. (3) No max line count.
- Fence-derived regions must carry **numLines** and whole-block startPos/endPos; `source` remains body only for LaTeX.
- Scanner/decorator: emit and consume optional `numLines` on MathRegion for fence blocks; use it in math-decorations for block height when present.
- Parser integration via `mathRegions`; decorator applies one decoration per region over [startPos, endPos].

## Verification

Run focused tests during development:

```bash
npm test -- --testPathPatterns="parser-math|math-scanner|math-renderer|decorator-math"
```

Run full validation before commit:

```bash
npm run validate
```

## Validation results

- Focused math tests: `npm test -- --testPathPatterns="parser-math|math-scanner|math-renderer|decorator-math"`: pass
- `npm run validate`: pass (lint:docs, all tests, build)

## Manual sanity checks

- ` ```math ` block with `align` environment renders display math.
- ` ```js ` block containing dollar signs remains plain code.
- Invalid LaTeX fence shows raw source (no crash).
- `markdownInlineEditor.math.enabled = false` disables all math rendering, including fence math.
