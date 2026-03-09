# Data Model: Code-Block Math Environments

**Feature**: 004-code-block-math-environments  
**Date**: 2026-03-09

## Entities

### MathRegion (extended usage)

Represents one rendered math span in normalized document text, from delimiter math (`$...$`, `$$...$$`) or from eligible math fences. For **fence-derived** regions, the range spans the **whole fenced block** (opening fence line + body + closing fence line); `source` is the body only (LaTeX). Optional `numLines` is used for height when present.

| Field | Type | Description |
|-------|------|-------------|
| `startPos` | number | Start offset in normalized text (0-based, inclusive). For fence-derived: start of opening fence line. |
| `endPos` | number | End offset in normalized text (0-based, exclusive). For fence-derived: end of closing fence line. |
| `source` | string | Raw LaTeX source to render (no delimiters/fence markers). For fence-derived: body only. |
| `displayMode` | boolean | `true` for display math (block/fence), `false` for inline math. |
| `numLines`? | number | Optional. Body line count for fence-derived regions; used for height = (numLines + 2) × line height. Omitted for delimiter math. |

**Validation**:
- `startPos < endPos`.
- `source.trim().length > 0` for fence-derived regions.
- Fence-derived regions always use `displayMode = true`.
- When `numLines` is present, it is the number of lines in `source` (body only).

**Lifecycle**:
1. Produced during parse/scanner pass (scanner emits whole-block range + body source + numLines for math fences).
2. Passed through parse cache in `ParseResult.mathRegions`.
3. Consumed by decorator for render/reveal; decorator uses numLines for block height when present.

---

### MathFenceRegion (derived conceptual entity)

Conceptual subset of `MathRegion` formed from fenced code blocks where normalized info string is `math`, `latex`, or `tex`. Emitted as MathRegion with **whole-block** range and body source.

| Field | Type | Description |
|-------|------|-------------|
| `fenceLanguage` | string | Normalized info string token (`math`, `latex`, `tex`). |
| `startPos` | number | Start of entire fenced block (opening fence line). |
| `endPos` | number | End of entire fenced block (after closing fence line). |
| `bodyStartPos` | number | Start of fenced body text (excludes opening fence). |
| `bodyEndPos` | number | End of fenced body text (before closing fence). |
| `bodySource` | string | Fence body used as display LaTeX source. |
| `numLines` | number | Number of lines in body (used for height = (numLines + 2) × line height). |

**Validation**:
- Language normalization is `trim -> lower-case -> first token`.
- Empty/whitespace-only body does not produce a fence math region.
- Unclosed fences do not create fence-derived regions.
- No spec-defined maximum numLines; existing performance constraints apply.

---

## Relationships

- `ParseResult` contains `mathRegions: MathRegion[]`.
- MathFenceRegion is emitted as MathRegion with `startPos`/`endPos` = whole block, `source` = body, `displayMode = true`, `numLines` = body line count.
- Delimiter-derived regions have no `numLines`; fence-derived regions include `numLines` for height.
- Decorator applies one decoration per region over [startPos, endPos]; when `numLines` is present, uses height = (numLines + 2) × line height.

---

## State and behavior rules

1. **Eligibility**: Only fences with normalized info token in `{math, latex, tex}` are math fences.
2. **Isolation**: Non-math fences remain code-only and cannot emit math regions.
3. **Display mode**: Math fences are always display math.
4. **Fallback**: Invalid render output does not create rendered decoration; raw source remains visible.
5. **Setting gate**: `markdownInlineEditor.math.enabled = false` prevents decoration rendering for all math regions.
6. **Decoration range**: Fence-derived MathRegion has startPos/endPos spanning the whole fenced block (opening + body + closing).
7. **No max line count**: No spec-defined upper bound on numLines; existing parse-cache and large-file behavior apply.
