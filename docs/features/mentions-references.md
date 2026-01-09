---
status: TODO
updateDate: 2024-12-19
priority: High
---

# Mentions/References

## Overview

GitHub-style `@username` and `#123` references with proper styling.

## Implementation

Detect `@username` and `#123` patterns, style as references (distinct from regular text), make clickable if possible, preserve on reveal.

## Acceptance Criteria

### User Mentions
```gherkin
Feature: User mention formatting

  Scenario: Basic mention
    When I type @username
    Then the mention is styled
    And the mention is clickable if in GitHub context

  Scenario: Organization mention
    When I type @org/team
    Then the mention is styled correctly

  Scenario: Mention in paragraph
    When I type "Contact @username for help"
    Then only the mention is styled
    And surrounding text is unaffected
```

### Issue References
```gherkin
Feature: Issue reference formatting

  Scenario: Basic issue reference
    When I type #123
    Then the reference is styled
    And the reference is clickable if in GitHub context

  Scenario: Issue with repo
    When I type @user/repo#456
    Then the reference is styled correctly

  Scenario: Multiple references
    When I type #123 and #456
    Then both references are styled correctly
```

### Edge Cases
```gherkin
Feature: Mention/reference edge cases

  Scenario: Email address
    When I type user@example.com
    Then it is not treated as a mention

  Scenario: Hash in text
    When I type "Issue #123"
    Then the reference is detected
    And the hash is part of the reference
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal mention/reference

  Scenario: Reveal on select
    Given @username is in my file
    When I select the mention
    Then the raw markdown is shown
    When I deselect
    Then the mention is styled again
```

## Notes

- GitHub Flavored Markdown feature
- Useful for GitHub/GitLab workflows
- Competitive requirement (markless has it)
- Moderate complexity
- Can enhance with hover tooltips showing user/issue info (future enhancement)
- Feasibility: High
- Usefulness: Moderate
- Risk: Low
- Effort: 1 week
- Dependencies: None (parser enhancement, pattern matching)

## Examples

- `@username` → Styled as mention, clickable if in GitHub context
- `#123` → Styled as issue reference, clickable if in GitHub context
- `@org/team` → Styled as team mention
- `@user/repo#456` → Styled as pull request reference
