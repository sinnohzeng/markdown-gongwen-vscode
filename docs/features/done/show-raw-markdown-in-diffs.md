---
status: DONE
githubIssue: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/20
updateDate: 2026-01-18
priority: High
---

# Show Raw Markdown in Diffs

## Overview

Add a configuration setting to show raw markdown syntax when viewing diffs, allowing users to see markdown changes more clearly in both source control view and Copilot inline diffs.

## Implementation

VS Code configuration option `markdownInlineEditor.defaultBehaviors.diffView.applyDecorations` (boolean, default: `false`) controls whether decorations are applied in diff views. When disabled (default), raw markdown syntax is shown instead of rendered decorations, making it easier to review changes. The extension automatically detects diff contexts including Git source control diffs, merge editors, and Copilot inline diffs.

**Diff Detection:**
- Check if active editor is a diff editor using `vscode.window.activeTextEditor` and `DiffEditor` type
- Detect diff context via `TextDocument.uri.scheme === 'git'` or similar diff schemes
- Listen for editor changes to update decoration state when switching between diff and normal views

**Scope:**
- Source control diff view (Git, SVN, etc.)
- Copilot inline diffs
- Any VS Code diff editor context

**Behavior:**
- When setting is enabled and diff is detected, show raw markdown syntax (skip decoration application)
- When setting is disabled or in normal editor, apply decorations as usual
- Setting change should immediately update active editors

### Affected Components

**Code Modules:**
- `src/extension.ts` - Configuration reading and change listeners
- `src/decorator.ts` - Diff detection and decoration skipping logic
- `src/link-provider.ts` - Diff-aware behavior for link navigation
- `package.json` - Configuration contribution

**Systems & Features:**
- VS Code configuration system (`workspace.getConfiguration`, `onDidChangeConfiguration`)
- VS Code editor API (`activeTextEditor`, `TextDocument.uri.scheme`)
- Git/Source Control diff views (`git:` URI scheme)
- VS Code Merge Editor (`vscode-merge:` URI scheme)
- GitHub Copilot inline diffs
- All markdown decoration features (when showing raw in diff mode)

## Acceptance Criteria

### Configuration Setting
```gherkin
Feature: Show raw markdown in diffs configuration

  Scenario: Enable setting
    When I enable "defaultBehaviors.diffView.applyDecorations" setting
    And I open a diff view
    Then markdown decorations are enabled
    And markdown is rendered as usual

  Scenario: Disable setting (default)
    When I disable "defaultBehaviors.diffView.applyDecorations" setting
    And I open a diff view
    Then markdown decorations are disabled
    And raw markdown syntax is visible
```

### Source Control Diff View
```gherkin
Feature: Show raw markdown in source control diff

  Scenario: Diff view with setting disabled (default)
    Given "defaultBehaviors.diffView.applyDecorations" setting is disabled
    When I open source control diff view
    Then decorations are disabled
    And raw markdown changes are visible

  Scenario: Diff view with setting enabled
    Given "defaultBehaviors.diffView.applyDecorations" setting is enabled
    When I open source control diff view
    Then decorations are enabled
    And markdown is rendered
```

### Copilot Inline Diffs
```gherkin
Feature: Show raw markdown in Copilot inline diffs

  Scenario: Copilot diff with setting disabled (default)
    Given "defaultBehaviors.diffView.applyDecorations" setting is disabled
    When Copilot shows inline diff
    Then decorations are disabled
    And raw markdown changes are visible

  Scenario: Copilot diff with setting enabled
    Given "defaultBehaviors.diffView.applyDecorations" setting is enabled
    When Copilot shows inline diff
    Then decorations are enabled
    And markdown is rendered
```

### Edge Cases
```gherkin
Feature: Show raw markdown in diffs edge cases

  Scenario: Setting change during diff view
    Given I have a diff view open
    When I change "defaultBehaviors.diffView.applyDecorations" setting
    Then decorations update immediately

  Scenario: Normal editor view unaffected
    Given "defaultBehaviors.diffView.applyDecorations" setting is disabled
    When I open a normal markdown file
    Then decorations are enabled
```

## Notes

- High user demand - makes reviewing markdown changes much easier
- Problem: Rendered markdown can obscure actual changes (e.g., heading level changes like `##` to `###` look like removals)
- Solution: Configuration option to show raw markdown syntax in diff contexts (disabled by default)
- Affects both source control view and Copilot inline diffs
- Implemented: Automatic detection of diff contexts (Git, merge editor, Copilot inline diffs)
- Feasibility: High
- Usefulness: High
- Risk: Low (optional setting, doesn't break existing behavior)
- Effort: Completed
- VS Code API: Uses `vscode.window.activeTextEditor` and checks for diff editor type or URI scheme
- Default behavior: Show raw markdown in diff views by default (setting default: `false`), users can opt-in to enable decorations

## Examples

**Before (with decorations in diff):**
```markdown
## Old Heading
```
Rendered as: **Old Heading** (obscures the actual change)

**After (with setting enabled):**
```markdown
## Old Heading
### New Heading
```
Raw markdown visible: `##` → `###` change is clear

**Configuration:**
```json
{
  "markdownInlineEditor.defaultBehaviors.diffView.applyDecorations": false
}
```

Default is `false` (raw markdown shown). Set to `true` to enable decorations in diff views.

- **Source Control Diff**: When viewing changes in Git diff, raw markdown is shown instead of rendered
- **Copilot Inline Diff**: When Copilot suggests changes, raw markdown diff is visible
- **Normal Editing**: Regular markdown files still render normally when setting is enabled
