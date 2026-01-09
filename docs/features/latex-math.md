---
status: TODO
updateDate: 2024-12-19
priority: High
---

# LaTeX/Math

## Overview

Hover preview for rendered LaTeX/math formulas using inline and block math syntax.

## Implementation

Detect `$...$` (inline) and `$$...$$` (block) math, render on hover using hover provider (better than markless inline approach).

## Acceptance Criteria

### Inline Math
```gherkin
Feature: Inline math formatting

  Scenario: Basic inline math
    When I type $E = mc^2$
    Then the math is detected
    And hover shows rendered formula

  Scenario: Inline math in paragraph
    When I type "The equation $x = y$ is true"
    Then the math is detected
    And surrounding text is unaffected
```

### Block Math
```gherkin
Feature: Block math formatting

  Scenario: Basic block math
    When I type $$
    And I type \int_0^\infty e^{-x^2} dx
    And I type $$
    Then the math is detected
    And hover shows rendered formula

  Scenario: Multi-line block math
    When I type $$
    And I type \begin{align}
    And I type x &= y
    And I type \end{align}
    And I type $$
    Then the math is detected correctly
```

### Edge Cases
```gherkin
Feature: Math edge cases

  Scenario: Dollar sign in text
    When I type "Price is $10"
    Then it is not treated as math
    And the dollar sign is preserved

  Scenario: Escaped dollar
    When I type \$10
    Then it is not treated as math
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal math

  Scenario: Reveal on select
    Given $E = mc^2$ is in my file
    When I select the math
    Then the raw markdown is shown
    When I deselect
    Then the math is detected again
```

## Notes

- Essential for academic/technical users
- Competitive requirement (markless has it but buggy)
- Hover approach avoids markless bugs
- Better performance than inline rendering
- Simpler and more reliable than inline approach
- Feasibility: Moderate
- Usefulness: High
- Risk: Medium (rendering complexity)
- Effort: 2-3 weeks
- Math rendering solution required (to be determined)

## Examples

- Inline math: `$E = mc^2$` → Hover to see rendered formula
- Block math: `$$\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$` → Hover to see rendered formula
