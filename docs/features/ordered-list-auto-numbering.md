---
status: TODO
updateDate: 2024-12-19
priority: High (reconsidering)
---

# Ordered List Auto-Numbering

## Overview

Hide list markers and show auto-numbered items (1, 2, 3...), including support for nested lists.

## Implementation

Hide markers (`1.`, `2.`, etc.), calculate numbers based on position, track nesting levels, support GFM parentheses (`1)` vs `1.`), handle out-of-order numbering.

## Acceptance Criteria

### Basic Auto-Numbering
```gherkin
Feature: Ordered list auto-numbering

  Scenario: Basic numbering
    When I type 1. First item
    And I type 2. Second item
    Then the markers are hidden
    And numbers are auto-calculated

  Scenario: Parentheses syntax
    When I type 1) First item
    And I type 2) Second item
    Then the markers are hidden
    And numbers are auto-calculated
```

### Nested Lists
```gherkin
Feature: Nested list auto-numbering

  Scenario: Single nesting level
    When I type 1. First
    And I type    1. Nested
    And I type    2. Nested
    And I type 2. Second
    Then all numbers are auto-calculated correctly

  Scenario: Multiple nesting levels
    When I type 1. First
    And I type    1. Nested
    And I type      1. Deeply nested
    Then all levels are numbered correctly
```

### Edge Cases
```gherkin
Feature: Auto-numbering edge cases

  Scenario: Out-of-order numbering
    When I type 3. Third
    And I type 1. First
    And I type 2. Second
    Then numbers are auto-calculated based on position

  Scenario: Mixed syntax
    When I type 1. First
    And I type 2) Second
    Then both syntaxes are handled correctly
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal ordered list

  Scenario: Reveal on select
    Given 1. First item is in my file
    When I select the list item
    Then the raw markdown is shown
    When I deselect
    Then the number is auto-calculated again
```

## Notes

- Core GFM feature
- Competitive requirement (markless has it)
- Major UX improvement
- Complex implementation due to edge cases
- Feasibility: Moderate
- Usefulness: High
- Risk: Medium (edge cases)
- Effort: 2-3 weeks
- Complex edge cases (nested lists, out-of-order numbering)
- Performance considerations (need to track list state)
- Moderate complexity for implementation
- Recommendation: Reassess after core features are complete, evaluate user demand
- Dependencies: None (parser enhancement)

## Examples

```markdown
1. First item
2. Second item
   1. Nested item
   2. Another nested item
3. Third item
```

→ Numbers auto-calculated, markers hidden
