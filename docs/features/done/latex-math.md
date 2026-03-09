---
status: DONE
updateDate: 2026-03-09
priority: High
---

# LaTeX/Math

## Overview

Inline and block LaTeX math rendering in the editor. **Delimiter math** (003-inline-latex-equations): `$...$` (inline) and `$$...$$` (block) are detected, rendered with MathJax to SVG, and displayed via decorations. **Code-block math** (004-code-block-math-environments): fenced blocks with `math`, `latex`, or `tex` language tags are rendered as display math over the whole block, with height from body line count. Raw LaTeX is revealed when the cursor or selection is inside a math region. Toggle via `markdownInlineEditor.math.enabled`.

## Implementation

- **Delimiter math**: Detect `$...$` and `$$...$$`, render to SVG, apply decorations; skip inside non-math fenced blocks.
- **Code-block math**: Detect ` ```math `, ` ```latex `, ` ```tex `; emit whole-block range and body line count; render body as display math; reserve height = (numLines + 2) × line height so content does not overlap following lines.
- Uses MathJax (mathjax-full); no line-count limit.

## Acceptance Criteria

### Inline Math
```gherkin
Feature: Inline math formatting

  Scenario: Basic inline math
    When I type $E = mc^2$
    Then the math is detected
    And the formula is rendered inline

  Scenario: Inline math in paragraph
    When I type "The equation $x = y$ is true"
    Then the math is detected
    And surrounding text is unaffected
```

### Block Math (Delimiters)
```gherkin
Feature: Block math formatting

  Scenario: Basic block math
    When I type $$
    And I type \int_0^\infty e^{-x^2} dx
    And I type $$
    Then the math is detected
    And the formula is rendered as block

  Scenario: Multi-line block math
    When I type $$
    And I type \begin{align}
    And I type x &= y
    And I type \end{align}
    And I type $$
    Then the math is detected correctly
```

### Code-Block Math
```gherkin
Feature: Code-block math

  Scenario: Math fence renders as display math
    When I type ```math
    And I type \sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
    And I type ```
    Then the block is rendered as display math
    And the following line is not overlapped

  Scenario: latex and tex fences
    When I type ```latex or ```tex with LaTeX body
    Then the block is rendered like ```math
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

  Scenario: Dollars in non-math code block
    When I type ```js and $x$ inside
    Then no math region is emitted for the code block
```

### Reveal Raw Markdown
```gherkin
Feature: Reveal math

  Scenario: Reveal on select
    Given $E = mc^2$ is in my file
    When I select the math
    Then the raw markdown is shown
    When I deselect
    Then the math is rendered again
```

## Notes

- **003-inline-latex-equations**: Delimiter math (`$...$`, `$$...$$`); specs in `specs/003-inline-latex-equations/`.
- **004-code-block-math-environments**: Fenced `math`/`latex`/`tex` blocks; specs in `specs/004-code-block-math-environments/`; height and range follow mermaid-style behavior.
- **Known issue**: Theme-appropriate font color for rendered math may need follow-up.
- Essential for academic/technical users.

## Examples

- Inline: `$E = mc^2$` → Rendered formula inline
- Block (delimiters): `$$\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$` → Rendered as block
- Block (fence): ` ```math ` with `\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}` → Display math over whole block, no overlap with next line
