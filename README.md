# Markdown Inline Editor [![CI/CD Status][ci-img]][ci] [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.txt)

<img src="assets/icon.png" align="right" alt="Extension Icon" width="120" height="120">

**Write Markdown like a rich text editor** – see **bold**, *italic*, and `code` styled inline while syntax markers stay hidden. Intelligent 3-state syntax shadowing adapts to your editing context. Your files remain 100% standard `.md`.

**Why?** Less clutter, more focus. Git-friendly. Works everywhere.

## ✨ Key Features

* **Intelligent Syntax Shadowing** – 3-state model (Rendered / Ghost / Raw) adapts syntax visibility to your editing context
* **Hide syntax** – No more `**`, `~~`, backticks cluttering your view when reading
* **Smart reveal** – Click any text to instantly see/edit raw Markdown  
* **Ghost state** – Faint syntax markers appear when cursor is on a line, providing edit cues without clutter
* **Emoji shortcodes** – Optional rendering for `:smile:` / `:+1:` style shortcodes
* **Fast** – Intelligent caching, no lag on selection changes
* **Compatible** – Standard `.md` files, works with any tool
* **Theme-aware** – Automatically adapts to your VS Code theme
* **Works out of the box** – With optional settings when you want them

## Demo

<p align="center" style="max-width:100%; margin-left:auto; margin-right:auto;">
  <img src="assets/autoplay-demo.gif" alt="Markdown Inline Editor Demo" width="70%" loading="eager"><br>
  <span style="display:block; font-size:90%; color:#888; margin-top:8px;">
    <em>Figure: Interactive demo—see formatting applied inline, reveal raw Markdown with a click, and watch the extension adapt instantly to color theme changes.</em>
  </span>
</p>

## Video Demos

<table align="center" style="width:100%; border:none;">
  <tr>
    <td align="center" style="width:50%; padding:0 1%;">
      <video src="https://github.com/user-attachments/assets/9898d617-acbb-4e81-944b-623d545a29ce" controls style="width:100%; max-width:100%; height:auto; border-radius:4px;"></video>
    </td>
    <td align="center" style="width:50%; padding:0 1%;">
      <video src="https://github.com/user-attachments/assets/c9025dd2-c2ca-44e5-a501-c9638a5e60cc" controls style="width:100%; max-width:100%; height:auto; border-radius:4px;"></video>
    </td>
  </tr>
</table>
<p align="center">
  <em style="font-size:90%; color:#888;">Left: Mermaid inline rendering from code blocks</em> • 
  <em style="font-size:90%; color:#888;">Right: Checkbox interaction and syntax shadowing</em><br>
</p>

## Get Started: Install the Extension

