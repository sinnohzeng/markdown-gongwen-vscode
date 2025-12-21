# Contributing to Markdown Inline Editor

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the Markdown Inline Editor extension.

## Getting Started

### Prerequisites

- **Node.js** 20 or higher
- **VS Code** 1.88.0 or higher (or Cursor IDE)
- **Git** for version control
- Basic familiarity with TypeScript and VS Code extension development

### Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/SeardnaSchmid/markdown-inline-editor-vscode.git
   cd markdown-inline-editor-vscode
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the extension:**
   ```bash
   npm run compile
   npm run bundle
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

5. **Open in VS Code/Cursor:**
   ```bash
   code .
   ```

6. **Debug the extension:**
   - Press `F5` to launch a new Extension Development Host
   - Open a markdown file in the new window to test your changes

## Project Structure

```
src/
├── extension.ts          # Extension entry point and activation
├── parser.ts             # Markdown AST parsing (remark-based)
├── parser-remark.ts      # Remark dependency helper
├── decorator.ts          # Decoration management and caching
├── decorations.ts        # VS Code decoration type definitions
├── link-provider.ts      # Clickable link provider
└── parser/__tests__/     # Comprehensive test suite (123+ tests)

dist/                     # Compiled output (do not edit directly)
docs/                     # Documentation and improvement notes
assets/                   # Icons and static assets
```

## Development Workflow

### 1. Create a Feature Branch

Always work on a feature branch, never directly on `main`:

```bash
git checkout -b feat/my-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feat/` - New features
- `fix/` - Bug fixes
- `perf/` - Performance improvements
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

### 2. Make Your Changes

- **Edit only files in `src/`** - Never modify `dist/` directly
- **Follow TypeScript strict mode** - Use interfaces/unions, avoid `any`
- **Add JSDoc comments** for public methods and complex logic
- **Write tests** for new functionality (see Testing section below)

### 3. Code Style Guidelines

**Naming Conventions:**
- **Classes**: PascalCase (`MarkdownParser`, `Decorator`)
- **Functions/Methods**: camelCase (`extractDecorations`, `updateDecorations`)
- **Test files**: kebab-case (`parser-bold.test.ts`, `parser-edge-cases.test.ts`)
- **Constants**: UPPER_SNAKE_CASE or camelCase depending on context

**TypeScript Best Practices:**
- Use interfaces for object shapes
- Prefer union types over `any`
- Add type annotations for function parameters and return types
- Use optional chaining (`?.`) and nullish coalescing (`??`) where appropriate

**Example:**
```typescript
/**
 * Extracts decoration ranges from markdown text.
 * 
 * @param {string} text - The markdown text to parse
 * @returns {DecorationRange[]} Array of decoration ranges, sorted by startPos
 */
extractDecorations(text: string): DecorationRange[] {
  // Implementation
}
```

### 4. Testing

**All changes must include tests.** The project uses Jest for testing.

**Run tests:**
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage report
```

**Test file location:**
- Parser tests: `src/parser/__tests__/`
- Follow existing test patterns and naming conventions

**Test requirements:**
- ✅ All existing tests must pass
- ✅ New features need test coverage
- ✅ Edge cases should be tested
- ✅ Performance-critical paths should have benchmarks

**Example test structure:**
```typescript
describe('MarkdownParser', () => {
  describe('extractDecorations', () => {
    it('should parse bold text', async () => {
      const parser = await MarkdownParser.create();
      const decorations = parser.extractDecorations('**bold**');
      // Assertions
    });
  });
});
```

### 5. Linting and Type Checking

Before committing, ensure your code passes linting and type checking:

```bash
npm run lint           # Check code style
npm run compile        # Type check and compile
```

**Fix linting issues:**
- Most issues can be auto-fixed with your editor's ESLint integration
- Follow the project's ESLint configuration (`.eslintrc.json`)

### 6. Commit Your Changes

**Use Conventional Commits** format for all commit messages:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Commit Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Test additions or changes
- `chore` - Build process or auxiliary tool changes

