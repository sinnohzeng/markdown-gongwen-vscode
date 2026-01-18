---
status: DONE
updateDate: 2026-01-18
priority: Core Feature
---

# Syntax Shadowing — Milestone 2: 3-state model (Rendered / Ghost / Raw) - IMPLEMENTED

## Overview

This milestone implements a formal 3-state model for syntax shadowing with scope-based detection, replacing the previous line-based approach that caused raw markdown to be incorrectly applied to all non-selected lines.

## Implementation

This milestone implements a formal 3-state model for syntax shadowing with scope-based detection, replacing the previous line-based approach that caused raw markdown to be incorrectly applied to all non-selected lines.

### What Was Fixed

The previous implementation had a critical bug where **raw markdown was applied to all lines not selected** due to:

1. **Line-based detection was too broad**: `isLineOfRangeSelected()` showed raw for entire lines, not specific constructs
2. **Range-based detection was imprecise**: `isRangeSelected()` checked if cursor was inside decoration range, which revealed entire multi-line constructs when cursor was only on one line
3. **No scope extraction**: The code didn't identify complete markdown constructs (e.g., `**bold**`, `[link](url)`) as scopes
4. **Missing Ghost state**: No faint marker visibility for cursor-on-line-but-not-inside-construct scenario

### Why It Works Now

The new implementation uses **scope-based detection** that:

1. **Extracts complete constructs as scopes**: Identifies full markdown constructs (from opening marker to closing marker) by matching content decorations with their surrounding `hide` decorations
2. **Precise cursor detection**: Uses smallest containing scope for cursor positions, preventing multi-line constructs from being revealed when cursor is only on one line
3. **Proper selection handling**: Uses all intersecting scopes for text selections, showing raw for everything the user explicitly selected
4. **3-state logic**: Implements Rendered (default), Ghost (cursor on line but not in scope), and Raw (cursor/selection in scope) states correctly

### Technical Implementation

### Key Components

#### 1. Scope Extraction (`extractScopes()`)

Extracts complete markdown constructs by:
- Finding content decorations (bold, italic, link, heading, etc.)
- Matching them with adjacent `hide` decorations (opening/closing markers)
- Creating `ScopeEntry` objects spanning from opening marker start to closing marker end

**Example**: For `**bold text**`:
- Content decoration: `bold` (positions 2-10)
- Opening hide: `hide` (positions 0-2)
- Closing hide: `hide` (positions 10-12)
- **Scope**: positions 0-12 (entire construct)

#### 2. Cursor-Based Raw Detection (`collectCursorScopeRanges()`)

For each cursor position:
- Finds all scopes containing the cursor
- Returns the **smallest** containing scope (most precise)
- Prevents revealing entire multi-line constructs when cursor is only on one line

**Example**: Cursor inside `**bold**` within `[**bold**](url)`:
- Finds both `strong` scope and `link` scope
- Returns only `strong` scope (smallest)
- Only bold markers show raw, not the entire link

#### 3. Selection-Based Raw Detection (`collectRawRanges()`)

For each selection range:
- Finds all scopes that intersect with the selection
- Returns all intersecting scopes (broader than cursor-based)
- Shows raw for everything the user explicitly selected

**Example**: Selection covering `**bold**` and `*italic*`:
- Returns both `strong` and `emphasis` scopes
- Both constructs show raw markdown

#### 4. 3-State Logic

The filtering logic applies states in priority order:

```typescript
// State priority: Raw > Ghost > Rendered

if (decoration.type === 'hide' || decoration.type === 'transparent') {
  const intersectsRaw = this.rangeIntersectsAny(range, rawRanges);
  const isGhostLine = cursorLines.has(decorationLine);
  
  if (intersectsRaw) {
    continue; // Raw: skip hide, show real markers
  }
  if (isGhostLine) {
    ghostFaintRanges.push(range); // Ghost: show faint markers
    continue;
  }
  // Rendered: apply hide decoration (default)
}
```

**States**:
- **Raw**: Decoration intersects raw range → syntax fully visible
- **Ghost**: Cursor on line but NOT in raw range → syntax faintly visible (50% opacity)
- **Rendered**: Default → syntax hidden

### Code Changes

#### Files Modified

1. **`src/decorations.ts`**
   - Added `GhostFaintDecorationType()` with 50% opacity

