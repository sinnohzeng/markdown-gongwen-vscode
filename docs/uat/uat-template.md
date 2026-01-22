---
title: Markdown Example Document - UAT Checklist
---

# Markdown Example - UAT Checklist

## Syntax Shadowing System - Testing Guide

The extension uses a 3-state model for markdown syntax visibility:

### States:
- **Rendered (default)**: Syntax markers are hidden, only formatted content is visible 
UAT-CHECK()
- **Ghost**: When cursor is on a line with markdown syntax but NOT inside the construct - markers show at reduced opacity. can be changed in the settings 
UAT-CHECK()
- **Raw**: When cursor/selection is inside or at boundaries of a construct - markers show fully visible 
UAT-CHECK()

### Testing Checklist for Each Example:

For each example below, verify the following behaviors:

**Rendered state**: When cursor is away from the construct, syntax markers are hidden 
UAT-CHECK()
**Ghost state**: When cursor is on the same line but outside the construct, markers show faintly (30% opacity) 
UAT-CHECK()
**Raw state**: When cursor is inside the construct or at its boundaries (start/end), markers show fully visible 
UAT-CHECK()
**Raw state with selection**: When text is selected covering the construct, markers show fully visible 
UAT-CHECK()
**Semantic styling preserved**: Formatting (bold, italic, etc.) remains visible in all states 
UAT-CHECK()
**Boundary detection**: Cursor right after closing marker shows raw state (not ghost) 
UAT-CHECK()
**Boundary detection**: Cursor at opening marker shows raw state (not ghost) 
UAT-CHECK()

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
1. Ordered list item 1
2. Ordered list item 2 with `code`
1. Ordered list item 1
2. Ordered list item 2 with `code`
3. Ordered list item 3 with [link](https://example.com)

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
UAT-CHECK()
__Bold text with underscores__ 
UAT-CHECK()

*Italic text with asterisk* 
UAT-CHECK()
_Italic text with underscore_ 
UAT-CHECK()

***Bold and italic text with triple asterisks*** 
UAT-CHECK()
___Bold and italic text with triple underscores___ 
UAT-CHECK()

~~Strikethrough text~~ 
UAT-CHECK()
`simple inline code` 
UAT-CHECK()

`code with spaces` 
UAT-CHECK()

`` `code` with backticks inside `` 
UAT-CHECK()
````Here is some ``inline `code` inside backticks```` 
UAT-CHECK()

## Sequential Font Styles Examples

**Bold** *Italic* ~~Strikethrough~~ 
UAT-CHECK()
__Bold__ _Italic_ `Inline code` 
UAT-CHECK()
**Bold** *Italic* ~~Strikethrough~~ `Code` 
UAT-CHECK()
~~Strikethrough~~ **Bold** *Italic* 
UAT-CHECK()
*Italic* `Code` __Bold__ 
UAT-CHECK()
`Code` ~~Strikethrough~~ *Italic* 
UAT-CHECK()
**Bold** *Italic* ~~Strikethrough~~ `Code block` 
UAT-CHECK()
[**Bold link**](https://example.com) *Italic* `inline code` 
UAT-CHECK()
~~Strikethrough~~ [__Bold link__](https://example.com) *Italic* `Code` 
UAT-CHECK()

---

## Nested Combinations

**Bold with *italic* inside** 
UAT-CHECK()
*Italic with **bold** inside* 
UAT-CHECK()
***Bold and italic combined*** 
UAT-CHECK()
**_Bold and italic (nested underscore syntax)_** 
UAT-CHECK()

~~**Bold in strikethrough**~~ 
UAT-CHECK()
~~*Italic in strikethrough*~~ 
UAT-CHECK()
**~~Bold and strikethrough (nested)~~** 
UAT-CHECK()
**~~Bold, Italic, and Strikethrough, and then `code`~~_** 
UAT-CHECK()

[**Bold** link text](https://example.com) 
UAT-CHECK()
[*Italic* link text](https://example.com) 
UAT-CHECK()
[~~Strikethrough~~ link text](https://example.com) 
UAT-CHECK()
[`Code` in link text](https://example.com) 
UAT-CHECK()
[**Bold** and *italic* combined](https://example.com) 
UAT-CHECK()

![**Bold** alt text](test.png) 
UAT-CHECK()
![*Italic* alt text](../test.png) 
UAT-CHECK()

`**bold** inside code` (should show literal asterisks) 
UAT-CHECK()
`*italic* inside code` (should show literal asterisks) 
UAT-CHECK()
`~~strikethrough~~ inside code` (should show literal tildes) 
UAT-CHECK()

---

## Stacked Markdown Styles

# H1 with **bold** text 
UAT-CHECK()

## H2 with *italic* text 
UAT-CHECK()

### H3 with ~~strikethrough~~ text 
UAT-CHECK()

#### H4 with `inline code` 
UAT-CHECK()

##### H5 with [link text](https://example.com) 
UAT-CHECK()

###### H6 with **bold** and *italic* combined 
UAT-CHECK()

- Item with **bold** text 
UAT-CHECK()
- Item with *italic* text 
UAT-CHECK()
- Item with ~~strikethrough~~ text 
UAT-CHECK()
- Item with `inline code` 
UAT-CHECK()
- Item with [link](https://example.com) 
UAT-CHECK()

* Item with **bold** and *italic* 
UAT-CHECK()
* Item with `code` and [link](https://example.com) 
UAT-CHECK()

+ Item with **bold** text 
UAT-CHECK()
+ Item with *italic* text 
UAT-CHECK()

- Parent item with **bold** 
UAT-CHECK()
  - Nested item with *italic* 
UAT-CHECK()
    - Deeply nested with `code` 
UAT-CHECK()
- Another parent 
UAT-CHECK()
  - Nested with [link](https://example.com) 
UAT-CHECK()

- Item 
UAT-CHECK()
- - Nested item 
UAT-CHECK()

1. First item with **bold** text 
UAT-CHECK()
2. Second item with *italic* text 
UAT-CHECK()
3. Third item with ~~strikethrough~~ text 
UAT-CHECK()
4. Fourth item with `inline code` 
UAT-CHECK()
5. Fifth item with [link](https://example.com) 
UAT-CHECK()

1) First item with **bold** 
UAT-CHECK()
2) Second item with *italic* 
UAT-CHECK()
3) Third item with `code` 
UAT-CHECK()

10. Tenth item with **bold** 
UAT-CHECK()
11. Eleventh item with *italic* 
UAT-CHECK()
12. Twelfth item with [link](https://example.com) 
UAT-CHECK()

1. Parent item 
UAT-CHECK()
   1. Nested item 
UAT-CHECK()
      1. Deeply nested item 
UAT-CHECK()
2. Another parent 
UAT-CHECK()

- [x] Completed task with **bold** text 
UAT-CHECK()
- [ ] Unchecked task with *italic* text 
UAT-CHECK()
- [ ] Task with `inline code` 
UAT-CHECK()
- [ ] Task with [link](https://example.com) 
UAT-CHECK()

* [x] Completed task with **bold** 
UAT-CHECK()
* [ ] Unchecked task with *italic* 
UAT-CHECK()

+ [x] Completed task 
UAT-CHECK()
+ [ ] Unchecked task with `code` 
UAT-CHECK()

1. [x] Completed ordered task with **bold** 
UAT-CHECK()
2. [ ] Unchecked ordered task with *italic* 
UAT-CHECK()
3. [x] Another completed task with `code` 
UAT-CHECK()

1) [x] Completed task 
UAT-CHECK()
2) [ ] Unchecked task with **bold** 
UAT-CHECK()

> Quote text with **bold** formatting 
UAT-CHECK()

> Quote text with *italic* formatting 
UAT-CHECK()

> Quote text with `inline code` 
UAT-CHECK()

> Quote text with [link](https://example.com) 
UAT-CHECK()

> Outer quote with **bold** 
> > Nested quote with *italic* 
> > > Deeply nested quote with `code` 
UAT-CHECK()

---
UAT-CHECK()
*** 
UAT-CHECK()
___ 
UAT-CHECK()

------- 
UAT-CHECK()
******** 
UAT-CHECK()

## Headings

Markdown supports six levels of headings, using hash symbols (`#`) from `#` (H1) to `######` (H6).

# Heading Level 1
UAT-CHECK()
## Heading Level 2
UAT-CHECK()
### Heading Level 3
UAT-CHECK()
#### Heading Level 4
UAT-CHECK()
##### Heading Level 5
UAT-CHECK()
###### Heading Level 6
UAT-CHECK()

Ensure that syntax markers for headings (`#`, `##`, etc.) respond to the 3-state model:

- **Rendered**: Hashes hidden, only heading text styled by level.
- **Ghost**: Hashes appear faint when the cursor is on the heading's line but not inside the marker area.
- **Raw**: Hashes are fully visible when the cursor is inside or at the boundary of the heading marker.

**Test stacking other markdown inside headings:**

# Heading with **bold** and *italic*
UAT-CHECK()

## Heading with `inline code` and [link](https://example.com)
UAT-CHECK()

### Heading with ~~strikethrough~~
UAT-CHECK()

# `some code` test **bold**
UAT-CHECK()


# some heading
UAT-CHECK()
---

## Code Blocks

```python
print("Hello, World!")
def example():
    return True
```
UAT-CHECK()

```
plain code block
no language specified
```
UAT-CHECK()

````markdown
Here is some ```code``` inside
And also ``inline `code` `` examples
````
UAT-CHECK()

```javascript
function hello() {
  console.log("Hello, World!");
}
```
UAT-CHECK()

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
UAT-CHECK()

```math
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
``` 
UAT-CHECK()

- Euler's identity: $e^{i\pi} + 1 = 0$
UAT-CHECK()
- Physics: Force $F = ma$, Greek: $A = \pi r^2$
UAT-CHECK()
- Function: $ f(x)=\int_{-\infty}^{\infty}e^{-x^2}dx $
UAT-CHECK()

$$
f(x) = \int_{-\infty}^{\infty} e^{-x^2} dx
$$ 
UAT-CHECK()

**Note:** Use `\$` for a regular dollar sign when math is implemented.

---

## Appendix: TODO / Not Implemented Yet

| A   | B   |
| --- | --- |
| X   | Y   |
UAT-CHECK()

| A   | :--- | ---: | :-: |
| --- | ---- | ---- | --- |
| L   | left | r    | c   |
UAT-CHECK()

| Inline <sub>HTML</sub> | **Bold** | `Code` |
| :--------------------: | -------: | :----: |
|          Some          |  **Row** | `Data` |
UAT-CHECK()

| Multi<br>Line | Pipe&#124;In Cell | Escaped \| literal |
| ------------- | ----------------- | ------------------ |
| a<br>b        | value\|2          | \| yes \|          |
| Empty Col     |                   | Trailing           |
UAT-CHECK()

<https://github.com>
UAT-CHECK()
www.example.com
UAT-CHECK()
user@example.com
UAT-CHECK()

:smile: :+1: :tada: :not-an-emoji: 
UAT-CHECK()

@octocat #42 repo#99 
UAT-CHECK()

```mermaid
graph TD
A[Start] --> B{Is Markdown beautiful?}
B -- Yes --> C[More readable!]
B -- No --> D[Try Mermaid diagrams]
D --> E[Visualize ideas]
``` 
UAT-CHECK()

```mermaid
sequenceDiagram
participant User
participant Extension
User->>Extension: Opens a .md file
Extension-->>User: Renders with hidden syntax
User->>Extension: Clicks to reveal raw markdown
Extension-->>User: Shows raw source
``` 
UAT-CHECK()

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
UAT-CHECK()

~~~js
console.log("Tilde fence, GFM");
~~~ 
UAT-CHECK()

<pre>
* GFM allows HTML *in text*
</pre> 
UAT-CHECK()

- [] Missing space after bracket for checkbox (invalid) 
UAT-CHECK()
- [x]Task missing space after checkbox (invalid) 
UAT-CHECK()
- [*] Not valid GFM (should not check) 
UAT-CHECK()

~not strikethrough~ (single tilde, not valid) 
UAT-CHECK()
~~GFM strikethrough~~ (valid) 
UAT-CHECK()
foo~~bar~~baz (strikethrough in middle of word) 
UAT-CHECK()
