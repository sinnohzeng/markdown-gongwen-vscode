---
name: mermaid-inline-svg
overview: Add inline Mermaid diagram rendering for fenced ` ```mermaid ` blocks by generating SVG locally (Node + JSDOM + npm `mermaid`) and displaying it via editor decorations, while preserving the existing Raw-on-selection behavior (no hover UI).
todos:
  - id: spec-update
    content: Rewrite `docs/features/done/mermaid-diagrams.md` for inline SVG (no hover) + raw reveal acceptance criteria.
    status: completed
  - id: parser-mermaid-blocks
    content: Extend `MarkdownParser` parse output to include `mermaidBlocks` extracted from fenced `code` nodes with `lang=mermaid` and thread through cache/decorator.
    status: completed
  - id: node-renderer
    content: Implement Node+JSDOM Mermaid renderer module with strict security config and SVG→data URI helper.
    status: completed
  - id: decorator-integration
    content: Add Mermaid decoration manager (dynamic decoration types + caching) and integrate into `Decorator` update flow with raw-state suppression.
    status: completed
  - id: tests
    content: Add parser and decorator tests (mock renderer) to cover Mermaid detection and raw reveal behavior.
    status: completed
---

# Mermaid inline SVG rendering (local Node)

## Goals

- Render fenced Mermaid blocks (` ```mermaid `) as **inline SVG** in the editor.
- **No hover UI**.
- **Hide Mermaid source when not editing**, and **reveal raw markdown** when cursor/selection is inside the block (reuse the existing 3-state model behavior).
- **Local-only**: use npm dependencies, no CDN/network.

## Key constraints discovered

- The current decoration pipeline applies `Range[]` per `DecorationType` (no per-range `renderOptions`). That makes `contentIconPath` *per-block* tricky unless we either:
- create **dynamic decoration types per SVG** (Markless approach), or
- refactor the pipeline to pass `DecorationOptions[]` for Mermaid.

We’ll use **dynamic decoration types per SVG** (cached + disposed), because it avoids a large refactor.

## Reference implementation (Markless)

- Markless renders Mermaid to SVG and injects it with a decoration type that sets `before.contentIconPath`.
- See: `examples/markless/src/extension.js` (Mermaid handler around the `"mermaid"` entry).
- The injection style is encapsulated in `examples/markless/src/common-decorations.js` (`getSvgDecoration`).

## Proposed implementation (this repo)

### 1) Update the feature spec

- Update [`docs/features/done/mermaid-diagrams.md`](docs/features/done/mermaid-diagrams.md):
- Change **Overview/Implementation** from hover preview → **inline SVG replacement**.
- Update acceptance criteria to reflect: “SVG is shown inline; raw markdown is revealed on select”.

### 2) Extend parsing output to include Mermaid blocks

- Extend `ParseResult` (and cache entry) to include Mermaid block metadata:
- Add a field like `mermaidBlocks: Array<{ startPos: number; endPos: number; source: string }>`.
- Implement this inside [`src/parser.ts`](src/parser.ts) within `processCodeBlock(...)`:
- When `node.lang?.trim() === 'mermaid'`, capture:
- `startPos/endPos` matching the existing fenced-block detection (`fenceStart..closingEnd` logic already computed there).
- `source` via `node.value` (Mermaid source without fences).
- Thread this through:
- [`src/markdown-parse-cache.ts`](src/markdown-parse-cache.ts) parse entry
- [`src/decorator.ts`](src/decorator.ts) `parseDocument(...)` return value

### 3) Local Mermaid→SVG renderer (Node + JSDOM)

- Add a new module (e.g. [`src/mermaid/mermaid-renderer.ts`](src/mermaid/mermaid-renderer.ts)):
- **Dynamic import** Mermaid (likely ESM): `await import('mermaid')`.
- Create/reuse a single JSDOM instance and set the minimal globals Mermaid expects (`window`, `document`, etc.).
- Initialize Mermaid with safe defaults:
- `startOnLoad: false`
- `securityLevel: 'strict'`
- theme selection based on VS Code theme (dark vs light)
- Expose `renderSvg(source, { theme, fontFamily }) -> Promise<string>`.
- Convert SVG to a data URI helper (base64) for use in decorations.

### 4) Decoration manager for Mermaid diagrams (dynamic decoration types)

- Add a small manager class (e.g. [`src/decorator/mermaid-diagram-decorations.ts`](src/decorator/mermaid-diagram-decorations.ts)):
- Maintains a per-document LRU cache:
- key: stable hash of `(source + theme + fontFamily)`
- value: `{ decorationType, dataUri }`
- Applies each diagram using `editor.setDecorations(decorationType, [range])`.
- Disposes decoration types no longer used after updates.
- Decoration style mirrors Markless’ technique:
- Make underlying text effectively invisible (transparent + zero width)
- Show SVG using `before.contentIconPath`

### 5) Integrate into the existing decoration update flow

- Update [`src/decorator.ts`](src/decorator.ts):
- After standard decoration application, call an async `updateMermaidDiagrams(...)`.
- Ensure cancellation/staleness protection using document version.
- Respect Raw behavior:
- If any selection/cursor is **inside** the Mermaid block range, skip applying the diagram decoration for that block (so the raw fenced block is visible while editing).
- Clear Mermaid decorations when:
- decorations are toggled off
- diff mode decorations are skipped
- editor changes

### 6) Dependencies

- Add npm dependencies in `package.json`:
- `mermaid`
- `jsdom`
- Keep everything local; no CDN usage.

### 7) Tests

- Parser tests:
- Extend [`src/parser/__tests__/parser-scopes.test.ts`](src/parser/__tests__/parser-scopes.test.ts) or add a new test to verify `mermaidBlocks` extraction (positions + `source`).
- Decorator tests:
- Add tests under [`src/decorator/__tests__/`](src/decorator/__tests__/) verifying:
- Mermaid diagram decoration is applied when cursor is outside the block.
- Mermaid diagram decoration is **not** applied when cursor/selection intersects the block (Raw behavior).
- Mock Mermaid renderer to return a stable SVG string (avoid heavy real rendering in Jest).

## Notes / risks

- Node+JSDOM Mermaid rendering can be version-sensitive. We’ll keep the integration isolated in a single renderer module so it’s easy to adjust.
- Decoration “replacement” is limited by what VS Code decorations can do; we’ll aim for a practical visual replacement (SVG shown inline, source hidden when not editing).