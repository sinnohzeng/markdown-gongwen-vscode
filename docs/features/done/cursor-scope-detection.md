---
status: DONE
updateDate: 2026-01-18
priority: Core Feature
---

# Cursor Scope Detection

## Overview

This document captures the positive implementation behavior for cursor-based markdown syntax node identification in Ghost and Raw states. When the cursor is positioned over markdown syntax on a single line (without any text selection), the markdown syntax nodes are correctly identified and the appropriate state (Ghost or Raw) is applied.

### Key Characteristics

1. **Cursor Position Only**: This behavior applies specifically when there is a cursor position but no text selection (empty selection).

2. **Single Line Scope**: The detection works correctly when the cursor is on a line containing markdown syntax.

3. **State Application**:
   - **Ghost State (G)**: Applied when the cursor is on a line with markdown syntax, but the cursor is not inside the construct's scope.
   - **Raw State**: Applied when the cursor is inside the construct's scope (the smallest containing scope is identified).

4. **Correct Node Identification**: The parser correctly identifies which markdown syntax nodes the cursor is associated with, enabling proper state transitions.

### Scope Detection
- The system uses `collectCursorScopeRanges` to identify the smallest scope containing the cursor position.
- Only the smallest intersecting scope is selected for Raw state activation.
- This ensures precise state application based on cursor position.

### State Logic
- **Ghost (G)**: Markdown syntax applied, syntax ghosted (faint markers visible)
- **Raw**: Markdown syntax applied, syntax fully visible (no hiding)

## Implementation

### 1. Cursor Position Collection

The system separates cursor positions from text selections:

```typescript
// src/decorator.ts (lines 578-590)
const selectedRanges: Range[] = [];
const cursorPositions: Position[] = [];
const cursorLines = new Set<number>();

for (const selection of this.activeEditor.selections) {
  if (!selection.isEmpty) {
    selectedRanges.push(selection);
  } else {
    // Store cursor positions for checkbox exclusion check
    cursorPositions.push(selection.start);
    cursorLines.add(selection.start.line);
  }
}
```

**Key Point**: Empty selections (cursor positions) are tracked separately from non-empty selections, enabling different handling logic.

### 2. Cursor Scope Range Collection

The `collectCursorScopeRanges` method identifies the **smallest** scope containing each cursor position:

```typescript
// src/decorator.ts (lines 1043-1070)
private collectCursorScopeRanges(cursorPositions: Position[], scopes: ScopeEntry[]): Range[] {
  if (!this.activeEditor || cursorPositions.length === 0 || scopes.length === 0) {
    return [];
  }

  const cursorRanges: Range[] = [];
  for (const position of cursorPositions) {
    const matchingScopes = scopes.filter(scope => scope.range.contains(position));
    if (matchingScopes.length === 0) {
      continue;
    }

    // Select the SMALLEST containing scope
    const smallestScope = matchingScopes.reduce((smallest, scope) => {
      if (!smallest) {
        return scope;
      }
      const smallestLength = smallest.endPos - smallest.startPos;
      const scopeLength = scope.endPos - scope.startPos;
      return scopeLength < smallestLength ? scope : smallest;
    }, undefined as ScopeEntry | undefined);

    if (smallestScope) {
      cursorRanges.push(smallestScope.range);
    }
  }

  return cursorRanges;
}
```

**Key Point**: Only the smallest containing scope is selected, ensuring precise Raw state activation. This differs from selection-based detection which collects all intersecting scopes.

### 3. Raw Range Aggregation

Cursor-based raw ranges are merged with selection-based ranges:

```typescript
// src/decorator.ts (lines 608-611)
const rawRanges = this.mergeRanges([
  ...this.collectRawRanges(selectedRanges, scopeEntries),
  ...this.collectCursorScopeRanges(cursorPositions, scopeEntries),
]);
```

### 4. State Determination Logic

The filtering logic determines the state for each decoration:

