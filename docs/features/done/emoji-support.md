---
status: DONE
updateDate: 2026-01-24
priority: Low
---

# Emoji Support

## Overview

Render GitHub-style emoji shortcodes like `:smile:` and `:+1:` inline in Markdown documents.

## Implementation

- Syntax: `:shortcode:` (GitHub/gemoji-style, e.g. `:smile:`, `:+1:`, `:t-rex:`, `:non-potable_water:`)
- Detection:
  - Runs on **remark AST text nodes** (not raw regex over the whole document)
  - Matches `/:([a-z0-9_+-]+):/gi` and validates the shortcode against a known emoji map
  - Skips parsing inside **inline code** and **fenced code blocks**
- Rendering:
  - Creates a decoration of type `emoji` covering the full shortcode range
  - The shortcode text is hidden, and the emoji character is injected via per-range render options
- Reveal behavior:
  - Integrates with the 3‑state visibility model; when the cursor/selection enters an `emoji` scope, the raw `:shortcode:` is revealed
- Configuration:
  - `markdownGongwen.emojis.enabled` (default: `true`) toggles emoji rendering on/off
- Performance:
  - Emoji map is **lazily loaded** only if a text slice contains `:` (fast path for documents without emojis)

## Acceptance Criteria

### Basic Emoji Support

```gherkin
Feature: Emoji shortcode rendering

  Scenario: Basic emoji
    When I type :smile:
    Then the emoji is rendered
    And the shortcode is replaced visually

  Scenario: Emoji with plus
    When I type :+1:
    Then the emoji is rendered correctly

  Scenario: Emoji with hyphens and underscores
    When I type :t-rex:
    And I type :heart_eyes:
    Then both emojis are rendered correctly
```

### Edge Cases

```gherkin
Feature: Emoji edge cases

  Scenario: Invalid shortcode
    When I type :not-an-emoji:
    Then the shortcode is handled gracefully
    And no error occurs

  Scenario: Emoji in paragraph
    When I type "Hello :smile: world"
    Then only the emoji is rendered
    And surrounding text is unaffected

  Scenario: No emoji rendering in code
    When I type `:smile:` in inline code
    And I type ```\n:smile:\n``` in a fenced code block
    Then no emoji is rendered in code
```

### Reveal Raw Markdown

```gherkin
Feature: Reveal emoji

  Scenario: Reveal on select
    Given :smile: is in my file
    When I place the cursor inside the emoji
    Then the raw markdown is shown
    When I move the cursor away
    Then the emoji is rendered again
```

### Configuration Toggle

```gherkin
Feature: Emoji config toggle

  Scenario: Disable emoji rendering
    Given markdownGongwen.emojis.enabled is false
    When I open a file containing :smile:
    Then the raw shortcode is shown
    And no emoji is rendered
```

## Notes

- Uses the GitHub **gemoji** shortcode set (map is auto-generated and loaded on demand)
- Invalid shortcodes are ignored (no replacement, no errors)
- Designed to be optional via configuration because emoji rendering is a GFM extension / convenience feature

## Examples

- `:smile:` → 😄
- `:+1:` → 👍
- `:-1:` → 👎
- `:tada:` → 🎉
- `:t-rex:` → 🦖
- `:not-an-emoji:` → stays as-is (no replacement)
