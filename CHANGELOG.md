# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.9.0] - 2026-01-18

### Added
- Enhanced syntax shadowing behavior for leading structural markers
  - Blockquote bars, list bullets, and checkbox icons now stay fully rendered on active lines
  - Raw syntax only appears when caret/selection directly overlaps the marker characters
  - Headings show raw `#` markers and remove heading styling when cursor is on the heading line
  - Ordered list numbers remain always visible (no ghost/raw behavior)

### Added
- Syntax Shadowing Milestone 2: 3-state model (Rendered / Ghost / Raw)
  - Implements scope-based detection for precise syntax marker visibility
  - **Rendered state (default)**: Syntax markers hidden, only formatted content visible
  - **Ghost state**: Cursor on line but not inside construct - markers show at reduced opacity (configurable via `markdownInlineEditor.decorations.ghostFaintOpacity`, default: 0.3)
  - **Raw state**: Cursor/selection inside construct - markers fully visible for editing
  - Uses smallest containing scope for cursor positions, preventing multi-line constructs from being revealed when cursor is only on one line
  - Configuration setting `markdownInlineEditor.decorations.ghostFaintOpacity` to control ghost state opacity (0.0-1.0, default: 0.3)

### Removed
- `markdownInlineEditor.defaultBehaviors.editor.applyDecorations` setting
  - This setting was redundant since users can toggle decorations via the command (`mdInline.toggleDecorations`)
  - Decorations are enabled by default, and users can toggle them on/off as needed
  - The diff view setting (`defaultBehaviors.diffView.applyDecorations`) remains as it serves a distinct purpose

## [1.8.0] - 2026-01-10

### Added
- Theme-aware background colors for inline code blocks
  - Dark themes: Automatically lighten inline code background (~30% brighter)
  - Light themes: Automatically darken inline code background (~30% darker)
- Automatic theme change detection - inline code colors update immediately when switching themes
- Theme change listener that recreates decorations without requiring restart

### Changed
- Improve inline code visibility in dark themes with better contrast
- Remove borders from inline code decorations for cleaner appearance
- Extract theme detection logic into reusable `isDarkTheme()` helper function
- Extract brightness overlay opacity into `BRIGHTNESS_OVERLAY_OPACITY` constant for maintainability

## [1.7.4] - 2026-01-10

### Changed
- Add bold font weight to checkbox decorations for better visibility

## [1.7.3] - 2026-01-09

