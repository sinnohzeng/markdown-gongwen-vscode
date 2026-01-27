---
status: DONE
updateDate: 2025-01-27
priority: High
---

# Autolinks

## Overview

Automatic link detection for URLs and email addresses, both with angle brackets (autolinks) and without (bare links). Type `<https://example.com>` or `<user@example.com>` and the brackets are hidden, text becomes clickable. Bare URLs and emails like `https://example.com` or `user@example.com` are also automatically detected and styled as clickable links.

## Implementation

- **Autolinks (with angle brackets):** User types `<https://example.com>` or `<user@example.com>` → brackets hidden, text displayed as clickable link.
- **Bare links (without angle brackets):** User types `https://example.com` or `user@example.com` → automatically detected and styled as clickable link (no brackets to hide).

Both types are detected using remark-gfm's AST parsing, ensuring GFM compliance.

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

### Bare Link Detection
```gherkin
Feature: Bare Links

  Scenario: Bare URL
    When I type https://example.com
    Then the URL is styled as a clickable link
    And no brackets are hidden (none exist)

  Scenario: Bare email
    When I type user@example.com
    Then the email is styled as a clickable mailto link
    And no brackets are hidden (none exist)

  Scenario: Bare link in paragraph
    When I type "Visit https://example.com for info"
    Then the URL is automatically detected and clickable
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

  Scenario: Multiple bare links
    When I type "Contact user@example.com or https://example.com"
    Then both links are automatically detected and clickable
```

## Technical Implementation

**Parser Integration:**
- Uses `remark-gfm` v4.0.1 for AST parsing
- Detects autolinks and bare links via AST structure (link text equals URL)
- Distinguishes autolinks from bare links by checking for angle brackets in source text
- Uses text child node positions for accurate decoration ranges

**Decoration Strategy:**
- **Autolinks:** Hides opening `<` and closing `>` brackets, styles inner content as link
- **Bare links:** Styles entire URL/email as link (no brackets to hide)
- Both types emit scope ranges for reveal-on-select behavior

**Link Provider Integration:**
- Works with existing `MarkdownLinkProvider` for clickability
- Supports `mailto:` links for email autolinks
- Compatible with link hover provider for URL previews

## Notes

- Core GFM feature
- Competitive requirement (markless has it)
- Implementation leverages remark-gfm's AST (no manual parsing)

## Examples

### Autolinks (with angle brackets)
- `<user@example.com>` → `user@example.com` (clickable mailto link, brackets hidden)
- `<user+tag@example.com>` → `user+tag@example.com` (plus addressing preserved, clickable, brackets hidden)
- `<https://example.com>` → `https://example.com` (clickable, brackets hidden)
- `"Visit <https://example.com> for info"` → Visit `https://example.com` for info (only brackets hidden on autolink)
- `"Contact <user@example.com> or <https://example.com>"` → Contact `user@example.com` or `https://example.com` (both autolinks clickable, brackets hidden)
- `"URL:<https://example.com>text"` → URL:`https://example.comtext` (only the autolink is styled as a link)

### Bare Links (without angle brackets)
These are automatically detected URLs and emails that don't require angle brackets:
- `user@example.com` → `user@example.com` (clickable mailto link, no brackets to hide)
- `user+tag@example.com` → `user+tag@example.com` (plus addressing preserved, clickable)
- `https://example.com` → `https://example.com` (clickable)
- `Visit https://example.com for info` → Visit `https://example.com` for info (automatically detected in text)

### Disabled Autolinks

Autolinks within code blocks, inline code, and certain contexts should not be converted.

Examples:
- \`<https://example.com>\` → `<https://example.com>` (brackets remain, not clickable)
- In code blocks:
  ```
  <user@example.com>
  <https://example.com>
  ```
  The brackets are not hidden and there is no linkification inside code blocks.

### Nested and Malformed Autolinks

The parser relies on remark-gfm's validation. Most malformed autolinks are correctly rejected, but some edge cases may still be parsed:

**Correctly rejected (not linkified):**
- `<user@@example.com>` → `<user@@example.com>` (invalid email, not linkified)
- `<foo<bar>@example.com>` → `<foo<bar>@example.com>` (invalid syntax, not linkified)

**Parsed by remark-gfm (may be linkified):**
- `<<https://example.com>>` → May parse inner URL (remark-gfm behavior)
- `<https://example.com` → May parse without closing bracket (remark-gfm behavior)

**Note:** The implementation follows remark-gfm's parsing decisions to ensure GFM compliance. Invalid emails and clearly malformed syntax are correctly rejected.

### Compatibility

Autolinks and bare links are fully GFM-compliant:

**GFM Specification Compliance:**
- ✅ Follows [GitHub Flavored Markdown Autolink Specification](https://github.github.com/gfm/#autolinks-extension-)
- ✅ Uses `remark-gfm` v4.0.1 for parsing (official GFM parser)
- ✅ Supports both URL autolinks (`<https://...>`) and email autolinks (`<email@example.com>`)
- ✅ Supports bare links (URLs and emails without angle brackets) as per GFM spec
- ✅ Properly handles `mailto:` prefix for email links
- ✅ Respects code block boundaries (no linkification inside code)

**Parser Behavior:**
- Detection is handled entirely by remark-gfm's AST parsing
- No manual regex or text pattern matching
- Relies on parser's validation for edge cases
- Ensures consistency with other GFM-compliant tools

**Integration:**
- Works seamlessly with existing link provider (clickability)
- Supports reveal-on-select behavior (raw markdown shown when selected)
- Compatible with link hover provider (URL preview)
- Respects code block exclusion rules


