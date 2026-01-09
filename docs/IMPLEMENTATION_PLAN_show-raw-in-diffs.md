# Implementation Plan: Show Raw Markdown in Diffs

## Overview

This document outlines the implementation plan for the "Show Raw Markdown in Diffs" feature. The feature adds a configuration option to disable markdown decorations when viewing diffs, making it easier to review markdown changes in source control and Copilot inline diffs.

## Implementation Steps

### Phase 1: Configuration Setup

**File: `package.json`**

1. Add configuration contribution to `contributes.configuration`:
   ```json
   "configuration": {
     "title": "Markdown Inline Editor",
     "properties": {
       "markdownInlineEditor.showRawInDiffs": {
         "type": "boolean",
         "default": true,
         "description": "Show raw markdown syntax instead of rendered decorations when viewing diffs (source control, Copilot, etc.). When enabled, decorations are disabled in diff views to make markdown changes more visible."
       }
     }
   }
   ```

**Estimated Time:** 15 minutes

---

### Phase 2: Diff Detection Utility

**File: `src/decorator.ts`** (add new private method)

Create a method to detect if the current editor is in a diff context:

```typescript
/**
 * Detects if the current editor is viewing a diff.
 * 
 * Checks for diff-related URI schemes:
 * - `git:` - Git source control diffs
 * - `vscode-merge:` - VS Code merge editor
 * - `vscode-diff:` - VS Code diff editor
 * - Any other diff-related schemes
 * 
 * @private
 * @returns {boolean} True if editor is in diff mode
 */
private isDiffEditor(): boolean {
  if (!this.activeEditor) {
    return false;
  }

  const scheme = this.activeEditor.document.uri.scheme;
  
  // Known diff-related schemes
  const diffSchemes = ['git', 'vscode-merge', 'vscode-diff'];
  
  return diffSchemes.includes(scheme);
}
```

**Rationale:**
- VS Code uses URI schemes to identify different editor contexts
- `git:` scheme is used for Git source control diffs
- `vscode-merge:` is used for merge conflict resolution
- `vscode-diff:` is used for general diff views
- This approach is reliable and doesn't require complex editor type checking

**Estimated Time:** 30 minutes

---

### Phase 3: Configuration Management

**File: `src/extension.ts`**

1. Add configuration reading helper:
   ```typescript
   /**
    * Reads the showRawInDiffs configuration setting.
    * 
    * @returns {boolean} True if raw markdown should be shown in diffs
    */
   function getShowRawInDiffsSetting(): boolean {
     const config = vscode.workspace.getConfiguration('markdownInlineEditor');
     return config.get<boolean>('showRawInDiffs', true);
   }
   ```

2. Pass configuration to Decorator:
   - Modify `Decorator` constructor or add a method to update the setting
   - Store the setting value in `Decorator` class

3. Add configuration change listener:
   ```typescript
   // Listen for configuration changes
   const changeConfiguration = vscode.workspace.onDidChangeConfiguration((event) => {
     if (event.affectsConfiguration('markdownInlineEditor.showRawInDiffs')) {
       decorator.updateShowRawInDiffsSetting(getShowRawInDiffsSetting());
       // Trigger immediate update to apply new setting
       decorator.updateDecorationsForSelection();
     }
   });
   
   context.subscriptions.push(changeConfiguration);
   ```

**File: `src/decorator.ts`**

1. Add private field to store setting:
   ```typescript
   /** Whether to show raw markdown in diff views */
   private showRawInDiffs = true;
   ```

2. Add method to update setting:
   ```typescript
   /**
    * Updates the showRawInDiffs setting.
    * 
    * @param {boolean} value - New setting value
    */
   updateShowRawInDiffsSetting(value: boolean): void {
     this.showRawInDiffs = value;
   }
   ```

3. Initialize setting in constructor or via `setActiveEditor`:
   ```typescript
   constructor() {
     // ... existing code ...
     // Read initial setting (will be set from extension.ts)
     this.showRawInDiffs = true; // Default, will be updated from extension
   }
   ```

**Estimated Time:** 1 hour

---

### Phase 4: Decoration Skipping Logic

**File: `src/decorator.ts`**

Modify `updateDecorationsInternal()` to check for diff mode:

