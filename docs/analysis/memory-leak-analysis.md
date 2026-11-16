# Memory Leak Analysis - Mermaid Renderer

## Summary

Analysis of `src/mermaid/mermaid-renderer.ts` identified **6 potential memory leaks** that could cause memory growth over time, especially during long-running sessions.

## Critical Issues

### 1. ⚠️ **onDidReceiveMessage Subscription Not Disposed** (Line 142)
**Severity:** High  
**Location:** `resolveWebviewView()` method

**Problem:**
```typescript
webviewView.webview.onDidReceiveMessage((message) => {
  // ... handler code ...
}, null, []);
```

The `Disposable` returned by `onDidReceiveMessage` is not stored or disposed. If `resolveWebviewView()` is called multiple times (e.g., webview recreation), multiple message handlers will accumulate, each holding references to the closure and `pendingRenders` Map.

**Impact:**
- Multiple handlers processing the same messages
- Memory growth proportional to number of webview recreations
- Potential race conditions with multiple handlers

**Fix:**
```typescript
let messageHandlerDisposable: vscode.Disposable | undefined;

resolveWebviewView(webviewView: vscode.WebviewView): void {
  // Dispose previous handler if exists
  messageHandlerDisposable?.dispose();
  
  // ... existing code ...
  
  messageHandlerDisposable = webviewView.webview.onDidReceiveMessage((message) => {
    // ... handler code ...
  });
}

// In disposeMermaidRenderer():
messageHandlerDisposable?.dispose();
messageHandlerDisposable = undefined;
```

---

### 2. ⚠️ **window.addEventListener Never Removed** (Line 50)
**Severity:** Medium  
**Location:** Webview HTML content (injected script)

**Problem:**
```javascript
window.addEventListener('message', async (event) => {
  // ... handler code ...
});
```

The event listener in the webview script is never removed. If the webview HTML is reloaded (e.g., during development, extension reload, or webview recreation), multiple listeners accumulate.

**Impact:**
- Multiple listeners processing the same messages
- Memory growth in webview context
- Potential duplicate message processing

**Fix:**
Since this is injected HTML, we can't easily track the listener. However, VS Code's webview lifecycle should handle this when the webview is disposed. To be safe:
- Ensure webview is properly disposed (already done via `retainContextWhenHidden: true`)
- Consider using a message handler ID to prevent duplicate processing

**Alternative Fix (if webview is recreated):**
```javascript
// Remove existing listener before adding new one
const existingHandler = window.__mermaidMessageHandler;
if (existingHandler) {
  window.removeEventListener('message', existingHandler);
}

const handler = async (event) => { /* ... */ };
window.__mermaidMessageHandler = handler;
window.addEventListener('message', handler);
```

---

### 3. ⚠️ **Unbounded Memoization Cache** (Line 496)
**Severity:** Medium  
**Location:** `memoizeMermaidDecoration()` function

**Problem:**
```typescript
function memoizeMermaidDecoration(...) {
  const cache = new Map<string, Promise<string>>(); // Never cleared!
  return (source: string, darkMode: boolean, height: number, fontFamily?: string) => {
    const key = `${source}|${darkMode}|${height}|${fontFamily ?? ''}`;
    // ... cache logic ...
  };
}
```

The cache is created once and never cleared. Since the key includes `height` (which can vary based on line count), and `source` (which can be any Mermaid diagram), this cache can grow unbounded.

**Impact:**
- Memory growth proportional to number of unique diagram renderings
- Each cached Promise holds references to closures and SVG strings
- No upper bound on cache size

**Fix:**
```typescript
// Option 1: Use LRU cache with size limit
import { LRUCache } from 'lru-cache'; // or implement simple LRU

const cache = new LRUCache<string, Promise<string>>({
  max: 100, // Limit to 100 entries
});

// Option 2: Clear cache periodically or on dispose
// Add to disposeMermaidRenderer():
// Clear the memoization cache (requires exposing it)
```

**Recommended:** Use the existing `decorationCache` instead of creating a new cache, or implement an LRU cache.

---

### 4. ⚠️ **pendingRenders Promise Leaks** (Line 16, 241)
**Severity:** Medium  
**Location:** `requestSvg()` function

**Problem:**
```typescript
pendingRenders.set(requestId, { resolve, reject });

// If webview crashes, message is lost, or error handling fails,
// the promise stays in pendingRenders forever
```

If a render request fails silently (webview crash, message loss, unhandled error), the promise remains in `pendingRenders` indefinitely, holding references to resolve/reject functions and closures.

