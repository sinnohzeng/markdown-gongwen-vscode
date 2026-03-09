# Contract: Math fence language eligibility

**Feature**: 004-code-block-math-environments  
**Type**: Parser/scanner eligibility contract  
**Consumers**: `src/parser.ts`, `src/math/math-scanner.ts`, parser/scanner tests

## Purpose

Define which fenced code blocks are eligible to be interpreted as display math.

## Input normalization

Given a fence info string:
1. Trim leading/trailing whitespace.
2. Convert to lower case.
3. Take the first whitespace-delimited token.

Example mappings:
- `"math"` -> `math`
- `"Math"` -> `math`
- `" latex "` -> `latex`
- `"tex numbered"` -> `tex`
- `""` -> empty token

## Eligibility rule

Fence is math-eligible iff normalized token is exactly one of:
- `math`
- `latex`
- `tex`

All other tokens are non-eligible and remain regular code fences.

## Non-goals

- No alias support beyond the allowlist.
- No automatic detection from body content.

## Validation examples

- ```` ```math ```` -> eligible
- ```` ```LaTeX ```` -> eligible
- ```` ```tex numbered ```` -> eligible
- ```` ```js ```` -> not eligible
- ```` ``` ```` (no info string) -> not eligible
