---
status: DONE
updateDate: 2024-12-19
priority: Core Feature
---

# Links

## Overview

Clickable links with hidden URL and syntax markers.

## Implementation

- Syntax: `[text](url)`
- Link text is displayed, URL is hidden
- Links are Ctrl+Clickable (via link provider)
- Supports nested formatting in link text

## Acceptance Criteria

### Basic Link Formatting
```gherkin
Feature: Link formatting

  Scenario: Basic link
    When I type [Link Text](https://example.com)
    Then the URL is hidden
    And the link text is displayed
    And the link is clickable

  Scenario: Link with title
    When I type [Link](https://example.com "Title")
    Then the title is preserved
    And the URL is hidden
```

### Nested Formatting
```gherkin
Feature: Link with nested formatting

  Scenario: Bold link text
    When I type [**Bold** Link](https://example.com)
    Then the bold formatting is applied
    And the URL is hidden

  Scenario: Italic link text
    When I type [*Italic* Link](https://example.com)
    Then the italic formatting is applied
    And the URL is hidden
```

### Edge Cases
```gherkin
Feature: Link edge cases

  Scenario: Empty link text
    When I type [](https://example.com)
    Then the link is handled gracefully

  Scenario: Multiple links
    When I type [Link1](url1) and [Link2](url2)
    Then both links are formatted correctly
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal link

  Scenario: Reveal on select
    Given [Link Text](https://example.com) is in my file
    When I select the link
    Then the raw markdown is shown
    When I deselect
    Then the URL is hidden again
```

## Notes

- Core Markdown feature
- Links are Ctrl+Clickable via link provider
- Supports nested formatting in link text

## Examples

- `[Link Text](https://example.com)` → **Link Text** (URL hidden, clickable)
- `[**Bold** Link](https://example.com)` → **Bold** Link (supports formatting)
