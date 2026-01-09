---
status: TODO
updateDate: 2024-12-19
priority: High
---

# Tables

## Overview

Complete table syntax hiding with cell alignment and multi-line cell support.

## Implementation

Detect GFM table syntax, hide pipe delimiters (`|`), style cell alignment indicators (`:---`, `:---:`, `---:`), support multi-line cells, preserve alignment on reveal.

## Acceptance Criteria

### Basic Tables
```gherkin
Feature: Table formatting

  Scenario: Basic table
    When I type | Header 1 | Header 2 |
    And I type |:---------|:--------:|
    And I type | Cell 1   | Cell 2   |
    Then the pipe delimiters are hidden
    And the table is displayed

  Scenario: Table with alignment
    When I type |:---|:---:|---:|
    Then left alignment is indicated
    And center alignment is indicated
    And right alignment is indicated
```

### Multi-line Cells
```gherkin
Feature: Multi-line table cells

  Scenario: Multi-line cell
    When I type | Multi |
    And I type | Line  |
    And I type | Cell |
    Then the multi-line cell is handled correctly

  Scenario: Mixed single and multi-line
    When I type | Single | Multi |
    And I type |        | Line  |
    Then both cell types are handled correctly
```

### Edge Cases
```gherkin
Feature: Table edge cases

  Scenario: Empty cells
    When I type | | Empty | |
    Then empty cells are handled gracefully

  Scenario: Table with formatting
    When I type | **Bold** | *Italic* |
    Then formatting in cells is preserved
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal table

  Scenario: Reveal on select
    Given | Header | Header |
    |:------|:------:|
    | Cell  | Cell   | is in my file
    When I select the table
    Then the raw markdown is shown
    When I deselect
    Then the pipes are hidden again
```

## Notes

- Core GFM feature
- Competitive requirement (markless has it)
- High user demand
- Complex due to alignment and multi-line handling
- Must preserve alignment when revealing raw markdown
- Feasibility: High
- Usefulness: High
- Risk: Medium (complex edge cases)
- Effort: 2-3 weeks
- Dependencies: None (parser enhancement, remark-gfm already supports tables)

## Examples

```markdown
| Header 1 | Header 2 | Header 3 |
|:---------|:--------:|---------:|
| Left     | Center   | Right    |
| Multi    | Line     | Cell     |
| content  | here     |          |
```

→ Table rendered with hidden pipes, alignment preserved, reveal on selection
