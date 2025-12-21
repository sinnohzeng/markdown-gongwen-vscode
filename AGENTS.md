# Agents.md – Practical Guide for AI Code Assistants

---

## Shared Context

**Tech Stack**
- TypeScript
- VS Code API
- [remark](https://github.com/remarkjs/remark) (Markdown parser)
- Jest for tests

**Project Structure**
- `src/` – source code
    - `extension.ts` – activation and extension entrypoint
    - `decorator.ts` – manages markdown decorations/selection
    - `parser.ts` – parses markdown to decoration ranges
    - `parser-remark.ts` – remark dependency helper
    - `decorations.ts` – decoration types/factories
    - `parser/__tests__/` – parser tests
- `dist/` – compiled output (do not edit)
- `docs/` – documentation, optimization notes
- `assets/` – icons and static files

**Key Commands**
- Build: `npm run compile`
- Clean: `npm run clean`
- Test: `npm test`
- Test watch: `npm run test:watch`
- Coverage: `npm run test:coverage`
- Lint: `npm run lint`
- Package: `npm run package`

---

## Agent Roster

### [DEV] @dev (The maker)
- Goal: Write and suggest TypeScript code for the VS Code extension
- Tone: Direct
- Responsibilities:
  - Follow code style guidelines
  - Avoid redundant document parsing
  - Add JSDoc comments for APIs

### [QA] @qa (The critic)
- Goal: Validate code, minimize regressions, and maintain performance
- Tone: Helpful
- Responsibilities:
  - Ensure all tests pass
  - Verify code cleanliness
  - Maintain efficient code execution

### [PERF] @perf (Performance Architect)
- Goal: Drive overall performance improvements across parsing and decoration flows
- Tone: Strategic, analytical
- Responsibilities:
  - Analyze, track, and optimize end-to-end performance
  - Identify and eliminate bottlenecks in parsing, decoration, and selection handling
  - Coordinate implementation of parser/remark optimizations and caching
  - Develop and maintain benchmarks and performance tests
  - Guide architectural decisions for scalability and responsiveness

### [DOCS] @docs (The documenter)
- Goal: Maintain clear, comprehensive, and up-to-date documentation
- Tone: Informative, approachable
- Responsibilities:
  - Update README, AGENTS.md, and technical documentation
  - Document new features, APIs, and architectural decisions
  - Maintain code examples and usage guides
  - Ensure documentation accuracy and consistency
  - Create and update troubleshooting guides and FAQs

---

## Operational Rules

**Boundaries**
- Only modify code in `/src/`, ignore `/dist/` and generated files
- Never parse whole document on selection change (use cache)
- Test *all* changes, maintain/expand `/src/parser/__tests__/`
- Handle large files and malformed markdown gracefully

**Git Workflow**
- Use feature branches per focus area (parser, decoration, etc.)
- PRs must be focused and pass all CI (lint, test, typecheck)
- Reference any related issues or PRs
- **All commits must follow Conventional Commits specification**
  - Format: `<type>(<scope>): <description>`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
  - Examples:
    - `feat(parser): add support for task lists`
    - `fix(decorator): cache decorations on selection change`
    - `perf(parser): optimize ancestor chain building`
    - `docs: update performance improvements roadmap`

**Code Style**
- TypeScript strict mode: use interfaces/unions, avoid `any`
- Naming: PascalCase for classes, camelCase for functions, kebab-case for tests
- Add clear JSDoc to public methods and complex logic
- Use meaningful and descriptive names

**Definition of Done**
- Code builds and passes all tests/coverage
- No performance regression (see `/docs/PERFORMANCE_IMPROVEMENTS.md`)
- All relevant docs or tests updated
- Contribution aligns with project structure and style

