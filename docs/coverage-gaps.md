# Coverage Gaps

Files excluded from the Jest coverage gate and the reason why unit testing them is not feasible in a pure Node/Jest environment.

## Excluded from coverage collection

### `src/extension.ts` — VS Code activation entry point

This file calls `vscode.extensions.getExtension`, registers event listeners, creates disposables via `vscode.window` and `vscode.workspace`, and initialises the Mermaid renderer. All of these require a live VS Code extension host. The `activate` and `deactivate` exports have no logic that can run outside VS Code. Integration coverage belongs in the e2e test suite (see `src/test/e2e/`).

### `src/mermaid/**` — Webview and Mermaid integration

Mermaid rendering invokes headless Chromium via Puppeteer (or the VS Code webview API), fetches remote scripts, and manipulates SVG/DOM. None of this is available in a Node test process without a browser binary, and mocking the entire rendering pipeline would test the mocks rather than the implementation. The module is verified by the e2e tests and manual smoke-testing.

### `src/code-block-hover-provider.ts` — Hover provider requiring VS Code + Mermaid

`CodeBlockHoverProvider` implements `vscode.HoverProvider` and directly calls `renderMermaidSvgNatural`, `svgToDataUri`, and Cheerio to build hover previews. It depends on both the Mermaid/Chromium renderer and VS Code's provider API, making isolated unit testing impractical for the same reasons as `src/mermaid/**`.

### `src/decorator/decoration-type-registry.ts` — VS Code decoration type factory

This file calls `vscode.window.createTextEditorDecorationType` for every decoration type in the system. That API creates real OS-level resources inside VS Code and returns opaque handles. The mock in `src/test/__mocks__/vscode.ts` provides a stub, but the registry file itself is only ever instantiated from `Decorator`, which is already excluded from high-coverage expectations because it requires VS Code event subscriptions.

### `src/math/math-decorations.ts` — Math rendering with VS Code editor APIs

`math-decorations.ts` reads `workspace.getConfiguration('editor')` for font size and line height, calls `window.activeColorTheme.kind` for theme detection, and calls `renderMathToDataUri` (KaTeX). Its logic is tightly coupled to the VS Code window state (active editor, theme) and the math renderer output. The math renderer itself is tested in `src/math/__tests__/`, covering the core rendering logic.

### `src/forge-context.ts` — Git/workspace context detection

`forge-context.ts` uses `child_process.execSync` to run `git remote get-url origin` and reads `.git/` files from the filesystem. It also calls `vscode.workspace.getWorkspaceFolder`. Meaningfully testing these paths requires a real git repository on disk and a VS Code workspace context. The function is integration-tested indirectly via the e2e suite. A thin unit test exists in `src/forge-context/__tests__/` covering the URL parsing helpers.

### `src/github-context.ts` — VS Code extension API calls

This file is a thin re-export shim over `forge-context.ts` that provides backwards-compatible named exports (`getGitHubContext`, `parseGitHubRemoteUrl`). It has no own logic and is excluded to avoid double-counting the already-excluded `forge-context.ts` lines.

---

## Files below 80% (included in coverage)

These files are in the coverage collection but fall below 80% because specific code paths depend on VS Code APIs or require complex integration state.

### `src/decorator.ts` (~62%)

The `Decorator` class is the central orchestrator that subscribes to VS Code events (`onDidChangeActiveTextEditor`, `onDidChangeTextEditorSelection`, `onDidChangeTextDocument`), calls `setDecorations` on real `TextEditor` instances, manages async update queues, and initialises `DecorationTypeRegistry`. Most of these paths require a live VS Code instance. The business logic within decorating (filtering, scoping, range computation) is extracted into `visibility-model.ts` and tested there. Lines in `decorator.ts` that are untested are event subscription callbacks, `setDecorations` calls, and the theme-change reload path.

### `src/diff-context.ts` (~73%)

The `isDiffLikeUri` function includes branches that inspect `uri.query` and `uri.fragment`. The VS Code mock in `src/test/__mocks__/vscode.ts` does not populate those properties (they are `undefined` in the test environment), so those specific branches (lines 16-28) cannot be reached without extending the mock or using a VS Code instance that produces real URI objects.

### `src/parser-remark.ts` (~67%)

The synchronous require path (`require('unified')`) succeeds in Jest when the modules are installed as CommonJS, so after calling `getRemarkProcessorSync()` the cached value is reused by `getRemarkProcessor()`. The fallback ESM dynamic-import branch inside the `catch` block is therefore not exercised in practice — the try always succeeds. Covering it would require forcing a CJS require failure, which is not practical without module mocking at the Node internals level.

---

## How to improve

| File | What would make it testable |
|------|----------------------------|
| `src/extension.ts` | Extract activation logic into a plain function that accepts injected dependencies (window, workspace, context). The injected version can be unit-tested; the thin wrapper calls VS Code APIs. |
| `src/mermaid/**` | Dependency-inject the Puppeteer launcher so tests can supply a mock browser, or split the SVG post-processing (pure functions) into a separate module that is tested independently. |
| `src/code-block-hover-provider.ts` | Accept a `renderFn` parameter instead of calling `renderMermaidSvgNatural` directly, and inject a `MarkdownParseCache` interface. The hover logic (hover range computation, HTML construction) can then be tested with mocked I/O. |
| `src/decorator/decoration-type-registry.ts` | Abstract the `createTextEditorDecorationType` call behind an injectable factory function, and use the existing mock implementation in tests. |
| `src/math/math-decorations.ts` | Extract `getEditorHeights()` and the color resolution logic into pure functions that take configuration values as parameters. Test those functions directly; the VS Code-specific callers remain untested. |
| `src/forge-context.ts` | Inject the `execSync` and `fs` dependencies so tests can provide a fake git output without spawning a real subprocess. The URL parsing and context-assembly logic is already partially tested. |
| `src/diff-context.ts` (query/fragment branches) | Extend the URI mock to accept a query string and fragment, or pass a hand-crafted plain object with `query` and `fragment` set. |
