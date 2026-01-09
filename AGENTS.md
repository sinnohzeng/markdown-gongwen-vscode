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
- All relevant docs or tests updated
- Contribution aligns with project structure and style

**Releasing a Version (Conventional Commits & SemVer)**

- **Determine the version bump** (major/minor/patch) following [SemVer](https://semver.org/) and [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat`: **minor** version (or **major** if breaking)
  - `fix`: **patch** version
  - `BREAKING CHANGE`: **major** version
- **Update `package.json`** version field (e.g., `1.3.6` → `1.4.0` for feature, `2.0.0` for breaking change).
- **Build the extension** to verify compilation:
  ```bash
  npm run build
  ```
- **Commit version bump** with a conventional commit message:
  ```bash
  git commit -am "chore(release): vX.Y.Z"
  ```
- **Tag the release** using the new version:
  ```bash
  git tag vX.Y.Z
  ```
- **Push changes and tag** to the repository:
  ```bash
  git push origin main
  git push origin vX.Y.Z
  ```
- **CI/CD publishes** to VS Code Marketplace and OpenVSX automatically for tags beginning with `v`.
- The release workflow is managed by `.github/workflows/ci.yaml`, which triggers on tags matching `refs/tags/v*`.