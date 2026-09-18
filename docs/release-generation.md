# Release generation

This document outlines the steps to generate and publish a new release for the project, following [Conventional Commits](https://www.conventionalcommits.org/) and [Semantic Versioning (SemVer)](https://semver.org/) guidelines.

## Automated Release (Recommended)

To create a new release automatically, run:

```bash
npm run release
```

Or directly:

```bash
node scripts/release.js
```

To force a specific version instead of letting `git-cliff` decide, pass it as an argument. Use this when the commit types overstate the change, for example a `feat`-typed commit that only swaps an asset and would otherwise bump the minor version:

```bash
npm run release -- 2.3.1
node scripts/release.js 2.3.1
```

This script will:

1. **Validate the environment**: Ensures you're on the `main` branch with a clean working tree
2. **Run validation checks**: Executes `lint:docs`, `test`, and `build` to ensure everything passes
3. **Determine the next version**: Uses the version passed as an argument if there is one; otherwise analyzes commits since the last tag using `git-cliff` to determine the appropriate version bump (major/minor/patch) based on conventional commits
4. **Update CHANGELOG.md**: Prepends a new release section generated from commit messages (grouped by type) above the existing entries. Hand-written sections are kept as they are. Edit the new section by hand before pushing if the generated wording is not what users should read
5. **Update package.json**: Bumps the version in `package.json` and `package-lock.json`
6. **Commit and tag**: Creates a commit with message `chore(release): vX.Y.Z` and creates the git tag `vX.Y.Z`
7. **Provide instructions**: Shows next steps for pushing changes

After running the script, push the changes. Push ONLY the release tag, never `--follow-tags` or `--tags` (those would also push upstream's historical annotated tags, and every `v*` tag push is treated as a release trigger; see `docs/experience/marketplace-publishing-lessons.md` §13):

```bash
git push origin main
git push origin vX.Y.Z
```

If no "Build & quality" run starts within a minute (push triggers have proven unreliable on this repo), trigger the release manually. This is the path used by all previous releases:

```bash
gh workflow run "Build & quality" --repo sinnohzeng/markdown-gongwen-vscode --ref main -f tag=vX.Y.Z
```

`--repo` 不能省。本地 clone 有 `upstream` remote，`gh` 在没设默认仓库时可能解析到上游，报 `HTTP 403: Must have admin rights to Repository`；`gh run list` 更麻烦，它不报错，直接列出上游的 run。一次性修掉：`gh repo set-default sinnohzeng/markdown-gongwen-vscode`。详见 `docs/experience/marketplace-publishing-lessons.md` §4。

The automated script (`npm run release` or `node scripts/release.js`) is recommended as it:
- Automatically determines the correct version from commits
- Generates the changelog automatically
- Reduces manual work and potential errors

## Requirements

- **git-cliff**: The script uses `npx git-cliff`, which will be downloaded automatically if not installed. For better performance, you can install it globally:
  ```bash
  npm install -g git-cliff
  ```

- **Conventional Commits**: All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for the version detection to work correctly.

## Changelog Format

The generated changelog follows the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format with sections:
- **Added**: New features (`feat:` commits)
- **Changed**: Changes in existing functionality (`docs:`, `perf:`, `refactor:`, `style:`, `test:`, `chore:` commits)
- **Fixed**: Bug fixes (`fix:` commits)

Release commits (`chore(release):`) are automatically excluded from the changelog.
