---
status: DONE
updateDate: 2026-01-18
priority: Medium
---

# YAML Frontmatter

## Overview

Detect, style, and hide YAML frontmatter delimiters at the start of Markdown documents.

## Implementation

Detect `---` delimiters at document start, style frontmatter block with background color (similar to code blocks). Delimiters are shown at reduced opacity (configurable via `markdownInlineEditor.decorations.frontmatterDelimiterOpacity`, default: 0.3). Delimiters remain visible while the entire block is styled. Supports CRLF line endings and validates frontmatter format (closing delimiter must be `---` with optional whitespace only). Horizontal rules inside frontmatter are skipped to avoid false positives.

## Acceptance Criteria

### Basic Frontmatter
```gherkin
Feature: YAML frontmatter formatting

  Scenario: Basic frontmatter
    When I type ---
    And I type title: My Document
    And I type ---
    Then the delimiters are hidden
    And the frontmatter is styled

  Scenario: Frontmatter with multiple fields
    When I type ---
    And I type title: Document
    And I type author: Author
    And I type ---
    Then all fields are detected
    And delimiters are hidden
```

### Edge Cases
```gherkin
Feature: Frontmatter edge cases

  Scenario: Frontmatter not at start
    When I type # Heading
    And I type ---
    Then it is not treated as frontmatter

  Scenario: Incomplete frontmatter
    When I type ---
    And I type title: Document
    And no closing delimiter exists
    Then it is handled gracefully
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal frontmatter

  Scenario: Reveal on select
    Given ---
    title: Document
    --- is in my file
    When I select the frontmatter
    Then the raw markdown is shown
    When I deselect
    Then the delimiters are hidden again
```

## Notes

- Not core GFM (frontmatter is YAML, not Markdown)
- Limited use case (Jekyll/Hugo/Obsidian workflows)
- Markless doesn't have it
- Polish feature
- Deferred from High Priority due to limited use case
- Feasibility: High
- Usefulness: Moderate
- Risk: Low
- Effort: 1 week
- Dependencies: None (parser enhancement)

## Examples

```markdown
---
title: My Document
author: John Doe
---

# Content starts here
```

→ Frontmatter styled distinctly, delimiters hidden, reveal on selection
