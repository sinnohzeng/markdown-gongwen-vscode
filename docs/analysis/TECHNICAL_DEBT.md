# Technical Debt

**Last Updated:** 2025-01-27  
**Purpose:** Track known technical debt, code quality issues, and areas for improvement

---

## Overview

This document tracks technical debt items that don't block current functionality but should be addressed to improve code quality, maintainability, and developer experience.


## Medium Priority

### 3. Large Class: Decorator

**Status:** Open  
**Location:** `src/decorator.ts` (920 lines)

**Issue:**
- `Decorator` class is large and handles multiple responsibilities:
  - Caching
  - Parsing coordination
  - Decoration application
  - Selection filtering
  - Performance optimization

**Impact:**
- Harder to understand and maintain
- Difficult to test individual concerns
- Risk of merge conflicts

**Recommendation:**
- Consider splitting into smaller classes:
  - `DecorationCache` - handles LRU caching
  - `DecorationApplier` - applies decorations to editor
  - `DecorationFilter` - filters decorations based on selection
  - Keep `Decorator` as orchestrator
- Only refactor if class continues to grow or becomes hard to maintain

**Related Files:**
- `src/decorator.ts`

---

### 4. Error Handling and Logging

**Status:** Open  
**Location:** Multiple files

**Issue:**
- Limited error logging for production debugging
- Stale document detection (`isDocumentStale`) has no logging
- Errors are thrown but not logged for debugging

**Impact:**
- Difficult to debug production issues
- No visibility into performance problems
- User reports lack context

**Recommendation:**
- Add debug logging for:
  - Cache hits/misses
  - Stale document detection
  - Performance metrics (parse time, decoration count)
- Use VS Code's output channel for logging
- Make logging configurable via settings

**Example:**
```typescript
private logDebug(message: string, ...args: any[]): void {
  if (this.config.debug) {
    this.outputChannel.appendLine(`[DEBUG] ${message}`, ...args);
  }
}
```

**Related Files:**
- `src/decorator.ts:379-382`
- `src/parser.ts:135`

---

### 5. Performance Metrics

**Status:** Open  
**Location:** `src/decorator.ts`

**Issue:**
- No performance metrics or telemetry
- Cannot measure actual performance in production
- Difficult to identify performance regressions

**Impact:**
- No data to guide optimization efforts
- Cannot detect performance degradation
- User reports lack quantitative data

**Recommendation:**
- Add optional performance metrics:
  - Parse time
  - Decoration count
  - Cache hit rate
  - Update frequency
- Make metrics opt-in via configuration
- Log to output channel or telemetry (if available)

**Related Files:**
- `src/decorator.ts`

---

## Low Priority

### 6. ESLint Configuration Warning

**Status:** Open  
**Location:** `scripts/validate-feature-outline.js:2`

**Issue:**
- ESLint warning about `/* eslint-env */` comments in flat config
- Will become error in ESLint v10.0.0

**Impact:**
- Future ESLint upgrade will break
- Minor: only affects scripts directory

**Recommendation:**
- Replace `/* eslint-env */` with `/* global */` or define globals in config
- Update when upgrading ESLint

**Related Files:**
- `scripts/validate-feature-outline.js:2`

---

### 7. Test Coverage Gaps (Partially Addressed)

**Status:** Open  
**Location:** Various test files

**Issue:**
- Some edge cases may not be fully covered
- Integration tests for complex scenarios (e.g., rapid typing, large files)

**Impact:**
- Potential bugs in edge cases
- Performance issues may not be caught

**Recommendation:**
- Add tests for:
  - Rapid typing scenarios (stress test debouncing)
  - Very large files (>10K lines)
  - Complex nested structures
  - Concurrent document changes

**Recent Improvements:**
- ✅ Added comprehensive tests for hover providers (image and link)
- ✅ Added tests for link click handler
- ✅ Added tests for hover utilities (URL resolution, caching, diff view handling)
- ✅ Current test count: 57+ passing tests across multiple test suites

**Related Files:**
- `src/decorator/__tests__/`
- `src/parser/__tests__/`
- `src/hover-utils/__tests__/` (new)
- `src/image-hover-provider/__tests__/` (new)
- `src/link-hover-provider/__tests__/` (new)
- `src/link-click-handler/__tests__/` (new)

---

### 8. Documentation Improvements

**Status:** Open  
**Location:** Various files

**Issue:**
- Some complex algorithms lack detailed explanations
- Performance characteristics not documented
- Architecture decisions not fully documented

**Impact:**
- Harder for new contributors to understand
- Risk of breaking changes during refactoring

**Recommendation:**
- Add detailed JSDoc for complex methods
- Document performance characteristics (O(n) complexity, etc.)
- Add architecture decision records (ADRs) for major decisions

**Related Files:**
- `src/decorator.ts` (caching strategy, debouncing)
- `src/position-mapping.ts` (CRLF handling)

---

## Notes

- **Priority Levels:**
  - **High:** Blocks maintainability or causes bugs
  - **Medium:** Improves code quality or developer experience
  - **Low:** Nice to have, minor improvements

- **Review Frequency:** This document should be reviewed quarterly or when major refactoring occurs.

- **Contributing:** When adding new technical debt, include:
  - Clear description of the issue
  - Impact assessment
  - Specific recommendations
  - Related file locations

---

## References

- [Code Review Summary](./TECHNICAL_DEBT.md) - Initial review that identified these issues
- [AGENTS.md](../AGENTS.md) - Project guidelines and code style
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
