# Feature Implementation Recommendations Table

**Generated:** 2025-01-XX  
**Source:** Feature Review and Recommendations Plan  
**Purpose:** Comprehensive todo list of all upcoming features with implementation recommendations

---

## Quick Summary

| Category | Count | Total Effort |
|----------|-------|--------------|
| **✅ Implement / Improve** | 6 features | 7-9 weeks |
| **⚠️ Reconsider / Delay** | 2 features | 4-5 weeks |
| **❌ Remove** | 1 feature | - |

**Priority Breakdown:**
- **High Priority (Must Have):** 3 features (5-7 weeks)
- **Medium Priority (Extended):** 2 features (2 weeks)
- **Low Priority (Nice-to-Have):** 1 feature (1 week)

---

## Feature Todo List

### ✅ Implement / Improve

**High Priority Features (Core GFM - Must Have) - 3 Features**

- [ ] **Autolinks** 
  - **Priority:** High
  - **Feasibility:** High | **Usefulness:** High
  - **Risk:** Low
  - **Effort:** 1 week
  - **Implementation:** Detect `<https://...>` and `<email@example.com>`, style as links, hide brackets
  - **Dependencies:** None (parser enhancement)
  - **Notes:** Core GFM, competitive requirement (markless has it), quick win

- [ ] **Mermaid Diagrams**
  - **Priority:** High
  - **Feasibility:** Moderate | **Usefulness:** High
  - **Risk:** Medium (rendering complexity)
  - **Effort:** 2-3 weeks
  - **Implementation:** Detect ` ```mermaid` code blocks, render on hover using hover provider (better than markless inline approach)
  - **Dependencies:** Rendering solution required (to be determined)
  - **Notes:** High user demand, competitive requirement (markless has it but buggy), hover approach avoids markless bugs

- [ ] **LaTeX/Math**
  - **Priority:** High
  - **Feasibility:** Moderate | **Usefulness:** High
  - **Risk:** Medium (rendering complexity)
  - **Effort:** 2-3 weeks
  - **Implementation:** Detect `$...$` (inline) and `$$...$$` (block) math, render on hover using hover provider (better than markless inline approach)
  - **Dependencies:** Math rendering solution required (to be determined)
  - **Notes:** Essential for academic/technical users, competitive requirement (markless has it but buggy), hover approach avoids markless bugs

**Medium Priority Features (Extended Features) - 2 Features**

- [ ] **Per-File Toggle State**
  - **Priority:** Medium (promoted from Low)
  - **Feasibility:** High | **Usefulness:** High
  - **Risk:** Low
  - **Effort:** 1 week
  - **Implementation:** Store toggle state per file URI, add UI control, persist state across sessions
  - **Dependencies:** State persistence mechanism (to be determined)
  - **Notes:** Competitive advantage (markless doesn't have it), better UX, low complexity

- [ ] **YAML Frontmatter**
  - **Priority:** Medium (deferred from High)
  - **Feasibility:** High | **Usefulness:** Moderate
  - **Risk:** Low
  - **Effort:** 1 week
  - **Implementation:** Detect `---` delimiters at document start, style frontmatter block, hide delimiters, reveal on selection
  - **Dependencies:** None (parser enhancement)
  - **Notes:** Not core GFM, limited use case (Jekyll/Hugo/Obsidian), markless doesn't have it, polish feature

**Low Priority Features (Nice-to-Have) - 1 Feature**

- [ ] **Emoji Support**
  - **Priority:** Low
  - **Feasibility:** High | **Usefulness:** Low
  - **Risk:** Low
  - **Effort:** 1 week
  - **Implementation:** Detect emoji shortcodes (`:smile:`, `:+1:`), render or style, handle invalid shortcodes gracefully
  - **Dependencies:** Emoji handling solution (optional, to be determined)
  - **Notes:** Nice-to-have, easy to implement, GitHub-specific, competitive feature (markless has it), make optional/configurable

---

### ⚠️ Reconsider / Delay

- [ ] **Ordered List Auto-Numbering**
  - **Current Priority:** High
  - **Feasibility:** Moderate | **Usefulness:** High
  - **Risk:** Medium (edge cases)
  - **Effort:** 2-3 weeks
  - **Implementation:** Hide markers (`1.`, `2.`, etc.), calculate numbers based on position, track nesting levels, support GFM parentheses (`1)` vs `1.`), handle out-of-order numbering
  - **Dependencies:** None (parser enhancement)
  - **Concerns:**
    - Complex edge cases (nested lists, out-of-order numbering)
    - Performance considerations (need to track list state)
    - Moderate complexity for implementation
  - **Recommendation:** Reassess after core features are complete, evaluate user demand

- [ ] **Footnotes**
  - **Current Priority:** Low
  - **Feasibility:** Moderate | **Usefulness:** Low
  - **Risk:** Medium (complex linking)
  - **Effort:** 2 weeks
  - **Implementation:** Detect footnote syntax `[^1]`, link to footnote definitions, style footnotes distinctively, handle footnote definitions
  - **Dependencies:** None (parser enhancement)
  - **Concerns:**
    - Complex linking between references and definitions
    - Low frequency of use (most users don't use footnotes)
    - Moderate complexity for limited value
  - **Recommendation:** Reassess after core features are complete, evaluate user demand

---

### ❌ Remove

- [x] **Highlighting Support** (`==text==`)
  - **Reason:** Non-standard feature that breaks "works everywhere" principle
  - **Status:** Not a competitive requirement (markless doesn't have it)
  - **Alternative:** Only implement if very high user demand emerges

---

## Detailed Implementation Recommendations

### High Priority (Must Have) - 3 Features

| Feature | Implementation Approach | Complexity | Dependencies | Estimated Effort |
|---------|------------------------|------------|--------------|------------------|
| **Autolinks** | Detect `<https://...>` and `<email@example.com>`, style as links, hide brackets | Low | None (parser enhancement) | Low (1 week) |
| **Mermaid Diagrams** | Detect ` ```mermaid` blocks, render on hover using hover provider | Moderate | Rendering solution (to be determined) | Medium (2-3 weeks) |
| **LaTeX/Math** | Detect `$...$` and `$$...$$`, render on hover using hover provider | Moderate | Math rendering solution (to be determined) | Medium (2-3 weeks) |

**Total Estimated Effort:** 5-7 weeks

---

### Medium Priority (Extended Features) - 2 Features

| Feature | Implementation Approach | Complexity | Dependencies | Estimated Effort |
|---------|------------------------|------------|--------------|------------------|
| **YAML Frontmatter** | Detect `---` delimiters at start, style block, hide delimiters | Low | None (parser enhancement) | Low (1 week) |
| **Per-File Toggle State** | Store state per URI, add UI control, persist across sessions | Low | State persistence mechanism (to be determined) | Low (1 week) |

**Total Estimated Effort:** 2 weeks

---

### Low Priority (Nice-to-Have) - 1 Feature

| Feature | Implementation Approach | Complexity | Dependencies | Estimated Effort |
|---------|------------------------|------------|--------------|------------------|
| **Emoji Support** | Detect shortcodes `:smile:`, render or style, handle invalid | Low | Emoji handling solution (optional, to be determined) | Low (1 week) |

**Total Estimated Effort:** 1 week

---

---

## Implementation Roadmap

### Phase 1: Core GFM Features (5-7 weeks) - ✅ Implement
1. **Autolinks** (1 week) - Quick win, core GFM, low risk
2. **Mermaid Diagrams** (2-3 weeks) - High user demand, medium risk
3. **LaTeX/Math** (2-3 weeks) - High user demand, medium risk

### Phase 2: Extended Features (2 weeks) - ✅ Implement
1. **Per-File Toggle State** (1 week) - Competitive advantage, low risk
2. **YAML Frontmatter** (1 week) - Polish feature, low risk

### Phase 3: Nice-to-Have (1 week) - ✅ Implement (Optional)
1. **Emoji Support** (1 week) - Easy win, low risk, make optional

### Phase 4: Reconsider (4-5 weeks) - ⚠️ Delay
1. **Ordered List Auto-Numbering** (2-3 weeks) - Reassess after core features, evaluate user demand
2. **Footnotes** (2 weeks) - Reassess after core features, evaluate user demand

---

## Key Decision Criteria

### ✅ Keep/Implement If:
- Core GFM feature
- High user value
- Competitive requirement (markless has it)
- Low to moderate complexity
- Aligns with "works everywhere" principle

### ❌ Remove If:
- Non-standard feature
- Breaks "works everywhere" principle
- Low user demand
- Not competitive requirement

---

## Competitive Analysis

| Feature | Our Extension | Markless | Competitive Status |
|---------|---------------|----------|-------------------|
| Autolinks | ⚠️ Needs verification | ✅ Supported | **Must implement** |
| Mermaid Diagrams | 🚧 Planned (hover) | ✅ Supported (inline, buggy) | **Better approach** |
| LaTeX/Math | 🚧 Planned (hover) | ✅ Supported (inline, buggy) | **Better approach** |
| YAML Frontmatter | ❌ Not supported | ❌ Not implemented | **Optional** |
| Per-File Toggle State | 🚧 Planned | ❌ Not supported | **Competitive advantage** |
| Emoji Support | ❌ Not supported | ✅ Supported | **Optional** |
| Ordered List Auto-Numbering | ⚠️ Reconsider | ✅ Supported | **Reassess** |
| Footnotes | ⚠️ Reconsider | ⚠️ Unknown | **Reassess** |

---

## Risk Assessment

### Low Risk (High Feasibility, High Value)
- ✅ Autolinks
- ✅ Per-File Toggle State
- ✅ YAML Frontmatter
- ✅ Emoji Support

### Medium Risk (Moderate Complexity, High Value)
- ⚠️ Mermaid Diagrams (rendering complexity)
- ⚠️ LaTeX/Math (rendering complexity)

### Reconsider / Delay
- ⚠️ Ordered List Auto-Numbering (edge cases, moderate complexity)
- ⚠️ Footnotes (complex linking, low frequency)

---

## Notes

1. **Hover vs Inline Rendering**: Our hover approach for Mermaid/LaTeX is better than markless inline rendering (avoids bugs, better performance)

2. **"Works Everywhere" Principle**: Features that break portability (GitHub-specific, non-standard) should be optional or deferred

3. **Core GFM First**: Prioritize standard Markdown features before extensions

4. **Competitive Parity**: Match markless on essential features, exceed on UX (per-file toggle)

5. **User Value vs Complexity**: Balance implementation effort with user benefit

---

**Last Updated:** 2025-01-XX  
**Next Review:** After Phase 1 completion
