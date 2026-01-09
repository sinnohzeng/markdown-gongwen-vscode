---
status: TODO
updateDate: 2024-12-19
priority: Medium
---

# HTML Tags

## Overview

Detect and style HTML tags within markdown.

## Implementation

Detect HTML tags (`<tag>`, `</tag>`, self-closing tags), style distinctly, optionally hide/show content based on tag type, preserve on reveal.

## Acceptance Criteria

### Basic HTML Tags
```gherkin
Feature: HTML tag formatting

  Scenario: Opening tag
    When I type <strong>text</strong>
    Then the tags are detected
    And the tags are styled distinctly

  Scenario: Self-closing tag
    When I type <br/>
    Then the tag is detected
    And the tag is styled

  Scenario: Inline tag
    When I type <em>italic</em>
    Then the tag is detected
    And the content is rendered appropriately
```

### Nested Tags
```gherkin
Feature: Nested HTML tags

  Scenario: Nested tags
    When I type <div><strong>bold</strong></div>
    Then all tags are detected
    And nesting is handled correctly

  Scenario: Multiple levels
    When I type <div><p><span>text</span></p></div>
    Then all tags are detected correctly
```

### Edge Cases
```gherkin
Feature: HTML tag edge cases

  Scenario: Malformed HTML
    When I type <div>unclosed
    Then the malformed HTML is handled gracefully

  Scenario: HTML in code
    When I type `<div>code</div>`
    Then the HTML is not processed
    And it remains as code
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal HTML tags

  Scenario: Reveal on select
    Given <strong>text</strong> is in my file
    When I select the HTML
    Then the raw markdown is shown
    When I deselect
    Then the tags are styled again
```

## Notes

- Markdown allows inline HTML
- Useful for advanced formatting
- Competitive requirement (markless has it)
- Complex due to nested tags and edge cases
- Must handle malformed HTML gracefully
- Consider which tags to render vs. hide
- Feasibility: Moderate
- Usefulness: Moderate
- Risk: Medium (parsing complexity)
- Effort: 1-2 weeks
- HTML parser (to be determined - may use remark-html or custom parser)

## Examples

```markdown
<strong>Bold text</strong>
<em>Italic text</em>
<kbd>Ctrl+C</kbd>
<div>Block content</div>
```

→ HTML tags detected and styled, content rendered appropriately
