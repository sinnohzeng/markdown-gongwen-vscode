---
title: Markdown Example Document - UAT Checklist
---

# Markdown Example - UAT Checklist

## Syntax Shadowing System - Testing Guide

The extension uses a 3-state model for markdown syntax visibility:

### States:
- **Rendered (default)**: Syntax markers are hidden, only formatted content is visible 
- **Ghost**: When cursor is on a line with markdown syntax but NOT inside the construct - markers show at reduced opacity. can be changed in the settings 
- **Raw**: When cursor/selection is inside or at boundaries of a construct - markers show fully visible 

### Testing Checklist for Each Example:

For each example below, verify the following behaviors:

**Rendered state**: When cursor is away from the construct, syntax markers are hidden 
**Ghost state**: When cursor is on the same line but outside the construct, markers show faintly (30% opacity) 
**Raw state**: When cursor is inside the construct or at its boundaries (start/end), markers show fully visible 
**Raw state with selection**: When text is selected covering the construct, markers show fully visible 
**Semantic styling preserved**: Formatting (bold, italic, etc.) remains visible in all states 
**Boundary detection**: Cursor right after closing marker shows raw state (not ghost) 
**Boundary detection**: Cursor at opening marker shows raw state (not ghost) 

---


## Basic Markdown Smoke Test

# Document Title

