# Markless vs Our Approach - Inline Code Comparison

**Created:** 2025-01-27  
**Purpose:** Detailed comparison of how Markless handles inline code vs our implementation

---

## Key Difference: Transparent vs Hidden

### Markless Approach

**File:** `examples/markless/src/extension.js` (lines 285-301)

```javascript
["inlineCode", ["inlineCode", (() => {
    const codeDecoration = vscode.window.createTextEditorDecorationType({
        border: "outset",
        borderRadius: "5px",
    })
    return (start, end, node) => {
        // 1. Apply code decoration to FULL range (including backticks)
        addDecoration(codeDecoration, start, end);
        
        // 2. Make backticks TRANSPARENT (not hidden)
        addDecoration(transparentDecoration, start, start + 1);
        addDecoration(transparentDecoration, end - 1, end);
    };
})()]]
```

**Transparent Decoration** (`examples/markless/src/common-decorations.js` line 34-36):
```javascript
const transparentDecoration = createDecoration({
    color: "transparent",  // Only makes text transparent, still takes up space
}, '.markless-transparent');
```

**Key Points:**
- ✅ Uses `color: "transparent"` - text is invisible but **still takes up space**
- ✅ Border decoration applied to full range first
- ✅ Backticks made transparent after (they still exist in layout)

---

### Our Current Approach

**File:** `src/parser.ts` (lines 456-482)

```typescript
private processInlineCode(node: InlineCode, text: string, decorations: DecorationRange[]): void {
    // ... position validation ...
    
    // 1. Apply code decoration to ENTIRE range (including backticks)
    decorations.push({ startPos: start, endPos: end, type: 'code' });
    
    // 2. Hide the backticks separately (using display: none)
    decorations.push({ startPos: start, endPos: start + markerLength, type: 'hide' });
    decorations.push({ startPos: end - markerLength, endPos: end, type: 'hide' });
}
```

**Hide Decoration** (`src/decorations.ts` line 8-17):
```typescript
export function HideDecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;',  // Completely removes from layout
    after: {
      contentText: '',
    },
  });
}
```

**Key Points:**
- ❌ Uses `display: none` - text is **completely removed from layout**
- ✅ Border decoration applied to full range first
- ❌ Backticks completely removed (might break border rendering)

---

## The Problem

**Why borders don't work with `display: none`:**

When we use `display: none` on the backticks:
1. The backticks are completely removed from the DOM/layout
2. VS Code's decoration system might not render borders correctly when the decorated range contains elements that are `display: none`
3. The border decoration might be applied, but since the backticks don't exist in layout, the border rendering fails

**Why `color: transparent` works:**

When Markless uses `color: transparent`:
1. The backticks still exist in the layout (they take up space)
2. They're just invisible (transparent color)
3. The border decoration can render correctly because all elements in the range still exist in layout
4. The border spans the full range including the transparent backticks

---

## Solution: Use Transparent Instead of Hide

We need to create a transparent decoration type (similar to Markless) and use it for inline code backticks instead of `hide`.

**Changes needed:**

1. **Create `TransparentDecorationType()` in `src/decorations.ts`:**
   ```typescript
   export function TransparentDecorationType() {
     return window.createTextEditorDecorationType({
       color: 'transparent',
     });
   }
   ```

2. **Add new decoration type to parser:**
   - Add `'transparent'` to `DecorationType` union
   - Use it for inline code backticks instead of `'hide'`

3. **Update decorator to handle transparent type:**
   - Map `'transparent'` to `TransparentDecorationType()`

---

## Visual Comparison

### Markless (Working):
```
`code`  →  [border spans full range including transparent backticks]
           ↑ backticks are transparent but exist in layout
```

### Our Approach (Broken):
```
`code`  →  [border tries to span range but backticks are display:none]
           ↑ backticks don't exist in layout, border rendering fails
```

---

## Implementation Steps

1. ✅ Set background to red (for debugging - already done)
2. Create `TransparentDecorationType()` 
3. Add `'transparent'` to `DecorationType`
4. Update `processInlineCode()` to use `'transparent'` instead of `'hide'` for backticks
5. Update decorator to handle transparent decorations
6. Test - borders should now work!

---

## Code Locations

- **Markless inline code handler:** `examples/markless/src/extension.js:285-301`
- **Markless transparent decoration:** `examples/markless/src/common-decorations.js:34-36`
- **Our inline code handler:** `src/parser.ts:456-482`
- **Our hide decoration:** `src/decorations.ts:8-17`
