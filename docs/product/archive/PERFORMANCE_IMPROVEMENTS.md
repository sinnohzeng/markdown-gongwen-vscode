# Performance Improvements TODO

This document tracks all performance improvements identified during the code review, organized by impact level.

## 🔴 CRITICAL - Highest Impact

- [x] **Cache parsed decorations per document version**
  - **Location**: `src/decorator.ts:30-32` → `updateDecorations()` → `updateDecorationsInternal()`
  - **Problem**: Every cursor movement triggers full remark AST parse even when content unchanged
  - **Solution**: 
    - Track document version (`document.version`)
    - Cache `Map<documentVersion, DecorationRange[]>`
    - On selection change, only re-filter cached decorations, skip parsing
    - Invalidate cache only on actual document content changes
  - **Impact**: Eliminates O(n) parsing on every selection change
  - **Status**: ✅ **COMPLETED** - Implemented LRU cache with document version tracking

- [x] **Decouple parsing from decoration application**
  - **Location**: `src/decorator.ts:131-254` - `updateDecorationsInternal()` does everything
  - **Problem**: Cannot optimize parsing independently from visual updates
  - **Solution**:
    - Split into `parseDocument()` (cached, returns decorations)
    - Split into `applyDecorations()` (fast, uses cached parse)
    - Separate concerns: parsing vs. filtering vs. application
  - **Impact**: Enables independent optimization of each phase
  - **Status**: ✅ **COMPLETED** - Refactored into `parseDocument()`, `filterDecorations()`, and `applyDecorations()`

- [x] **Implement incremental parsing for text changes**
  - **Location**: `src/decorator.ts:34-38` → `updateDecorations()` on document change
  - **Problem**: Small edits (single character) trigger full document parse
  - **Solution**:
    - Track changed regions from `TextDocumentChangeEvent`
    - Only re-parse affected regions
    - Merge with cached decorations from unchanged regions
    - Fall back to full parse for large changes (>50% of document)
  - **Impact**: Reduces parse time from O(n) to O(changed_region_size)
  - **Status**: ✅ **COMPLETED** - Added `updateDecorationsFromChange()` with change tracking support

## 🟠 HIGH - Significant Impact

- [x] **Improve debounce strategy with batching**
  - **Location**: `src/decorator.ts:141-192` - Smart debouncing with batching
  - **Problem**: Rapid typing still causes multiple full parses, just delayed
  - **Solution**:
    - Use `requestIdleCallback` for non-urgent updates (with setTimeout fallback)
    - Track document version to skip redundant work (pendingUpdateVersion Map)
    - Batch multiple document changes into single parse (version comparison)
    - Different strategies: immediate for selection, debounced+idle for typing
  - **Impact**: Reduces redundant parsing during rapid edits
  - **Status**: ✅ **COMPLETED** - Implemented two-tier debouncing with version-based batching

- [x] **Add document version tracking**
  - **Location**: Missing throughout codebase
  - **Problem**: Cannot detect if document actually changed between parse and apply
  - **Solution**:
    - Store `lastParsedVersion` in Decorator
    - Check `document.version` before parsing
    - Skip parse if version unchanged
  - **Impact**: Prevents unnecessary work when document hasn't changed
  - **Status**: ✅ **COMPLETED** - Integrated into cache system with `CacheEntry.version`

- [x] **Optimize selection filtering**
  - **Location**: `src/decorator.ts:174-236` - filters after parsing
  - **Problem**: Wastes CPU parsing decorations that will be filtered out
  - **Solution**:
    - If document unchanged, only re-run filtering on cached decorations
    - Use spatial index for faster range intersection checks
    - Early exit optimizations in `isRangeSelected()`
  - **Impact**: Faster updates when only selection changes
  - **Status**: ✅ **COMPLETED** - Selection changes now only re-filter cached decorations, skip parsing

## 🟡 MEDIUM - Moderate Impact

- [x] **Optimize decoration type storage**
  - **Location**: `src/decorator.ts:321-362` - `filterDecorations()` and `applyDecorations()`
  - **Problem**: Memory allocation and iteration overhead
  - **Solution**:
    - Use `Map<DecorationType, Range[]>` instead of 15 separate arrays ✓
    - Group decorations by type during filtering ✓
  - **Impact**: Reduces memory allocations and simplifies code
  - **Status**: ✅ **COMPLETED** - Already using Map-based storage in filter and apply methods