This is a paragraph with **bold**, *italic*, ~~strikethrough~~, `inline code`, and a [link to example.com](https://example.com).

## Section Heading

Here's an image: ![Alt text](image.png)

- Unordered list item 1
- Unordered list item 2 with **bold**
- Nested list root
  - Nested item with *italic*

1. Ordered list item 1
2. Ordered list item 1
3. Ordered list item 2 with `code`
   1. Ordered list item 1
   2. Ordered list item 2 with `code`
      1. Ordered list item 3 with [link](https://example.com)

- [x] Completed task
- [ ] Unchecked task
- [x] Clickable checkbox list item

> This is a blockquote with **bold** text
> Nested blockquote root
> > Nested blockquote with *italic* text

```python
# Code block example
def example():
    return "Hello, World!"
``` 

---


## Font Styles

**Bold text with asterisks** 
__Bold text with underscores__ 

*Italic text with asterisk* 
_Italic text with underscore_ 

***Bold and italic text with triple asterisks*** 
___Bold and italic text with triple underscores___ 

~~Strikethrough text~~ 
`simple inline code` 

`code with spaces` 

`` `code` with backticks inside `` 
````Here is some ``inline `code` inside backticks```` 

## Sequential Font Styles Examples

**Bold** *Italic* ~~Strikethrough~~ 
__Bold__ _Italic_ `Inline code` 
**Bold** *Italic* ~~Strikethrough~~ `Code` 
~~Strikethrough~~ **Bold** *Italic* 
*Italic* `Code` __Bold__ 
`Code` ~~Strikethrough~~ *Italic* 
**Bold** *Italic* ~~Strikethrough~~ `Code block` 
[**Bold link**](https://example.com) *Italic* `inline code` 
~~Strikethrough~~ [__Bold link__](https://example.com) *Italic* `Code` 

---

## Nested Combinations

**Bold with *italic* inside** 
*Italic with **bold** inside* 
***Bold and italic combined*** 
**_Bold and italic (nested underscore syntax)_** 

~~**Bold in strikethrough**~~ 
~~*Italic in strikethrough*~~ 
**~~Bold and strikethrough (nested)~~** 
**~~Bold, Italic, and Strikethrough, and then `code`~~_** 

`**bold** inside code` (should show literal asterisks) 
`*italic* inside code` (should show literal asterisks) 
`~~strikethrough~~ inside code` (should show literal tildes) 

[**Bold** link text](https://example.com) 
[*Italic* link text](https://example.com) 
[~~Strikethrough~~ link text](https://example.com) 
[`Code` in link text](https://example.com) 
[**Bold** and *italic* combined](https://example.com) 

![**Bold** alt text to local image](test.png) 
![*Italic* alt text to local image](test.png) 

---

## Stacked Markdown Styles

# H1 with **bold** text 
## H2 with *italic* text 
### H3 with ~~strikethrough~~ text 
#### H4 with `inline code` 
##### H5 with [link text](https://example.com) 
###### H6 with **bold** and *italic* combined 

- Item with **bold** text 
- Item with *italic* text 
- Item with ~~strikethrough~~ text 
- Item with `inline code` 
- Item with [link](https://example.com) 

* Item with **bold** and *italic* 
* Item with `code` and [link](https://example.com) 

+ Item with **bold** text 
+ Item with *italic* text 

- Parent item with **bold** 
  - Nested item with *italic* 
    - Deeply nested with `code` 
- Another parent 
  - Nested with [link](https://example.com) 

1. First item with **bold** text 
2. Second item with *italic* text 
3. Third item with ~~strikethrough~~ text 
4. Fourth item with `inline code` 
5. Fifth item with [link](https://example.com) 

6) First item with **bold** 
7) Second item with *italic* 
8) Third item with `code` 

9.  Tenth item with **bold** 
10. Eleventh item with *italic* 
11. Twelfth item with [link](https://example.com) 

12. Parent item 
   1. Nested item 
      1. Deeply nested item 
13. Another parent 

- [x] Completed task with **bold** text 
- [ ] Unchecked task with *italic* text 
- [ ] Task with `inline code` 
- [ ] Task with [link](https://example.com) 

* [x] Completed task with **bold** 
* [ ] Unchecked task with *italic* 

+ [x] Completed task 
+ [ ] Unchecked task with `code` 

1. [x] Completed ordered task with **bold** 
2. [ ] Unchecked ordered task with *italic* 
3. [x] Another completed task with `code` 

1) [x] Completed task 
2) [ ] Unchecked task with **bold** 

> Quote text with **bold** formatting 

> Quote text with *italic* formatting 

> Quote text with `inline code` 

> Quote text with [link](https://example.com) 

> Outer quote with **bold** 
> > Nested quote with *italic* 
> > > Deeply nested quote with `code` 

---
*** 
___ 

------- 
******** 

## Headings

Markdown supports six levels of headings, using hash symbols (`#`) from `#` (H1) to `######` (H6).

# Heading Level 1
## Heading Level 2
### Heading Level 3
#### Heading Level 4
##### Heading Level 5
###### Heading Level 6

Ensure that syntax markers for headings (`#`, `##`, etc.) respond to the 3-state model:

- **Rendered**: Hashes hidden, only heading text styled by level.
- **Ghost**: Hashes appear faint when the cursor is on the heading's line but not inside the marker area.
- **Raw**: Hashes are fully visible when the cursor is inside or at the boundary of the heading marker.

**Test stacking other markdown inside headings:**

# Heading with **bold** and *italic*

## Heading with `inline code` and [link](https://example.com)

### Heading with ~~strikethrough~~

# `some code` test **bold**


# some heading
---

## Code Blocks

```python
print("Hello, World!")
def example():
    return True
```

```
plain code block
no language specified
```

````markdown
Here is some ```code``` inside
And also ``inline `code` `` examples
````

```javascript
function hello() {
  console.log("Hello, World!");
}
```

---

## Math (LaTeX) — TODO

```latex
\begin{align}
E &= mc^2 \\[10pt]
a^2 + b^2 &= c^2 \\[10pt]
\int_0^\infty e^{-x^2} \, dx &= \frac{\sqrt{\pi}}{2} \\[18pt]
\text{Euler's Identity:} \quad e^{i\pi} + 1 &= 0 \\[10pt]
\text{Quadratic Formula:} \quad x &= \frac{ -b \pm \sqrt{b^2 - 4ac} }{2a} \\[18pt]
\text{Taylor Series for } e^x: \quad e^x &= \sum_{n=0}^{\infty} \frac{x^n}{n!}
\end{align}
``` 

```math
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
``` 

- Euler's identity: $e^{i\pi} + 1 = 0$
- Physics: Force $F = ma$, Greek: $A = \pi r^2$
- Function: $ f(x)=\int_{-\infty}^{\infty}e^{-x^2}dx $

$$
f(x) = \int_{-\infty}^{\infty} e^{-x^2} dx
$$ 

**Note:** Use `\$` for a regular dollar sign when math is implemented.

---

## Appendix: TODO / Not Implemented Yet

| A   | B   |
| --- | --- |
| X   | Y   |

| A   | :--- | ---: | :-: |
| --- | ---- | ---- | --- |
| L   | left | r    | c   |

| Inline <sub>HTML</sub> | **Bold** | `Code` |
| :--------------------: | -------: | :----: |
|          Some          |  **Row** | `Data` |

| Multi<br>Line | Pipe&#124;In Cell | Escaped \| literal |
| ------------- | ----------------- | ------------------ |
| a<br>b        | value\|2          | \| yes \|          |
| Empty Col     |                   | Trailing           |

<https://github.com>
www.example.com
user@example.com

:smile: :+1: :tada: :not-an-emoji: 

@octocat #42 repo#99 

```mermaid
graph TD
A[Start] --> B{Is Markdown beautiful?}
B -- Yes --> C[More readable!]
B -- No --> D[Try Mermaid diagrams]
D --> E[Visualize ideas]
``` 

```mermaid
sequenceDiagram
participant User
participant Extension
User->>Extension: Opens a .md file
Extension-->>User: Renders with hidden syntax
User->>Extension: Clicks to reveal raw markdown
Extension-->>User: Shows raw source
``` 

```mermaid
gantt
title Markdown Features Timeline
dateFormat YYYY-MM-DD
section Syntax Decoration
Bold/Italic :done, a1, 2023-01-01,2023-02-01
Lists :done, a2, 2023-02-01,2023-03-01
Task Lists :active, a3, 2023-03-01,2023-04-01
Mermaid : a4, after a3, 15d
``` 

```mermaid
flowchart TD
    A[Start] --> B[Flowchart Example]
    B --> C[Flow End]
```

```mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Hi Bob!
    Bob-->>Alice: Hi Alice!
```

```mermaid
classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
```

```mermaid
stateDiagram
    [*] --> S1
    S1 --> S2
    S2 --> [*]
    S1 : This is a state
    S2 : Another state
```

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    CUSTOMER }|..|{ DELIVERY_ADDRESS : uses
```

```mermaid
gantt
    title Gantt Diagram Example
    dateFormat  YYYY-MM-DD
    section Section
    Task1           :done,    des1, 2022-01-06,2022-01-08
    Task2           :active,  des2, 2022-01-09, 3d
    Task3           :         des3, after des2, 5d
```

```mermaid
pie
    title Pie Chart Example
    "Cats" : 35
    "Dogs" : 25
    "Rats" : 15
```

```mermaid
journey
    title My Working Day
    section Go to Work
      Make Coffee: 5: Me
      Dress Up: 3: Me
    section Work
      Code: 5: Me,Colleague
      Review code: 2: Me
```

```mermaid
requirementDiagram
    requirement req1 {
      id: 1
      text: The system shall be secure
    }
    requirement req2 {
      id: 2
      text: The system shall be fast
    }
    req1 - priority:high -> req2


```

```mermaid
gitGraph
    commit id:"Initial commit"
    commit id:"Added Readme"
    branch develop
    checkout develop
    commit id:"Develop feature"
    checkout main
    merge develop


    
```


~~~js
console.log("Tilde fence, GFM");
~~~ 

<pre>
* GFM allows HTML *in text*
</pre> 

- [] Missing space after bracket for checkbox (invalid) 
- [x]Task missing space after checkbox (invalid) 
- [*] Not valid GFM (should not check) 

~not strikethrough~ (single tilde, not valid) 
~~GFM strikethrough~~ (valid) 
foo~~bar~~baz (strikethrough in middle of word) 