1. **Install** the extension from:
   - [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=CodeSmith.markdown-inline-editor-vscode)
   - [OpenVSX Registry](https://open-vsx.org/extension/CodeSmith/markdown-inline-editor-vscode)
   - [Github Releases](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/releases)
2. **Open** any `.md` file
3. **Start typing** – formatting appears automatically with syntax hidden (Rendered state)
4. **Move cursor** – Faint syntax markers appear on active lines (Ghost state)
5. **Click/select text** – Raw Markdown syntax becomes fully visible for editing (Raw state)
6. **Toggle anytime** – Click the toolbar button or use `Ctrl+Shift+P` / `Cmd+Shift+P` → "Toggle Markdown Decorations"

## Recommended Extensions

Enhance your Markdown workflow with these complementary extensions:

- **[Markdown All in One](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one)**
    - Keyboard shortcuts (e.g., <kbd>Alt</kbd>+<kbd>C</kbd> to toggle checkboxes)
    - Auto-formatting, table of contents, preview, and more

- **[Mermaid Chart](https://marketplace.visualstudio.com/items?itemName=MermaidChart.vscode-mermaid-chart)**
    - Create and edit diagrams directly within Markdown
    - Preview and quickly iterate on charts

## 🎯 Syntax Shadowing: 3-State Model

The extension uses an intelligent **3-state syntax shadowing system** that adapts syntax visibility based on your editing context:

### **Rendered State** (Default)
- Syntax markers are **hidden** – see only formatted content
- Clean, distraction-free reading experience
- Example: `**bold**` appears as **bold** with no visible markers

### **Ghost State** (Cursor on line)
- Syntax markers appear **faintly** (30% opacity by default, configurable)
- Provides edit cues without cluttering the view
- Only applies to constructs on the active line, not the entire document
- Example: Cursor on a line with `**bold**` shows faint `**` markers

### **Raw State** (Cursor/selection inside construct)
- Syntax markers are **fully visible** for direct editing
- Precise scope detection – only the specific construct you're editing shows raw
- Example: Cursor inside `**bold**` reveals the full `**bold**` syntax

**Special behavior for structural markers:**
- **Blockquotes, lists, and checkboxes** stay fully rendered on active lines unless you directly click on the marker
- **Headings** show raw `#` markers and remove styling when cursor is on the heading line
- **Ordered list numbers** always remain visible

Configure ghost opacity: `markdownInlineEditor.decorations.ghostFaintOpacity` (default: 0.3)
Configure emoji shortcodes: `markdownInlineEditor.emojis.enabled` (default: true)

## Supported Features

The extension supports the following Markdown (and common GitHub-flavored) features with inline rendering and syntax hiding. Formatting appears inline while syntax markers stay hidden—click any text to reveal and edit raw Markdown.

### Text Formatting
* [x] **Bold** (`**text**`) • [Details](docs/features/done/bold.md)
* [x] **Italic** (`*text*`) • [Details](docs/features/done/italic.md)
* [x] **Bold + Italic** (`***text***`) • [Details](docs/features/done/bold-italic.md)
* [x] **Strikethrough** (`~~text~~`) • [Details](docs/features/done/strikethrough.md)
* [x] **Inline Code** (`` `code` ``) • [Details](docs/features/done/inline-code.md)

### Structure
* [x] **Headings** (`# H1` through `###### H6`) • [Details](docs/features/done/headings.md)
* [x] **Links** (`[text](url)`) • [Details](docs/features/done/links.md)
* [x] **Images** (`![alt](img.png)`) • [Details](docs/features/done/images.md)
* [x] **Blockquotes** (`> quote`) • [Details](docs/features/done/blockquotes.md)
* [x] **Horizontal Rules** (`---`, `***`, `___`) • [Details](docs/features/done/horizontal-rules.md)

### Lists
* [x] **Unordered Lists** (`-`, `*`, `+`) • [Details](docs/features/done/unordered-lists.md)
* [x] **Task Lists** (`- [ ]` / `- [x]`) • [Details](docs/features/done/task-lists.md)

### Code
* [x] **Code Blocks** (`` ```lang ``) • [Details](docs/features/done/code-blocks.md)
* [x] **YAML Frontmatter** • [Details](docs/features/done/yaml-frontmatter.md) • [Issue #27](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/27)
* [x] **Emoji Support** (`:smile:`) • [Details](docs/features/done/emoji-support.md) • [Issue #30](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/30)
* [x] **Mermaid Diagrams** (`` ```mermaid ``) • [Details](docs/features/done/mermaid-diagrams.md) • [Issue #26](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/26)

### Configuration
* [x] **Show Raw Markdown in Diffs** • [Details](docs/features/done/show-raw-markdown-in-diffs.md) • [Issue #20](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/20)

## Settings (Optional)

All settings are under the `Markdown Inline Editor` section in VS Code Settings (search for `markdownInlineEditor`).

### Appearance

- `markdownInlineEditor.decorations.ghostFaintOpacity` (default: `0.3`): Opacity of faint “ghost” markers on the active line.
- `markdownInlineEditor.decorations.frontmatterDelimiterOpacity` (default: `0.3`): Opacity of YAML frontmatter `---` delimiters.
- `markdownInlineEditor.decorations.codeBlockLanguageOpacity` (default: `0.3`): Opacity of fenced code block language identifiers (e.g. ```ts).

### Behavior

- `markdownInlineEditor.defaultBehaviors.diffView.applyDecorations` (default: `false`): Apply decorations in diff views (off by default to make reviews easier).
- `markdownInlineEditor.links.singleClickOpen` (default: `false`): Open links/images with a single click (may interfere with text selection).
- `markdownInlineEditor.emojis.enabled` (default: `true`): Render emoji shortcodes like `:smile:` inline.

## Upcoming Features

### Work in progress
* [ ] **Set Default Feature Activation** – Allow users to configure which Markdown features are decorated/enabled by default (e.g., selectively apply decorators for headings, bold, italic, etc.) • [Details](docs/features/todo/default-feature-activation.md)

### High Priority
* [ ] **Tables** • [Details](docs/features/todo/tables.md) • [Issue #23](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/23)
* [x] **Autolinks** • [Details](docs/features/done/autolinks.md) • [Issue #24](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/24)
* [x] **Mermaid Diagrams** • [Details](docs/features/done/mermaid-diagrams.md) • [Issue #26](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/26)
* [ ] **LaTeX/Math** • [Details](docs/features/todo/latex-math.md) • [Issue #6](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/6)

### Medium Priority
* [ ] **Per-File Toggle State** • [Details](docs/features/todo/per-file-toggle-state.md) • [Issue #28](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/28)
* [ ] **Column alignment in tables with markup** • [Details](docs/features/todo/table-column-alignment.md) • [Issue #21](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/21)

### Low Priority
* [ ] **HTML Tags** • [Details](docs/features/todo/html-tags.md) • [Issue #29](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/29)
* [ ] **Mentions/References** • [Details](docs/features/todo/mentions-references.md) • [Issue #25](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/25)
* [ ] **Ordered List Auto-Numbering** • [Details](docs/features/todo/ordered-list-auto-numbering.md) • [Issue #31](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/31)
* [ ] **Footnotes** • [Details](docs/features/todo/footnotes.md) • [Issue #32](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/32)

## Getting Started (Developers)

### Quick Setup (TLDR)

```bash
git clone https://github.com/SeardnaSchmid/markdown-inline-editor-vscode.git
cd markdown-inline-editor-vscode
npm install
npm run compile
npm test
```

Press `F5` to launch the Extension Development Host and test your changes.

### Dependencies

**Key Technologies:**
- **TypeScript** 5.9+ – Type-safe development
- **VS Code API** 1.88.0+ – Editor integration and decoration system
- **[remark](https://github.com/remarkjs/remark)** – Markdown parser for precise AST-based parsing
- **[unified](https://github.com/unifiedjs/unified)** – AST processing framework
- **[remark-gfm](https://github.com/remarkjs/remark-gfm)** – GitHub Flavored Markdown support
- **Jest** – Testing framework

**Runtime Requirements:**
- **Node.js** 20 or higher
- **VS Code** 1.88.0+ (or Cursor IDE)

**Production Dependencies:**
- `remark-gfm`, `remark-parse`, `unified`, `unist-util-visit`

**Development Dependencies:**
- TypeScript, Jest, ESLint, VS Code extension tools

### Architecture

```
src/
├── extension.ts          # Extension entry point and activation
├── config.ts             # Centralized configuration access
├── diff-context.ts       # Unified diff view detection and policy
├── link-targets.ts       # Unified link/image URL resolution
├── markdown-parse-cache.ts # Shared parsing and caching service
├── parser.ts             # Markdown AST parsing (remark-based)
├── parser-remark.ts     # Remark dependency helper
├── decorations.ts        # VS Code decoration type definitions
├── decorator.ts          # Decoration orchestration
├── decorator/
│   ├── decoration-type-registry.ts  # Decoration type lifecycle
│   ├── visibility-model.ts          # 3-state filtering logic
│   ├── checkbox-toggle.ts           # Checkbox click handling
│   └── decoration-categories.ts    # Decoration type categorization
├── link-provider.ts      # Clickable link provider
├── link-hover-provider.ts # Hover provider for link URLs
├── image-hover-provider.ts # Hover provider for image previews
├── link-click-handler.ts # Single-click navigation handler
├── position-mapping.ts   # Position mapping utilities (CRLF handling)
└── */__tests__/         # Comprehensive test suites
    ├── parser/__tests__/              # Parser tests
    ├── markdown-parse-cache/__tests__/ # Parse cache tests
    ├── diff-context/__tests__/        # Diff context tests
    ├── link-targets/__tests__/        # Link target resolution tests
    ├── link-provider/__tests__/       # Link provider tests
    ├── image-hover-provider/__tests__/ # Image hover tests
    ├── link-hover-provider/__tests__/  # Link hover tests
    └── link-click-handler/__tests__/   # Click handler tests
```

**How it works:**
1. **Parser** (`parser.ts`) – Uses remark to parse Markdown into an AST and extract scopes
2. **Shared Cache** (`markdown-parse-cache.ts`) – Single parse cache instance shared across all components
3. **Decorator** (`decorator.ts`) – Orchestrates decoration management with 3-state syntax shadowing
4. **Scope-based detection** – Precisely identifies markdown constructs for context-aware syntax visibility
5. **3-state model** – Rendered (hidden), Ghost (faint), Raw (visible) states adapt to editing context
6. **Hover providers** – Show image previews and link URLs on hover (use shared cache)
7. **Click handler** – Optional single-click navigation for links and images (uses shared cache)

### Testing

The project maintains comprehensive test coverage with **438+ passing tests** across 33 test suites:

- **Parser tests** (`parser/__tests__/`) – Core markdown parsing logic
- **Parse cache tests** (`markdown-parse-cache/__tests__/`) – Shared caching and LRU eviction
- **Diff context tests** (`diff-context/__tests__/`) – Diff view detection and policy
- **Link target tests** (`link-targets/__tests__/`) – Link/image URL resolution
- **Image hover provider tests** (`image-hover-provider/__tests__/`) – Image preview hover functionality
- **Link hover provider tests** (`link-hover-provider/__tests__/`) – Link URL hover functionality
- **Link click handler tests** (`link-click-handler/__tests__/`) – Single-click navigation behavior
- **Link provider tests** (`link-provider/__tests__/`) – Clickable link provider functionality

Run tests with `npm test` or `npm run test:watch` for development.

### Installing

```bash
npm install
```

### Key Commands

| Command                 | Description                             |
| ----------------------- | --------------------------------------- |
| `npm run compile`       | Compile TypeScript to JavaScript        |
| `npm run bundle`        | Bundle with esbuild                     |
| `npm test`              | Run all tests                           |
| `npm run test:watch`    | Run tests in watch mode                 |
| `npm run test:coverage` | Generate coverage report                |
| `npm run lint`          | Run ESLint                              |
| `npm run validate`      | Run docs lint + tests + build           |
| `npm run package`       | Create `.vsix` package                  |
| `npm run clean`         | Clean build artifacts                   |
| `npm run build`         | Full build (compile + bundle + package) |
| `npm run release`       | Automated release workflow              |

### Executing

**Option 1: VS Code Launch Configuration**

Create `.vscode/launch.json` with the extension host configuration, then press `F5` to launch the Extension Development Host.

**Option 2: Manual Build & Test**

```bash
npm run compile
npm run package
code --install-extension dist/extension.vsix
```

## Contributing

Contributions are welcome! This project follows [Conventional Commits](https://www.conventionalcommits.org/) and maintains high code quality standards.

### Quick Start

```bash
git checkout -b feat/my-feature
# Make changes, write tests
npm test && npm run lint
git commit -m "feat(parser): add support for definition lists"
```

### Contribution Guidelines (TLDR)

- **Read first:** [`CONTRIBUTING.md`](CONTRIBUTING.md) for detailed workflow
- **Code style:** TypeScript strict mode, JSDoc comments, comprehensive tests
- **Commit format:** `<type>(<scope>): <description>`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
- **Testing:** All changes must include tests
- **Performance:** No regressions – maintain efficient code execution

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for full contribution guidelines and [`AGENTS.md`](AGENTS.md) for agent roles and architecture details.

## Known Limitations & Reporting Bugs

### Known Limitations

- **Ordered lists** – Currently displayed as-is (auto-numbering planned)
- **Tables** – Table syntax hiding is in progress
- **Mermaid diagrams** – ✅ Fully implemented with inline rendering and hover preview
- **Math formulas** – KaTeX/MathJax support is planned
- **H1 heading clipping** – Text goes out of window when H1 is on first line – [#4](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/4)

### Reporting Bugs

If you encounter an issue not covered in the [FAQ](docs/FAQ.md), please [open an issue](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues) with:
- VS Code version
- Extension version
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots if applicable

For common issues and solutions, see the [FAQ](docs/FAQ.md).

## License

MIT License – See [LICENSE.txt](LICENSE.txt)

## Acknowledgments

Special thanks to these projects, which inspired or enabled this extension:

- [markdown-inline-preview-vscode](https://github.com/domdomegg/markdown-inline-preview-vscode) by [domdomegg](https://github.com/domdomegg) – Original concept and codebase for using VS Code decorations to hide markdown syntax (MIT License, Copyright (c) Adam Jones (domdomegg))
- [Markdown Inline Preview](https://marketplace.visualstudio.com/items?itemName=markdown-inline-preview.markdown-inline-preview) by [markdown-inline-preview](https://marketplace.visualstudio.com/publishers/markdown-inline-preview) – Horizontal rule implementation using border-bottom approach that prevents editor width expansion
- [Markdown WYSIWYG](https://marketplace.visualstudio.com/items?itemName=remcohaszing.markdown-decorations) by [remcohaszing](https://github.com/remcohaszing) – Decoration-based markdown editor with similar approach
- [markless](https://github.com/tejasvi/markless) by [tejasvi](https://github.com/tejasvi) – Advanced decoration-based markdown editor with Mermaid and LaTeX support
- [Typora](https://typora.io/) – Original inspiration for the inline markdown editing concept
- [Obsidian](https://obsidian.md/) – Markdown-based knowledge management application that inspired the editing experience

[ci-img]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/actions/workflows/ci.yaml/badge.svg
[ci]: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/actions/workflows/ci.yaml




test
[1.14.0-overview.webm](https://github.com/user-attachments/assets/8bad925d-1538-4105-b5b5-c8db493f9734)



