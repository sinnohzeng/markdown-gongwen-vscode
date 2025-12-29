# Competitive Analysis – Markdown WYSIWYG Extensions

**Last Updated:** 2025-12-25  
**Analysis Scope:** VS Code Marketplace extensions for markdown WYSIWYG editing

---

## Executive Summary

The VS Code marketplace contains **2,498+ extensions** matching "markdown wysiwyg" search terms. This analysis focuses on the **top 20 most relevant competitors** that provide inline or WYSIWYG markdown editing experiences.

**Key Finding:** Most competitors fall into two categories:
1. **Webview-based editors** – Replace the native editor with a custom webview (breaks native editing, requires separate UI)
2. **Decoration-based editors** – Use VS Code decorations to overlay formatting (preserves native editing, better integration)

**Our Extension's Position:** We are in the **decoration-based** category, which is less common but provides superior integration with VS Code's native editing experience.

---

## Competitive Landscape Overview

### Market Leaders (High Install Count)

| Extension | Installs | Rating | Approach | Status |
|-----------|----------|--------|----------|--------|
| **Markdown Editor** (zaaack) | 166K | 4.5/5 | Webview (vditor) | ⚠️ Stale (12mo) |
| **Markdown All in One** | 12.3M | 4.7/5 | Preview pane only | ❌ Not WYSIWYG |
| **Markdown Preview Enhanced** | 8.3M | 4.4/5 | Preview pane only | ❌ Not WYSIWYG |
| **Milkdown** | 19.3K | 5.0/5 | Custom editor (milkdown) | ✅ Active |
| **Mark Sharp** | 18.7K | 5.0/5 | Unknown | ⚠️ Unknown |

### Direct Competitors (Decoration-Based)

| Extension | Installs | Rating | Approach | Status |
|-----------|----------|--------|----------|--------|
| **Markdown WYSIWYG** (remcohaszing) | 3K | 5.0/5 | Decorations | ⚠️ Stale (4mo) |
| **Markless** | 3.7K | 4.8/5 | Decorations + Mermaid/LaTeX | ⚠️ Stale (2021) |
| **Markdown Inline Editor** (ours) | 218 | 5.0/5 | Decorations | ✅ Active |

### Other Notable Extensions

| Extension | Installs | Rating | Approach | Notes |
|-----------|----------|--------|----------|-------|
| **Markdown Editor** (adamerose) | 13.2K | 4.7/5 | Unknown | "Powerful markdown WYSIWYG editor" |
| **UNOTES Remark** | 2.7K | 5.0/5 | Unknown | Notes-focused |
| **Markdown Preview Editor** | 2.9K | 5.0/5 | Unknown | "WYSIWYG style editor" |
| **SeeMark** | 48 | 0.0/5 | Decorations | "Hides syntax when not editing" |

---

## Detailed Competitor Analysis

### 1. Markdown Editor (zaaack) – 166K installs

