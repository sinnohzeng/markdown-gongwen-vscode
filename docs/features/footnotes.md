---
status: TODO
updateDate: 2024-12-19
priority: Low (reconsidering)
---

# Footnotes

## Overview

Support for footnote syntax `[^1]` with reference links and footnote definitions.

## Implementation

Detect footnote syntax `[^1]`, link to footnote definitions, style footnotes distinctively, handle footnote definitions.

## Acceptance Criteria

### Basic Footnotes
```gherkin
Feature: Footnote formatting

  Scenario: Basic footnote reference
    When I type text[^1]
    Then the footnote reference is styled
    And the reference is clickable

  Scenario: Footnote definition
    When I type [^1]: Footnote definition
    Then the footnote definition is styled
    And it links to the reference
```

### Multiple Footnotes
```gherkin
Feature: Multiple footnotes

  Scenario: Multiple references
    When I type text[^1] and more[^2]
    Then both references are styled correctly
    And both link to their definitions

  Scenario: Multiple definitions
    When I type [^1]: First
    And I type [^2]: Second
    Then both definitions are styled correctly
```

### Edge Cases
```gherkin
Feature: Footnote edge cases

  Scenario: Missing definition
    When I type text[^1]
    And no definition exists
    Then the reference is handled gracefully

  Scenario: Unused definition
    When I type [^1]: Definition
    And no reference exists
    Then the definition is handled gracefully
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal footnote

  Scenario: Reveal on select
    Given text[^1] is in my file
    When I select the footnote reference
    Then the raw markdown is shown
    When I deselect
    Then the reference is styled again
```

## Notes

- Core GFM feature but low frequency
- Useful for academic users
- Markless status unknown
- Complex implementation for limited use case
- Feasibility: Moderate
- Usefulness: Low
- Risk: Medium (complex linking)
- Effort: 2 weeks
- Complex linking between references and definitions
- Low frequency of use (most users don't use footnotes)
- Moderate complexity for limited value
- Recommendation: Reassess after core features are complete, evaluate user demand
- Dependencies: None (parser enhancement)

## Examples

```markdown
This is a sentence with a footnote[^1].

[^1]: This is the footnote definition.
```

→ Footnotes styled distinctively, links between references and definitions
