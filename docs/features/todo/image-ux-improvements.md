---
status: TODO
priority: Enhancement
updateDate: 2026-01-19
---

# Image UX Improvements

## Overview

Enhance the user experience for markdown images with additional features like clickable images, enhanced hover previews, visual distinction, and optional inline thumbnails. These improvements build upon the current image implementation which already supports styled alt text, hidden syntax, hover previews, and icons.

## Implementation

### Phase 1: Clickable Images (High Priority)
- Extend `MarkdownLinkProvider` or create similar `DocumentLinkProvider` for images
- Clicking image alt text opens the image in VS Code's image viewer
- Use `vscode.commands.executeCommand('vscode.open', imageUri)` or similar
- Provides consistent behavior with links

### Phase 2: Enhanced Hover Experience (Medium Priority)
- Show image dimensions (width × height) if available
- Show file size and file path/name
- Add "Open Image" action button in hover
- Constrain image size in hover (max-width: 400px) to prevent overflow

### Phase 3: Visual Distinction (Low Priority)
- Different color scheme (e.g., slightly different shade)
- Background highlight (subtle, like code blocks but lighter)
- Border or underline style difference
- Icon positioning (before vs after)

### Phase 4: Status Indicators (Low Priority)
- Visual feedback for image states:
  - ✅ Valid image (exists, loadable)
  - ⚠️ Missing image (file not found)
  - 🔒 External image (requires network)
  - 📦 Large image (file size warning)

### Phase 5: Inline Thumbnail Preview (Future - Complex)
- Show small thumbnail inline instead of just icon
- Performance considerations: loading many images, caching strategy
- Alternative: Show thumbnail only on hover or when image is "expanded"

### Phase 6: Keyboard Navigation (Low Priority)
- `Ctrl+Click` / `Cmd+Click`: Open in new tab
- `Alt+Click`: Copy image path
- `F12` / `Go to Definition`: Jump to image file

## Acceptance Criteria

### Clickable Images
```gherkin
Feature: Clickable images

  Scenario: Click to open image
    Given I have an image ![Alt](image.png) in my markdown
    When I click on the alt text
    Then the image opens in VS Code's image viewer
    And the image file is displayed

  Scenario: Click on external image
    Given I have an external image ![Alt](https://example.com/image.png)
    When I click on the alt text
    Then the image opens in the default browser or viewer
```

### Enhanced Hover
```gherkin
Feature: Enhanced image hover

  Scenario: Hover shows metadata
    Given I have an image ![Alt](image.png) in my markdown
    When I hover over the alt text
    Then I see the image preview
    And I see the image dimensions (if available)
    And I see the file size
    And I see the file path
    And I see an "Open Image" button

  Scenario: Hover size constraints
    Given I have a large image ![Alt](large-image.png)
    When I hover over the alt text
    Then the preview is constrained to max 400x300px
    And the preview does not overflow the hover popup
```

### Visual Distinction
```gherkin
Feature: Visual distinction for images

  Scenario: Images look different from links
    Given I have both links and images in my markdown
    When I view the document
    Then images have a distinct visual style from links
    And I can easily distinguish between images and links
```

## Notes

- Current implementation already supports:
  - ✅ Image alt text styling (with inline formatting support: bold, italic, etc.)
  - ✅ Image URL hiding (like links)
  - ✅ Hover shows image preview
  - ✅ Image icon (📷) appears after alt text

- Icon recommendations:
  - Current: 📷 (Camera - U+1F4F7) - Most recognizable, universal meaning
  - Alternatives: 🖼️ (Frame), 📸 (Camera with Flash), ⬜ (White Square), ▦ (Grid Square)

- Configuration options (future):
  - Icon choice (camera, frame, square, etc.)
  - Icon position (before, after, or none)
  - Hover behavior (preview size, metadata display)
  - Click behavior (open in editor, external viewer, etc.)
  - Thumbnail display (enabled/disabled, size)

- Implementation order:
  1. Phase 1 (Quick Win): Make images clickable
  2. Phase 2 (Enhanced UX): Improve hover with metadata
  3. Phase 3 (Polish): Visual distinction
  4. Phase 4 (Advanced): Status indicators
  5. Phase 5 (Future): Inline thumbnails - if user demand

## Examples

### Current Behavior
- `![Alt Text](image.png)` → **Alt Text** 📷 (styled, path hidden, icon shown)
- Hover shows image preview with size constraints

### Proposed Enhancements

**Clickable Images:**
- Click on `![Alt](image.png)` → Opens image in VS Code viewer

**Enhanced Hover:**
```
[Image Preview - 400x300px max]

📷 image.png
Size: 1.2 MB | Dimensions: 1920×1080
[Open Image] button
```

**Visual Distinction:**
- Images: Slightly different color/shade than links
- Images: Subtle background highlight
- Images: Different underline style

**Status Indicators:**
- `![Alt](image.png)` ✅ → Valid image
- `![Alt](missing.png)` ⚠️ → Missing image
- `![Alt](https://example.com/img.png)` 🔒 → External image
