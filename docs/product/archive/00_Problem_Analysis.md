# Opportunity Brief – Markdown Inline Editor

## Project
**Markdown Inline Editor** – VS Code Extension for WYSIWYG-style Markdown editing

## Problem Statement

Markdown is a powerful, lightweight markup language that has become the de facto standard for documentation, notes, and content creation. However, editing Markdown files presents a significant cognitive burden:

1. **Visual Clutter**: Syntax markers (`**`, `*`, `` ` ``, `#`, `[]`, etc.) dominate the visual space, making it difficult to focus on the actual content
2. **Context Switching**: Users must mentally parse syntax to understand formatting, breaking their flow state
3. **Accessibility Gap**: While Markdown preview panes exist, they require a split view and don't allow direct editing of the formatted content
4. **Learning Curve**: New users struggle with syntax memorization, while experienced users still find syntax-heavy files harder to scan

**Current State**: Users spend significant mental effort parsing syntax markers instead of focusing on content. Existing solutions either require split-pane previews (breaking editing flow) or don't provide inline formatting visualization.

**Desired State**: Users should see formatted content inline (bold, italic, headings, etc.) with syntax markers hidden, while maintaining full access to raw Markdown when needed. Files must remain standard `.md` format for compatibility.

## Constraints

### Technical Constraints
- **File Format**: Must preserve 100% standard Markdown syntax (no file modification)
- **VS Code API**: Limited to decoration-based visual overlays (cannot modify document content)
- **Performance**: Must handle large files (>1MB) gracefully without lag
- **Compatibility**: Must work with existing Markdown tooling (Git, parsers, previews)
- **Theme Integration**: Must adapt to VS Code theme changes automatically

### Business Constraints
- **Zero Configuration**: Must work out-of-the-box (no setup required)
- **Open Source**: MIT license, community-driven development
- **Resource Limits**: Extension size must remain reasonable (<500KB packaged)
- **Maintenance**: Must align with VS Code API changes and maintain backward compatibility

### User Constraints
- **Learning Curve**: Users should not need to learn new syntax or workflows
- **Accessibility**: Must support keyboard navigation and screen readers
- **Performance**: No noticeable lag on selection changes or file edits

## In-Scope

### Core Functionality
- **Syntax Hiding**: Hide all Markdown syntax markers (`**`, `*`, `` ` ``, `#`, `[]`, `>`, etc.)
- **Visual Formatting**: Apply inline styling (bold, italic, headings, code blocks, links)
- **Smart Reveal**: Show raw Markdown syntax when text is selected
- **Interactive Elements**: Clickable links, toggleable checkboxes
- **Theme Awareness**: Automatic adaptation to VS Code color themes

### Supported Markdown Features
- Text formatting (bold, italic, strikethrough, bold+italic)
- Headings (H1–H6) with appropriate sizing
- Inline code and code blocks
- Links and images
- Lists (unordered, ordered, task lists/checkboxes)
- Blockquotes
- Horizontal rules

### User Experience
- Toggle decorations on/off globally
- Instant reveal on selection (no debounce)
- Intelligent caching for performance
- Support for `.md`, `.markdown`, `.mdx` file types
- CRLF and LF line ending support

## Out-of-Scope

### Explicitly Excluded
- **File Modification**: Extension does not modify `.md` file content (read-only decorations)
- **Preview Pane**: No split-pane preview functionality (focus on inline editing)
- **Syntax Highlighting**: Not a code syntax highlighter (focus on content formatting)
- **Markdown Rendering**: Does not render images, diagrams, or complex HTML
- **Auto-formatting**: Does not automatically format or clean Markdown syntax
- **Export/Import**: No file conversion or export to other formats

### Future Considerations (Not in Current Scope)
- **Tables**: Table syntax hiding is planned but not in current release
- **Mermaid Diagrams**: Diagram rendering support is planned
- **Math Formulas**: KaTeX/MathJax support is planned
- **Ordered List Auto-numbering**: Currently displayed as-is
- **Per-file Toggle State**: Currently global toggle only
- **Custom Themes**: Uses VS Code theme colors only (no custom color schemes)

## Success Criteria

### Primary Metrics
- **User Adoption**: Measured via VS Code Marketplace downloads and active users
- **Performance**: Parsing and decoration updates complete in <150ms for typical files (<100KB)
- **Compatibility**: Works with 100% of standard Markdown syntax (no breaking changes)
- **User Satisfaction**: Positive reviews (>4.0/5.0) with focus on "reduces clutter" and "improves focus"

### Secondary Metrics
- **Error Rate**: <1% of users report critical bugs or crashes
- **File Size Support**: Handles files up to 1MB without performance degradation
- **Theme Compatibility**: Works correctly with 95%+ of popular VS Code themes

## Market Context

### Target Users
- **Content Creators**: Bloggers, technical writers, documentation authors
- **Developers**: README authors, code comment writers, project maintainers
- **Knowledge Workers**: Note-takers, researchers, students
- **Teams**: Organizations using Markdown for documentation and collaboration

### Competitive Landscape
- **Markdown Preview Extensions**: Provide split-pane previews but don't enable inline editing
- **WYSIWYG Markdown Editors**: Require file conversion or proprietary formats
- **Markdown All-in-One**: Provides shortcuts and formatting, but doesn't hide syntax inline

**See [Competitive Analysis](./01_Competitive_Analysis.md) for detailed comparison of 20+ competing extensions.**

### Differentiation
- **Unique Value**: Only extension that hides syntax inline while maintaining standard `.md` files
- **Zero Friction**: No configuration, no file conversion, works immediately
- **Git-Friendly**: Files remain standard Markdown, compatible with all tooling
- **Active Development**: Most competitors are stale or abandoned (see competitive analysis)

---

**Last Updated**: 2025-01-XX  
**Version**: 1.4.0  
**Status**: Active Development
