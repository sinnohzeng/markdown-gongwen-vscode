---
status: TODO
updateDate: 2024-12-19
priority: N/A
---

# Highlighting Support

## Overview

Support for `==text==` highlighting syntax with background color styling.

## Implementation

Detect `==text==` syntax, style with background color, hide markers.

## Acceptance Criteria

### Basic Highlighting
```gherkin
Feature: Highlighting syntax

  Scenario: Basic highlighting
    When I type ==highlighted text==
    Then the markers are hidden
    And the text has background color styling

  Scenario: Highlighting in paragraph
    When I type "This is ==important== text"
    Then only the highlighted markers are hidden
    And surrounding text is unaffected
```

### Edge Cases
```gherkin
Feature: Highlighting edge cases

  Scenario: Nested highlighting
    When I type ==outer ==inner== text==
    Then the highlighting is handled correctly

  Scenario: Multiple highlights
    When I type ==first== and ==second==
    Then both highlights are formatted correctly
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal highlighting

  Scenario: Reveal on select
    Given ==highlighted text== is in my file
    When I select the highlighted text
    Then the raw markdown is shown
    When I deselect
    Then the markers are hidden again
```

## Notes

- Non-standard feature that breaks "works everywhere" principle
- Non-standard Markdown extension (not core GFM)
- Breaks "works everywhere" principle
- Markless doesn't have it (not competitive requirement)
- Limited adoption (not widely supported)
- Recommendation: Remove from roadmap. Only implement if very high user demand emerges
- Alternative: Consider removing entirely or only implementing if there's overwhelming user demand
- Feasibility: High
- Usefulness: Low
- Risk: Low
- Effort: 1 week

## Examples

- `==highlighted text==` → highlighted text (background color, markers hidden)
- `"This is ==important== text"` → This is important text (only highlighted portion styled)
