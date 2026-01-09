---
status: DONE
updateDate: 2024-12-19
priority: Core Feature
---

# Task Lists

## Overview

Task lists (checkboxes) with clickable toggles and support for all variants.

## Implementation

- Syntax: `- [ ]` (unchecked) or `- [x]` (checked)
- Checkboxes are rendered as ☐ (unchecked) or ☑ (checked)
- Clickable checkboxes - click inside checkbox to toggle
- Supports all variants:
  - Unordered lists: `- [ ]`, `* [ ]`, `+ [ ]`
  - Ordered lists: `1. [ ]`, `1) [ ]`
- Smart click behavior: raw markdown only shows when clicking behind checkbox, not on it
- Handles edge cases (missing spaces, invalid syntax)

## Acceptance Criteria

### Basic Task Lists
```gherkin
Feature: Task list formatting

  Scenario: Unchecked task
    When I type - [ ] Task
    Then the checkbox is rendered as ☐
    And the checkbox is clickable

  Scenario: Checked task
    When I type - [x] Completed
    Then the checkbox is rendered as ☑
    And the checkbox is clickable
```

### Task List Variants
```gherkin
Feature: Task list variants

  Scenario: Asterisk variant
    When I type * [ ] Task
    Then the checkbox is rendered correctly

  Scenario: Plus variant
    When I type + [ ] Task
    Then the checkbox is rendered correctly

  Scenario: Ordered list task
    When I type 1. [ ] Task
    Then the checkbox is rendered correctly
```

### Click Behavior
```gherkin
Feature: Task list click behavior

  Scenario: Toggle on click
    Given - [ ] Task is in my file
    When I click inside the checkbox
    Then the task is toggled to checked

  Scenario: Reveal on click behind
    Given - [ ] Task is in my file
    When I click behind the checkbox
    Then the raw markdown is shown
```

## Notes

- Core GFM feature
- Supports all list marker variants
- Smart click behavior prevents accidental reveals

## Examples

- `- [ ] Task` → ☐ Task (clickable)
- `- [x] Completed` → ☑ Completed (clickable)
- `1. [ ] Ordered task` → 1. ☐ Ordered task (clickable)
- `* [ ] Asterisk task` → • ☐ Asterisk task (clickable)
