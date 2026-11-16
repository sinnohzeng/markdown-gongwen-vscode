# VS Code Extension Size Analysis

**Analysis Date:** 2026-01-23  
**Extension Version:** 1.12.0

## Summary

- **Compressed Package Size:** 5.5 MB (`.vsix` file)
- **Uncompressed Size:** 44.3 MB
- **Compression Ratio:** ~87.6% (5.5 MB / 44.3 MB)

## Size Breakdown

### Top Contributors (Uncompressed)

| Directory | Size | Notes |
|-----------|------|-------|
| `extension/media/chunks/` | 9.61 MB | **DUPLICATE** - Same as assets/mermaid/chunks |
| `extension/assets/mermaid/chunks/` | 9.61 MB | Used by code (mermaid-renderer.ts) |
| `extension/dist/` | 2.59 MB | Compiled TypeScript + bundled extension.js (2.6 MB) |
| `extension/assets/` | 0.25 MB | Icons and images |

### Detailed Breakdown

```
Total uncompressed: 44.34 MB
├── Mermaid chunks (duplicated): 19.22 MB (43% of total)
│   ├── media/chunks/: 9.61 MB (194 files) ❌ NOT USED
│   └── assets/mermaid/chunks/: 9.61 MB (194 files) ✅ USED
├── Extension code: 2.59 MB
│   └── extension.js: 2.6 MB (bundled with dependencies)
├── Assets: 0.25 MB
│   ├── icon.png: 53 KB
│   ├── syntax-shadowing.png: 122 KB
│   └── code-blocks.png: 90 KB
└── Other: ~22 MB (package metadata, docs, etc.)
```

## Critical Issue: Duplication

**Problem:** The `media/` directory contains an exact duplicate of `assets/mermaid/chunks/` (9.61 MB).

- **194 files** in `media/chunks/` (duplicate)
- **194 files** in `assets/mermaid/chunks/` (used by code)
- Both directories are **identical** (verified with `diff -r`)
- Code only references `assets/mermaid/` (see `src/mermaid/mermaid-renderer.ts:21`)

**Root Cause:** The `media/` directory is not excluded in `.vscodeignore`, so it gets packaged unnecessarily.

## Optimization Opportunities

### 1. Remove Duplicate `media/` Directory ⚠️ HIGH IMPACT

**Potential Savings:** ~9.6 MB uncompressed (~2-3 MB compressed)

**Action:** Add `media/**` to `.vscodeignore`

**Verification:**
- Code uses `assets/mermaid/mermaid.esm.min.mjs` (line 21 in mermaid-renderer.ts)
- `media/` directory is not referenced anywhere in the codebase
- Both directories contain identical files

### 2. Bundle Size Analysis

The `extension.js` file is 2.6 MB, which includes:
- All TypeScript source code (bundled)
- Dependencies: `cheerio`, `remark-parse`, `remark-gfm`, `unified`, `unist-util-visit`
- Note: `mermaid` is NOT bundled (loaded separately in webview)

**Potential Optimization:**
- Review if all dependencies are necessary
- Consider tree-shaking unused code
- Check if any large dependencies can be replaced with lighter alternatives

### 3. Mermaid Chunks

The mermaid chunks (9.6 MB) are necessary for the mermaid renderer feature. However:
- Only one copy is needed (`assets/mermaid/chunks/`)
- The chunks are loaded dynamically by the webview
- Consider if all diagram types are needed (currently includes all mermaid diagram types)

## Recommendations

### Immediate (High Priority)

1. **Exclude `media/` directory from package**
   ```bash
   # Add to .vscodeignore
   media/**
   ```
   **Expected savings:** ~2-3 MB compressed (~20% reduction)

### Medium Priority

2. **Verify mermaid chunk usage**
   - Check if all diagram types are actually used
   - Consider lazy-loading chunks only when needed
   - Mermaid v11 supports dynamic imports

3. **Review bundle dependencies**
   - Analyze `extension.js` bundle for unused code
   - Consider code splitting if possible

### Low Priority

4. **Optimize assets**
   - Compress PNG images further if possible
   - Consider using WebP format for better compression

## Current Package Contents

### Files Count
- Total files in package: ~400+
- Mermaid chunk files: 388 (194 duplicated)
- TypeScript definitions: ~20
- Assets: 3 PNG files

### Compression
- Original: 44.3 MB
- Compressed: 5.5 MB
- Ratio: 87.6% compression

## Comparison with Similar Extensions

- **Markless** (similar functionality): ~3-4 MB
- **Markdown All in One**: ~2-3 MB
- **Current extension**: 5.5 MB (could be ~3 MB after removing duplication)

## Next Steps

1. ✅ Add `media/**` to `.vscodeignore`
2. ✅ Rebuild and verify package size reduction
3. ⏳ Test mermaid rendering still works (should use `assets/mermaid/`)
4. ⏳ Consider further optimizations if needed
