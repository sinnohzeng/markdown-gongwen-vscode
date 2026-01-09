---
status: DONE
updateDate: 2024-12-19
priority: Core Feature
---

# Italic

## Overview

Italic text formatting with hidden syntax markers.

## Implementation

- Syntax: `*text*` or `_text_`
- Markers are hidden, text is displayed in italic
- Supports nested formatting (e.g., **bold *italic***)

## Acceptance Criteria

### Basic Italic Formatting
```gherkin
Feature: Italic text formatting

  Scenario: Asterisk syntax
    When I type *italic text*
    Then the markers are hidden
    And the text is displayed in italic

  Scenario: Underscore syntax
    When I type _italic text_
    Then the markers are hidden
    And the text is displayed in italic
```

### Nested Formatting
```gherkin
Feature: Nested italic formatting

  Scenario: Italic with bold
    When I type **bold *italic* text**
    Then italic markers are hidden
    And bold markers are hidden
    And text is displayed with both formats

  Scenario: Italic with code
    When I type *italic `code` text*
    Then italic markers are hidden
    And code markers are preserved
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal italic

  Scenario: Reveal on select
    Given *italic text* is in my file
    When I select the italic text
    Then the raw markdown is shown
    When I deselect
    Then the markers are hidden again
```

## Notes

- Core Markdown feature
- Two syntax variants supported
- Works with nested formatting

## Examples

- `*italic text*` → *italic text* (markers hidden)
- `_italic text_` → *italic text* (markers hidden)
