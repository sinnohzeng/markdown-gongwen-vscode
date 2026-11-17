# PR review findings: mentions & issue references

**Date:** 2026-03-21  
**Context:** Review of branch `pr/bircni/54` (tracking `bircni/005-mentions-references`) vs `main` — GitHub-style `@mentions`, `#issue` refs, `@owner/repo#n`, forge-aware link resolution.

**Commits reviewed (vs `main`):**

- `d365089` — feat: Implement GitHub-style mentions
- `3aed9eb` — feat(parser): add inline mentions and forge-aware issue references
- `1ada531` — refactor(mentions): simplify, fix linksEnabled default, and add missing tests
- `66357f8` — chore(vscodeignore): add `.specify` directory and `.eslintignore` to ignore list

---

## Summary

The change adds parser detection and decorations for mentions/issue references, resolves click/hover/document-link targets using `git remote` (with GitLab-style `/-/issues` when appropriate), and exposes `markdownInlineEditor.mentions.enabled` and `markdownInlineEditor.mentions.linksEnabled`. Spec artifacts live under `specs/005-mentions-references/`; user-facing notes in `docs/features/done/mentions-references.md`.

---

## Strengths

| Area | Notes |
|------|--------|
| Layering | Parsing in `src/parser.ts`, URL building in `src/link-targets.ts`, remote detection in `src/forge-context.ts`; `src/github-context.ts` re-exports for compatibility. |
| Integration | `MarkdownLinkProvider`, `MarkdownLinkHoverProvider`, and `LinkClickHandler` share the same forge context + `resolveMentionTarget` / `resolveIssueRefTarget` logic. |
| Workspace edge case | When there is no workspace folder, code uses the document’s parent as the root for git detection (consistent across providers). |
| Match ordering | Repo-scoped `@owner/repo#n` is handled before `@org/team`; `occupiedIssueRanges` avoids double-applying `#` inside repo-scoped refs. |
| Safety | Code-block exclusion and `looksLikeEmailAt` reduce false positives for `@`. |
| Tests | Dedicated `src/parser/__tests__/parser-mention-ref.test.ts`, `src/forge-context/__tests__/forge-context.test.ts`, and expanded link provider/hover/click/target tests. |
| Packaging | `.vscodeignore` updated to avoid shipping dev/spec noise. |

**Validation at review time:** `npm test` — 627 passed, 1 skipped (44 suites).

---

## Risks and follow-ups (non-blocking)

1. **Synchronous git** — `execSync("git remote get-url origin", …)` in `src/forge-context.ts` can block the extension host briefly on first access per workspace path. Results are cached; async or lighter probing is optional future work.

2. **Stale forge cache** — `gitRemoteCache` is not invalidated if `origin` changes without reloading the window. Rare; document or add invalidation if users report confusion.

3. **Bare `#123` in prose** — Any `#` + digits in normal text is treated as an issue reference (GitHub-flavored behavior). May surprise in docs that use `#` for other meanings; accepted product tradeoff.

4. ~~**README roadmap drift**~~ — **Addressed:** `README.md` now lists mentions under **Supported Features** with a link to `docs/features/done/mentions-references.md`, and the item was removed from the **Roadmap** section.

---

## Minor nits (cosmetic / optional)

- Hover text uses `Link URL:` for mentions/refs; `URL:` or `Open:` might read slightly clearer.
- `ForgeContextResult` JSDoc implies “when enabled” for clickable links; `enabled` can be true while `owner`/`repo` are missing if git resolution failed — plain `#123` links then need remote context. Comment could be tightened.

---

## Verdict

**Approve** with small documentation follow-up (README + release notes / CHANGELOG per project process).

---

## Suggested post-merge checklist

- [x] Update README roadmap section for Mentions/References.
- [x] Confirm Issue #25 / spec links reflect “done” status if applicable — `docs/features/done/mentions-references.md` and [FAQ](FAQ.md) updated; close #25 when the release ships.
- [ ] Run `npm run validate` on the merge target branch before release.

---

## Key files (for navigation)

| File | Role |
|------|------|
| `src/parser.ts` | `scanMentionAndIssueRefs`, decoration types `mention` / `issueReference` |
| `src/forge-context.ts` | Remote detection, caching, GitLab issue path segment |
| `src/link-targets.ts` | `resolveMentionTarget`, `resolveIssueRefTarget` |
| `src/link-provider.ts` | `DocumentLink` for mentions/refs when forge context allows |
| `src/link-hover-provider.ts` | Hover shows resolved URL |
| `src/link-click-handler.ts` | Single-click open when enabled |
| `src/config.ts` | `mentions.linksEnabled`, `mentions.enabled` |
| `package.json` | Contributes settings descriptions |

---

*This document is a durable snapshot of review findings; it is not a substitute for re-running tests and manual QA on the final merged commit.*
