---
status: DONE
updateDate: 2026-03-21
priority: P2
---

# GitHub-style mentions and issue references

## Overview

Inline styling and optional linking for GitHub-flavored `@username`, `@org/team`, `#123`, and `@user/repo#456` in Markdown. Targets resolve from **`git remote origin`** when possible: web base URL (e.g. GitHub, GitLab, self-hosted), `owner`/`repo` for bare `#n` refs, and GitLab-style `/-/issues` vs `/issues` when the host looks like GitLab. If `origin` cannot be read, a default base of `https://github.com` is still used for URL building where metadata allows (e.g. `@user`); bare `#123` needs `owner`/`repo` from the remote.

## Implementation

- Parser: post-pass in `src/parser.ts` (`scanMentionAndIssueRefs`) after AST processing; excludes code blocks and email patterns; emits `mention` and `issueReference` decorations with `slug`, `issueNumber`, `ownerRepo` metadata.
- URL resolution: `src/link-targets.ts` — `resolveMentionTarget(slug, webBaseUrl)`, `resolveIssueRefTarget(owner, repo, number, webBaseUrl, issuePathSegment)`.
- Context: `src/forge-context.ts` — `getForgeContext(workspaceRootUri)` (`parseGitRemoteUrl`, cached `git remote get-url origin`).
- Styling: `src/decorations.ts` (MentionDecorationType, IssueReferenceDecorationType), `src/decorator/decoration-type-registry.ts`.
- Links: `src/link-provider.ts`, `src/link-hover-provider.ts`, `src/link-click-handler.ts` use decoration metadata and forge context for `DocumentLink`s and opens (subject to the same rules as other links for **Ctrl/Cmd+click** vs **single-click** — see [FAQ](../../FAQ.md#links-mentions-and-issue-refs-wont-open)).

### Patterns

| Pattern           | Example          | Styled | Click target (when linking is enabled) |
| ----------------- | ---------------- | ------ | -------------------------------------- |
| User mention      | `@username`      | Yes    | `{webBaseUrl}/username`                |
| Org/team mention  | `@org/team`      | Yes    | `{webBaseUrl}/org/team`                |
| Issue reference   | `#123`           | Yes    | `{webBaseUrl}/{owner}/{repo}/{issueSegment}/123` (needs `owner`/`repo` from remote or from `@owner/repo#…`) |
| Repo-scoped issue | `@user/repo#456` | Yes    | `{webBaseUrl}/user/repo/{issueSegment}/456` |

`webBaseUrl` and `issuePathSegment` (`issues` vs `-/issues`) come from the parsed forge remote. Underscores in simple `@user` handles are not matched (GitHub-style token rules). Exclusions: fenced/inline code, email-like `@` contexts. Reveal on select: raw `@user` / `#123` shows for editing.

### Settings

- **`markdownInlineEditor.mentions.enabled`** (default: `true`) — Master switch for detection and styling.
- **`markdownInlineEditor.mentions.linksEnabled`** — `true` forces clickable link resolution on; `false` forces it off; **unset** uses forge detection (still allows styling; URLs use remote when available).

### Context behavior

`getForgeContext` returns `enabled: false` only when `mentions.linksEnabled` is **explicitly `false`**. Otherwise links are resolved when metadata and remote data are sufficient (e.g. bare `#1` is not clickable without `owner`/`repo`). Workspace folder resolution falls back to the document’s parent directory when no folder is open, so `git` can still run next to the file.

## Acceptance Criteria

- `@username`, `@org/team`, `#123`, `@user/repo#456` are styled (link-like) when `mentions.enabled` is true.
- When linking is enabled and URLs resolve, mentions/refs are clickable (same interaction model as other document links: **Ctrl/Cmd+click** by default; optional **single-click** via `markdownInlineEditor.links.singleClickOpen`).
- When `mentions.linksEnabled` is `false`, or a URL cannot be resolved (e.g. bare `#123` with no remote), styling may still apply where detection runs; links are not provided where resolution fails.
- Email patterns and content inside code blocks are not styled as mentions/refs.
- Selecting a mention/ref reveals raw markdown; deselecting restores the styled view.

## Notes

- Spec and plan: `specs/005-mentions-references/`.
- Tests: `src/parser/__tests__/parser-mention-ref.test.ts`, `src/forge-context/__tests__/forge-context.test.ts`.
- Manual smoke file: `docs/mentions-references-test.md`.

## Examples

- `@alice` → styled; click opens profile URL under `webBaseUrl` when linking is on.
- `@org/team` → styled; click opens `{webBaseUrl}/org/team`.
- `#42` → styled; click opens issue when `owner`/`repo` come from `git` remote (or use `@owner/repo#42`).
- `@owner/repo#99` → styled; click opens that repo’s issue page.
- `user@domain.com` → not a mention (email exclusion).
- Content in `` `code` `` or fenced blocks → no mention/ref styling.
