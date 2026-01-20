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
    - `link-provider.ts` – clickable link provider for markdown documents
    - `link-hover-provider.ts` – hover provider for link URLs
    - `image-hover-provider.ts` – hover provider for image previews
    - `link-click-handler.ts` – single-click navigation handler
    - `hover-utils.ts` – shared utilities for hover providers (caching, URL resolution)
    - `position-mapping.ts` – position mapping utilities (CRLF/LF normalization)
    - `parser/__tests__/` – parser tests
    - `link-provider/__tests__/` – link provider tests
    - `hover-utils/__tests__/` – hover utilities tests
    - `image-hover-provider/__tests__/` – image hover provider tests
    - `link-hover-provider/__tests__/` – link hover provider tests
    - `link-click-handler/__tests__/` – click handler tests
- `dist/` – compiled output (do not edit)
- `docs/` – documentation, optimization notes
- `assets/` – icons and static files

**Key Commands**
- Compile: `npm run compile` (TypeScript compilation only)
- Build: `npm run build` (compile + bundle + package for release)
- Clean: `npm run clean`
- Test: `npm test`
- Test watch: `npm run test:watch`
- Coverage: `npm run test:coverage`
- Lint: `npm run lint`
- Package: `npm run package`


## Operational Rules

**Boundaries**
- Only modify code in `/src/`, ignore `/dist/` and generated files
- Never parse whole document on selection change (use cache)
- Test *all* changes, maintain/expand test suites in `*/__tests__/` directories
- Handle large files and malformed markdown gracefully
- Maintain test coverage: currently 57+ passing tests across parser, hover providers, and click handler

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
- **Update `CHANGELOG.md`** with the new version entry:
  - Add a new section `## [X.Y.Z] - YYYY-MM-DD` at the top
  - Document all changes using categories: `Added`, `Changed`, `Fixed`, `Removed`, `Deprecated`, `Security`
  - Update the comparison links at the bottom of the file
- **Verify feature list in `README.md`** to ensure all current features are accurately documented before each release.
- **Verify issue list on github** [Github issues](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues)
- **Build the extension** to verify compilation:
  ```bash
  npm run build
  ```
- **Commit version bump and changelog** with a conventional commit message:
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