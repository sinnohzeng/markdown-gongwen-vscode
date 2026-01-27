---
status: TODO
updateDate: 2024-12-19
priority: High
---

# Mentions and References Styling

## Overview

Enhance the readability of Markdown by detecting and visually styling common GitHub-style mentions and references, such as user mentions (`@username`, `@org/team`) and issue/PR references (`#123`, `@user/repo#456`). These references are rendered with distinct inline styling to make them stand out from regular text—mimicking the appearance seen on platforms like GitHub or GitLab.

## Implementation

- **Pattern detection**: Identify common mention (`@username`, `@org/team`) and reference (`#123`, `@user/repo#456`) patterns using efficient text pattern matching.
- **Styling**: Apply a visibly distinct decoration to each detected mention or reference, using a style similar to code formatting or subtle tagging as seen in markdown renderers.
- **Text preservation**: The underlying markdown text remains unchanged—these are strictly visual decorations, not text edits.
- **Purely visual**: Decorations are applied for visual emphasis only, without providing navigation, links, or API lookups.

## Acceptance Criteria

### User Mentions
```gherkin
Feature: User mention formatting

  Scenario: Basic mention
    When I type @username
    Then the mention is styled using an inline code/label style

  Scenario: Organization/team mention
    When I type @org/team
    Then the mention is styled using the same style as user mentions

  Scenario: Mention in paragraph
    When I type "Contact @username for help"
    Then only the mention part "@username" is styled
    And the surrounding text is unaffected
```

### Issue and PR References
```gherkin
Feature: Issue reference formatting

  Scenario: Basic issue reference
    When I type #123
    Then the reference is styled using a distinct inline style

  Scenario: Reference with user/repo
    When I type @user/repo#456
    Then the entire "@user/repo#456" is styled as a single reference unit

  Scenario: Multiple references in line
    When I type #123 and #456
    Then both references "#123" and "#456" are styled individually
```

### Edge Cases
```gherkin
Feature: Robust mention/reference detection

  Scenario: Email address is typed
    When I type user@example.com
    Then it is not styled as a mention

  Scenario: Number sign in text
    When I type "Issue #123"
    Then "#123" is styled, but the surrounding text remains plain

  Scenario: At-sign as symbol, not mention
    When I type "Prices start @ $5"
    Then "@ $5" is not styled as a mention
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal original markdown

  Scenario: Raw markdown reveal on selection
    Given @username is present in the file
    When I select or place the caret on the mention/reference
    Then the original raw markdown is shown (no decoration applied)
    When I deselect or move the caret away
    Then the styled decoration is re-applied
```

## Notes

- This is a non-intrusive, visual enhancement for Markdown editing in VS Code.
- No click-to-navigate, linking, or integration with remote services is included.
- Styles are chosen to visually align with popular markdown renderers (e.g., background shading, subtle border, or code-style font).
- May be extended to add tooltips or quick copy features in the future.
- High feasibility, low risk, moderate implementation complexity due to pattern edge cases (particularly email detection and code block exclusion).

## Examples

- <code>@username</code> → visually styled as a mention (special text style)
- <code>#123</code> → visually styled as an issue reference
- <code>@org/team</code> → visually styled mention (same style as @username)
- <code>@user/repo#456</code> → visually styled as a reference to issue/pr in <code>user/repo</code>

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