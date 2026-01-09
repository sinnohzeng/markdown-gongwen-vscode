---
status: TODO
updateDate: 2024-12-19
priority: High
---

# Mermaid Diagrams

## Overview

Hover preview for rendered Mermaid diagrams in code blocks.

## Implementation

Detect ` ```mermaid` code blocks, render on hover using hover provider (better than markless inline approach).

## Acceptance Criteria

### Basic Mermaid Diagrams
```gherkin
Feature: Mermaid diagram formatting

  Scenario: Basic diagram
    When I type ```mermaid
    And I type graph TD
    And I type     A --> B
    And I type ```
    Then the code block is detected
    And hover shows rendered diagram

  Scenario: Different diagram types
    When I type ```mermaid
    And I type sequenceDiagram
    And I type ```
    Then the diagram is detected correctly
```

### Edge Cases
```gherkin
Feature: Mermaid diagram edge cases

  Scenario: Invalid Mermaid syntax
    When I type ```mermaid
    And I type invalid syntax
    And I type ```
    Then the error is handled gracefully

  Scenario: Non-mermaid code block
    When I type ```javascript
    And I type code
    And I type ```
    Then it is not treated as Mermaid
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal Mermaid diagram

  Scenario: Reveal on select
    Given ```mermaid
    graph TD
    A --> B
    ``` is in my file
    When I select the code block
    Then the raw markdown is shown
    When I deselect
    Then the code block is detected again
```

## Notes

- High user demand
- Competitive requirement (markless has it but buggy)
- Hover approach avoids markless bugs
- Better performance than inline rendering
- Simpler and more reliable than inline approach
- Feasibility: Moderate
- Usefulness: High
- Risk: Medium (rendering complexity)
- Effort: 2-3 weeks
- Rendering solution required (to be determined)

## Examples

````markdown
```mermaid
graph TD
    A[Start] --> B[End]
```
````

→ Hover over code block to see rendered diagram
