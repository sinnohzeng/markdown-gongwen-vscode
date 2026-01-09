---
status: DONE
updateDate: 2024-12-19
priority: Core Feature
---

# Inline Code

## Overview

Inline code formatting with monospace styling and hidden syntax markers.

## Implementation

- Syntax: `` `code` ``
- Markers (backticks) are hidden, text is displayed in monospace
- Supports nested formatting (e.g., `**bold `code`**`)

## Acceptance Criteria

### Basic Inline Code
```gherkin
Feature: Inline code formatting

  Scenario: Basic inline code
    When I type `code`
    Then the backticks are hidden
    And the text is displayed in monospace

  Scenario: Code with spaces
    When I type `code with spaces`
    Then the backticks are hidden
    And the text is displayed in monospace
```

### Nested Formatting
```gherkin
Feature: Inline code with nested formatting

  Scenario: Code in bold
    When I type **bold `code` text**
    Then the code markers are preserved
    And the code is displayed in monospace
    And the bold formatting is applied

  Scenario: Code takes precedence
    When I type `**bold** code`
    Then the code markers are preserved
    And formatting inside code is not applied
```

### Edge Cases
```gherkin
Feature: Inline code edge cases

  Scenario: Multiple code spans
    When I type `code1` and `code2`
    Then both code spans are formatted correctly

  Scenario: Code with backticks
    When I type `` `code` ``
    Then the outer backticks are hidden
    And the inner backticks are preserved
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal inline code

  Scenario: Reveal on select
    Given `code` is in my file
    When I select the code
    Then the raw markdown is shown
    When I deselect
    Then the backticks are hidden again
```

## Notes

- Core Markdown feature
- Code takes precedence over other formatting
- Monospace styling for readability

## Examples

- `` `inline code` `` → `inline code` (monospace, markers hidden)
- `` `**bold** code` `` → `**bold** code` (code takes precedence)
