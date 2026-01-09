---
status: DONE
updateDate: 2024-12-19
priority: Core Feature
---

# Headings

## Overview

Heading levels 1-6 with appropriate font sizing and hidden syntax markers.

## Implementation

- Syntax: `# H1` through `###### H6`
- Markers (`#`) are hidden
- Font sizes: H1 (200%), H2 (180%), H3 (160%), H4 (140%), H5 (120%), H6 (80%)
- Supports all heading levels

## Acceptance Criteria

### Heading Levels
```gherkin
Feature: Heading formatting

  Scenario: H1 heading
    When I type # Heading 1
    Then the marker is hidden
    And the text is displayed at 200% size

  Scenario: H2 heading
    When I type ## Heading 2
    Then the markers are hidden
    And the text is displayed at 180% size

  Scenario: H3 heading
    When I type ### Heading 3
    Then the markers are hidden
    And the text is displayed at 160% size

  Scenario: H4 heading
    When I type #### Heading 4
    Then the markers are hidden
    And the text is displayed at 140% size

  Scenario: H5 heading
    When I type ##### Heading 5
    Then the markers are hidden
    And the text is displayed at 120% size

  Scenario: H6 heading
    When I type ###### Heading 6
    Then the markers are hidden
    And the text is displayed at 80% size
```

### Edge Cases
```gherkin
Feature: Heading edge cases

  Scenario: Heading with formatting
    When I type ## **Bold** heading
    Then the heading markers are hidden
    And the bold formatting is applied

  Scenario: Multiple headings
    When I type # First
    And I type ## Second
    Then both headings are formatted correctly
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal heading

  Scenario: Reveal on select
    Given # Heading is in my file
    When I select the heading
    Then the raw markdown is shown
    When I deselect
    Then the marker is hidden again
```

## Notes

- Core Markdown feature
- All six heading levels supported
- Font sizes provide visual hierarchy

## Examples

- `# Heading 1` → **Heading 1** (200% size, markers hidden)
- `## Heading 2` → **Heading 2** (180% size, markers hidden)
- `### Heading 3` → **Heading 3** (160% size, markers hidden)
- `#### Heading 4` → **Heading 4** (140% size, markers hidden)
- `##### Heading 5` → **Heading 5** (120% size, markers hidden)
- `###### Heading 6` → **Heading 6** (80% size, markers hidden)
