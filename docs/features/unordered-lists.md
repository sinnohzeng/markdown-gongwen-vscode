---
status: DONE
updateDate: 2024-12-19
priority: Core Feature
---

# Unordered Lists

## Overview

Unordered lists with bullet points and hidden syntax markers.

## Implementation

- Syntax: `- item`, `* item`, or `+ item`
- List markers are replaced with bullet points (•)
- Supports all three marker types
- Supports nested lists

## Acceptance Criteria

### Basic Unordered Lists
```gherkin
Feature: Unordered list formatting

  Scenario: Hyphen marker
    When I type - item
    Then the marker is replaced with bullet point
    And the text is displayed

  Scenario: Asterisk marker
    When I type * item
    Then the marker is replaced with bullet point
    And the text is displayed

  Scenario: Plus marker
    When I type + item
    Then the marker is replaced with bullet point
    And the text is displayed
```

### Nested Lists
```gherkin
Feature: Nested unordered lists

  Scenario: Single nesting level
    When I type - item
    And I type   - nested item
    Then both items are formatted correctly
    And nesting is indicated

  Scenario: Multiple nesting levels
    When I type - item
    And I type   - nested
    And I type     - deeply nested
    Then all levels are formatted correctly
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal unordered list

  Scenario: Reveal on select
    Given - item is in my file
    When I select the list item
    Then the raw markdown is shown
    When I deselect
    Then the bullet point is displayed again
```

## Notes

- Core Markdown feature
- Three marker types supported
- Supports unlimited nesting levels

## Examples

- `- item` → • item (marker hidden)
- `* item` → • item (marker hidden)
- `+ item` → • item (marker hidden)
