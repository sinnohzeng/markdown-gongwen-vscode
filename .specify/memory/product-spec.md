# Product Specification: Markdown Inline Editor

**Created**: 2025-03-08  
**Status**: Active  
**Input**: A VS Code experience where markdown looks like the final result while you edit: headings, links, lists, and other syntax appear as they would when rendered, so the document is easier to read and less cluttered. Links and images stay clickable and show useful previews on hover. The goal is to make writing and reading markdown in the editor feel closer to the rendered output without hiding the source or breaking normal editing and VS Code behavior.

---

## Vision Summary

The extension delivers **inline WYSIWYG-style markdown**: source text remains visible and editable, but syntax (headings, links, lists, code blocks, etc.) is visually presented as it would when rendered. The editor stays a normal text editor—selection, editing, and VS Code features work as expected—while reducing visual clutter and making the document easier to read. Interactive elements (links, images) remain functional: clickable and with helpful hover previews.

---

## User Scenarios & Testing

### User Story 1 – Read and edit with less clutter (Priority: P1)

As a writer editing markdown in VS Code, I see headings, links, lists, and other syntax styled like the rendered result (e.g. heading sizes, hidden `#` and `[]()`, list bullets implied by layout). I can still click anywhere and edit the underlying text; I am not in a preview-only mode. The document feels easier to scan and read than raw markdown.

**Why this priority**: Core value proposition—inline rendering that reduces clutter while keeping the source editable.

**Independent test**: Open a markdown file with headings, links, and lists; confirm syntax is visually subdued or styled like rendered output; confirm all text is editable and selection works normally.

**Acceptance scenarios**:

1. **Given** a markdown file with headings, **when** the file is open, **then** heading markers are hidden or de-emphasized and heading text uses rendered-like sizing.
2. **Given** a markdown file with links, **when** the file is open, **then** link text is shown and URL/syntax is hidden or de-emphasized.
3. **Given** a markdown file with lists, **when** the file is open, **then** list markers are hidden or de-emphasized and list items look like rendered content.
4. **Given** any such document, **when** the user places the cursor or selects text, **then** normal editing (typing, delete, selection) works and raw markdown can be revealed on demand (e.g. on selection).

---

### User Story 2 – Links and images are interactive (Priority: P1)

As a user, I can follow links (e.g. Ctrl+Click) and see useful information on hover: for links, the URL or destination; for images, a preview where possible. Behavior matches VS Code conventions for links and hovers.

**Why this priority**: Interactivity is part of “closer to rendered output”; without it, the experience feels static and less useful.

**Independent test**: Add a link and an image to a markdown file; confirm link is clickable and hover shows URL/destination; confirm image hover shows preview when supported.

**Acceptance scenarios**:

1. **Given** a markdown link `[text](url)`, **when** I Ctrl+Click the link text, **then** I navigate to the target (or VS Code shows its normal link behavior).
2. **Given** a markdown link or image, **when** I hover, **then** I see a useful preview (URL, title, or image preview) consistent with VS Code UX.
3. **Given** the inline-rendered view, **when** I interact with links/images, **then** behavior is consistent with other VS Code markdown/link features and does not break normal editing.

---

### User Story 3 – Editing and VS Code behavior preserved (Priority: P1)

As a user, I use the same keyboard shortcuts, multi-cursor, find/replace, and extensions I rely on in VS Code. The extension does not replace the editor surface or block standard editing; it only changes how certain markdown syntax is displayed (e.g. decorations). Cursor position, undo/redo, and file state remain correct.

**Why this priority**: “Without hiding the source or breaking normal editing” is a hard constraint; violating it would make the extension unusable for serious editing.

**Independent test**: Perform typical editing (typing, selection, multi-cursor, find/replace, undo) in a decorated markdown file; confirm no broken behavior or loss of VS Code functionality.

**Acceptance scenarios**:

1. **Given** a markdown file with inline rendering, **when** I type, select, or delete, **then** changes apply to the underlying source and undo/redo works correctly.
2. **Given** the same file, **when** I use find/replace or multi-cursor, **then** behavior matches standard VS Code and decorations do not interfere.
3. **Given** any supported markdown, **when** the extension is active, **then** cursor and range positions correspond to the real document (no offset or CRLF/LF bugs that break editing).

---

### User Story 4 – Consistent, predictable rendering (Priority: P2)

