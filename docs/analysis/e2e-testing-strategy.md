# E2E Testing Strategy for Visual Decoration Verification

## Problem Statement

VS Code extensions that use `TextEditorDecorationType` to apply visual decorations face a challenge: **there is no public API to read decorations back**. This makes automated E2E testing of visual appearance difficult.

### Key Constraints
- Decorations are rendered in VS Code's native Monaco editor (not a webview)
- No public API to verify decorations were applied correctly
- Visual verification requires either:
  - Screenshot comparison (fragile, complex)
  - Range verification (reliable, but doesn't verify visual appearance)
  - Hybrid approach (best of both worlds)

---

## Solution Approaches

### 1. Range Verification (Recommended - Phase 1)
**Status:** ✅ Implementable now  
**Complexity:** Low  
**Reliability:** High

#### Brief Overview
- Spy on `setDecorations()` calls to track what decorations are applied
- Verify decoration types and ranges match expected text content
- Validate that syntax markers are hidden, text is decorated correctly

#### Implementation Strategy
```typescript
// Spy on setDecorations calls
class DecoratorVerifier {
  - Track all setDecorations() calls with type and ranges
  - Map ranges to document text to verify content
  - Provide verification methods:
    - verifySyntaxHidden(syntax: string)
    - verifyDecorationApplied(type, expectedContent)
    - verifyDecorationAtRange(type, range)
}
```

#### Pros
- ✅ Fully automated
- ✅ Fast execution
- ✅ Reliable (no flaky screenshots)
- ✅ Works in CI without Docker
- ✅ Catches 95% of bugs (logic errors, wrong ranges, missing decorations)

#### Cons
- ❌ Doesn't verify actual visual appearance
- ❌ Can't catch CSS/styling issues
- ❌ Can't verify color, font, or visual indicators

#### Use Cases
- Verify blockquote markers (`>`) are hidden
- Verify bold text ranges are decorated
- Verify selection reveals raw markdown
- Verify nested decorations work correctly

---

### 2. Screenshot-Based Visual Regression (Phase 2)
**Status:** 🚧 Complex, requires setup  
**Complexity:** High  
**Reliability:** Medium (fragile due to rendering differences)

#### Brief Overview
- Capture screenshots of editor with decorations applied
- Compare against baseline images
- Use pixel-level comparison with tolerance

#### Implementation Strategy
```typescript
// Using Playwright or similar
- Launch VS Code extension host
- Apply decorations to test document
- Capture screenshot of editor area
- Compare to baseline using pixelmatch/pngjs
- Generate diff images for failures
```

#### Tools Required
- `@vscode/test-electron` - Run extension in VS Code
- `playwright` or `playwright-core` - Browser automation
- `pixelmatch` + `pngjs` - Image comparison
- Docker container - For consistent rendering (critical!)

#### Pros
- ✅ Verifies actual visual appearance
- ✅ Catches CSS/styling regressions
- ✅ Catches rendering issues
- ✅ Can verify colors, fonts, visual indicators

#### Cons
- ❌ Fragile (OS differences, font rendering, GPU differences)
- ❌ Requires Docker for consistency
- ❌ Slower execution
- ❌ Requires baseline image management
- ❌ More complex CI setup

#### Critical Requirements
1. **Containerized Environment** - Must run in Docker to ensure consistency
   - Use `mcr.microsoft.com/playwright` container
   - Same OS, fonts, rendering in local and CI
2. **Masking** - Mask dynamic content (clock, git branch, cursor)
3. **Tolerance** - Set appropriate pixel difference tolerance
4. **Baseline Management** - Version control baseline images

#### Use Cases
- Verify visual bar appears for blockquotes
- Verify checkbox icons render correctly
- Verify heading styling matches design
- Verify link underlines/colors

---

### 3. Gherkin Feature File Integration
**Status:** ✅ Implementable  
**Complexity:** Medium  
**Reliability:** High (when combined with verification)

#### Brief Overview
- Extract Gherkin scenarios from `docs/features/*.md` files
- Convert to executable E2E tests
- Use Cucumber to run scenarios
- Combine with range verification or screenshots

#### Implementation Strategy
```typescript
// Extract Gherkin from markdown
extractGherkinFromMarkdown(featureFile)
  - Parse markdown code blocks with ```gherkin
  - Extract Feature/Scenario definitions
  - Generate .feature files for Cucumber

// Step definitions
Given/When/Then steps that:
  - Set up VS Code editor
  - Apply decorations via decorator
  - Verify using DecoratorVerifier or screenshots
```

#### Tools Required
- `@cucumber/cucumber` - Gherkin test runner
- `@cucumber/gherkin` - Parse Gherkin syntax
- Custom extractor for markdown → Gherkin

#### Pros
- ✅ Executable acceptance criteria
- ✅ Tests stay in sync with documentation
- ✅ Human-readable test scenarios
- ✅ Can run all features or filter by file

#### Cons
- ❌ Requires step definition maintenance
- ❌ Gherkin extraction from markdown is custom

#### Example
```gherkin
Feature: Blockquote formatting
  Scenario: Basic blockquote
    When I type > Quote text
    Then the marker is replaced with visual bar
    And the text is displayed
```

---

### 4. Hybrid Approach (Recommended - Full Solution)
**Status:** 🎯 Best practice  
**Complexity:** Medium-High  
**Reliability:** High

#### Brief Overview
Combine range verification (Phase 1) with selective screenshot testing (Phase 2) for critical visual features.

#### Implementation Strategy
```typescript
// Phase 1: Range verification for all tests
- Fast, reliable verification of decoration logic
- Catches most bugs automatically

// Phase 2: Screenshot testing for critical visuals
- Only for features where visual appearance is critical
- Examples: blockquote bars, checkbox icons, heading styles
- Run less frequently (nightly, not on every commit)
```

#### Test Strategy
1. **Unit Tests** (Jest) - Parser logic, position mapping
2. **E2E Range Verification** (Cucumber + DecoratorVerifier) - All features
3. **Visual Regression** (Playwright + Screenshots) - Critical visual features only

#### Pros
- ✅ Best of both worlds
- ✅ Fast feedback on logic (range verification)
- ✅ Visual confidence on critical features
- ✅ Scalable (add visual tests as needed)

#### Cons
- ❌ More complex setup
- ❌ Two test systems to maintain

---

## Implementation Roadmap

### Phase 1: Range Verification (Immediate)
**Goal:** Automated E2E tests that verify decoration ranges and types

**Tasks:**
1. Create `DecoratorVerifier` class that spies on `setDecorations()`
2. Map decoration types to string keys (registry)
3. Implement verification methods:
   - `verifySyntaxHidden(syntax)`
   - `verifyDecorationApplied(type, expectedContent)`
   - `verifyDecorationAtRange(type, range)`
4. Create Gherkin extractor from `docs/features/*.md`
5. Write Cucumber step definitions
6. Integrate with `@vscode/test-electron`

**Deliverables:**
- `src/test/suite/decorator-verifier.ts`
- `src/test/suite/gherkin/extract-gherkin.ts`
- `src/test/suite/step-definitions/*.ts`
- `src/test/suite/cucumber-runner.ts`

**Timeline:** 1-2 days

---

### Phase 2: Visual Regression (Future)
**Goal:** Screenshot-based visual verification for critical features

**Tasks:**
1. Set up Playwright with VS Code extension host
2. Create Docker container for consistent rendering
3. Implement screenshot capture of editor area
4. Set up baseline image management
5. Configure masking for dynamic content
6. Add visual tests for critical features:
   - Blockquote visual bars
   - Checkbox icons
   - Heading styles
   - Link styling

**Deliverables:**
- `src/test/e2e/playwright-setup.ts`
- `src/test/e2e/visual-verification.ts`
- `Dockerfile` for test environment
- Baseline images in `test/baselines/`
- CI configuration for visual tests

**Timeline:** 3-5 days (including Docker setup and CI)

---

## Technical Details

### DecoratorVerifier Implementation

```typescript
class DecoratorVerifier {
  private decorationCalls: Map<string, DecorationCall[]>;
  
  // Spy setup
  setupSpy(editor: TextEditor): void {
    // Override setDecorations to track calls
    // Map decoration types to string keys
    // Store ranges and text content
  }
  
  // Verification methods
  verifySyntaxHidden(syntax: string): boolean
  verifyDecorationApplied(type: string, expectedContent: string[]): VerificationResult
  verifyDecorationAtRange(type: string, range: Range): boolean
  getAllDecorationCalls(): Map<string, DecorationCall[]>
}
```

**Key Challenges:**
- Mapping decoration type instances to string keys
- Handling CRLF vs LF line endings in range mapping
- Verifying nested decorations
- Handling selection-based decoration filtering

**Solutions:**
- Decoration type registry (map instances to names)
- Use existing `mapNormalizedToOriginal` helpers
- Track all decoration calls, not just final state
- Clear calls before each test step

---

### Gherkin Extraction Implementation

```typescript
function extractGherkinFromMarkdown(markdownPath: string): ExtractedFeature[] {
  // Parse markdown
  // Find ```gherkin code blocks
  // Extract Feature/Scenario definitions
  // Return array of features
}

function writeFeatureFiles(features: ExtractedFeature[], outputDir: string): string[] {
  // Write .feature files for Cucumber
  // Return paths to feature files
}
```

**Key Challenges:**
- Parsing markdown code blocks
- Handling multiple Gherkin blocks per file
- Preserving Gherkin syntax

**Solutions:**
- Use regex to find ```gherkin blocks
- Create separate .feature file per block
- Preserve original Gherkin text

---

### Screenshot Testing Implementation

```typescript
// Launch VS Code with extension
async function launchVSCodeWithExtension(): Promise<Page> {
  // Option A: code-server (VS Code in browser)
  // Option B: VS Code extension host + Playwright
  // Option C: Electron + Playwright
}

// Capture editor screenshot
async function screenshotEditor(page: Page, testName: string): Promise<string> {
  // Locate Monaco editor (.monaco-editor .view-lines)
  // Wait for editor ready
  // Capture screenshot
  // Save to test/screenshots/
}

// Compare to baseline
function compareScreenshot(actual: string, baseline: string): ComparisonResult {
  // Load images
  // Pixel-level comparison with pixelmatch
  // Generate diff image
  // Return match result
}
```

**Key Challenges:**
- Locating editor DOM elements (Monaco is complex)
- Consistent rendering across environments
- Masking dynamic content
- Managing baseline images

**Solutions:**
- Use Playwright's frame locators for Monaco editor
- Docker container for consistency
- Mask selectors for dynamic elements
- Git LFS or separate repo for baseline images

---

## CI/CD Integration

### Phase 1 Tests (Range Verification)
```yaml
# .github/workflows/ci.yaml
test-e2e:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
    - run: npm ci
    - run: npm run compile
    - run: npm run test:e2e  # Range verification tests
```

**Characteristics:**
- Fast (seconds, not minutes)
- Reliable (no flaky screenshots)
- Runs on every commit
- No special requirements

---

### Phase 2 Tests (Visual Regression)
```yaml
# .github/workflows/visual-tests.yaml
visual-regression:
  runs-on: ubuntu-latest
  container:
    image: mcr.microsoft.com/playwright:v1.40.0
  steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
    - run: npm ci
    - run: npm run compile
    - run: npm run test:visual  # Screenshot tests
    - uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: screenshot-diffs
        path: test/screenshots/diffs/
```

**Characteristics:**
- Slower (minutes)
- Requires Docker
- Runs on schedule or PR labels
- Uploads diff images on failure

---

## Testing Checklist

### What Range Verification Tests
- ✅ Syntax markers are hidden (`, `>`, `**`, etc.)
- ✅ Text ranges are decorated correctly
- ✅ Selection reveals raw markdown
- ✅ Nested decorations work
- ✅ Edge cases (empty content, malformed markdown)
- ✅ CRLF vs LF handling
- ✅ Position mapping accuracy

### What Screenshot Tests Verify
- ✅ Visual appearance matches design
- ✅ Colors and fonts are correct
- ✅ Visual indicators (bars, icons) render
- ✅ Spacing and alignment
- ✅ Theme compatibility (light/dark)

### What Manual Testing Still Needed
- ⚠️ Subjective visual quality
- ⚠️ Performance with large files
- ⚠️ Integration with other extensions
- ⚠️ User experience flow

---

## Decision Matrix

| Approach | Speed | Reliability | Visual Verification | Setup Complexity | Recommended For |
|----------|-------|-------------|---------------------|------------------|-----------------|
| Range Verification | ⚡⚡⚡ | ⭐⭐⭐ | ❌ | Low | All features |
| Screenshot Testing | ⚡ | ⭐⭐ | ✅ | High | Critical visuals |
| Hybrid | ⚡⚡ | ⭐⭐⭐ | ✅ | Medium | Production use |

---

## Next Steps

1. **Immediate:** Implement Phase 1 (Range Verification)
   - Start with `DecoratorVerifier` class
   - Add Gherkin extraction
   - Create step definitions for blockquotes feature
   - Verify it works end-to-end

2. **Short-term:** Evaluate if Phase 2 is needed
   - Are there visual bugs that range verification misses?
   - Is visual appearance critical enough to justify complexity?
   - Can we rely on manual visual QA for styling?

3. **Long-term:** If Phase 2 is needed
   - Set up Docker environment
   - Implement screenshot capture
   - Create baseline images
   - Add to CI pipeline

---

## References

- [VS Code Extension Testing](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [@vscode/test-electron](https://github.com/microsoft/vscode-test)
- [Playwright Visual Testing](https://playwright.dev/docs/test-screenshots)
- [Cucumber.js Documentation](https://cucumber.io/docs/cucumber/)
- [Pixelmatch (Image Comparison)](https://github.com/mapbox/pixelmatch)

---

## Notes

- VS Code's decoration API doesn't expose read methods
- Monaco editor DOM is complex and may change between versions
- Screenshot testing requires careful baseline management
- Range verification provides 95% of the value with 20% of the effort
- Consider visual regression testing as "nice to have" not "must have"
