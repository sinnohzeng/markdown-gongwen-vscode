---
status: DONE
updateDate: 2024-12-19
priority: Core Feature
---

# Images

## Overview

Image alt text styling with hidden syntax markers.

## Implementation

- Syntax: `![alt](img.png)`
- Alt text is styled, image path is hidden
- Markers (`![` and `](...)`) are hidden
- Handles empty alt text gracefully

## Acceptance Criteria

### Basic Image Formatting
```gherkin
Feature: Image formatting

  Scenario: Image with alt text
    When I type ![Alt Text](image.png)
    Then the markers are hidden
    And the alt text is styled
    And the image path is hidden

  Scenario: Image without alt text
    When I type ![](image.png)
    Then the markers are hidden
    And empty alt text is handled gracefully
```

### Edge Cases
```gherkin
Feature: Image edge cases

  Scenario: Image with formatting in alt
    When I type ![**Bold** alt](image.png)
    Then the alt text formatting is preserved
    And the markers are hidden

  Scenario: Image with URL
    When I type ![Alt](https://example.com/image.png)
    Then the URL is hidden
    And the alt text is displayed
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal image

  Scenario: Reveal on select
    Given ![Alt Text](image.png) is in my file
    When I select the image
    Then the raw markdown is shown
    When I deselect
    Then the markers are hidden again
```

## Notes

- Core Markdown feature
- Alt text provides accessibility
- Handles empty alt text gracefully

## Examples

- `![Alt Text](image.png)` → **Alt Text** (styled, path hidden)
- `![](image.png)` → (empty alt text handled gracefully)
