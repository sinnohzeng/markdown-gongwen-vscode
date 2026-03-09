# Research: Code-Block Math Environments

**Feature**: 004-code-block-math-environments  
**Date**: 2026-03-09

## 1. Detecting eligible fenced blocks

**Decision**: Detect fenced math blocks from markdown code-fence metadata (info string), with case-insensitive normalization and whitespace trimming, and accept only `math`, `latex`, or `tex`.

**Rationale**:
- The feature requirement is language-tag based, not delimiter based.
- Code fences are already parsed in the markdown pipeline, so language metadata is available without heuristic text parsing.
- Restricting to an allowlist prevents accidental rendering inside normal code fences.

**Alternatives considered**:
- Pattern-match fence markers directly in raw text: more error-prone for indentation and fence variants.
- Treat any fence containing LaTeX-like syntax as math: too permissive and would regress code-block UX.

---

## 2. Interaction with existing `$...$` and `$$...$$` scanning

**Decision**: Keep current delimiter scanner for normal prose regions, but ensure scanning does not produce math regions inside non-math code fences; fenced `math|latex|tex` blocks produce display-math regions explicitly.

**Rationale**:
- Existing inline/block math behavior is already implemented and should remain stable.
- Without fence exclusion, dollar content inside code fences can be misclassified as math.
- A single `mathRegions` output keeps downstream decoration logic unchanged.

**Alternatives considered**:
- Replace scanner with full AST-only math detection: larger rewrite risk for existing behavior.
- Keep current scanner unchanged and add fence rendering separately: would still allow false positives in non-math fences.

---

## 3. Rendering and reveal behavior for math fences

**Decision**: Reuse the existing MathJax renderer and math decoration pipeline for fence-derived regions, always in display mode; reveal-on-selection and invalid-LaTeX fallback follow current math behavior.

**Rationale**:
- Existing pipeline already handles SVG generation, caching, and error fallback.
- Shared behavior maintains consistent UX between `$$...$$` and fenced math.
- Limits implementation scope to detection and region construction.

**Alternatives considered**:
- Create a separate renderer/decorator path for fences: duplicate logic and increase maintenance cost.
- Render fence math only in hover: fails feature requirement for inline rendering.

---

## 4. Test strategy for regressions and edge cases

**Decision**: Add tests across parser/scanner/decorator layers for:
- accepted languages (`math`, `latex`, `tex`),
- rejected non-math fences (`js`, `ts`, etc.),
- mixed documents with delimiter math and fenced math,
- reveal and fallback paths.

**Rationale**:
- Requirements explicitly mandate coverage in parser/scanner, decorator integration, and renderer error paths.
- Mixed-content tests prevent regressions where one syntax breaks another.

**Alternatives considered**:
- Parser-only tests: insufficient for reveal/fallback interaction.
- Decorator-only tests: insufficient for scanner correctness and non-math fence exclusion.

---

## 5. Height and decoration range (spec clarifications)

**Decision**: (1) **Decoration range** = entire fenced block (opening fence line + body + closing fence line); one replacement per block, same as mermaid. (2) **Height** = body line count only (numLines), formula **(numLines + 2) × editor line height**. (3) **No maximum line count** for math fences; rely on existing parse-cache and large-file behavior.

**Rationale**:
- Whole-block range keeps UX consistent with mermaid and avoids split handling of fence vs body.
- Body-only line count avoids double-counting fence lines; (numLines + 2) × line height matches mermaid implementation.
- No cap keeps spec simple and aligns with delimiter-math “no line-count limit” approach.

**Alternatives considered**:
- Body-only decoration range: would require separate hide decorations for fence lines and different reveal range.
- Full-block line count for height: would over-count and make rendered block taller than source.
- Max line count or height cap: adds spec/implementation complexity; deferred unless needed.
