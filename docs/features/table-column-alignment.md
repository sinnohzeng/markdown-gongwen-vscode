---
status: TODO
githubIssue: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/21
updateDate: 2026-01-09
priority: Medium
---

# Table Column Alignment with Markup

## Overview

Fix column alignment in tables when cells contain formatted text (bold, code, italic, etc.). Currently, when markup is hidden, the column alignment breaks because the rendered width differs from the raw markdown width.

## Implementation

When calculating table column widths, account for the rendered width of formatted text instead of using raw markdown width. This requires:

**Width Calculation:**
- Measure rendered text width for cells containing markup (bold, code, italic, etc.)
- Use VS Code's text measurement API or calculate based on character widths
- Account for font metrics and styling differences
- Preserve alignment indicators (`:---`, `:---:`, `---:`) while adjusting column spacing

**Table Processing:**
- Detect table cells with inline formatting during parsing
- Calculate actual rendered width for each cell
- Adjust column spacing to maintain alignment
- Handle mixed cells (some with markup, some without)

**Edge Cases:**
- Multiple formatting types in one cell (e.g., `**bold** and `code`)
- Nested formatting
- Very long cell content
- Mixed alignment types (left, center, right)

## Acceptance Criteria

### Basic Alignment with Markup
```gherkin
Feature: Table alignment with formatted cells

  Scenario: Table with inline code
    Given a table with inline code in cells
    When I view the table
    Then columns remain aligned
    And code formatting is hidden
    And alignment matches normal view

  Scenario: Table with bold text
    Given a table with bold text in cells
    When I view the table
    Then columns remain aligned
    And bold formatting is shown
    And alignment matches normal view
```

### Mixed Formatting
```gherkin
Feature: Table alignment with mixed formatting

  Scenario: Mixed formatted and plain cells
    Given a table with some cells containing markup
    And some cells with plain text
    When I view the table
    Then all columns remain aligned
    And formatting is preserved

  Scenario: Multiple formatting types
    Given a table cell with bold and code
    When I view the table
    Then the column alignment is correct
    And all formatting is rendered
```

### Alignment Preservation
```gherkin
Feature: Alignment preservation

  Scenario: Left-aligned columns
    Given a table with left-aligned columns
    And cells contain formatted text
    When I view the table
    Then left alignment is maintained
    And columns are properly aligned

  Scenario: Center and right alignment
    Given a table with center and right-aligned columns
    And cells contain formatted text
    When I view the table
    Then alignment types are preserved
    And columns remain aligned
```

### Edge Cases
```gherkin
Feature: Alignment edge cases

  Scenario: Very long formatted content
    Given a table with very long formatted cell content
    When I view the table
    Then columns remain aligned
    And content is handled gracefully

  Scenario: Empty and formatted cells
    Given a table with empty cells and formatted cells
    When I view the table
    Then alignment is maintained
    And empty cells are handled correctly
```

## Notes

- Problem: When markup (bold, code, etc.) is hidden, rendered width differs from raw markdown width, breaking column alignment
- Solution: Calculate rendered text width and adjust column spacing accordingly
- Related to tables feature but addresses specific alignment issue
- Affects readability of tables with formatted content
- Currently columns align correctly in normal view but break with extension enabled
- Feasibility: Moderate (requires text width measurement)
- Usefulness: High (improves table readability significantly)
- Risk: Medium (complex width calculations, font-dependent)
- Effort: 1-2 weeks
- Dependencies: Tables feature must be implemented first
- Technical challenge: Accurate text width measurement across different fonts and themes

## Examples

See reference on: https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/21 

**Before (broken alignment):**
```markdown
| Field | Value |
|:------|:------|
| `id` | 14000 |
| `customer_id` | 2995299 |
| `external_customer_id` | ZRV-M00011 |
```
Columns misaligned when code formatting is hidden.

**After (fixed alignment):**
```markdown
| Field | Value |
|:------|:------|
| `id` | 14000 |
| `customer_id` | 2995299 |
| `external_customer_id` | ZRV-M00011 |
```
Columns remain aligned, accounting for rendered code width.

**With bold text:**
```markdown
| Status | Count |
|:-------|:------|
| **Active** | 10 |
| **Inactive** | 5 |
```
Bold text width is accounted for in column alignment.
