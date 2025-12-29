# Parser Improvements TODO

This document tracks all parser optimizations and precision mining findings identified during the code review.

## Parser Optimizations

- [ ] **Optimize AST traversal**
  - **Location**: `src/parser.ts:135` - `visit()` traverses entire AST
  - **Problem**: No early exit or conditional traversal based on document regions
  - **Solution**:
    - Skip nodes outside viewport (if viewport info available)
    - Conditional traversal based on changed regions
    - Early exit for nodes that don't affect visible decorations
  - **Impact**: Faster parsing for large documents

- [ ] **Optimize text normalization**
  - **Location**: `src/parser.ts:95` - `replace(/\r\n|\r/g, '\n')` on every parse
  - **Problem**: Normalizes entire document even if unchanged
  - **Solution**:
    - Track if document uses CRLF vs LF
    - Only normalize when document actually has CRLF
    - Cache normalized text with version
  - **Impact**: Avoids unnecessary string operations
  - **Note**: ✅ Fixed CRLF offset mapping issue in `decorator.ts` - `mapNormalizedToOriginal()` correctly maps positions from normalized to original text

- [ ] **Optimize empty image alt detection**
  - **Location**: `src/parser.ts:676-699` - `handleEmptyImageAlt()` uses regex on full text
  - **Problem**: Scans entire document even when no `![]` patterns exist
  - **Solution**:
    - Only run if AST doesn't contain Image nodes
    - Use faster string search (indexOf) instead of regex
    - Skip if no `![` found in text
  - **Impact**: Faster parsing when no empty images

- [ ] **Optimize marker detection**
  - **Location**: `src/parser.ts:704-725` - `getBoldMarker()` and `getItalicMarker()` use substring
  - **Problem**: Creates temporary strings for every marker check
  - **Solution**:
    - Use character code comparisons: `text.charCodeAt(pos) === 0x2A` (asterisk)
    - Avoid substring creation
  - **Impact**: Reduces temporary string allocations

- [ ] **Reduce position validation overhead**
  - **Location**: `src/parser.ts:136-138` - checks `position.start.offset` on every node
  - **Problem**: Redundant checks when position is guaranteed by remark
  - **Solution**:
    - Trust remark positions, only validate on error paths
    - Wrap in try-catch for safety
    - Remove redundant checks in hot path
  - **Impact**: Faster AST traversal

- [ ] **Remove or optimize unused processChildren method**
  - **Location**: `src/parser.ts:663-671` - `processChildren()` is empty but called
  - **Problem**: Method exists but does nothing, children processed by main visit
  - **Solution**:
    - Remove unused method calls
    - Or implement actual nested processing optimization if needed
  - **Impact**: Cleaner code, slight performance improvement

- [ ] **Optimize duplicate decoration handling**
  - **Location**: `src/parser.ts:234-247` - headings get both specific and generic decoration
  - **Problem**: Creates duplicate decorations for same range
  - **Solution**:
    - Combine into single decoration with multiple types
    - Or optimize application to handle efficiently
  - **Impact**: Reduces decoration array size

- [ ] **Optimize string indexOf usage**
  - **Location**: `src/parser.ts:481, 485, 537, 541, 569, 577, 602, 614, 638, 648` - multiple `indexOf()` calls
  - **Problem**: Linear searches in loops, some could use position hints
  - **Solution**:
    - Use position offsets from AST when available
    - Avoid full-text search when position is known
    - Cache search results when possible
  - **Impact**: Faster marker detection

- [ ] **Optimize ancestor chain building**
  - **Location**: `src/parser.ts:142-151` - builds ancestor chain with `isNodeChildOf()` checks
  - **Problem**: O(n²) complexity for nested structures
  - **Solution**:
    - Build ancestor chain during single downward pass
    - Maintain stack during traversal
    - Remove `isNodeChildOf()` recursive checks
  - **Impact**: Linear complexity instead of quadratic