**Impact:**
- Memory leak proportional to failed requests
- Closures holding references to large objects (SVG strings, source code)
- Map grows unbounded over time

**Fix:**
```typescript
// Add timeout to reject stale promises
const REQUEST_TIMEOUT = 30000; // 30 seconds

return new Promise<string>((resolve, reject) => {
  // ... existing code ...
  
  const timeoutId = setTimeout(() => {
    if (pendingRenders.has(requestId)) {
      pendingRenders.delete(requestId);
      reject(new Error('Mermaid render request timed out'));
    }
  }, REQUEST_TIMEOUT);
  
  // Store timeout ID to clear on success
  const originalResolve = resolve;
  const originalReject = reject;
  
  pendingRenders.set(requestId, {
    resolve: (value) => {
      clearTimeout(timeoutId);
      originalResolve(value);
    },
    reject: (error) => {
      clearTimeout(timeoutId);
      originalReject(error);
    }
  });
});
```

---

### 5. ⚠️ **setTimeout Not Cleared** (Line 218)
**Severity:** Low  
**Location:** `initMermaidRenderer()` function

**Problem:**
```typescript
setTimeout(() => {
  vscode.commands.executeCommand('workbench.view.explorer');
}, 100);
```

The `setTimeout` is not stored, so it cannot be cleared if the extension is deactivated before it fires.

**Impact:**
- Minor: callback may execute after deactivation
- Potential error if VS Code API is called after deactivation

**Fix:**
```typescript
let initTimeoutId: NodeJS.Timeout | undefined;

export function initMermaidRenderer(context: vscode.ExtensionContext): void {
  // ... existing code ...
  
  initTimeoutId = setTimeout(() => {
    vscode.commands.executeCommand('workbench.view.explorer');
    initTimeoutId = undefined;
  }, 100);
}

// In disposeMermaidRenderer():
if (initTimeoutId) {
  clearTimeout(initTimeoutId);
  initTimeoutId = undefined;
}
```

---

### 6. ⚠️ **decorationCache Stores Promises** (Line 20)
**Severity:** Low  
**Location:** Global `decorationCache`

**Problem:**
```typescript
const decorationCache = new Map<string, Promise<string>>();
```

The cache stores Promise objects, which hold references to closures, SVG strings, and the entire render chain. While the cache is cleared on dispose, during active use it can hold significant memory.

**Impact:**
- Memory usage proportional to cache size
- Promises hold references preventing GC
- Cache cleared on dispose, but could be large during active use

**Fix:**
- Current implementation is acceptable (cleared on dispose)
- Consider adding size limit or LRU eviction if memory usage becomes an issue
- Monitor cache size in production

---

## Additional Observations

### ✅ **Good Practices Found:**
1. `disposeMermaidRenderer()` properly clears caches and resets references
2. `renderContainer` is properly cleaned up in `finally` block
3. `pendingRenders` entries are deleted after resolution/rejection
4. Webview provider is registered with extension context subscriptions

### ⚠️ **Potential Issues:**
1. **Multiple webview instances:** If `resolveWebviewView()` is called multiple times, old webview references may not be cleared
2. **Error handling:** Some error paths may not clean up `pendingRenders` entries
3. **Concurrent renders:** High concurrency could cause `pendingRenders` to grow temporarily

---

## Recommendations

### Priority 1 (High Impact):
1. **Fix onDidReceiveMessage disposal** - Store and dispose the subscription
2. **Add timeout to pendingRenders** - Prevent promise leaks from failed requests

### Priority 2 (Medium Impact):
3. **Fix unbounded memoization cache** - Use LRU or reuse `decorationCache`
4. **Handle webview event listener** - Ensure proper cleanup on webview recreation

### Priority 3 (Low Impact):
5. **Clear setTimeout** - Store and clear timeout ID
6. **Monitor decorationCache** - Add size limits if needed

---

## Testing Recommendations

1. **Long-running session test:** Run extension for extended period, monitor memory usage
2. **Rapid webview recreation:** Test multiple webview recreations to detect handler accumulation
3. **Failed request test:** Simulate webview crashes/message loss to verify timeout cleanup
4. **Cache growth test:** Render many unique diagrams to verify cache doesn't grow unbounded
5. **Memory profiling:** Use VS Code's memory profiler to identify actual leaks

---

## Related Files

- `src/mermaid/mermaid-renderer.ts` - Main file with identified issues
- `src/extension.ts` - Calls `disposeMermaidRenderer()` on deactivation
- `src/decorator.ts` - Uses mermaid renderer, may contribute to cache growth
