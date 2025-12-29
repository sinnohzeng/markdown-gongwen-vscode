# Improved Issue Descriptions

This document contains improved descriptions for all GitHub issues. Copy and paste these into the respective issues on GitHub.

---

## Issue #11: PlantUML Support

```markdown
## PlantUML Support

Add support for rendering PlantUML diagrams in markdown files.

### Context

This feature was requested in the [Reddit discussion](https://www.reddit.com/r/vscode/comments/...) where users mentioned using PlantUML for inline diagrams at work.

### Requirements

- Detect PlantUML code blocks (````plantuml` or ````puml`)
- Render diagrams (likely via hover preview, not inline - see implementation approach)
- Support relative and absolute image paths

### Implementation Approach

**Recommended:** Hover preview (not inline rendering)
- **Why:** PlantUML requires Java dependency, which is complex to bundle
- **Alternative:** Use PlantUML server API or local rendering
- **Reference:** See [Markless Deep Dive](../docs/product/02_Markless_Deep_Dive.md) for lessons learned on diagram rendering

### Related Issues

- #10 - Mermaid diagram support (similar feature)
- #9 - KaTeX/Math rendering support (similar rendering approach)

### Priority

**Low** - Lower priority than Mermaid (#10) due to Java dependency requirement and lower user demand.

### Acceptance Criteria

- [ ] PlantUML code blocks are detected
- [ ] Diagrams render on hover (or via alternative method)
- [ ] Works with both `plantuml` and `puml` language identifiers
- [ ] Handles relative and absolute paths correctly
- [ ] Performance is acceptable (no lag on file open/edit)

### Notes

- OP mentioned: "I really like plantuml, but i do not like the dependency to java on my system"
- Consider using PlantUML server API to avoid Java dependency
- May need to defer until after Mermaid support is implemented
```

**Labels:** `enhancement`, `feature-request`, `low-priority`

---

## Issue #10: Mermaid Diagram Support

```markdown
## Mermaid Diagram Support

Add support for rendering Mermaid diagrams in markdown files.

### Context

This feature was requested in the [Reddit discussion](https://www.reddit.com/r/vscode/comments/...) and is a common feature in markdown editors like Obsidian and Typora.

**Competitive Analysis:** Markless (our closest competitor) implements inline Mermaid rendering, but has known bugs (see [Markless Deep Dive](../docs/product/02_Markless_Deep_Dive.md#a-mermaid-diagram-rendering)).

### Requirements

- Detect Mermaid code blocks (````mermaid`)
- Render diagrams (recommended: hover preview, not inline)
- Support all Mermaid diagram types (flowcharts, sequence diagrams, etc.)

### Implementation Approach

