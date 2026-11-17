# Bug analysis: Checkboxes rendering strangely (Issue #47)

**Issue:** [Checkboxes rendering strangely #47](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues/47)

**Reporter:** @a-kriya  
**Environment:** macOS 15.4, VSCodium, latest (1.108)

---

## Description

Checked checkboxes (`- [x] Task 2`) render as a **blank rectangle** instead of a visible checked-box symbol.

---

## Root cause

The extension replaces the raw `[x]` with a Unicode character via a decoration’s `before.contentText`. The **checked** checkbox uses:

- **Current character:** `🗹` (U+1F5F9 — BALLOT BOX WITH BOLD CHECK, Miscellaneous Symbols and Pictographs)

That codepoint is in the emoji/symbols range. Many **monospace and editor fonts** (including defaults in VS Code/VSCodium) do not have a glyph for U+1F5F9. When the font lacks the glyph, the host shows a **replacement character** (empty rectangle or “tofu”), which matches the reported “blank rectangle”.

The **unchecked** checkbox uses `☐` (U+2610 BALLOT BOX), which is in the older Miscellaneous Symbols block and is supported by many more fonts, so it usually renders correctly.

---

## Fix

Use a character that is widely supported in editor fonts:

- **Recommended:** `☑` (U+2611 — BALLOT BOX WITH CHECK, Miscellaneous Symbols)

U+2611 is in the same block as ☐ (U+2610) and is much more likely to have a glyph in coding/editor fonts than U+1F5F9.

**File:** `src/decorations.ts` — in `CheckboxCheckedDecorationType()`, set `contentText` to `'☑'` instead of `'🗹'`. The JSDoc already describes “checked checkbox symbol (☑)”; the code was inconsistent.

---

## Verification

- In a markdown file, `- [x] Done` should show a visible checked box (☑), not a blank rectangle.
- Unchecked `- [ ] Todo` should still show ☐ as before.
- Checkbox click-to-toggle behavior is unchanged (decorator/checkbox-toggle.ts).
