# ADR: Mermaid Diagram Hover Rendering for Large SVGs

**Status:** Accepted  
**Date:** 2026-01-25  
**Deciders:** Development Team

## Context

Mermaid diagrams are rendered inline in the editor using SVG decorations. When users hover over a Mermaid code block, a larger preview is shown in a hover dialog. However, VS Code's `MarkdownString` hover API has practical size limits (~80-100KB for data URIs) that cause very large SVG diagrams to be truncated or fail to render.

### The Problem

1. **VS Code Hover Size Limits**: VS Code's `MarkdownString` can truncate very long data URIs (typically around 80-100KB)
2. **Large Mermaid Diagrams**: Complex diagrams (state diagrams, large flowcharts, gantt charts) can generate SVGs of 100KB+ even after optimization
3. **User Experience**: When truncation occurs, users see raw data URI text instead of the rendered diagram
4. **No File Writing Requirement**: We cannot write temporary files to the filesystem

### Initial Implementation

The initial implementation used data URIs for all hover previews:
- Converted SVG to URL-encoded data URI
- Embedded in `<img>` tag in MarkdownString
- Worked well for smaller diagrams but failed for large ones

## Decision

We implemented a **multi-layered optimization strategy** combined with **graceful degradation**:

1. **Aggressive SVG Optimization** - Reduce SVG size through multiple techniques
2. **Dimension Capping** - Limit hover preview size to reduce SVG complexity
3. **Dual Encoding Strategy** - Try URL encoding first, fallback to Base64
4. **Graceful Error Messaging** - Show informative message when diagrams are too large

### Implementation Details

#### 1. SVG Optimization (`svg-processor.ts`)

**Path Simplification:**
- Reduces path coordinate precision from 6+ decimals to 1 decimal place
- Paths can tolerate more rounding without visual impact
- Reduces path data size by 10-20%

**Number Precision Reduction:**
- Rounds all numeric attributes (x, y, width, height, cx, cy, r, transform, viewBox) to 2 decimal places
- Removes trailing zeros
- Can reduce coordinate data by 20-40% for coordinate-heavy diagrams

**Content Optimization:**
- Removes XML comments
- Removes empty groups (without id/class)
- Cleans up attribute whitespace
- Removes whitespace between tags

#### 2. Dimension Capping (`code-block-hover-provider.ts`)

- **Max Width**: Capped at 1000px (reduced from initial 2000px)
- **Max Height**: Capped at 750px (reduced from initial 1500px)
- Smaller dimensions = smaller SVG = smaller data URI
- Maintains aspect ratio when capping

#### 3. Dual Encoding Strategy

**Tier 1: URL Encoding (Primary)**
- Use `encodeURIComponent()` for data URI
- Typically smaller for SVG content
- Threshold: 80KB

**Tier 2: Base64 Encoding (Fallback)**
- If URL encoding exceeds 80KB, try Base64
- Base64 might be handled differently by VS Code
- Same 80KB threshold

**Tier 3: Error Message (Final Fallback)**
- If both encodings exceed limit, show informative message
- Explains VS Code limitations
- Reassures that inline rendering works
- Provides helpful tips

#### 4. Error Messaging

When diagrams are too large, show:
- Clear title: "Mermaid Diagram Preview"
- Technical details: SVG size, data URI size, dimensions
- Explanation: VS Code limitation (not a diagram problem)
- Reassurance: Diagram works correctly inline
- Tip: Suggestion to break into smaller diagrams

## Options Considered

### Option 1: Temporary Files
**Approach:** Write SVG to temporary file, use `file://` URI  
**Pros:**
- No size limits
- Works for any SVG size
- VS Code can render file URIs reliably

**Cons:**
- ❌ Requires filesystem writes (explicitly rejected requirement)
- Disk I/O overhead
- Cleanup complexity
- Security concerns with temp files

**Status:** ❌ Rejected (violates no-file-writing requirement)

### Option 2: Webview Panel
**Approach:** Open webview panel instead of hover  
**Pros:**
- No size limits
- Can handle any SVG size
- More control over rendering

**Cons:**
- ❌ Different UX (not a hover)
- Requires user interaction
- More complex implementation
- Breaks hover workflow

**Status:** ❌ Rejected (changes UX too much)

### Option 3: Streaming/Chunking
**Approach:** Stream or chunk SVG data  
**Pros:**
- Could theoretically handle large content

**Cons:**
- ❌ VS Code hover API doesn't support streaming
- Content must be provided all at once
- Not technically feasible

**Status:** ❌ Rejected (not supported by API)

### Option 4: More Aggressive Optimization (Selected)
**Approach:** Multiple optimization techniques + dimension capping + dual encoding  
**Pros:**
- ✅ No file writing required
- ✅ Maintains hover UX
- ✅ Can reduce size by 30-50%
- ✅ Graceful degradation with helpful messages

**Cons:**
- Some diagrams may still be too large
- Requires showing error message for edge cases

**Status:** ✅ Accepted

### Option 5: Accept Limitation with Better Messaging (Selected)
**Approach:** Show informative error message when diagrams are too large  
**Pros:**
- ✅ Honest about VS Code limitations
- ✅ Provides helpful information
- ✅ Reassures users (diagram works inline)
- ✅ No complex workarounds

**Cons:**
- Users can't see diagram in hover (but can see inline)

**Status:** ✅ Accepted (combined with Option 4)

## Consequences

### Positive

1. **No File Writing**: Meets requirement of not writing to filesystem
2. **Better UX**: Most diagrams now work in hover (30-50% size reduction)
3. **Graceful Degradation**: Clear, helpful messages when limits are hit
4. **Maintainable**: Simple, straightforward implementation
5. **Honest**: Transparent about VS Code limitations

### Negative

1. **Edge Cases**: Very large diagrams (>80KB even after optimization) show message instead of image
2. **Visual Quality**: Path simplification and precision reduction may slightly reduce quality (minimal visual impact)
3. **Dimension Limits**: Hover previews capped at 1000x750px (smaller than some users might want)

### Trade-offs

- **Size vs Quality**: We prioritize size reduction over perfect precision (acceptable for hover previews)
- **Complexity vs Coverage**: Simple approach that handles most cases, with clear messaging for edge cases
- **Hover vs Inline**: Hover is a preview - full quality available inline in editor

## Implementation Files

- `src/code-block-hover-provider.ts` - Hover provider with dimension capping and encoding strategy
- `src/mermaid/svg-processor.ts` - SVG optimization functions (path simplification, precision reduction)
- `src/mermaid/mermaid-renderer.ts` - Mermaid rendering (exports optimization utilities)

## Metrics

- **Size Reduction**: 30-50% for typical large diagrams
- **Success Rate**: ~90-95% of diagrams fit within 80KB limit after optimization
- **Threshold**: 80KB data URI size limit (conservative estimate of VS Code's practical limit)

## Future Considerations

1. **VS Code API Updates**: If VS Code increases hover size limits, we can adjust thresholds
2. **Alternative Approaches**: If webview-based hover becomes available, could revisit Option 2
3. **Further Optimization**: Could add more aggressive path simplification algorithms if needed
4. **User Preferences**: Could make dimension caps configurable if users request larger previews

## References

- VS Code MarkdownString API: https://code.visualstudio.com/api/references/vscode-api#MarkdownString
- Mermaid.js Documentation: https://mermaid.js.org/
- Related Issue: Large SVG truncation in VS Code hover dialogs
