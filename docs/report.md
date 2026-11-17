# Bugfix Report: Mermaid diagrams not rendering (webview never created)

**Summary:** Mermaid inline diagrams did not render in some environments (notably VS Code). The extension stayed on “waiting for webview” and never showed diagrams until the user opened the Mermaid Renderer view manually once.

**Root cause:** The Mermaid webview is created only when VS Code calls `resolveWebviewView()` on the view provider, which happens only when the **view is actually shown**. The extension tried to create the webview at startup by opening the **view container** (`workbench.view.extension.mdInlineRenderer`). The Mermaid view is declared with `"visibility": "hidden"`. In VS Code, opening only the container does not necessarily reveal a hidden view, so `resolveWebviewView()` was often never called and the webview was never created.

---

## Fixes applied

### 1. Use the view focus command instead of opening the container

- **Before:** `vscode.commands.executeCommand('workbench.view.extension.mdInlineRenderer')` — opens the Markdown Inline Editor **sidebar (container)** only.
- **After:** `vscode.commands.executeCommand('mdInline.mermaidRenderer.focus')` — focuses the **Mermaid Renderer view** itself.

VS Code defines a `.focus` command for each contributed view. Focusing the view causes the host to show it and call `resolveWebviewView()`, so the webview is created. This makes automatic webview creation work in VS Code (and Cursor) without requiring the user to open the view manually.

**File:** `src/mermaid/webview-manager.ts` (initialize)

---

### 2. Wait for webview to be ready before switching back

- **Before:** After running the open/focus command, the extension switched back to Explorer after **50 ms**. In some environments the host did not call `resolveWebviewView()` that quickly, so the webview was still never created.
- **After:** After the focus command completes, the extension **waits for `webviewLoaded`** (with a **5 s** timeout). Only when the webview is ready (or the timeout fires) does it switch back to Explorer (after 100 ms). If the timeout fires, it logs “Webview not ready after opening view” and still switches back so the user is not stuck on the Mermaid view.

**File:** `src/mermaid/webview-manager.ts` (initialize)

---

### 3. Reduce “waiting for webview” log spam

- **Before:** Every call to `renderMermaidSvg()` logged “renderMermaidSvg: waiting for webview” before `await webviewManager.waitForWebview()`. When the webview was never created, many update cycles piled up and the output was flooded with repeated lines.
- **After:** That message is logged at most **once per session** (flag `hasLoggedWaitingForWebview`). Subsequent requests that are still waiting do not log again.

**File:** `src/mermaid/mermaid-renderer.ts`

---

### 4. TypeScript: Promise rejection handler for open-view command

- **Before:** `.catch((err) => …)` was used on the result of `executeCommand()`. The VS Code API returns a `Thenable` (PromiseLike), which in strict typings may not expose `.catch`, and the callback parameter had implicit `any`.
- **After:** Rejection is handled with the second argument of `.then(onFulfilled, onRejected)` and the error parameter is typed as `(err: unknown)`.

**File:** `src/mermaid/webview-manager.ts` (initialize)

---

## Debugging support (unchanged by this bugfix)

- **Setting:** `markdownInlineEditor.debug.mermaid` — when enabled, logs Mermaid init, webview lifecycle, and render steps to the **Markdown Inline Editor (Mermaid)** output channel.
- **Workaround** if automatic creation still fails in an environment: open the Mermaid view once manually (**View → Open View…** → “Mermaid Renderer”), then switch back to the editor; diagrams should render after that.

See `docs/debugging-mermaid.md` for full debugging steps and common issues.

---

## Files changed

| File | Change |
|------|--------|
| `src/mermaid/webview-manager.ts` | Use `mdInline.mermaidRenderer.focus`; wait for webview with 5 s timeout before switching back; Promise rejection handler fix. |
| `src/mermaid/mermaid-renderer.ts` | Log “waiting for webview” at most once per session. |
| `docs/debugging-mermaid.md` | Updated “Common issues” and workaround text to mention the focus command and manual open. |

---

## Verification

- With the fix: after activation, the Mermaid debug log should show “Webview created (setWebviewView)” and “Webview ready, switching back to explorer”, then “requestSvg: posting render request” and “Webview message: SVG received” when diagrams are rendered.
- If the webview still does not appear: “Webview not ready after opening view” is logged; user can open **View → Open View… → Mermaid Renderer** once as a workaround.
