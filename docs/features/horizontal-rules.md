---
status: DONE
updateDate: 2024-12-19
priority: Core Feature
---

# Horizontal Rules

## Overview

Horizontal rules with visual separator and hidden syntax markers.

## Implementation

- Syntax: `---`, `***`, or `___` (minimum 3 characters)
- The code syntax is visually replaced by drawing a border below the line.
- All three marker types are supported.
- The border adapts to the active theme for consistent styling.

## Acceptance Criteria

### Basic Horizontal Rules
```gherkin
Feature: Horizontal rule formatting

  Scenario: Hyphen syntax
    When I type ---
    Then the markers are replaced with visual separator
    And the separator is displayed

  Scenario: Asterisk syntax
    When I type ***
    Then the markers are replaced with visual separator
    And the separator is displayed

  Scenario: Underscore syntax
    When I type ___
    Then the markers are replaced with visual separator
    And the separator is displayed
```

### Edge Cases
```gherkin
Feature: Horizontal rule edge cases

  Scenario: Minimum length
    When I type ---
    Then the rule is displayed
    When I type --
    Then the rule is not displayed

  Scenario: Longer rules
    When I type --------
    Then the visual separator is displayed
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal horizontal rule

  Scenario: Reveal on select
    Given --- is in my file
    When I select the rule
    Then the raw markdown is shown
    When I deselect
    Then the visual separator is displayed again
```

## Notes

- Core Markdown feature
- Three syntax variants supported
- Theme-aware styling

## Examples

- `---` → ──────── (visual separator, markers hidden)
- `***` → ──────── (visual separator, markers hidden)
- `___` → ──────── (visual separator, markers hidden)