**Recommended:** Hover preview (not inline rendering)
- **Why:** Inline rendering requires webview management, which adds complexity and performance overhead
- **Reference:** Markless uses inline rendering but has bugs (issue #10: "mermaid doesn't work")
- **Benefits:** Simpler implementation, better performance, more reliable

**Alternative Approaches:**
1. **Hover preview** (recommended) - Show diagram on hover over code block
2. **Inline rendering** - Render diagram directly in editor (complex, performance concerns)
3. **HTML dialog** - Show diagram in popup dialog (OP mentioned experimental branch with this)

### Related Issues

- #11 - PlantUML support (similar feature)
- #9 - KaTeX/Math rendering support (similar rendering approach)

### Priority

**Medium** - High user demand, but should be implemented after core GFM features (#8).

### Acceptance Criteria

- [ ] Mermaid code blocks are detected
- [ ] Diagrams render on hover (or via alternative method)
- [ ] Supports all common Mermaid diagram types
- [ ] Performance is acceptable (no lag on file open/edit)
- [ ] Works with large files (>500 lines) - avoid Markless's bug
- [ ] Handles syntax errors gracefully

### Implementation Notes

- OP mentioned: "I had a experimental feature branch where i added mermaid rendering support. I could not make it inline, but i created a html dialog on hover."
- Consider reusing experimental branch code if available
- Use Mermaid.js library for rendering
- Test with large files to avoid performance issues

### References

- [Markless Mermaid Implementation](https://github.com/tejasvi/markless/blob/master/src/extension.js) (reference, but avoid their bugs)
- [Mermaid.js Documentation](https://mermaid.js.org/)
```

**Labels:** `enhancement`, `feature-request`, `medium-priority`

---

## Issue #9: KaTeX/Math Rendering Support

```markdown
## KaTeX/Math Rendering Support

Add support for rendering LaTeX math formulas in markdown files.

### Context

This feature was requested in the [Reddit discussion](https://www.reddit.com/r/vscode/comments/...) where users mentioned needing math formulas for technical and scientific notes (similar to Obsidian).

**Competitive Analysis:** Markless (our closest competitor) implements inline LaTeX rendering, but has critical bugs (see [Markless Deep Dive](../docs/product/02_Markless_Deep_Dive.md#b-latexmath-rendering)).

### Requirements

- Support inline math: `$...$` (e.g., `$E = mc^2$`)
- Support block math: `$$...$$` (e.g., `$$\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$`)
- Render formulas (recommended: hover preview, not inline)
- Support common LaTeX math syntax

### Implementation Approach

**Recommended:** Hover preview (not inline rendering)
- **Why:** Inline rendering requires KaTeX bundling and has performance concerns
- **Reference:** Markless uses inline rendering but has critical bug (issue #22: multi-line math fails on files >500 lines)
- **Benefits:** Simpler implementation, better performance, more reliable

**Alternative Approaches:**
1. **Hover preview** (recommended) - Show rendered math on hover over formula
2. **Inline rendering** - Render formula directly in editor (complex, performance concerns)
3. **HTML dialog** - Show formula in popup dialog

### Related Issues

- #6 - Equation display (duplicate/related - should be merged)
- #10 - Mermaid diagram support (similar rendering approach)
- #11 - PlantUML support (similar feature)

### Priority

**Medium** - High user demand, especially for technical/scientific users. Should be implemented after core GFM features (#8).

### Acceptance Criteria

- [ ] Inline math (`$...$`) is detected and rendered
- [ ] Block math (`$$...$$`) is detected and rendered
- [ ] Formulas render on hover (or via alternative method)
- [ ] Works with large files (>500 lines) - avoid Markless's critical bug
- [ ] Performance is acceptable (no lag on file open/edit)
- [ ] Handles syntax errors gracefully
- [ ] Supports common LaTeX math syntax

### Implementation Notes

- Use KaTeX library for rendering (industry standard)
- Test with multi-line math blocks to avoid Markless's bug
- Consider both inline and block math rendering
- May need to handle edge cases (e.g., `$` in code blocks)

### Known Issues to Avoid

- **Markless Issue #22:** Multi-line math fails on files >500 lines due to performance optimization
- **Lesson:** Never break functionality for performance - use proper caching instead

### References

- [Markless LaTeX Implementation](https://github.com/tejasvi/markless/blob/master/src/extension.js) (reference, but avoid their bugs)
- [KaTeX Documentation](https://katex.org/)
- [Markless Deep Dive - LaTeX Section](../docs/product/02_Markless_Deep_Dive.md#b-latexmath-rendering)
```

**Labels:** `enhancement`, `feature-request`, `medium-priority`

---

## Issue #8: Full GitHub Flavored Markdown (GFM) Support

```markdown
## Full GitHub Flavored Markdown (GFM) Support

Complete GitHub Flavored Markdown (GFM) compliance for the extension.

### Context

This feature was requested in the [Reddit discussion](https://www.reddit.com/r/vscode/comments/...) where users mentioned needing full GFM support.

**Current Status:** Extension has partial GFM support via `remark-gfm`, but not all GFM features are fully implemented in decorations.

**Competitive Analysis:** Markless (our closest competitor) has full GFM/Commonmark compliance, which is a competitive advantage we should match (see [Competitive Analysis](../docs/product/01_Competitive_Analysis.md)).

### Requirements

Complete support for all GFM features:

- [x] **Strikethrough** - `~~text~~` ✅ (already implemented)
- [x] **Task lists** - `- [ ]` / `- [x]` ✅ (already implemented)
- [ ] **Tables** - Syntax hiding for table syntax
- [ ] **Autolinks** - Automatic link detection
- [ ] **Disallowed raw HTML** - Handle HTML in markdown
- [ ] **Fenced code blocks** - Already supported, but verify all edge cases
- [ ] **Task list items** - Verify all edge cases

### Implementation Approach

1. **Tables** (highest priority)
   - Hide table syntax markers (`|`, `-`, `:`)
   - Style table cells appropriately
   - Handle alignment markers
   - Support multi-line cells

2. **Autolinks**
   - Detect and style automatic links
   - Make them clickable

3. **Edge Cases**
   - Verify all GFM edge cases work correctly
   - Test with GFM test suite if available

### Related Issues

- #10 - Mermaid diagram support (GFM includes code blocks)
- #9 - KaTeX/Math rendering support (GFM includes code blocks)

### Priority

**High** - Core feature that affects compatibility and user experience. Should be completed before advanced features (Mermaid, LaTeX).

### Acceptance Criteria

- [ ] Tables syntax is hidden and styled correctly
- [ ] Autolinks are detected and clickable
- [ ] All GFM features work correctly
- [ ] Passes GFM compliance tests (if available)
- [ ] No regressions in existing features
- [ ] Performance is acceptable

### Implementation Notes

- Extension already uses `remark-gfm` for parsing
- Need to add decoration support for missing features
- Tables are the most complex feature to implement
- Reference: [GFM Specification](https://github.github.com/gfm/)

### References

- [GFM Specification](https://github.github.com/gfm/)
- [Competitive Analysis - GFM Support](../docs/product/01_Competitive_Analysis.md#feature-comparison-matrix)
- [Markless Deep Dive - GFM Compliance](../docs/product/02_Markless_Deep_Dive.md#feature-quality)
```

**Labels:** `enhancement`, `feature-request`, `high-priority`, `gfm`

---

## Issue #6: Equation Display (LaTeX Math Rendering)

```markdown
## Equation Display (LaTeX Math Rendering)

Add support for displaying inline Markdown equations (LaTeX-style math rendered inline with text).

### User Request

> "It's a really nice extension overall. I was wondering if it would be possible to add support for displaying inline Markdown equations (for example, LaTeX-style math rendered inline with text). Having proper inline equation rendering would significantly improve the writing and reading experience, especially for technical and scientific notes. (similar to obsidian)"

### Context

This is a duplicate/related issue to #9 (KaTeX/Math rendering support). Both issues request math formula rendering.

**Recommended Action:** Merge with #9 or keep as separate tracking issue for user feedback.

### Requirements

- Support inline math formulas (e.g., `$E = mc^2$`)
- Support block math formulas (e.g., `$$\int_0^\infty e^{-x^2} dx$$`)
- Render formulas similar to Obsidian's implementation
- Improve writing/reading experience for technical/scientific notes

### Implementation Approach

See #9 for detailed implementation approach. Recommended: hover preview (not inline rendering) to avoid performance issues seen in Markless.

### Related Issues

- #9 - KaTeX/Math rendering support (main tracking issue)
- #10 - Mermaid diagram support (similar rendering approach)

### Priority

**Medium** - High user demand, especially for technical/scientific users.

### Acceptance Criteria

- [ ] Inline math formulas render correctly
- [ ] Block math formulas render correctly
- [ ] Works similar to Obsidian's math rendering
- [ ] Performance is acceptable
- [ ] Works with large files

### Notes

- User specifically mentioned Obsidian as reference
- Consider Obsidian's implementation approach
- May want to gather more user feedback on preferred rendering method (inline vs hover)

### References

- #9 - KaTeX/Math rendering support (main issue)
- [Markless Deep Dive - LaTeX Section](../docs/product/02_Markless_Deep_Dive.md#b-latexmath-rendering)
```

**Labels:** `enhancement`, `feature-request`, `medium-priority`, `duplicate`

---

## Issue #4: Text Out of Line - Heading Overlap Issue

```markdown
## Text Out of Line - Heading Overlap Issue

When H1 heading is placed on the first line, the text goes out of the window/viewport.

### Problem Description

When an H1 heading is placed on the first line of a markdown file, the text extends beyond the visible window/viewport, making it difficult to read or edit.

### Visual Evidence

![Image showing text going out of window](https://github.com/user-attachments/assets/619c28a4-ffd7-41c3-94d1-5bdc01cc12dd)

### Root Cause

This issue is related to VS Code's line height limitations. The extension uses font size scaling for headings (H1 = 200% font size), which can cause text to overflow when:
- Heading is on the first line
- Line height is not adjustable via VS Code API
- VS Code 1.107+ has variable line height support, but it's not accessible via extensions API

### Current Status

**On Hold** - Waiting for VS Code API support for variable line height.

**Investigation:**
- VS Code 1.107+ has variable line height support in Monaco editor
- However, extensions don't have access to this API
- Workaround: May need to reduce heading font sizes or use alternative approach

### Related Context

This issue was also discussed in the [Reddit thread](https://www.reddit.com/r/vscode/comments/...) where users mentioned:
- "Could you tweak a little bit of line height of the headers? So squeezed right now"
- VS Code 1.107 has variable line height, but it's not publicly released/accessible

### Possible Solutions

1. **Reduce heading font sizes** (temporary workaround)
   - Reduce H1 from 200% to 180% or 150%
   - May reduce visual impact but fixes overflow

2. **Wait for VS Code API** (long-term)
   - VS Code may add extension API for line height in future
   - Monitor VS Code API changes

3. **Alternative approach** (creative solution)
   - Use different decoration method that doesn't affect line height
   - May require rethinking heading decoration approach

### Related Issues

- Similar issues may exist for other heading levels (H2-H6)
- May be related to blockquote or other large decorations

### Priority

**Medium** - Affects UX but has workaround. May need to wait for VS Code API support.

### Acceptance Criteria

- [ ] H1 headings on first line don't overflow viewport
- [ ] All heading levels (H1-H6) work correctly
- [ ] Solution doesn't significantly reduce visual impact
- [ ] Works with all VS Code themes

### Implementation Notes

- Check if VS Code API has been updated to support line height
- Consider reducing heading font sizes as temporary fix
- Test with different themes and font sizes
- May need to document limitation if no fix available

### References

- [VS Code Issue #85682](https://github.com/microsoft/vscode/issues/85682) - Variable line height API request
- [Reddit Discussion](https://www.reddit.com/r/vscode/comments/...) - User feedback on heading line height
```

**Labels:** `bug`, `on hold`, `medium-priority`

---

## Summary of Improvements

### What Was Improved

1. **Added Context** - Each issue now includes:
   - Where the feature was requested (Reddit discussion)
   - Competitive analysis references
   - Current status and implementation notes

2. **Clear Requirements** - Each issue specifies:
   - What needs to be implemented
   - Acceptance criteria
   - Related issues

3. **Implementation Guidance** - Each issue includes:
   - Recommended approach (learned from Markless analysis)
   - Alternative approaches
   - Known issues to avoid

4. **Priority & Labels** - Each issue has:
   - Clear priority (High/Medium/Low)
   - Appropriate labels
   - Related issue links

5. **References** - Each issue links to:
   - Competitive analysis documents
   - Markless deep dive (lessons learned)
   - External documentation

### Next Steps

1. Copy each improved description into the respective GitHub issue
2. Add the suggested labels to each issue
3. Consider creating a milestone for high-priority issues (#8 - GFM support)
4. Link related issues together
5. Consider merging #6 into #9 (both are about math rendering)

