# Mermaid Width Constraint — Manual Test File (Issue #50)

Open this file with the **Markdown Inline Editor** extension active.
Each diagram below should render **within the editor viewport** — no horizontal overflow.

---

## 1. Large flowchart (many nodes)

This is the primary case from the bug report. The diagram is intrinsically wide but must be capped to the editor width.

```mermaid
flowchart LR
    A[Start] --> B[Load config]
    B --> C{Valid?}
    C -->|Yes| D[Parse tokens]
    C -->|No| E[Show error]
    D --> F[Build AST]
    F --> G[Run decorators]
    G --> H[Syntax: headings]
    G --> I[Syntax: bold/italic]
    G --> J[Syntax: links]
    G --> K[Syntax: code]
    G --> L[Syntax: lists]
    G --> M[Syntax: blockquote]
    H --> N[Apply ranges]
    I --> N
    J --> N
    K --> N
    L --> N
    M --> N
    N --> O[Update editor]
    O --> P[Done]
```

---

## 2. Wide sequence diagram (many participants)

```mermaid
sequenceDiagram
    participant Browser
    participant VSCode
    participant Extension
    participant Webview
    participant MermaidRenderer
    participant SvgProcessor
    participant DecorationCache
    participant Editor

    Browser->>VSCode: open file
    VSCode->>Extension: onDidChangeTextDocument
    Extension->>DecorationCache: lookup key
    DecorationCache-->>Extension: miss
    Extension->>MermaidRenderer: renderMermaidSvg(source)
    MermaidRenderer->>Webview: postMessage render
    Webview->>MermaidRenderer: svgString
    MermaidRenderer->>SvgProcessor: processSvg(svg, height, maxWidth)
    SvgProcessor-->>MermaidRenderer: constrained SVG
    MermaidRenderer->>DecorationCache: store result
    MermaidRenderer-->>Extension: SVG data URI
    Extension->>Editor: setDecorations
    Editor-->>Browser: render inline
```

---

## 3. Gantt chart (wide timeline)

```mermaid
gantt
    title Feature Development Timeline
    dateFormat  YYYY-MM-DD
    section Research
    Investigate issue      :done,    r1, 2026-01-01, 7d
    Review prior art       :done,    r2, after r1, 5d
    section Design
    Draft architecture     :done,    d1, after r2, 4d
    Review with team       :done,    d2, after d1, 2d
    section Implementation
    svg-processor changes  :done,    i1, after d2, 3d
    mermaid-renderer hook  :done,    i2, after i1, 2d
    Unit tests             :done,    i3, after i2, 2d
    E2E tests              :active,  i4, after i3, 3d
    section Release
    PR review              :         rel1, after i4, 2d
    Merge to main          :         rel2, after rel1, 1d
    Publish extension      :         rel3, after rel2, 1d
```

---

## 4. Normal-width diagram (must NOT be clipped)

This diagram is naturally narrow and should render at its intrinsic width without any scaling.

```mermaid
flowchart TD
    A[Start] --> B[Process]
    B --> C[End]
```

---

## 5. Square / tall diagram (aspect ratio preserved)

```mermaid
flowchart TD
    A --> B --> C --> D --> E --> F --> G --> H --> I --> J
```

---

## Expected results

| # | Diagram | Expected |
|---|---------|----------|
| 1 | Large flowchart | Fits viewport, height scaled proportionally |
| 2 | Wide sequence | Fits viewport, height scaled proportionally |
| 3 | Gantt chart | Fits viewport, height scaled proportionally |
| 4 | Narrow flowchart | Renders at natural width — no clipping |
| 5 | Tall flowchart | Renders at natural width — no clipping |
