---
status: DONE
updateDate: 2024-12-19
priority: Core Feature
---

# Code Blocks

## Overview

Code blocks with background styling and hidden fence markers.

## Implementation

- Syntax: ` ```lang ` (fenced code blocks)
- Fence markers (triple backticks) are hidden
- Code block background is styled with theme colors
- Language identifier is preserved but not displayed
- Supports all languages

## Acceptance Criteria

### Basic Code Blocks
```gherkin
Feature: Code block formatting

  Scenario: Basic code block
    When I type ```javascript
    And I type function hello() {
    And I type ```
    Then the fence markers are hidden
    And the code block has background styling

  Scenario: Code block with language
    When I type ```python
    And I type print("Hello")
    And I type ```
    Then the language identifier is preserved
    And the fence markers are hidden
```

### Edge Cases
```gherkin
Feature: Code block edge cases

  Scenario: Code block without language
    When I type ```
    And I type code here
    And I type ```
    Then the fence markers are hidden
    And the code block is styled

  Scenario: Nested code blocks
    When I type ```markdown
    And I type ```code```
    And I type ```
    Then the nested backticks are preserved
    And the outer fence markers are hidden
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal code block

  Scenario: Reveal on select
    Given ```javascript
    function hello() {}
    ``` is in my file
    When I select the code block
    Then the raw markdown is shown
    When I deselect
    Then the fence markers are hidden again
```

## Notes

- Core Markdown feature
- Supports all programming languages
- Language identifier preserved for syntax highlighting

## Examples

````markdown
```javascript
function hello() {
  console.log("Hello");
}
```
````

→ Code block with background styling, fences hidden
