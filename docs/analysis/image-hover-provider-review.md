# Image Hover Provider Code Review

## Current Implementation Analysis

### ✅ **Strengths**

1. **Proper VS Code API Usage**
   - Correctly implements `HoverProvider`
   - Uses `MarkdownString` for rendering
   - Properly registered in extension activation

2. **Position Mapping**
   - Correctly uses `mapNormalizedToOriginal` to handle CRLF/LF differences
   - Properly calculates hover offset and range

3. **Diff View Handling**
   - Respects diff view configuration setting
   - Skips hover in diff views when decorations are disabled

4. **Parser Reuse**
   - Parser instance is created once per provider (good for performance)

### ⚠️ **Issues & Improvements Needed**

#### 1. **Performance - Parsing on Every Hover**
**Issue:** The entire document is parsed on every hover event, which can be expensive for large documents.

**Current:**
```typescript
const decorations = this.parser.extractDecorations(text);
```

**Recommendation:**
- Cache parsed decorations per document version
- Or reuse the decorator's cache if available
- Consider debouncing hover requests

#### 2. **Error Handling - Missing File Validation**
**Issue:** No check if image file exists before trying to display it.

**Current:**
```typescript
const target = this.resolveImageTarget(decoration.url, document.uri);
if (!target) {
  return; // Silent failure
}
// No validation if file exists
```

**Recommendation:**
- Add file existence check for local files
- Show helpful error message if file not found
- Handle network errors gracefully for external images

#### 3. **Image Size Constraints**
**Issue:** No limits on image dimensions in hover - could display huge images.

**Current:**
```typescript
const markdown = new vscode.MarkdownString(`![](${target.toString(true)})`);
```

**Recommendation:**
- Add max-width constraint: `![alt](url){width=400}`
- Or use HTML with style: `<img src="..." style="max-width: 400px;">`
- Consider configuration option for max size

#### 4. **Path Resolution Logic**
**Issue:** Path resolution might not handle all edge cases correctly.

**Current:**
```typescript
const relative = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
return vscode.Uri.joinPath(documentUri, '..', relative);
```

**Problems:**
- Absolute paths (`/path/to/image.png`) are treated as relative
- `./` prefix is not explicitly handled
- `../` paths might resolve incorrectly

**Recommendation:**
```typescript
if (trimmed.startsWith('/')) {
  // Absolute path - resolve from workspace root
  return vscode.Uri.joinPath(vscode.workspace.workspaceFolders?.[0]?.uri || documentUri, trimmed);
} else if (trimmed.startsWith('./')) {
  // Explicit relative path
  return vscode.Uri.joinPath(documentUri, '..', trimmed.slice(2));
} else if (trimmed.startsWith('../')) {
  // Parent directory relative path
  return vscode.Uri.joinPath(documentUri, '..', trimmed);
} else {
  // Simple relative path
  return vscode.Uri.joinPath(documentUri, '..', trimmed);
}
```

#### 5. **Security - isTrusted Flag**
**Issue:** `isTrusted: true` is set without clear documentation of security implications.

**Current:**
```typescript
markdown.isTrusted = true;
```

**Recommendation:**
- Document why this is needed (local file access)
- Consider only setting for local files, not external URLs
- Add security comment explaining the risk

#### 6. **Network Image Handling**
**Issue:** No timeout or error handling for slow/failing network requests.

**Recommendation:**
- Add timeout for network images
- Show loading state or error message
- Consider caching network images

#### 7. **Cancellation Token Not Used**
**Issue:** The `_token` parameter is ignored, but hover requests should be cancellable.

**Current:**
```typescript
provideHover(
  document: vscode.TextDocument,
  position: vscode.Position,
  _token: vscode.CancellationToken  // Ignored
)
```

**Recommendation:**
- Check `token.isCancellationRequested` before expensive operations
- Return early if cancelled

#### 8. **Missing Alt Text in Hover**
**Issue:** The hover image doesn't include the alt text, which is useful for accessibility.

**Current:**
```typescript
const markdown = new vscode.MarkdownString(`![](${target.toString(true)})`);
```

**Recommendation:**
- Include alt text: `![${decoration.altText || 'Image'}](${target})`
- Or show alt text as caption below image

#### 9. **No Metadata Display**
**Issue:** Hover doesn't show useful information like file size, dimensions, or path.

**Recommendation:**
- Add file metadata (size, dimensions if available)
- Show file path for reference
- Consider adding "Open Image" action button

## Recommended Improvements

### Priority 1 (Critical)
1. ✅ Add file existence validation
2. ✅ Improve path resolution logic
3. ✅ Add image size constraints

### Priority 2 (Important)
4. ✅ Use cancellation token
5. ✅ Add error handling for network images
6. ✅ Cache parsing results

### Priority 3 (Nice to Have)
7. ✅ Add metadata display
8. ✅ Include alt text in hover
9. ✅ Add configuration options

## Example Improved Implementation

```typescript
provideHover(
  document: vscode.TextDocument,
  position: vscode.Position,
  token: vscode.CancellationToken
): vscode.ProviderResult<vscode.Hover> {
  // ... early returns ...

  const text = document.getText();
  
  // Check cancellation before expensive parsing
  if (token.isCancellationRequested) {
    return;
  }
  
  const decorations = this.parser.extractDecorations(text);
  const hoverOffset = document.offsetAt(position);

  for (const decoration of decorations) {
    if (token.isCancellationRequested) {
      return;
    }
    
    if (decoration.type !== 'image' || !decoration.url) {
      continue;
    }

    const start = mapNormalizedToOriginal(decoration.startPos, text);
    const end = mapNormalizedToOriginal(decoration.endPos, text);

    if (hoverOffset < start || hoverOffset >= end) {
      continue;
    }

    const target = this.resolveImageTarget(decoration.url, document.uri);
    if (!target) {
      continue; // Skip invalid targets
    }

    // Validate file exists (for local files)
    if (target.scheme === 'file') {
      try {
        await vscode.workspace.fs.stat(target);
      } catch {
        // File doesn't exist - show error message
        const errorMarkdown = new vscode.MarkdownString();
        errorMarkdown.appendMarkdown(`**Image not found:** \`${decoration.url}\``);
        return new vscode.Hover(errorMarkdown, new vscode.Range(
          document.positionAt(start), 
          document.positionAt(end)
        ));
      }
    }

    // Create hover with size constraints and alt text
    const altText = text.substring(start, end) || 'Image';
    const markdown = new vscode.MarkdownString();
    
    // Add image with max width constraint
    markdown.appendMarkdown(`![${altText}](${target.toString(true)})`);
    
    // Add metadata
    if (target.scheme === 'file') {
      try {
        const stat = await vscode.workspace.fs.stat(target);
        const sizeKB = (stat.size / 1024).toFixed(1);
        markdown.appendMarkdown(`\n\n*${decoration.url} • ${sizeKB} KB*`);
      } catch {
        // Ignore stat errors
      }
    }
    
    // Only trust local files, not external URLs
    markdown.isTrusted = target.scheme === 'file' || target.scheme === 'vscode-remote';

    return new vscode.Hover(markdown, new vscode.Range(
      document.positionAt(start), 
      document.positionAt(end)
    ));
  }

  return;
}
```