```typescript
private updateDecorationsInternal() {
  if (!this.activeEditor) {
    return;
  }

  // Early exit if decorations are disabled
  if (!this.decorationsEnabled) {
    return;
  }

  // Early exit for non-markdown files
  if (!this.isMarkdownDocument()) {
    return;
  }

  // NEW: Check if we should skip decorations in diff mode
  if (this.showRawInDiffs && this.isDiffEditor()) {
    // Skip decorations in diff mode - show raw markdown
    this.clearAllDecorations();
    return;
  }

  // ... rest of existing code ...
}
```

**Rationale:**
- Early exit pattern matches existing code style
- `clearAllDecorations()` ensures no decorations remain when switching to diff mode
- Setting check happens before expensive parsing operations

**Estimated Time:** 30 minutes

---

### Phase 5: Link Provider (Optional Enhancement)

**File: `src/link-provider.ts`**

Optionally, we can also disable link provider in diff mode:

```typescript
provideDocumentLinks(
  document: vscode.TextDocument,
  _token: vscode.CancellationToken
): vscode.ProviderResult<vscode.DocumentLink[]> {
  if (document.languageId !== 'markdown') {
    return [];
  }

  // Check if in diff mode and setting is enabled
  const config = vscode.workspace.getConfiguration('markdownInlineEditor');
  const showRawInDiffs = config.get<boolean>('showRawInDiffs', true);
  
  if (showRawInDiffs) {
    const diffSchemes = ['git', 'vscode-merge', 'vscode-diff'];
    if (diffSchemes.includes(document.uri.scheme)) {
      return []; // Don't provide links in diff mode
    }
  }

  // ... rest of existing code ...
}
```

**Note:** This is optional - the feature spec mentions it may need diff-aware behavior. We can implement this if needed, but it's not critical for the core feature.

**Estimated Time:** 20 minutes (optional)

---

### Phase 6: Testing

**File: `src/decorator/__tests__/decorator-diff-mode.test.ts`** (new file)

Create comprehensive tests:

```typescript
import { TextDocument, Uri, TextEditor } from '../../test/__mocks__/vscode';
import { Decorator } from '../decorator';

describe('Decorator - Diff Mode', () => {
  let decorator: Decorator;
  let mockEditor: TextEditor;
  let mockDocument: TextDocument;

  beforeEach(() => {
    decorator = new Decorator();
    mockDocument = new TextDocument(
      Uri.parse('git:/path/to/file.md'),
      'markdown',
      1,
      '## Heading\n\n**bold** text'
    );
    mockEditor = {
      document: mockDocument,
      selections: [],
      setDecorations: jest.fn(),
    } as unknown as TextEditor;
  });

  describe('isDiffEditor', () => {
    it('should detect git scheme as diff editor', () => {
      decorator.setActiveEditor(mockEditor);
      // Access private method via type assertion or make it testable
      // For now, test via public behavior
    });

    it('should detect vscode-merge scheme as diff editor', () => {
      const mergeDoc = new TextDocument(
        Uri.parse('vscode-merge:/path/to/file.md'),
        'markdown',
        1,
        '## Heading'
      );
      const mergeEditor = {
        document: mergeDoc,
        selections: [],
        setDecorations: jest.fn(),
      } as unknown as TextEditor;
      
      decorator.setActiveEditor(mergeEditor);
      decorator.updateDecorationsForSelection();
      
      // Verify decorations are cleared (raw markdown shown)
      expect(mockEditor.setDecorations).toHaveBeenCalled();
    });

    it('should not detect file scheme as diff editor', () => {
      const fileDoc = new TextDocument(
        Uri.file('test.md'),
        'markdown',
        1,
        '## Heading'
      );
      const fileEditor = {
        document: fileDoc,
        selections: [],
        setDecorations: jest.fn(),
      } as unknown as TextEditor;
      
      decorator.setActiveEditor(fileEditor);
      decorator.updateDecorationsForSelection();
      
      // Verify decorations are applied (normal mode)
      expect(fileEditor.setDecorations).toHaveBeenCalled();
    });
  });

  describe('showRawInDiffs setting', () => {
    it('should skip decorations when setting is enabled and in diff mode', () => {
      decorator.updateShowRawInDiffsSetting(true);
      decorator.setActiveEditor(mockEditor);
      decorator.updateDecorationsForSelection();
      
      // Verify all decorations are cleared
      // Check that setDecorations was called with empty arrays
    });

    it('should apply decorations when setting is disabled even in diff mode', () => {
      decorator.updateShowRawInDiffsSetting(false);
      decorator.setActiveEditor(mockEditor);
      decorator.updateDecorationsForSelection();
      
      // Verify decorations are applied normally
    });

    it('should apply decorations in normal editor even when setting is enabled', () => {
      const fileDoc = new TextDocument(
        Uri.file('test.md'),
        'markdown',
        1,
        '## Heading'
      );
      const fileEditor = {
        document: fileDoc,
        selections: [],
        setDecorations: jest.fn(),
      } as unknown as TextEditor;
      
      decorator.updateShowRawInDiffsSetting(true);
      decorator.setActiveEditor(fileEditor);
      decorator.updateDecorationsForSelection();
      
      // Verify decorations are applied (normal editor, not diff)
    });
  });

  describe('configuration change', () => {
    it('should update immediately when setting changes', () => {
      decorator.setActiveEditor(mockEditor);
      
      // Initially enabled
      decorator.updateShowRawInDiffsSetting(true);
      decorator.updateDecorationsForSelection();
      // Verify decorations cleared
      
      // Change to disabled
      decorator.updateShowRawInDiffsSetting(false);
      decorator.updateDecorationsForSelection();
      // Verify decorations applied
    });
  });
});
```