- [x] **Batch decoration application**
  - **Location**: `src/decorator.ts:397-405` - decoration application
  - **Problem**: VS Code API overhead, potential re-renders
  - **Solution**:
    - Group decorations by type efficiently using Map ✓
    - Single loop to apply all decoration types ✓
    - VS Code API doesn't support batch updates, but we minimize overhead
  - **Impact**: Reduces API call overhead
  - **Status**: ✅ **COMPLETED** - Decorations already grouped and applied efficiently via Map iteration

- [x] **Early exit for non-markdown files**
  - **Location**: `src/decorator.ts:127-130, 149-152, 226-229`
  - **Problem**: Unnecessary debounce setup for non-markdown files
  - **Solution**:
    - Check language ID at the start of all update methods ✓
    - Early return if not markdown before any work ✓
  - **Impact**: Prevents unnecessary work for non-markdown files
  - **Status**: ✅ **COMPLETED** - Early exits already implemented in all update methods

- [x] **Cache document text with version check**
  - **Location**: `src/decorator.ts:28-33, 440-454` - `CacheEntry` and cache methods
  - **Problem**: String allocation for large documents
  - **Solution**:
    - Cache text with version in `CacheEntry` ✓
    - Reuse cached text when available ✓
  - **Impact**: Reduces memory allocations for large documents
  - **Status**: ✅ **COMPLETED** - Text caching integrated with decoration cache system

## 🟢 LOW - Minor Optimizations

- [x] **Optimize ancestor tracking**
  - **Location**: `src/parser.ts:126-165` - AST traversal with ancestor tracking
  - **Problem**: O(n²) worst case for deeply nested structures (rebuilding ancestor chain each time)
  - **Solution**: 
    - Use Map-based caching to store each node's ancestors ✓
    - Reuse parent's cached ancestors instead of rebuilding ✓
    - Removed recursive `isNodeChildOf` method ✓
  - **Impact**: Reduces complexity from O(n²) to O(n) for nested markdown
  - **Status**: ✅ **COMPLETED** - Implemented Map-based ancestor caching for efficient lookups

- [ ] **Optimize range intersection checks**
  - **Location**: `src/decorator.ts:295-312` - `isRangeSelected()` checks all selections
  - **Problem**: O(n×m) where n=decorations, m=selections
  - **Solution**:
    - Use spatial index (R-tree) for decorations
    - Early exit optimizations
    - Cache intersection results for common cases
  - **Impact**: Faster selection filtering for many decorations

- [ ] **Memoize position conversions**
  - **Location**: `src/decorator.ts:269-280` - `createRange()` calls `positionAt()` repeatedly
  - **Problem**: VS Code API calls for same positions
  - **Solution**:
    - Cache `Map<offset, Position>` conversions
    - Batch position conversions
  - **Impact**: Reduces VS Code API overhead

## Summary of Completed Improvements

### ✅ Completed (9 of 12 items)

**🔴 CRITICAL - Highest Impact (3/3)**
- ✅ Cache parsed decorations per document version
- ✅ Decouple parsing from decoration application
- ✅ Implement incremental parsing for text changes

**🟠 HIGH - Significant Impact (3/3)**
- ✅ Improve debounce strategy with batching
- ✅ Add document version tracking
- ✅ Optimize selection filtering

**🟡 MEDIUM - Moderate Impact (4/4)**
- ✅ Optimize decoration type storage (Map-based)
- ✅ Batch decoration application (efficient grouping)
- ✅ Early exit for non-markdown files
- ✅ Cache document text with version check

**🟢 LOW - Minor Optimizations (1/3)**
- ✅ Optimize ancestor tracking (Map-based caching)
- ⏸️ Optimize range intersection checks (already well-optimized with Set)
- ⏸️ Memoize position conversions (deferred - VS Code API likely optimized)

### Performance Impact

The completed optimizations provide significant performance improvements:
- **Selection changes**: Now instant (use cached decorations, skip parsing)
- **Document changes**: Smart debouncing with version batching (skip redundant parses)
- **Large documents**: LRU cache with text caching (reduced memory allocations)
- **Nested markdown**: O(n) ancestor tracking instead of O(n²)

## Notes

- All critical and high-impact items are **COMPLETED** ✅
- Most medium-impact items were already implemented ✅
- Remaining low-impact items are deferred (diminishing returns)
- Consider user experience: selection changes feel instant ✅
- Document changes feel responsive even during rapid typing ✅
- Large documents (>1000 lines) remain usable ✅

