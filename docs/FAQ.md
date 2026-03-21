# FAQ

## Decorations Not Showing?

1. **Check file extension** – Ensure file is `.md`
2. **Toggle decorations** – Click the toolbar button or use `Ctrl+Shift+P` / `Cmd+Shift+P` → "Toggle Markdown Decorations"
3. **Reload window** – `Ctrl/Cmd+Shift+P` → "Developer: Reload Window"
4. **Check extension status** – Verify extension is activated in the Extensions view

## Why is there a sidebar button in the activity bar?

The extension adds a "Markdown Inline" button in VS Code's activity bar (left sidebar). This button hosts a hidden webview that's required for rendering Mermaid diagrams inline. The webview is never visible to you—it runs in the background to process Mermaid code blocks.

**You can safely ignore this button.** It doesn't provide any user-facing functionality and is purely a technical requirement for Mermaid diagram rendering. The button appears because VS Code requires a view container for webviews, even when they're hidden.

If you don't use Mermaid diagrams, the button still appears but remains inactive.

## Performance Issues?

- **Large files** – Files over 1MB may experience slower parsing
- **Temporarily disable** – Use the toolbar button or command palette to toggle decorations off
- **Check performance** – `Help` → `Startup Performance` to diagnose issues
- **Report issues** – If performance is consistently poor, please [open an issue](https://github.com/SeardnaSchmid/markdown-inline-editor-vscode/issues) with details (see [README](README.md#reporting-bugs) for reporting format)

## Links, mentions, and issue refs won’t open?

**Regular Markdown links** (`[text](url)`) and extension-provided targets (including **mentions** like `@user` and **issue refs** like `#123`) use VS Code’s **document link** behavior:

- **Default:** use **Ctrl+Click** (Windows/Linux) or **Cmd+Click** (macOS). A plain left-click does not open the link (that avoids fighting text selection).
- **Optional:** enable **Settings → Markdown Inline Editor → Open links and images with single click** (`markdownInlineEditor.links.singleClickOpen`) if you want left-click to open links (can make selecting text harder).

**Mentions and `#` issue references** also depend on [forge-style link resolution](features/done/mentions-references.md):

- If **`markdownInlineEditor.mentions.linksEnabled`** is **false**, mention/issue links are not offered (styling may still apply depending on other settings).
- A bare **`#123`** needs a **repository owner and name** (usually from `git remote origin`). Without that, the ref may be styled but not get a clickable URL—use **`@owner/repo#123`** or open the repo in a workspace with a proper **`origin`** remote.
- In **diff** views, link providers are skipped when diff decorations are off (raw markdown mode), same as other interactive link behavior.
