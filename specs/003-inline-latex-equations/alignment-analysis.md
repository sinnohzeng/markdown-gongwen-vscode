# Spec–Implementation Alignment Analysis: 003 Inline LaTeX Equations

**Date**: 2026-03-08  
**Purpose**: Verify that `specs/003-inline-latex-equations` (spec, contracts, data model, plan, research) is aligned with the implementation in `src/`.

---

## Summary

| Area | Status | Notes |
|------|--------|--------|
| Config (math.enabled) | ✓ Aligned | Contract and implementation match |
| Data model (MathRegion, ParseResult) | ✓ Aligned | Types and usage match data-model.md |
| Delimiter grammar (scanner) | ✓ Aligned | math-scanner.ts implements contract exactly |
| Math config schema | ✓ Aligned | package.json + config.ts match contract |
| Rendering (MathJax, SVG, errors) | ✓ Aligned | research.md and math-renderer.ts aligned |
| Decorations (inline/block, theme, sizing) | ✓ Aligned | math-decorations.ts + decorator match plan/data-model |
| Reveal on select (US3) | ✓ Aligned | Decorator passes null range when selection/cursor inside |
| Pipeline (cache, position mapping) | ✓ Aligned | Parse cache + mapNormalizedToOriginal used |
| FR-007 (no line-count limit) | ✓ Aligned | No skip; test for >500 lines present |
| Tests (contract + FR-009) | ✓ Aligned | parser-math, math-renderer, decorator-math cover spec cases |
| Documentation (latex-math.md) | ⚠ Minor | Status updated; leftover “KaTeX”/“hover” wording |

**Overall**: Specs and implementation are aligned. One minor documentation cleanup recommended.

---

## 1. Configuration (Contract: math-config-schema.md)

| Requirement | Implementation | Location |
|-------------|----------------|----------|
| Section `markdownInlineEditor` | Same | config.ts `SECTION` |
| Key `math.enabled`, type boolean, default true | `getConfiguration(SECTION).get<boolean>('math.enabled', true)` | config.ts:60–65 |
| config.math.enabled() | `config.math.enabled()` | config.ts:59–65 |
| Read when building decorations; if false, no math | `if (config.math.enabled() && mathRegions.length > 0) { this.applyMathDecorations(...) } else { this.mathDecorations.clear(...) }` | decorator.ts:369–375 |
| package.json contribution | `markdownInlineEditor.math.enabled` with type, default, description | package.json:121–125 |
| “When disabled, math delimiters are shown as plain text” | In `markdownDescription` | package.json:124 |

**Verdict**: ✓ Aligned.

---

## 2. Delimiter Grammar (Contract: math-delimiter-grammar.md)

| Rule | Implementation | Location |
|------|----------------|----------|
| Inline start: `$` immediately followed by non-whitespace | `if (next >= text.length \|\| /\s/.test(text[next])) return null` | math-scanner.ts:104 |
| Inline end: next unescaped `$` | `indexOf('$', i)` + `isEscapedAt` | math-scanner.ts:106–118 |
| Escaped `\$` does not start/end | `isEscaped(text, i)` / `isEscapedAt(text, idx)` (odd backslashes) | math-scanner.ts:55–63, 91–99 |
| Empty/whitespace-only content not math | `content.trim(); if (content.length === 0) continue/return null` | math-scanner.ts:75–78, 114–117 |
| Block: `$$` start/end, not escaped | Check for `$$`, then `indexOf('$$', i)` + `isEscapedAt` | math-scanner.ts:23–36, 65–89 |
| Block may span multiple lines | Loop with `indexOf('$$', i)` over full text | math-scanner.ts:68–79 |
| Precedence: block before inline | Try block first (`tryMatchBlock`), then inline | math-scanner.ts:22–47 |
| Positions in normalized (LF) text | Scanner receives normalized text; returns startPos/endPos | parser.ts passes normalizedText to scanMathRegions |
| Contract test cases | All covered in parser-math.test.ts | parser-math.test.ts |

**Contract test cases** (contract § Test cases):

- `$E = mc^2$` → one inline, source `E = mc^2` ✓ (parser-math.test.ts)
- `Price is $10` → no region ✓
- `$  x$` → no region ✓
- `\$x$` → no region ✓
- `$$\int_0^\infty$$` → one block ✓
- `$$  $$` → no region ✓
- `$x$ and $y$` → two inline ✓
- `$$a$$ $$b$$` → two block ✓
- Currency-style `$100$`/`$200$` valid ✓

**Verdict**: ✓ Aligned.

---

## 3. Data Model (data-model.md)

