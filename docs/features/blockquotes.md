---
status: DONE
updateDate: 2024-12-19
priority: Core Feature
---

# Blockquotes

## Overview

Blockquotes with visual bar indicator and support for nested blockquotes.

## Implementation

- Syntax: `> quote`
- Blockquote marker (`>`) is replaced with visual bar (│)
- Supports nested blockquotes (`> > nested`)
- Visual bar indicates nesting level

## Acceptance Criteria

### Basic Blockquote
```gherkin
Feature: Blockquote formatting

  Scenario: Basic blockquote
    When I type > Quote text
    Then the marker is replaced with visual bar
    And the text is displayed

  Scenario: Multiple lines
    When I type > Line 1
    And I type > Line 2
    Then both lines are formatted as blockquote
```

### Nested Blockquotes
```gherkin
Feature: Nested blockquotes

  Scenario: Single nesting level
    When I type > > Nested quote
    Then two visual bars are displayed
    And nesting level is indicated

  Scenario: Multiple nesting levels
    When I type > > > Deeply nested
    Then three visual bars are displayed
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal blockquote

  Scenario: Reveal on select
    Given > Quote text is in my file
    When I select the blockquote
    Then the raw markdown is shown
    When I deselect
    Then the visual bar is displayed again
```

## Notes

- Core Markdown feature
- Visual bar provides clear visual indication
- Supports unlimited nesting levels

## Examples

- `> Quote text` → │ Quote text (marker hidden)
- `> > Nested quote` → │ │ Nested quote (nested indicator)
