---
status: DONE
updateDate: 2024-12-19
priority: Core Feature
---

# Strikethrough

## Overview

Strikethrough text formatting with hidden syntax markers.

## Implementation

- Syntax: `~~text~~`
- Markers are hidden, text is displayed with strikethrough
- Supports nested formatting

## Acceptance Criteria

### Basic Strikethrough Formatting
```gherkin
Feature: Strikethrough text formatting

  Scenario: Basic strikethrough
    When I type ~~strikethrough text~~
    Then the markers are hidden
    And the text is displayed with strikethrough

  Scenario: Strikethrough in paragraph
    When I type "This is ~~deleted~~ text"
    Then only the strikethrough markers are hidden
    And surrounding text is unaffected
```

### Nested Formatting
```gherkin
Feature: Nested strikethrough formatting

  Scenario: Strikethrough with bold
    When I type ~~**bold** text~~
    Then strikethrough markers are hidden
    And bold markers are hidden
    And text is displayed with both formats

  Scenario: Strikethrough with italic
    When I type ~~*italic* text~~
    Then strikethrough markers are hidden
    And italic markers are hidden
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal strikethrough

  Scenario: Reveal on select
    Given ~~strikethrough text~~ is in my file
    When I select the strikethrough text
    Then the raw markdown is shown
    When I deselect
    Then the markers are hidden again
```

## Notes

- Core GFM feature
- Used for indicating deleted or deprecated content
- Works with nested formatting

## Examples

- `~~strikethrough text~~` → ~~strikethrough text~~ (markers hidden)