**Approach:** Webview-based using [vditor](https://github.com/Vanessa219/vditor)

**Features:**
- Full WYSIWYG editor in separate webview
- Auto-sync between editor and webview
- Multiple editing modes (instant rendering, WYSIWYG, split screen)
- Supports KaTeX, Mermaid, Graphviz, ECharts, abc.js
- Image upload/paste/drag-drop to `assets` folder
- Multi-theme support
- Custom CSS support

**Strengths:**
- Very feature-rich
- Supports advanced diagrams and math
- High install count indicates popularity

**Weaknesses:**
- ⚠️ **Stale** – Last commit 12 months ago, 95 open issues
- ❌ **Breaks native editing** – Uses webview, not native VS Code editor
- ❌ **No Vim support** – Can't use native editor features
- ❌ **Context switching** – Must open separate editor view
- ❌ **Performance** – Webview overhead
- ❌ **Extension compatibility** – Other extensions may not work

**User Pain Points (from reviews):**
- "Doesn't work with Vim mode"
- "Buggy, crashes sometimes"
- "Not updated in a while"
- "Can't use other markdown extensions"

---

### 2. Markdown WYSIWYG (remcohaszing) – 3K installs

**Approach:** Decoration-based (similar to ours)

**Features:**
- Emphasis text → italic
- Strong text → bold
- Headers → bold
- Deleted text → strikethrough
- Thematic breaks → extended strikethrough
- Inline code → background styling
- HTML tags → background styling
- Code blocks → background styling
- Frontmatter → background styling
- Block quotes → background styling (nested support)
- MDX expressions → background styling

**Strengths:**
- ✅ **Native editor** – Uses decorations, preserves native editing
- ✅ **Simple and focused** – Does one thing well
- ✅ **MDX support** – Handles MDX files

**Weaknesses:**
- ⚠️ **Stale** – Last commit 4 months ago
- ❌ **Limited features** – No syntax hiding, only styling
- ❌ **No link handling** – Links not clickable
- ❌ **No smart reveal** – Can't reveal raw markdown on selection
- ❌ **No lists/checkboxes** – Doesn't handle lists or task lists
- ❌ **No images** – Doesn't handle image syntax

**Comparison to Our Extension:**
- **Similar approach** but less feature-complete
- We hide syntax markers; they only style them
- We support more markdown features (links, images, lists, blockquotes, etc.)
- We have smart reveal on selection

---

### 3. Markless – 3.7K installs

**Approach:** Decoration-based with advanced rendering

**Features:**
- Inline markdown preview
- Syntax hiding (similar to ours)
- **Mermaid diagram rendering** (inline)
- **LaTeX/Math rendering** (inline)
- Image rendering (inline)
- Vim mode support
- Spec-compliant (GFM/Commonmark)
- Performance optimized (under 100ms)
- Reveal source toggle
- Auto-reveal near cursor

**Strengths:**
- ✅ **Native editor** – Uses decorations, preserves native editing
- ✅ **Advanced features** – Mermaid, LaTeX, images
- ✅ **Vim support** – Works with Vim extensions
- ✅ **Performance** – Intelligent parsing, caching
- ✅ **Spec compliant** – Follows GFM/Commonmark

**Weaknesses:**
- ⚠️ **Stale** – Last updated May 2021 (4+ years old)
- ❌ **Abandoned** – No recent updates, likely unmaintained
- ❌ **Known issues** – 15 open bugs, including critical performance issues
- ❌ **Performance bugs** – Fails on files >500 lines (issue #22)
- ❌ **No tests** – Zero test coverage
- ❌ **UI polish** – Less polished than Typora (per their own comparison)

**Comparison to Our Extension:**
- **Most similar competitor** in terms of approach
- They have Mermaid/LaTeX (we plan to add)
- They have image rendering (we don't plan inline images)
- We have better maintenance (active development)
- We have more comprehensive test coverage (123+ tests)
- We have better documentation and contribution guidelines
- We have better performance (no line count limits, intelligent caching)

**See [Markless Deep Dive](./02_Markless_Deep_Dive.md) for comprehensive analysis.**

---

### 4. Milkdown – 19.3K installs

**Approach:** Custom editor using [Milkdown](https://saul-mirone.github.io/milkdown/) framework

**Features:**
- WYSIWYG markdown editor
- Full GFM syntax support
- Emoji picker and filter
- Copy/paste with markdown
- Slash commands
- Tooltip bar
- Math support
- Can be set as default markdown editor

**Strengths:**
- ✅ **Active development** – Last updated Feb 2025
- ✅ **Full GFM support** – Complete GitHub Flavored Markdown
- ✅ **Modern framework** – Built on Milkdown (proven editor)
- ✅ **Rich features** – Emoji picker, slash commands, tooltips

**Weaknesses:**
- ❌ **Custom editor** – Not native VS Code editor
- ❌ **Requires activation** – Must right-click or use command to open
- ❌ **Extension compatibility** – May not work with all extensions
- ❌ **Context switching** – Separate editor view

**Comparison to Our Extension:**
- Different approach (custom editor vs. decorations)
- They have more features (emoji, slash commands)
- We have better integration (native editor, no context switching)
- We have zero configuration (works automatically)

---

### 5. Markdown Editor (adamerose) – 13.2K installs

**Approach:** Unknown (likely webview-based)

**Features:**
- "A powerful markdown WYSIWYG editor"
- Limited public information

**Strengths:**
- High install count suggests popularity

**Weaknesses:**
- ❌ **Lack of documentation** – Hard to assess features
- ❌ **Unknown approach** – Can't evaluate technical merits

---

## Feature Comparison Matrix

| Feature | Our Extension | remcohaszing | Markless | zaaack | Milkdown |
|---------|---------------|--------------|----------|--------|----------|
| **Approach** | Decorations | Decorations | Decorations | Webview | Custom Editor |
| **Native Editor** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Syntax Hiding** | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Smart Reveal** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Bold/Italic** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Headings** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Links** | ✅ Clickable | ❌ | ✅ | ✅ | ✅ |
| **Images** | ✅ Styled | ❌ | ✅ Rendered | ✅ | ✅ |
| **Lists** | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Task Lists** | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Blockquotes** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Code Blocks** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Mermaid** | 🚧 Planned | ❌ | ✅ | ✅ | ❌ |
| **LaTeX/Math** | 🚧 Planned | ❌ | ✅ | ✅ | ✅ |
| **Tables** | 🚧 Planned | ❌ | ✅ | ✅ | ✅ |
| **GFM Support** | Partial | ❌ | ✅ | ✅ | ✅ |
| **Vim Support** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Zero Config** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Active Development** | ✅ | ⚠️ | ❌ | ❌ | ✅ |
| **Test Coverage** | ✅ 123+ tests | ❌ | ❌ | ❌ | ❌ |
| **Performance** | ✅ Cached | ✅ | ✅ | ⚠️ | ⚠️ |

**Legend:**
- ✅ = Supported
- ❌ = Not supported
- 🚧 = Planned/In progress
- ⚠️ = Partial/Issues

---

## Technical Approach Comparison

### 1. Decoration-Based (Our Approach)

**Extensions:** Ours, remcohaszing, Markless

**How it works:**
- Uses VS Code's `TextEditorDecorationType` API
- Overlays visual styling on top of native editor
- Preserves all native editor functionality
- Files remain standard `.md` format

**Advantages:**
- ✅ **Native editing** – Full VS Code editor features
- ✅ **Extension compatibility** – Works with all extensions
- ✅ **Vim support** – Native editor supports Vim mode
- ✅ **Performance** – Lightweight, efficient
- ✅ **Git-friendly** – Files remain standard markdown
- ✅ **No context switching** – Edit in place

**Disadvantages:**
- ❌ **Limited rendering** – Can't render complex diagrams inline
- ❌ **VS Code API limits** – Some features harder to implement
- ❌ **Theme dependency** – Must adapt to VS Code themes

**Best for:** Users who want native editing with visual improvements

---

### 2. Webview-Based

**Extensions:** zaaack, adamerose (likely)

**How it works:**
- Opens markdown in separate webview panel
- Uses custom HTML/CSS/JS editor (e.g., vditor)
- Syncs changes between webview and file

**Advantages:**
- ✅ **Rich features** – Can implement any UI/UX
- ✅ **Advanced rendering** – Diagrams, math, complex layouts
- ✅ **Customizable** – Full control over appearance

**Disadvantages:**
- ❌ **Breaks native editing** – Can't use VS Code editor features
- ❌ **No Vim support** – Webview doesn't support Vim
- ❌ **Extension incompatibility** – Other extensions may not work
- ❌ **Context switching** – Must open separate view
- ❌ **Performance** – Webview overhead
- ❌ **Maintenance burden** – Must maintain custom editor

**Best for:** Users who want rich features and don't need native editing

---

### 3. Custom Editor

**Extensions:** Milkdown

**How it works:**
- Registers custom editor type for `.md` files
- Replaces native editor with custom implementation
- Uses VS Code Custom Editor API

**Advantages:**
- ✅ **Rich features** – Can implement any UI/UX
- ✅ **Can be default** – Can replace native editor
- ✅ **Modern framework** – Built on proven editor (Milkdown)

**Disadvantages:**
- ❌ **Not native** – Loses VS Code editor features
- ❌ **Extension compatibility** – May not work with all extensions
- ❌ **Activation required** – Must explicitly open in custom editor
- ❌ **Maintenance burden** – Must maintain custom editor

**Best for:** Users who want rich features and are willing to give up native editing

---

## Market Positioning

### Our Unique Value Proposition

1. **Native Editing + Visual Improvements**
   - Only decoration-based extension with comprehensive syntax hiding
   - Preserves all VS Code editor features (Vim, extensions, etc.)
   - Zero configuration, works automatically

2. **Active Development**
   - Most competitors are stale or abandoned
   - Regular updates, bug fixes, feature additions
   - Comprehensive test coverage (123+ tests)

3. **Performance & Quality**
   - Intelligent caching, incremental updates
   - Handles large files gracefully
   - Well-documented, maintainable codebase

4. **Git-Friendly**
   - Files remain 100% standard `.md` format
   - No file modification, only visual overlays
   - Works with all markdown tooling

### Competitive Advantages

| Advantage | Our Extension | Competitors |
|-----------|---------------|-------------|
| **Native Editing** | ✅ | ❌ (webview/custom editors) |
| **Syntax Hiding** | ✅ | ⚠️ (only Markless, but stale) |
| **Active Development** | ✅ | ❌ (most are stale) |
| **Test Coverage** | ✅ 123+ tests | ❌ (none have tests) |
| **Zero Configuration** | ✅ | ⚠️ (some require setup) |
| **Vim Support** | ✅ | ❌ (webview/custom editors) |
| **Extension Compatibility** | ✅ | ❌ (webview/custom editors) |

### Competitive Disadvantages

| Disadvantage | Impact | Mitigation |
|--------------|--------|------------|
| **No Mermaid/LaTeX yet** | Medium | Planned features, can use companion extensions |
| **No inline image rendering** | Low | Images styled, not rendered (by design) |
| **Limited GFM support** | Medium | Actively working on GFM compliance |
| **Small install base** | Low | Growing organically, high ratings (5.0/5) |

---

## Differentiation Opportunities

### 1. **Performance Leadership**
- **Current:** Intelligent caching, incremental updates
- **Opportunity:** Benchmark and optimize further, publish performance metrics
- **Competitive Edge:** Most competitors don't optimize for performance

### 2. **Developer Experience**
- **Current:** Comprehensive tests, good documentation
- **Opportunity:** Add more developer tools, debugging features
- **Competitive Edge:** No competitor has 123+ tests

### 3. **GFM Compliance**
- **Current:** Partial GFM support
- **Opportunity:** Full GFM compliance (tables, task lists, strikethrough, etc.)
- **Competitive Edge:** Match Markless's spec compliance

### 4. **Advanced Features (Planned)**
- **Mermaid diagrams** – Hover preview (not inline, by design)
- **LaTeX/Math** – Hover preview (not inline, by design)
- **Tables** – Syntax hiding for tables
- **Auto-numbering** – Ordered list auto-numbering

### 5. **Ecosystem Integration**
- **Current:** Works with Markdown All in One
- **Opportunity:** Explicit integration guides, recommended extension bundles
- **Competitive Edge:** Position as "best companion" to existing tools

---

## Recommendations

### Short-Term (Next 3-6 months)

1. **Complete GFM Support**
   - Tables syntax hiding
   - Full task list support
   - Strikethrough (already done)
   - Auto-numbering for ordered lists

2. **Performance Optimization**
   - Benchmark against competitors
   - Optimize large file handling
   - Publish performance metrics

3. **Documentation Enhancement**
   - Add comparison page to README
   - Create migration guides from competitors
   - Add troubleshooting for common issues

### Medium-Term (6-12 months)

1. **Advanced Features**
   - Mermaid diagram hover preview
   - LaTeX/Math hover preview
   - Table editing improvements

2. **Developer Tools**
   - Debug mode for decorations
   - Performance profiling tools
   - Extension compatibility checker

3. **Community Building**
   - Engage with users on Reddit/GitHub
   - Create video tutorials
   - Build extension bundle partnerships

### Long-Term (12+ months)

1. **Market Leadership**
   - Become the go-to decoration-based markdown editor
   - Maintain active development while competitors stagnate
   - Build ecosystem of complementary extensions

2. **Feature Parity (Selective)**
   - Add features that make sense for decoration-based approach
   - Avoid features that require webview/custom editor
   - Focus on "native editing + visual improvements"

---

## Conclusion

**Market Opportunity:** The decoration-based approach is **underrepresented** in the marketplace. Most competitors use webview/custom editors, which break native editing. Our extension fills this gap.

**Competitive Position:** We are the **only actively maintained** decoration-based extension with comprehensive syntax hiding. Markless is our closest competitor but is abandoned (4+ years stale).

**Strategic Focus:**
1. **Maintain active development** – Most competitors are stale
2. **Complete GFM support** – Match Markless's spec compliance
3. **Performance leadership** – Optimize and benchmark
4. **Developer experience** – Maintain high code quality and tests
5. **Ecosystem integration** – Position as best companion to existing tools

**Key Differentiator:** Native editing + visual improvements, with active development and high code quality.

---

## References

- [VS Code Marketplace Search](https://marketplace.visualstudio.com/search?term=markdown%20wysiwyg&target=VSCode&category=All%20categories&sortBy=Relevance)
- [Markdown WYSIWYG (remcohaszing)](https://marketplace.visualstudio.com/items?itemName=remcohaszing.markdown-decorations)
- [Markdown Editor (zaaack)](https://marketplace.visualstudio.com/items?itemName=zaaack.markdown-editor)
- [Markless](https://marketplace.visualstudio.com/items?itemName=tejasvi.markless)
- [Milkdown](https://marketplace.visualstudio.com/items?itemName=mirone.milkdown)