```typescript
// src/decorator.ts (lines 626-691)
const intersectsRaw = this.rangeIntersectsAny(range, rawRanges);
// Check if this decoration is on a line with a cursor
const decorationLine = range.start.line;
const isGhostLine = cursorLines.size > 0 && cursorLines.has(decorationLine);

// Handle hide/hideStructural decorations
// State logic:
// - Raw (intersectsRaw=true): skip hide, show real markers
// - Ghost (isGhostLine=true, !intersectsRaw): apply ghostFaint, show faint markers (G)
// - Rendered (!isGhostLine, !intersectsRaw): apply hide, hide markers (R) - DEFAULT
if (decoration.type === 'hide' || decoration.type === 'hideStructural') {
  // Raw state: cursor/selection is inside the construct scope
  if (intersectsRaw) {
    continue; // Skip hide decoration - show real markers (Raw)
  }
  // Ghost state: cursor is on the line but not inside the construct scope
  if (isGhostLine) {
    ghostFaintRanges.push(range); // Apply ghost - show faint markers (G)
    continue;
  }
  // Rendered state: no cursor on line, not in raw range
  // THIS IS THE DEFAULT - always apply hide decoration to hide syntax
  const ranges = (filtered.get(decoration.type) as Range[] | undefined) || [];
  ranges.push(range);
  filtered.set(decoration.type, ranges);
  continue;
}
```

**Key Points**:
- `intersectsRaw`: Checks if the decoration range intersects with any raw range (from cursor or selection)
- `isGhostLine`: Checks if the decoration is on a line that has a cursor (but cursor is not inside the scope)
- **Raw**: `intersectsRaw = true` → syntax fully visible
- **Ghost**: `isGhostLine = true` AND `intersectsRaw = false` → syntax faintly visible
- **Rendered**: `!isGhostLine` AND `!intersectsRaw` → syntax hidden (default)

## Acceptance Criteria

✅ **Cursor position detection**: Empty selections (cursor positions) are tracked separately from non-empty selections
✅ **Smallest scope selection**: Only the smallest containing scope is selected for Raw state activation
✅ **Precise state application**: State is applied correctly based on cursor position within markdown constructs
✅ **Ghost state activation**: Ghost state is applied when cursor is on line but not inside construct scope
✅ **Raw state activation**: Raw state is applied when cursor is inside construct scope

## Notes

This behavior is essential for:
- Providing visual feedback when editing markdown
- Showing syntax markers when needed for editing context
- Maintaining a clean rendered view when not actively editing a construct

**Comparison: Cursor vs Selection Detection**

### Cursor-Based Detection (This Feature)
- **Trigger**: Empty selection (cursor position only)
- **Scope Selection**: **Smallest** containing scope
- **Use Case**: Precise editing feedback when cursor is inside a construct
- **Method**: `collectCursorScopeRanges`

### Selection-Based Detection
- **Trigger**: Non-empty selection (text is selected)
- **Scope Selection**: **All** intersecting scopes
- **Use Case**: Show raw markdown for all constructs touched by selection
- **Method**: `collectRawRanges`

**Example**:
- Cursor inside `**bold**` → Only the `strong` scope becomes Raw
- Selection covering `**bold**` and `*italic*` → Both `strong` and `emphasis` scopes become Raw

**Additional Notes**:
- This only applies to cursor positions, not text selections
- Text selections use a different mechanism (`collectRawRanges`) that collects all intersecting scopes
- The cursor-based detection is more precise, selecting only the smallest containing scope
- This precision ensures that when editing nested constructs, only the innermost construct shows raw syntax
- Related features:
  - Syntax Shadowing - Milestone 2: 3-state model (Rendered / Ghost / Raw)
  - Cursor-based scope detection
  - Selective reveal rules
- Status: ✅ **IMPLEMENTED** - This behavior is working correctly in the current implementation.

## Examples

**Example 1: Cursor inside bold construct**
```markdown
**bold text**
```
- Cursor inside "bold" → Only the `strong` scope becomes Raw
- Result: `**bold text**` markers fully visible

**Example 2: Cursor on line but outside construct**
```markdown
**bold text** and more text
```
- Cursor after "more" → Ghost state for bold construct
- Result: `**bold text**` markers faintly visible (30% opacity), rest rendered

**Example 3: Nested constructs**
```markdown
[**bold**](url)
```
- Cursor inside "bold" → Only the `strong` scope becomes Raw (smallest scope)
- Result: `**bold**` markers fully visible, link markers remain hidden

**Example 4: Selection vs cursor**
```markdown
**bold** and *italic*
```
- Cursor inside `**bold**` → Only `strong` scope becomes Raw
- Selection covering both → Both `strong` and `emphasis` scopes become Raw
