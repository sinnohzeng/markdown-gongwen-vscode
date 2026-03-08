# Markdown Inline Editor Constitution

## Core Principles

### I. Code Quality
Code is the primary artifact; quality is non-negotiable. TypeScript strict mode is mandatory. Prefer interfaces and unions over `any`. Functions are single-purpose and focused; complex logic lives in named helpers. Follow naming conventions: PascalCase for classes, camelCase for functions, UPPER_SNAKE_CASE for constants. JSDoc is required for public APIs. Source lives under `/src/` only; generated output in `/dist/` is never edited. All changes must pass `npm run validate` (lint:docs, test, build) before commit.

### II. Testing Standards
Every new or changed behavior has corresponding tests. Tests live in `__tests__/` next to the module; files are named `module-name.test.ts`. Cover happy path, empty input, malformed input, and large-file edge cases. Mock the VS Code API where needed; follow existing test patterns. Coverage must be maintained or improved. TDD is encouraged; at minimum, no commit without tests for new functionality and updated tests for changed behavior.

### III. User Experience Consistency
The extension must feel like a natural part of VS Code. Decoration behavior (transparent, faint, etc.) is consistent across markdown constructs. Links and images follow VS Code conventions for navigation, hover, and preview. Errors and edge cases are handled gracefully—no crashes or broken states; degrade to safe defaults. Settings and commands align with VS Code UX patterns and documentation.

### IV. Performance Requirements
Parsing is never done on every keystroke or selection change; the parse cache (`markdown-parse-cache.ts`) is always used for document parsing. Avoid O(n²) and other inefficient algorithms; test with large files (>10k lines) when touching the parser. Handle malformed markdown without crashing. Position calculations use the position-mapping layer for CRLF/LF correctness. New features must not regress perceived performance in typical documents.

## Quality Gates

- **Before commit:** `npm run validate` (lint:docs, test, build) must pass.
- **Parser/decorator changes:** Include tests for new syntax and edge cases; consider large-file impact.
- **New features:** Document in `/docs/` when appropriate; feature specs live in `/docs/features/`.

## Governance

This constitution overrides ad-hoc practices. All PRs and reviews must verify compliance with these principles. Exceptions require explicit justification and documentation. For day-to-day development guidance, see `AGENTS.md`. Amendments require a documented rationale and, when relevant, a migration or rollout plan.

**Version**: 1.0.0 | **Ratified**: 2025-03-08 | **Last Amended**: 2025-03-08