**Examples:**
```bash
git commit -m "feat(parser): add support for definition lists"
git commit -m "fix(decorator): cache decorations on selection change"
git commit -m "perf(parser): optimize ancestor chain building"
git commit -m "docs: update performance improvements roadmap"
git commit -m "test(parser): add edge case tests for nested formatting"
```

**Scope** (optional but recommended):
- `parser` - Changes to markdown parsing
- `decorator` - Changes to decoration management
- `extension` - Changes to extension activation/entry point
- `docs` - Documentation updates

### 7. Performance Considerations

This extension prioritizes performance, especially for:
- **Selection changes** - Should be instant (uses cached decorations)
- **Document edits** - Should feel responsive during rapid typing
- **Large documents** - Should remain usable (>1000 lines)

**Before submitting performance-related changes:**
- Review `/docs/PERFORMANCE_IMPROVEMENTS.md`
- Ensure no performance regressions
- Consider adding benchmarks for significant changes

**Key performance principles:**
- Never parse the whole document on selection change (use cache)
- Use efficient data structures (Maps, Sets)
- Avoid unnecessary string allocations
- Batch operations where possible

### 8. Pull Request Process

1. **Push your branch:**
   ```bash
   git push origin feat/my-feature-name
   ```

2. **Create a Pull Request** on GitHub:
   - Provide a clear title and description
   - Reference any related issues (e.g., "Fixes #123")
   - Include screenshots/GIFs for UI changes if applicable

3. **PR Requirements:**
   - ✅ All tests pass (`npm test`)
   - ✅ Code compiles without errors (`npm run compile`)
   - ✅ Linting passes (`npm run lint`)
   - ✅ No performance regressions
   - ✅ Documentation updated if needed
   - ✅ Follows Conventional Commits

4. **Code Review:**
   - Address review feedback promptly
   - Keep PRs focused and reasonably sized
   - Respond to comments and questions

5. **After Approval:**
   - Maintainers will merge your PR
   - Your contribution will be included in the next release!

## Common Development Tasks

### Adding a New Markdown Feature

1. **Update the parser** (`src/parser.ts`):
   - Add a new case in `processAST()` switch statement
   - Implement the processing method (e.g., `processDefinitionList()`)
   - Extract decoration ranges

2. **Add decoration type** (`src/decorations.ts`):
   - Create a new decoration type factory if needed
   - Register it in `decorator.ts`

3. **Write tests** (`src/parser/__tests__/`):
   - Create or update test file
   - Test various edge cases

4. **Update documentation:**
   - Update README.md if it's a user-facing feature
   - Update AGENTS.md if it affects architecture

### Debugging

**Enable debug logging:**
- Check `View → Output → Extension Host` for extension logs
- Use `console.log()` sparingly (remove before committing)

**Common issues:**
- **Decorations not showing**: Check if file is `.md`, `.markdown`, or `.mdx`
- **Extension not activating**: Check activation events in `package.json`
- **Performance issues**: Profile with VS Code's built-in tools

### Building and Packaging

**Build for development:**
```bash
npm run compile    # TypeScript compilation
npm run bundle     # Bundle with esbuild
```

**Package for distribution:**
```bash
npm run package    # Create .vsix file
```

**Test the packaged extension:**
```bash
cursor --install-extension dist/extension.vsix --force
# or
code --install-extension dist/extension.vsix --force
```

## Documentation

When contributing, please update relevant documentation:

- **README.md** - User-facing features, installation, usage
- **AGENTS.md** - Architecture, agent roles, development guidelines
- **CONTRIBUTING.md** - This file (if workflow changes)
- **Code comments** - JSDoc for public APIs

## Getting Help

- **Open an issue** for bugs or feature requests
- **Check existing issues** before creating new ones
- **Review AGENTS.md** for detailed architecture and agent roles
- **Read the code** - The codebase is well-documented

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Focus on what's best for the project

## Recognition

Contributors will be credited in:
- Release notes
- GitHub contributors page
- Project documentation (where appropriate)

Thank you for contributing to Markdown Inline Editor! 🎉