### Fixed
- Fix table of contents links broken with CRLF line endings (Issue #33)
- Links in table of contents now work correctly regardless of line ending format (LF or CRLF)

### Changed
- Extract position mapping utility to shared module (`position-mapping.ts`)
- Improve code maintainability by eliminating duplication between Decorator and MarkdownLinkProvider

### Documentation
- Update architecture documentation to include `position-mapping.ts` utility
- Update project structure in AGENTS.md to reflect new file organization
- Fix incorrect Issue #33 reference in README.md

## [1.7.2] - 2026-01-09

### Changed
- Standardize list markers in README (use asterisks for consistency)

## [1.7.1] - 2026-01-09

### Documentation
- Add OpenVSX Registry link to installation instructions
- Add GitHub Releases link to installation section

## [1.7.0] - 2026-01-09

### Added
- YAML Frontmatter support - Detect and highlight YAML frontmatter blocks at document start
- Frontmatter blocks are highlighted with background color (similar to code blocks)
- Delimiters remain visible while entire block is styled
- Support for CRLF line endings in frontmatter
- Comprehensive validation of frontmatter format (closing delimiter must be `---` with optional whitespace only)

## [1.6.1] - 2026-01-09

### Fixed
- Fix release pipeline issue

## [1.6.0] - 2026-01-09

### Added
- Default behaviors settings for diff view
- `markdownInlineEditor.defaultBehaviors.diffView.applyDecorations` setting (default: false)
- Automatic detection of diff views (Git, merge editor, Copilot inline diffs)
- Support for side-by-side diff views with decorations disabled on both sides
- Raw markdown display in diff views by default for easier change review

### Changed
- Diff views now show raw markdown syntax by default instead of rendered decorations
- Settings organized into hierarchical structure (Default Behaviors > Diff View / Editor)

## [1.5.1] - 2026-01-07

### Fixed
- Remove explicit color override for H4-H6 headings to respect editor theme

## [1.5.0] - 2026-01-07

### Added
- Task list enhancements with GFM compliance
- Automated npm audit fix workflow with test verification
- Feature implementation table documentation
- Acknowledgements and license attribution

### Fixed
- Prevent horizontal rule from expanding editor width
- Prevent ordered lists from being replaced with bullet points
- Fix npm audit vulnerabilities

### Changed
- Reduce horizontal rule border width to 1px
- Use ThemeColor for horizontal rule border styling

### Documentation
- Add implemented features documentation
- Split features into separate files
- Update README.md with enhanced Markdown features section
- Add workflow chart design guidelines
- Reorganize documentation structure
- Remove obsolete documentation files

## [1.4.0] - 2025-12-25

### Added
- Toggle checkbox on click in markdown editor

### Fixed
- Make toggle work only on mouse click
- Resolve all ESLint warnings and improve config
- Downgrade VS Code engines and fix Jest test script

### Changed
- Adjust dependency strategy and add Dependabot

### Performance
- Reduce extension size from 8MB to 328KB by excluding demo assets

## [1.3.12] - 2025-12-21

### Performance
- Reduce extension size from 8MB to 328KB by excluding demo assets

## [1.3.11] - 2025-12-21

### Documentation
- Fix image layout in README
- Update README

## [1.3.10] - 2025-12-21

_No changes documented_

## [1.3.9] - 2025-12-21

### Documentation
- Update README links and assets

## [1.3.8] - 2025-12-21

_No changes documented_

## [1.3.7] - 2025-12-21

_No changes documented_

## [1.3.6] - 2025-12-21

### Changed
- Rename images folder to assets

## [1.3.5] - 2025-12-19

### Fixed
- Handle CRLF line endings correctly in decorator

## [1.3.4] - 2025-12-19

### Changed
- Split CD jobs into separate vsce and ovsx jobs

## [1.3.3] - 2025-12-19

### Fixed
- Use npx vsce instead of global vsce command in CI

## [1.3.2] - 2025-12-19

### Added
- OpenVSX publish step and inline deploy commands in CI
- Comprehensive CONTRIBUTING.md guide
- Issue templates

## [1.3.1] - 2025-12-19

### Fixed
- Bundle runtime deps for packaged extension

## [1.3.0] - 2025-12-19

### Added
- Configurable heading line height support

### Performance
- Implement phase 1 parser optimizations
- Implement high-impact performance optimizations

## [1.2.0] - 2025-12-19

_No changes documented_

## [1.1.5] - 2025-12-19

### Documentation
- Replace video files with optimized GIF

## [1.1.4] - 2025-12-19

### Changed
- Add MP4 video format

## [1.1.3] - 2025-12-19

### Fixed
- Remove Open VSX publishing from deploy workflow

## [1.1.1] - 2025-12-19

### Changed
- Update version and readme.md with example videos/images
- Remove Open VSX publishing from deploy script

### Documentation
- Improve README structure and add @docs agent
- Add clarifying comments for CD job conditions in CI
- Fix formatting of secrets in CI workflow for consistency
- Remove obsolete LICENSE files and test validation reports
- Update package-lock.json and CI workflows for security audits
- Update README and version for Markdown Inline Editor

### Changed
- Refactor heading decoration types and enhance markdown parser functionality
- Refactor decoration types and enhance code block handling in markdown parser

### Added
- Additional decoration types for markdown syntax in the editor
- Blockquote decoration support in MarkdownParser and related components
- Blockquote processing in MarkdownParser and refine emphasis handling
- Link navigation and decoration improvements

### Fixed
- Heading whitespace visualization issue in markdown parser

### Documentation
- Remove outdated test report files and associated JavaScript logic
- Update PARSER_IMPROVEMENTS.md to reflect completion of parser optimization tasks
- Update PERFORMANCE_IMPROVEMENTS.md to indicate completion of caching parsed decorations

## [1.1.0] - 2025-12-19

### Added
- Initial release of Markdown Inline Editor
- WYSIWYG inline markdown editor functionality
- Hide markdown syntax, focus on content
- Support for various markdown elements:
  - Headings
  - Bold and italic text
  - Code blocks and inline code
  - Links
  - Images
  - Blockquotes
  - Task lists (checkboxes)
  - Strikethrough

[1.8.0]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.7.4...v1.8.0
[1.9.0]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.8.0...v1.9.0
[1.8.0]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.7.4...v1.8.0
[1.7.4]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.7.3...v1.7.4
[1.7.3]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.7.2...v1.7.3
[1.7.2]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.7.1...v1.7.2
[1.7.1]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.7.0...v1.7.1
[1.7.0]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.6.1...v1.7.0
[1.6.1]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.5.1...v1.6.0
[1.5.1]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.5.0...v1.5.1
[1.7.3]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.7.2...v1.7.3
[1.7.2]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.7.1...v1.7.2
[1.7.1]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.7.0...v1.7.1
[1.7.0]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.6.1...v1.7.0
[1.6.1]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.5.1...v1.6.0
[1.5.1]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.3.12...v1.4.0
[1.3.12]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.3.11...v1.3.12
[1.3.11]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.3.10...v1.3.11
[1.3.10]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.3.9...v1.3.10
[1.3.9]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.3.8...v1.3.9
[1.3.8]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.3.7...v1.3.8
[1.3.7]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.3.6...v1.3.7
[1.3.6]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.3.5...v1.3.6
[1.3.5]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.3.4...v1.3.5
[1.3.4]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.3.3...v1.3.4
[1.3.3]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.3.2...v1.3.3
[1.3.2]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.1.5...v1.2.0
[1.1.5]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.1.4...v1.1.5
[1.1.4]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.1.3...v1.1.4
[1.1.3]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.1.1...v1.1.3
[1.1.1]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/releases/tag/v1.1.0

