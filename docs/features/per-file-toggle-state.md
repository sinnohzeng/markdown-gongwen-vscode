---
status: TODO
updateDate: 2024-12-19
priority: Medium
---

# Per-File Toggle State

## Overview

Enable/disable decorations per file instead of globally, allowing fine-grained control over decoration state.

## Implementation

Store toggle state per file URI, add UI control, persist state across sessions.

## Acceptance Criteria

### Per-File Toggle
```gherkin
Feature: Per-file toggle state

  Scenario: Enable decorations for file
    When I enable decorations for file A
    Then decorations are shown in file A
    And other files are unaffected

  Scenario: Disable decorations for file
    When I disable decorations for file B
    Then decorations are hidden in file B
    And other files are unaffected
```

### State Persistence
```gherkin
Feature: Toggle state persistence

  Scenario: Persist across sessions
    Given decorations are enabled for file A
    When I close VS Code
    And I reopen VS Code
    Then decorations are still enabled for file A

  Scenario: Multiple files
    Given decorations are enabled for file A
    And decorations are disabled for file B
    When I close and reopen VS Code
    Then file A has decorations enabled
    And file B has decorations disabled
```

### Edge Cases
```gherkin
Feature: Toggle state edge cases

  Scenario: New file
    When I create a new file
    Then it uses the default toggle state

  Scenario: Renamed file
    Given decorations are enabled for file A
    When I rename file A to file B
    Then decorations are enabled for file B
```

## Notes

- Competitive advantage (markless doesn't have it)
- Better UX - users may want different settings per file
- Low complexity
- Promoted from Low Priority due to high value
- Feasibility: High
- Usefulness: High
- Risk: Low
- Effort: 1 week
- State persistence mechanism (to be determined)

## Examples

- File A: Decorations enabled
- File B: Decorations disabled
- State persists across VS Code sessions