**Note:** Testing will require mocking VS Code APIs and may need adjustments based on the actual test infrastructure.

**Estimated Time:** 2-3 hours

---

### Phase 7: Integration & Edge Cases

**Edge Cases to Handle:**

1. **Switching between diff and normal editor:**
   - When user switches from diff to normal editor, decorations should reapply
   - Already handled by `setActiveEditor()` which calls `updateDecorationsForSelection()`

2. **Setting change while diff is open:**
   - Configuration change listener triggers immediate update
   - Already handled in Phase 3

3. **Multiple diff editors:**
   - Each editor is handled independently via `setActiveEditor()`
   - No special handling needed

4. **Diff editor with non-markdown file:**
   - Early exit for non-markdown files happens before diff check
   - No issue

5. **Copilot inline diffs:**
   - Copilot uses standard VS Code diff mechanisms
   - Should be covered by `vscode-diff:` scheme detection
   - May need to test and add additional schemes if needed

**Estimated Time:** 1 hour (testing and refinement)

---

## Implementation Order

1. ✅ **Phase 1:** Configuration Setup (15 min)
2. ✅ **Phase 2:** Diff Detection Utility (30 min)
3. ✅ **Phase 3:** Configuration Management (1 hour)
4. ✅ **Phase 4:** Decoration Skipping Logic (30 min)
5. ✅ **Phase 5:** Link Provider (Optional, 20 min)
6. ✅ **Phase 6:** Testing (2-3 hours)
7. ✅ **Phase 7:** Integration & Edge Cases (1 hour)

**Total Estimated Time:** 5-7 hours

---

## Testing Checklist

- [ ] Configuration setting appears in VS Code settings UI
- [ ] Default value is `true`
- [ ] Setting change triggers immediate update
- [ ] Git diff view shows raw markdown when enabled
- [ ] Git diff view shows decorations when disabled
- [ ] Normal markdown editor shows decorations regardless of setting
- [ ] Merge editor shows raw markdown when enabled
- [ ] Copilot inline diff shows raw markdown when enabled
- [ ] Switching between diff and normal editor works correctly
- [ ] Unit tests pass
- [ ] Manual testing in VS Code

---

## Code Review Checklist

- [ ] Follows existing code style and patterns
- [ ] JSDoc comments added for new public methods
- [ ] No breaking changes to existing APIs
- [ ] Configuration follows VS Code conventions
- [ ] Error handling is appropriate
- [ ] Performance considerations (early exits, no unnecessary parsing)
- [ ] Tests cover main scenarios and edge cases

---

## Rollout Plan

1. **Development:** Implement all phases
2. **Testing:** Run full test suite, manual testing
3. **Code Review:** Self-review against checklist
4. **Documentation:** Update feature file status to "✅ Complete"
5. **Commit:** Use conventional commit: `feat(decorator): add showRawInDiffs configuration`
6. **PR:** Create focused PR with clear description
7. **CI:** Ensure all checks pass
8. **Merge:** After review approval

---

## Future Enhancements (Out of Scope)

- Per-file override for diff mode
- Different behavior for different diff types (Git vs Copilot)
- Visual indicator when in diff mode
- Keyboard shortcut to toggle diff mode behavior

---

## Notes

- The implementation is backward compatible (default: `true` matches user expectations)
- No breaking changes to existing functionality
- Performance impact is minimal (simple URI scheme check)
- Feature is opt-out (users can disable if they prefer decorations in diffs)
