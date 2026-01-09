---
status: TODO
updateDate: 2024-12-19
priority: High
---

# Autolinks

## Overview

Automatic link detection for URLs and email addresses in angle brackets. Type `<https://example.com>` or `<user@example.com>` and the brackets are hidden, text becomes clickable.

## Implementation

User types `<https://example.com>` or `<user@example.com>` → brackets hidden, text displayed as clickable link.

## Acceptance Criteria

### URL Autolink Detection
```gherkin
Feature: Autolink URLs

  Scenario: Basic URL
    When I type <http://example.com>
    Then the brackets are hidden
    And the URL is clickable

  Scenario: HTTPS URL
    When I type <https://github.com/user/repo>
    Then the link is displayed clickable

  Scenario: URL with query
    When I type <https://example.com/path?query=value>
    Then the full URL is clickable without brackets
```

### Email Autolink Detection
```gherkin
Feature: Autolink Emails

  Scenario: Basic email
    When I type <user@example.com>
    Then the email is clickable as mailto
    And the brackets are hidden

  Scenario: Email with plus
    When I type <user+tag@example.com>
    Then plus addressing is preserved in the link
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal autolink

  Scenario: Reveal on select
    Given <https://example.com> is in my file
    When I select the link
    Then the raw markdown is shown
    When I deselect
    Then the brackets are hidden again
```

### Edge Cases
```gherkin
Feature: Autolink edge cases

  Scenario: In paragraph
    When I type "Visit <https://example.com> for info"
    Then only the autolink brackets are hidden

  Scenario: Multiple autolinks
    When I type "Contact <user@example.com> or <https://example.com>"
    Then both autolinks are detected and clickable

  Scenario: Adjacent text
    When I type "URL:<https://example.com>text"
    Then only the autolink is styled as a link
```

## Notes

- Core GFM feature
- Competitive requirement (markless has it)

## Examples

- `<user@example.com>` → user@example.com (clickable mailto link, brackets hidden)
- `<user+tag@example.com>` → user+tag@example.com (plus addressing preserved, clickable, brackets hidden)
- `<https://example.com>` → https://example.com (clickable, brackets hidden)
- `"Visit <https://example.com> for info"` → Visit https://example.com for info (only brackets hidden on autolink)
- `"Contact <user@example.com> or <https://example.com>"` → Contact user@example.com or https://example.com (both autolinks clickable, brackets hidden)
- `"URL:<https://example.com>text"` → URL:https://example.comtext (only the autolink is styled as a link)

