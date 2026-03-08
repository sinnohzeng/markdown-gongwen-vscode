# Implementation Plan: Markdown Inline Editor (Project Technical Context)

**Date**: 2025-03-08 | **Spec**: [Product Spec](.specify/memory/product-spec.md)

**Input**: The extension is a VS Code extension written in TypeScript (strict mode). Markdown is parsed with remark; rendering is done via VS Code TextEditorDecorationType only—no custom editor or webview. Use a parse cache so the document is not re-parsed on every keystroke or selection change. Use position mapping for all ranges so CRLF and LF are handled correctly. Tests are in Jest under __tests__/ next to each module; build with esbuild. No external storage or server; all state is in the editor and VS Code workspace. Keep dependencies minimal and stick to the existing layout under src/ (parser, decorator, decorations, link/image providers, config).

---

## Summary

Inline markdown rendering in VS Code is achieved **without custom editors or webviews**: the extension uses **TextEditorDecorationType** only to hide or style syntax (e.g. transparent/faint) so the document looks closer to rendered output while remaining plain text. **Remark** parses markdown to an AST; the parser converts AST nodes to decoration ranges. A **parse cache** ensures the document is not re-parsed on every keystroke or selection change. **Position mapping** is used for all ranges so CRLF and LF are handled correctly. The stack is TypeScript (strict), Jest for tests, esbuild for bundling; there is no external storage or server—state lives in the editor and workspace. The codebase stays minimal and follows the existing `src/` layout (parser, decorator, decorations, link/image providers, config).

---

## Technical Context

| Dimension | Choice |
|-----------|--------|
| **Language/Version** | TypeScript (strict mode) |
| **Parsing** | [remark](https://github.com/remarkjs/remark) — markdown → AST |
| **Rendering** | VS Code **TextEditorDecorationType** only (no custom editor, no webview for main rendering) |
| **Storage** | None. All state is in the editor buffer and VS Code workspace (e.g. settings). |
| **Testing** | Jest; tests in `__tests__/` next to each module (`module-name.test.ts`) |
| **Build** | esbuild (compile + bundle) |
| **Target Platform** | VS Code extension host (desktop); markdown files in workspace |
| **Project Type** | VS Code extension (single package under `src/`) |
| **Performance Goals** | No parse on every keystroke/selection; acceptable responsiveness on typical docs (e.g. &lt;10k lines) |
| **Constraints** | Parse cache mandatory; position mapping for all decoration/link ranges (CRLF/LF); minimal dependencies; no O(n²) in parser path |
| **Scale/Scope** | Single extension; existing layout under `src/` (parser, decorator, decorations, link-provider, image-hover-provider, config, etc.) |

---

## Constitution Check

*GATE: All implementation must align with [.specify/memory/constitution.md](.specify/memory/constitution.md). Re-check when changing parser, decorator, or build.*

| Principle | Gate |
|-----------|------|
| **I. Code Quality** | TypeScript strict; source under `/src/` only; `npm run validate` passes before commit. |
| **II. Testing Standards** | New/changed behavior has tests in `__tests__/`; coverage maintained; VS Code API mocked where needed. |
| **III. User Experience Consistency** | Decorations and link/image behavior consistent with VS Code; graceful degradation; no crashes. |
| **IV. Performance Requirements** | Parse cache used for all document parsing; position mapping for CRLF/LF; no parse on every keystroke/selection; large-file safe. |

---

## Project Structure

### Documentation and specify (this repo)

```text
.specify/
├── memory/
│   ├── constitution.md      # Principles (quality, testing, UX, performance)
│   ├── product-spec.md      # Product vision and requirements
│   └── implementation-plan.md   # This file — technical context
└── templates/               # speckit templates (spec, plan, tasks, etc.)

specs/
└── [###-feature-name]/      # Per-feature branch
    ├── spec.md
    ├── plan.md
    ├── research.md
    ├── data-model.md
    ├── quickstart.md
    ├── contracts/
    └── tasks.md             # From /speckit.tasks

docs/
├── features/                # Feature specs (done/todo)
└── plans/                  # Analysis and design docs
```

### Source code (repository root)

```text
src/
├── extension.ts             # Entry point, activation, commands
├── config.ts                # VS Code settings access
├── parser.ts                # Main parser: AST → decoration ranges
├── parser-remark.ts         # Remark setup and utilities
├── parser/                  # Parser helpers and tests
│   └── __tests__/
├── decorations.ts           # Decoration type factories (transparent, faint, etc.)
├── decorator.ts             # Orchestration: applies decorations to editors
├── decorator/               # Decoration registry, visibility, checkbox, mermaid, etc.
│   └── __tests__/
├── markdown-parse-cache.ts  # Parse cache (use for all document parsing)
├── markdown-parse-cache/
│   └── __tests__/
├── position-mapping.ts      # CRLF/LF position mapping for ranges
├── link-provider.ts         # DocumentLinkProvider (clickable links)
├── link-provider/
│   └── __tests__/
├── link-hover-provider.ts   # Hover for link URL/destination
├── link-hover-provider/
│   └── __tests__/
├── link-click-handler.ts    # Single-click navigation
├── link-click-handler/
│   └── __tests__/
├── image-hover-provider.ts  # Hover for image preview
├── image-hover-provider/
│   └── __tests__/
├── link-targets.ts          # Resolve link/image URLs (relative, workspace)
├── link-targets/
│   └── __tests__/
├── diff-context.ts          # Diff view detection and policies
├── diff-context/
│   └── __tests__/
├── code-block-hover-provider.ts
├── emoji-map.ts / emoji-map-loader.ts
├── mermaid/                 # Mermaid diagram support (webview only for diagrams)
├── utils/
└── test/
    └── __mocks__/
        └── vscode.ts

dist/                        # Generated; do not edit
```

**Structure decision**: Single package under `src/`. Parsing and decoration are centralized (parser, decorator, markdown-parse-cache, position-mapping). Link and image behavior are in dedicated providers (link-provider, link-hover-provider, link-click-handler, image-hover-provider, link-targets). Config is centralized in `config.ts`. New features extend this layout (e.g. new providers or decorator submodules) without adding new top-level app layers or external services.

---

## Key Technical Rules (from input)

1. **Rendering**: TextEditorDecorationType only. No custom editor or webview for the main markdown rendering. (Webview is used only where required, e.g. Mermaid diagrams.)
2. **Parsing**: Always use the parse cache (`markdown-parse-cache.ts`). Never parse the full document on every keystroke or selection change.
3. **Positions**: Use position mapping for all ranges (decorations, link ranges, hovers) so CRLF and LF are handled correctly.
4. **Tests**: Jest; `__tests__/` next to each module; `module-name.test.ts`.
5. **Build**: esbuild (compile + bundle). Output in `dist/`; do not edit generated files.
6. **State**: No external storage or server. State is in the editor and VS Code workspace.
7. **Dependencies**: Keep minimal; stay within the existing src/ layout (parser, decorator, decorations, link/image providers, config).

---

## Complexity Tracking

No constitution violations are introduced by this plan. The technical context reinforces the constitution (parse cache, position mapping, Jest, strict TypeScript, existing layout). If a future feature requires an exception (e.g. new persistence or a new top-level component), document it in that feature’s plan under **Complexity Tracking** with justification.
