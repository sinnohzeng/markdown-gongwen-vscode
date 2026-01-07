# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - Unreleased

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

[1.5.0]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/compare/v1.4.0...HEAD
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

