---
status: DONE
updateDate: 2024-12-19
priority: Core Feature
---

# Bold + Italic

## Overview

Combined bold and italic text formatting with hidden syntax markers.

## Implementation

- Syntax: `***text***` or `___text___`
- Markers are hidden, text is displayed in both bold and italic
- Supports nested formatting

## Acceptance Criteria

### Basic Bold Italic Formatting
```gherkin
Feature: Bold italic text formatting

  Scenario: Triple asterisk syntax
    When I type ***bold italic text***
    Then the markers are hidden
    And the text is displayed in both bold and italic

  Scenario: Triple underscore syntax
    When I type ___bold italic text___
    Then the markers are hidden
    And the text is displayed in both bold and italic
```

### Edge Cases
```gherkin
Feature: Bold italic edge cases

  Scenario: In paragraph
    When I type "This is ***important*** text"
    Then only the bold italic markers are hidden
    And surrounding text is unaffected

  Scenario: Adjacent formatting
    When I type ***bold italic*** and **bold** text
    Then both formatting types are correctly applied
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal bold italic

  Scenario: Reveal on select
    Given ***bold italic text*** is in my file
    When I select the formatted text
    Then the raw markdown is shown
    When I deselect
    Then the markers are hidden again
```

## Notes

- Core Markdown feature
- Combines bold and italic formatting
- Two syntax variants supported

## Examples

- `***bold italic text***` → ***bold italic text*** (markers hidden)
- `___bold italic text___` → ***bold italic text*** (markers hidden)