| Entity / Field | Implementation | Location |
|----------------|----------------|----------|
| MathRegion.startPos, endPos, source, displayMode | Interface `MathRegion` | parser.ts:64–69 |
| startPos/endPos in normalized text | Scanner returns offsets in passed-in normalized string | math-scanner.ts |
| displayMode true = block, false = inline | `displayMode: true` in tryMatchBlock, `false` in tryMatchInline | math-scanner.ts:85, 123 |
| ParseResult.mathRegions | `mathRegions: MathRegion[]` in ParseResult and return | parser.ts:78, 228–234 |
| Empty/whitespace-only not emitted | Scanner skips such content | math-scanner.ts |
| RenderedMath (internal): region, dataUri, contentKey | Not a named type; logic in MathDecorations (contentKey, render to dataUri) | math-decorations.ts |
| On render failure, no RenderedMath; show raw | `if (!dataUri) continue` → region not decorated | math-decorations.ts:69–70 |
| mathInline / mathBlock decoration types | Single class, displayMode drives “block” vs “inline” styling | math-decorations.ts:111–125 |
| Visibility: selection intersects → raw | range passed as null when `isSelectionOrCursorInsideOffsets` | decorator.ts:386–398 |

**Verdict**: ✓ Aligned.

---

## 4. Functional Requirements (spec.md FR-001 – FR-010)

| FR | Requirement | Implementation |
|----|-------------|----------------|
| FR-001 | Detect `$...$`, render inline, hide delimiters/source | scanMathRegions + math-decorations (transparent + contentIconPath) |
| FR-002 | Detect `$$...$$`, render display, visually distinct | Block branch in scanner; block decoration type (block styling) |
| FR-003 | Inline in editor, not only hover | Decorations applied in editor via applyMathDecorations |
| FR-004 | Reveal raw on select/cursor; re-render on deselect | applyMathDecorations passes null range when selection/cursor inside |
| FR-005 | No single/unmatched `$`; `\$` not start/end; non-whitespace after `$` | Scanner rules + parser-math tests (Price is $10, \$x$, $ 50) |
| FR-006 | Parse cache; no full-doc parse per keystroke; position mapping | parseDocument uses cache; createRange uses mapNormalizedToOriginal |
| FR-007 | No line-count limit | No skip in scanner/parser; parser-math “large document” test >500 lines |
| FR-008 | Invalid LaTeX → raw source in place, no crash | renderMathToDataUri returns null; decorator skips decoration for that region |
| FR-009 | Unit tests: inline, block, reveal-on-select, dollar-ambiguity | parser-math.test.ts, math-renderer.test.ts, decorator-math.test.ts |
| FR-010 | Setting to enable/disable, default on | config.math.enabled(); package.json default true; decorator clears when disabled |

**Verdict**: ✓ All FRs reflected in implementation.

---

## 5. Research and Plan

| Decision (research.md / plan.md) | Implementation |
|----------------------------------|-----------------|
| MathJax (mathjax-full), TeX input, SVG output | math-renderer.ts uses mathjax-full, TeX, SVG, liteAdaptor |
| SVG for contentIconPath (no HTML/foreignObject) | renderMathToDataUri → SVG → svgToDataUriBase64 |
| On error / MathJax error SVG → null, show raw | isMathJaxErrorSvg + catch → null |
| Theme-appropriate foreground (dark/light) | DEFAULT_FOREGROUND, foregroundColor passed to renderer |
| Editor font size / line height for sizing | getEditorHeights(); clear cache on editor.fontSize/lineHeight | extension.ts:225–226, decorator.clearMathDecorationCache |
| Dedicated math scan (not remark AST) | scanMathRegions(normalizedText) in parser |
| math/ module: math-scanner, math-renderer, math-decorations | Present under src/math/ |
| ParseResult.mathRegions, decorator uses when enabled | parser.ts, decorator.ts |

**Verdict**: ✓ Aligned.

---

## 6. User Stories and Success Criteria

- **US1 (inline in place)**: Inline math rendered via decorations; raw hidden. ✓  
- **US2 (block distinct)**: Block math with block/centered styling. ✓  
- **US3 (reveal on select)**: Selection/cursor inside → null range → raw; deselect → decorated. ✓ (decorator-math.test.ts)  
- **US4 (no false positives)**: Parser-math tests for $10, \$x$, $ 50, etc. ✓  
- **SC-001 – SC-007**: Covered by FR alignment and tests above. ✓  

---

## 7. Minor Gaps / Recommendations

### 7.1 docs/features/done/latex-math.md

- **Status**: DONE; feature doc matches the implementation (MathJax SVG, inline rendering, reveal-on-select).
- **Note**: If we add hover-only enhancements in the future, keep the doc explicit that rendering is inline first, with hover as optional UX.

### 7.2 package.json description

- **Contract**: description should include “When disabled, math delimiters are shown as plain text.”
- **Implementation**: Short `description` omits it; `markdownDescription` includes it. Settings UI (markdownDescription) is therefore aligned; no code change required.

---

## 8. Conclusion

The 003 specs (spec.md, contracts, data-model.md, plan.md, research.md) are **aligned** with the implementation. All functional requirements, contract rules, and data model choices are implemented and tested.