As a user, I see consistent treatment of markdown constructs: similar syntax (e.g. all headings, or all links) is rendered in a consistent way. Behavior is predictable across files and sessions (respecting settings). Edge cases (malformed markdown, very long lines, large files) do not crash the editor or corrupt the display.

**Why this priority**: Consistency and stability support trust and daily use; lower than P1 only because P1 defines the core experience.

**Independent test**: Use various markdown constructs and malformed input; confirm consistent styling and no crashes or obvious corruption.

**Acceptance scenarios**:

1. **Given** multiple headings (or links, lists) in one file, **when** the file is rendered, **then** the same construct type is styled consistently.
2. **Given** malformed or partial markdown, **when** the file is open, **then** the extension degrades gracefully (e.g. no decorations for invalid regions) and does not crash.
3. **Given** user settings for the extension, **when** settings change, **then** behavior updates predictably (e.g. enable/disable per language or globally).

---

### Edge cases

- Very long lines or very large files: parsing and decoration remain bounded; no O(n²) or unbounded work that freezes the editor.
- CRLF vs LF: position mapping is correct so decorations and link clicks align with the actual document.
- Diff views / read-only views: behavior is defined (e.g. decorations on or off, or policy documented) so the experience is consistent.
- Nested or overlapping syntax: behavior is well-defined (e.g. link inside heading); no broken decorations or wrong ranges.
- Empty or minimal documents: no errors; decorations simply empty or minimal.

---

## Requirements

### Functional requirements

- **FR-001**: The extension MUST apply inline visual treatment (e.g. hide or de-emphasize syntax) to markdown constructs such as headings, links, lists, code blocks, images, and other supported syntax so the document resembles rendered output.
- **FR-002**: The extension MUST keep the document fully editable; all text remains in the buffer and can be selected and modified using normal VS Code editing.
- **FR-003**: The extension MUST support clickable links (e.g. Ctrl+Click) and hover previews for links (e.g. URL/destination) and images (e.g. image preview) in line with VS Code conventions.
- **FR-004**: The extension MUST NOT replace the editor surface or block standard VS Code editing, shortcuts, multi-cursor, find/replace, or undo/redo.
- **FR-005**: The extension MUST use position mapping (or equivalent) so decorations and interactions respect document line endings (CRLF/LF) and cursor positions stay correct.
- **FR-006**: The extension MUST handle malformed or partial markdown without crashing; it MAY hide decorations for invalid regions or fall back to raw display.
- **FR-007**: The extension MUST use a parse cache and avoid parsing on every keystroke or selection change so that performance remains acceptable on typical documents.
- **FR-008**: The extension MUST allow revealing raw markdown (e.g. on selection) so users can see and edit the underlying syntax when needed.
- **FR-009**: Behavior and settings MUST be consistent across files and sessions and MUST be configurable where documented (e.g. enable/disable, per-language).

### Out of scope (explicit)

- Full WYSIWYG that hides source (e.g. rich-text editor): source remains visible and editable.
- Rendering of arbitrary HTML or unsafe content: rendering is limited to supported markdown and safe previews.
- Changing VS Code’s built-in markdown preview or other core editor behavior beyond decoration and link/image providers.

---

## Success criteria

### Measurable outcomes

- **SC-001**: Users can open a markdown file and immediately see headings, links, and lists styled closer to rendered output without changing editor mode.
- **SC-002**: Links are clickable and show useful hover information; images show preview on hover where supported.
- **SC-003**: Standard editing (typing, selection, multi-cursor, find/replace, undo) works correctly in decorated markdown files with no reproducible position or state bugs.
- **SC-004**: Large files (e.g. >10k lines) and malformed markdown do not cause freezes or crashes; degradation is graceful.
- **SC-005**: User feedback and support issues do not indicate confusion about “source vs preview”; the product is clearly “inline rendering while editing,” not “preview only.”

---

## Relationship to other artifacts

- **Constitution** (`.specify/memory/constitution.md`): Principles for code quality, testing, UX consistency, and performance; all implementation must align.
- **AGENTS.md**: Day-to-day development rules, project structure, and patterns; product spec is the “what,” AGENTS.md is the “how.”
- **Feature specs** (`docs/features/`, `specs/###-feature-name/spec.md`): Individual features (e.g. links, headings, tables) should trace back to this product spec and the vision above.
