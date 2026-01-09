---
status: DONE
updateDate: 2024-12-19
priority: Core Feature
---

# Bold

## Overview

Bold text formatting with hidden syntax markers.

## Implementation

- Syntax: `**text**` or `__text__`
- Markers are hidden, text is displayed in bold
- Supports nested formatting (e.g., **bold *italic***)

## Acceptance Criteria

### Basic Bold Formatting
```gherkin
Feature: Bold text formatting

  Scenario: Asterisk syntax
    When I type **bold text**
    Then the markers are hidden
    And the text is displayed in bold

  Scenario: Underscore syntax
    When I type __bold text__
    Then the markers are hidden
    And the text is displayed in bold
```

### Nested Formatting
```gherkin
Feature: Nested bold formatting

  Scenario: Bold with italic
    When I type **bold *italic* text**
    Then bold markers are hidden
    And italic markers are hidden
    And text is displayed with both formats

  Scenario: Bold with code
    When I type **bold `code` text**
    Then bold markers are hidden
    And code markers are preserved
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal bold

  Scenario: Reveal on select
    Given **bold text** is in my file
    When I select the bold text
    Then the raw markdown is shown
    When I deselect
    Then the markers are hidden again
```

## Notes

- Core Markdown feature
- Two syntax variants supported
- Works with nested formatting

## Examples

- `**bold text**` → **bold text** (markers hidden)
- `__bold text__` → **bold text** (markers hidden)
