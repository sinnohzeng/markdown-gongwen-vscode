# Issue #50 — Mermaid chart not restricted by editor view width

## Summary

Wide Mermaid diagrams (e.g. large flowcharts, gantt charts, sequence diagrams with many participants) previously overflowed the editor viewport, causing horizontal scrolling and visual clutter.

## Root cause

`svg-processor.ts` calculated a `calculatedWidth` from the SVG's `viewBox` / `width` attributes and wrote it directly to the `width` attribute of the output `<svg>` element. There was no upper-bound check, so a diagram that was intrinsically 3 000 px wide would be rendered at 3 000 px regardless of the editor pane width.

## Fix

Three files were changed:

### `src/mermaid/svg-processor.ts`

A `maxWidth?: number` parameter was added to `processSvg`. After the existing width calculation logic runs, if `calculatedWidth > maxWidth` the SVG is scaled down proportionally:

```ts
if (maxWidth !== undefined && calculatedWidth > maxWidth) {
  const scale = maxWidth / calculatedWidth;
  finalWidth  = maxWidth;
  finalHeight = Math.round(height * scale);   // aspect ratio preserved
}
```

### `src/mermaid/mermaid-renderer.ts`

- `maxWidth` is threaded through `getMermaidDecoration` and its memoisation wrapper.
- The value is estimated from the editor's font size setting using a standard monospace character-width heuristic and a default column count:

```ts
const maxWidth = Math.round(fontSize * 0.6 * 90);
// e.g. 14px font → 14 × 0.6 × 90 = 756 px
```

This is a conservative but generous column count (90) so normal diagrams are never clipped, while truly oversized ones are capped.

- The `fontSize` read was moved above the `lineHeight` block so it can be reused for both calculations.

### `src/mermaid/__tests__/svg-processor.test.ts` *(new file)*

Six unit tests covering:

| Scenario | Expected behaviour |
|---|---|
| No `maxWidth`, normal diagram | Width scales proportionally from aspect ratio |
| No `maxWidth`, very wide diagram | Rendered at full intrinsic width (no constraint) |
| `maxWidth` set, diagram fits | No scaling applied |
| `maxWidth` set, diagram wider | Width clamped, height scaled proportionally |
| Gantt-style extremely wide | Width clamped to 756 px, height recalculated |
| Aspect ratio after constraint | `width / height` matches original ratio |
| Exact match to `maxWidth` | No scaling (boundary condition) |

## Testing

Open [`docs/issues/50-mermaid-width-test.md`](./50-mermaid-width-test.md) in VS Code with the extension active to visually verify the fix.

Unit tests:

```bash
npm test
```

E2E tests:

```bash
npm run test:e2e
```