- [ ] **Investigate incremental AST updates**
  - **Location**: `src/parser.ts:89-117` - always parses from scratch
  - **Problem**: No support for partial/incremental parsing
  - **Solution**:
    - Research remark plugins that support incremental parsing
    - Or cache AST with diffs
    - Consider alternative parsing strategies for small changes
  - **Impact**: Potential for much faster updates on small edits

## Implementation Priority

### Phase 1: Quick Wins (High Impact, Low Effort)
1. Optimize marker detection (char code comparisons)
2. Reduce position validation overhead in AST traversal
3. Optimize text normalization (normalize only when necessary)
4. Optimize empty image alt detection
5. Remove or optimize unused processChildren method

### Phase 2: Structural and Traversal Enhancements (Medium Effort)
1. Optimize AST traversal for viewport/changed regions
2. Optimize ancestor chain building using traversal stack
3. Optimize string indexOf usage (use positions/caching)
4. Optimize duplicate decoration handling

### Phase 3: Advanced Optimizations (Higher Effort/Exploratory)
1. Investigate incremental AST updates (remark plugins or AST caching)

### Phase 4: Polish & Quality
1. General code quality improvements
2. Additional benchmarking and profiling

## Precision Mining Findings

### Code Quality & Maintainability

- [ ] **Refactor decoration type management**
  - **Location**: `src/decorator.ts:41-55` - 15 separate decoration type instances
  - **Finding**: Could be managed more efficiently
  - **Action**: Consider factory pattern or registry for decoration types

- [x] **Extract selection filtering logic**
  - **Location**: `src/decorator.ts:174-236` - selection filtering mixed with decoration grouping
  - **Finding**: Complex logic that could be separated
  - **Action**: Extract to `SelectionFilter` class or utility
  - **Status**: ✅ **COMPLETED** - Refactored into separate `filterDecorations()` method, decoupled from parsing

- [ ] **Improve error handling in parser**
  - **Location**: `src/parser.ts:111-114` - catches all errors, logs to console
  - **Finding**: Error handling could be more specific
  - **Action**: Handle specific error types, provide better diagnostics

### Edge Cases & Robustness

- [ ] **Handle very large documents**
  - **Location**: Throughout parser and decorator
  - **Finding**: No size limits or chunking for large documents
  - **Action**: Add document size checks, consider chunking for >100KB files

- [ ] **Handle malformed markdown gracefully**
  - **Location**: `src/parser.ts:111-114` - catches errors but may leave partial state
  - **Finding**: Malformed markdown could cause inconsistent decoration state
  - **Action**: Ensure partial parses don't leave decorations in inconsistent state

- [x] **Validate decoration ranges**
  - **Location**: `src/decorator.ts:269-280` - `createRange()` validates but may fail silently
  - **Finding**: Invalid ranges return null but don't log issues
  - **Action**: Add logging for invalid ranges, investigate root causes
  - **Status**: ✅ **COMPLETED** - Fixed CRLF offset mapping issue, `createRange()` now correctly maps normalized positions to original document positions using `mapNormalizedToOriginal()`

### Testing & Validation

- [ ] **Add performance benchmarks**
  - **Location**: Missing from codebase
  - **Finding**: No way to measure performance improvements
  - **Action**: Create benchmark suite for parsing and decoration application

- [ ] **Add stress tests for large documents**
  - **Location**: Test suite
  - **Finding**: Tests may not cover large document scenarios
  - **Action**: Add tests with 10K+ line documents, many decorations

- [ ] **Profile actual usage patterns**
  - **Location**: Missing instrumentation
  - **Finding**: Don't know which optimizations will have most impact in practice
  - **Action**: Add telemetry/logging to understand real-world usage patterns

## Implementation Notes

- Parser optimizations should be measured against real-world markdown documents
- Focus on common patterns: nested formatting, long documents, frequent edits
- Consider parser-specific benchmarks separate from overall extension performance
- Test edge cases: deeply nested structures, malformed markdown, very large files

