---
status: 🚧 In Progress
githubIssue: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/20
updateDate: 2026-01-09
priority: High
---

# Disable for Diffs

## Overview

Add a configuration setting to disable markdown rendering when viewing diffs, allowing users to see raw markdown changes more clearly in both source control view and Copilot inline diffs.

## Implementation

Add VS Code configuration option `markdownInlineEditor.disableForDiffs` (boolean, default: `false`) that detects when editor is in diff mode and disables decorations accordingly.

**Diff Detection:**
- Check if active editor is a diff editor using `vscode.window.activeTextEditor` and `DiffEditor` type
- Detect diff context via `TextDocument.uri.scheme === 'git'` or similar diff schemes
- Listen for editor changes to update decoration state when switching between diff and normal views

**Scope:**
- Source control diff view (Git, SVN, etc.)
- Copilot inline diffs
- Any VS Code diff editor context

**Behavior:**
- When setting is enabled and diff is detected, skip decoration application
- When setting is disabled or in normal editor, apply decorations as usual
- Setting change should immediately update active editors

## Acceptance Criteria

### Configuration Setting
```gherkin
Feature: Disable for diffs configuration

  Scenario: Enable setting
    When I enable "disable for diffs" setting
    And I open a diff view
    Then markdown decorations are disabled
    And raw markdown syntax is visible

  Scenario: Disable setting
    When I disable "disable for diffs" setting
    And I open a diff view
    Then markdown decorations are enabled
    And markdown is rendered as usual
```

### Source Control Diff View
```gherkin
Feature: Disable in source control diff

  Scenario: Diff view with setting enabled
    Given "disable for diffs" setting is enabled
    When I open source control diff view
    Then decorations are disabled
    And raw markdown changes are visible

  Scenario: Diff view with setting disabled
    Given "disable for diffs" setting is disabled
    When I open source control diff view
    Then decorations are enabled
    And markdown is rendered
```

### Copilot Inline Diffs
```gherkin
Feature: Disable in Copilot inline diffs

  Scenario: Copilot diff with setting enabled
    Given "disable for diffs" setting is enabled
    When Copilot shows inline diff
    Then decorations are disabled
    And raw markdown changes are visible

  Scenario: Copilot diff with setting disabled
    Given "disable for diffs" setting is disabled
    When Copilot shows inline diff
    Then decorations are enabled
    And markdown is rendered
```

### Edge Cases
```gherkin
Feature: Disable for diffs edge cases

  Scenario: Setting change during diff view
    Given I have a diff view open
    When I change "disable for diffs" setting
    Then decorations update immediately

  Scenario: Normal editor view unaffected
    Given "disable for diffs" setting is enabled
    When I open a normal markdown file
    Then decorations are enabled
```

## Notes

- High user demand - makes reviewing markdown changes much easier
- Problem: Rendered markdown can obscure actual changes (e.g., heading level changes like `##` to `###` look like removals)
- Solution: Configuration option to disable rendering in diff contexts
- Affects both source control view and Copilot inline diffs
- Users can currently work around by clicking the line, but it's inconvenient
- Feasibility: High
- Usefulness: High
- Risk: Low (optional setting, doesn't break existing behavior)
- Effort: 1-2 weeks
- VS Code API: Use `vscode.window.activeTextEditor` and check for diff editor type or URI scheme
- Should respect user preference (opt-in, default: false)

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
  "markdownInlineEditor.disableForDiffs": true
}
```

- **Source Control Diff**: When viewing changes in Git diff, raw markdown is shown instead of rendered
- **Copilot Inline Diff**: When Copilot suggests changes, raw markdown diff is visible
- **Normal Editing**: Regular markdown files still render normally when setting is enabled