2. **`src/decorator.ts`**
   - Added `ScopeEntry` interface
   - Added `ghostFaintDecorationType` instance
   - Implemented `extractScopes()` method
   - Implemented `collectCursorScopeRanges()` method
   - Implemented `collectRawRanges()` method
   - Implemented `mergeRanges()` helper
   - Implemented `rangeIntersectsAny()` helper
   - Updated `filterDecorations()` with scope-based 3-state logic
   - Updated `applyDecorations()` to handle ghostFaint decorations
   - Updated `dispose()` to dispose ghostFaint decoration type

### Why Previous Approach Failed

**Problem: Line-Based Detection**

Old code:
```typescript
const shouldRevealRaw =
  this.isRangeSelected(range, selectedRanges) ||
  this.isLineOfRangeSelected(range, selectedLines);
```

Issues:
1. `isLineOfRangeSelected()` checked if decoration was on ANY line with a cursor/selection
   - If cursor on line 5, ALL decorations on line 5 showed raw
   - No distinction between "cursor inside construct" vs "cursor on same line"
2. `isRangeSelected()` for cursors checked if cursor was inside decoration range
   - For multi-line constructs (code blocks), cursor on one line revealed entire block
   - No concept of "smallest containing scope"

**Solution: Scope-Based Detection**

New code:
```typescript
const scopeEntries = this.extractScopes(decorations, originalText);
const rawRanges = this.mergeRanges([
  ...this.collectRawRanges(selectedRanges, scopeEntries),
  ...this.collectCursorScopeRanges(cursorPositions, scopeEntries),
]);
```

Benefits:
1. **Precise**: Only reveals the specific construct containing the cursor (smallest scope)
2. **Context-aware**: Distinguishes between "cursor inside construct" (Raw) and "cursor on line but outside construct" (Ghost)
3. **Multi-line safe**: Cursor on one line of a multi-line construct doesn't reveal entire construct unless cursor is actually inside it

## Acceptance Criteria

✅ **Rendered is readable**: Syntax markers hidden when not editing
✅ **Ghost provides edit cues**: Faint markers visible when cursor on line but not in construct
✅ **Raw is reachable**: Full syntax visible when cursor/selection inside construct
✅ **Nested formatting predictable**: Smallest containing scope selected for nested constructs

## Notes

- The 3-state model provides three distinct visibility states for syntax markers:
  - **Rendered (default)**: Syntax markers hidden, only formatted content visible
  - **Ghost**: Cursor on line but not inside construct - markers show at reduced opacity (configurable via `markdownInlineEditor.decorations.ghostFaintOpacity`, default: 0.3)
  - **Raw**: Cursor/selection inside construct - markers fully visible for editing
- State priority: Raw > Ghost > Rendered
- Scope-based detection ensures precise state application based on cursor position within markdown constructs
- Related features:
  - [Cursor Scope Detection](./cursor-scope-detection.md) - Foundation for scope-based detection
  - [Syntax Shadowing M1](./syntax-shadowing-m1-keep-styling-while-editing.md) - Previous milestone
- Status: ✅ **IMPLEMENTED** - The 3-state model is working correctly with scope-based detection.

## Examples

### Scenario 1: Cursor Inside Bold
**Input**: `**bold text**` with cursor inside "bold"
- **Scope detected**: `strong` scope (positions 0-12)
- **State**: Raw (cursor inside scope)
- **Result**: `**bold text**` fully visible

### Scenario 2: Cursor on Line, Outside Bold
**Input**: `**bold text** and more` with cursor after "more"
- **Scope detected**: `strong` scope (positions 0-12)
- **State**: Ghost (cursor on line but not in scope)
- **Result**: `**bold text**` faintly visible (30% opacity by default), rest rendered

### Scenario 3: Cursor on Line, No Constructs
**Input**: `plain text` with cursor anywhere
- **No scopes detected**
- **State**: Rendered (default)
- **Result**: Text rendered normally, no syntax markers

### Scenario 4: Nested Constructs
**Input**: `[**bold**](url)` with cursor inside "bold"
- **Scopes detected**: `strong` (positions 1-9) and `link` (positions 0-15)
- **Smallest scope**: `strong` (positions 1-9)
- **State**: Raw for bold only
- **Result**: `**bold**` fully visible, link markers hidden

### Scenario 5: Multi-Line Code Block
**Input**: 
````markdown
```
code
block
```
````
With cursor on line 2 (inside "code")
- **Scope detected**: `codeBlock` scope (entire block)
- **State**: Raw (cursor inside scope)
- **Result**: Entire code block shows raw (correct, cursor is inside)

With cursor on line 4 (after closing fence)
- **No scope detected** (cursor outside block)
- **State**: Rendered
- **Result**: Code block rendered normally (correct, cursor is outside)
