import { window, ThemeColor, ColorThemeKind } from 'vscode';

/**
 * Opacity value for brightness adjustment overlays.
 * Creates approximately 30% brightness change when composited over editor background.
 */
const BRIGHTNESS_OVERLAY_OPACITY = 0.1;

/** Size of the checkbox box (width and height). */
const CHECKBOX_BOX_SIZE = '1em';
/** Gap between checkbox and adjacent text. */
const CHECKBOX_GAP_SIZE = '0.6em';
/** Left padding applied after the checkbox. */
const CHECKBOX_PADDING = '0.2em';

/**
 * Determines if the current theme is dark or high contrast.
 *
 * @returns {boolean} True if theme is dark or high contrast
 */
function isDarkTheme(): boolean {
  const themeKind = window.activeColorTheme.kind;
  return themeKind === ColorThemeKind.Dark || themeKind === ColorThemeKind.HighContrast;
}

/**
 * Creates a decoration type for hiding markdown syntax.
 *
 * @returns {vscode.TextEditorDecorationType} A decoration type that hides text
 */
export function HideDecorationType() {
  return window.createTextEditorDecorationType({
    // Hide the item
    textDecoration: 'none; display: none;',
    // This forces the editor to re-layout following text correctly
    after: {
      contentText: '',
    },
  });
}

/**
 * Creates a decoration type for making text transparent.
 *
 * Unlike HideDecorationType which uses display: none (removes from layout),
 * this keeps the text in the layout but makes it invisible. This is important
 * for inline code borders - the backticks need to exist in layout for borders
 * to render correctly.
 *
 * Matches Markless approach: uses color: transparent instead of display: none.
 *
 * @returns {vscode.TextEditorDecorationType} A decoration type that makes text transparent
 */
export function TransparentDecorationType() {
  return window.createTextEditorDecorationType({
    color: 'transparent',
  });
}

/**
 * Creates a decoration type for ghost (faint) markdown syntax markers.
 *
 * Used in Ghost state to show subtle edit cues without fully restoring raw layout.
 * Makes markers faintly visible so users can locate formatting boundaries.
 *
 * @param {number} opacity - Opacity value between 0.0 and 1.0 (default: 0.3)
 * @returns {vscode.TextEditorDecorationType} A decoration type that makes text faint
 */
export function GhostFaintDecorationType(opacity: number = 0.3) {
  // Clamp opacity to valid range
  const clampedOpacity = Math.max(0, Math.min(1, opacity));
  return window.createTextEditorDecorationType({
    opacity: clampedOpacity.toString(),
  });
}

/**
 * Creates a decoration type for code block language identifiers.
 *
 * Renders the language identifier (e.g., "python", "javascript") with a subtle badge-like appearance.
 * Uses reduced opacity, italic style, and underline to create a non-intrusive label
 * that clearly indicates the language without competing with the code content.
 *
 * @param {number} opacity - Opacity value between 0.0 and 1.0 (default: 0.3)
 * @returns {vscode.TextEditorDecorationType} A decoration type for code block language identifiers
 */
export function CodeBlockLanguageDecorationType(opacity: number = 0.3) {
  // Clamp opacity to valid range
  const clampedOpacity = Math.max(0, Math.min(1, opacity));
  return window.createTextEditorDecorationType({
    opacity: clampedOpacity.toString(),
    fontStyle: 'italic',
    textDecoration: 'underline',
  });
}

/**
 * Creates a decoration type for bold text styling.
 *
 * @param {string | ThemeColor | undefined} color - Optional hex or theme color; when undefined uses default (no color override)
 * @param {string | undefined} fontFamily - Optional CSS font-family override
 * @param {string | undefined} fontWeight - Optional CSS font-weight override (default: 'bold')
 * @returns {vscode.TextEditorDecorationType} A decoration type for bold text
 */
export function BoldDecorationType(color?: string | ThemeColor, fontFamily?: string, fontWeight?: string) {
  const effectiveWeight = fontWeight ?? 'bold';
  const cssParts = ['none'];
  if (fontFamily) {
    // When textDecoration hack is needed, fontWeight must go inside it
    cssParts.push(`font-weight: ${effectiveWeight}`);
    cssParts.push(`font-family: ${fontFamily}`);
  }
  const options: Record<string, unknown> = {};
  if (cssParts.length > 1) {
    options.textDecoration = cssParts.join('; ') + ';';
  } else {
    options.fontWeight = effectiveWeight;
  }
  if (color !== undefined) {
    options.color = color;
  }
  return window.createTextEditorDecorationType(options);
}

/**
 * Creates a decoration type for italic text styling.
 *
 * @param {string | ThemeColor | undefined} color - Optional hex or theme color; when undefined uses default
 * @param {string | undefined} fontFamily - Optional CSS font-family override
 * @returns {vscode.TextEditorDecorationType} A decoration type for italic text
 */
export function ItalicDecorationType(color?: string | ThemeColor, fontFamily?: string) {
  const cssParts = ['none'];
  if (fontFamily) cssParts.push(`font-family: ${fontFamily}`);
  const options: Record<string, unknown> = { fontStyle: 'italic' };
  if (cssParts.length > 1) {
    options.textDecoration = cssParts.join('; ') + ';';
  }
  if (color !== undefined) {
    options.color = color;
  }
  return window.createTextEditorDecorationType(options);
}

/**
 * Creates a decoration type for bold+italic text styling.
 *
 * @param {string | ThemeColor | undefined} color - Optional hex or theme color; when undefined uses default
 * @param {string | undefined} fontFamily - Optional CSS font-family override
 * @param {string | undefined} fontWeight - Optional CSS font-weight override (default: 'bold')
 * @returns {vscode.TextEditorDecorationType} A decoration type for bold+italic text
 */
export function BoldItalicDecorationType(color?: string | ThemeColor, fontFamily?: string, fontWeight?: string) {
  const effectiveWeight = fontWeight ?? 'bold';
  const cssParts = ['none'];
  if (fontFamily) {
    cssParts.push(`font-weight: ${effectiveWeight}`);
    cssParts.push(`font-family: ${fontFamily}`);
  }
  const options: Record<string, unknown> = { fontStyle: 'italic' };
  if (cssParts.length > 1) {
    options.textDecoration = cssParts.join('; ') + ';';
  } else {
    options.fontWeight = effectiveWeight;
  }
  if (color !== undefined) {
    options.color = color;
  }
  return window.createTextEditorDecorationType(options);
}

/**
 * Creates a decoration type for strikethrough text styling.
 *
 * @returns {vscode.TextEditorDecorationType} A decoration type for strikethrough text
 */
export function StrikethroughDecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'line-through',
  });
}

/**
 * Creates a decoration type for inline code styling.
 *
 * Uses the editor background color with theme-aware brightness adjustment:
 * - Dark themes: Lightens by ~30% using white overlay
 * - Light themes: Darkens by ~30% using black overlay
 *
 * Since VS Code doesn't allow reading ThemeColor values, we use semi-transparent
 * overlays that composite over the editor background.
 *
 * Note: This decoration type is automatically recreated when the theme changes
 * via {@link Decorator.recreateCodeDecorationType}, ensuring the background color
 * adapts to the current theme without requiring a restart.
 *
 * @param {string | ThemeColor | undefined} color - Optional hex or theme color for text; when undefined only background is applied
 * @param {string | ThemeColor | undefined} backgroundColor - Optional hex or theme color for background overlay; when undefined uses theme-aware default (white for dark, black for light)
 * @returns {vscode.TextEditorDecorationType} A decoration type for inline code
 */
export function CodeDecorationType(
  color?: string | ThemeColor,
  backgroundColor?: string | ThemeColor,
) {
  const isDark = isDarkTheme();
  let bgColor: string | ThemeColor;
  if (backgroundColor !== undefined) {
    bgColor = backgroundColor;
  } else {
    bgColor = isDark
      ? `rgba(255, 255, 255, ${BRIGHTNESS_OVERLAY_OPACITY})`
      : `rgba(0, 0, 0, ${BRIGHTNESS_OVERLAY_OPACITY})`;
  }
  const options: Record<string, unknown> = {
    backgroundColor: bgColor,
  };
  if (color !== undefined) {
    options.color = color;
  }
  return window.createTextEditorDecorationType(options);
}

/**
 * Creates a decoration type for code block styling.
 *
 * @returns {vscode.TextEditorDecorationType} A decoration type for code blocks
 */
export function CodeBlockDecorationType() {
  return window.createTextEditorDecorationType({
    backgroundColor: new ThemeColor('textCodeBlock.background'),
    isWholeLine: true, // Extend background to full line width
  });
}

/**
 * Creates a decoration type that overlays VS Code's selection background color.
 *
 * This is used to restore visible selection highlight on top of opaque
 * block background decorations (e.g. fenced code blocks, frontmatter),
 * in themes where the block background can visually overpower the native selection.
 */
export function SelectionOverlayDecorationType() {
  return window.createTextEditorDecorationType({
    backgroundColor: new ThemeColor('editor.selectionBackground'),
  });
}

/**
 * Creates a decoration type for YAML frontmatter styling.
 *
 * Highlights the entire frontmatter block (including --- delimiters) with a background color,
 * similar to code blocks. The delimiters remain visible.
 *
 * @returns {vscode.TextEditorDecorationType} A decoration type for frontmatter blocks
 */
export function FrontmatterDecorationType() {
  return window.createTextEditorDecorationType({
    backgroundColor: new ThemeColor('textCodeBlock.background'),
    isWholeLine: true, // Extend background to full line width
  });
}

/**
 * Creates a decoration type for frontmatter delimiters (---).
 *
 * Renders the frontmatter delimiters with reduced opacity to make them
 * visible but subtle, similar to code block language identifiers.
 *
 * @param {number} opacity - Opacity value between 0.0 and 1.0 (default: 0.3)
 * @returns {vscode.TextEditorDecorationType} A decoration type for frontmatter delimiters
 */
export function FrontmatterDelimiterDecorationType(opacity: number = 0.3) {
  // Clamp opacity to valid range
  const clampedOpacity = Math.max(0, Math.min(1, opacity));
  return window.createTextEditorDecorationType({
    opacity: clampedOpacity.toString(),
  });
}

/**
 * Creates a decoration type for emoji shortcodes.
 *
 * Hides the original shortcode and allows per-range emoji rendering
 * via {@link vscode.DecorationOptions.renderOptions}.
 */
export function EmojiDecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;',
    before: {
      contentText: '',
    },
  });
}

/**
 * Creates a decoration type for heading styling.
 *
 * @returns {vscode.TextEditorDecorationType} A decoration type for headings
 */
export function HeadingDecorationType() {
  return window.createTextEditorDecorationType({
    fontWeight: 'bold',
  });
}

/**
 * Default body text font configuration.
 * Uses Times New Roman for English, Source Han Serif SC / Noto Serif SC for Chinese.
 */
const BODY_DEFAULT_FONT_FAMILY = '"Songti SC", "Source Han Serif SC", "Noto Serif CJK SC", "SimSun", serif';
const BODY_DEFAULT_FONT_WEIGHT = 'normal';
/** Default body font size — 150% matches H5 (公文四级标题) for visual consistency. */
const BODY_DEFAULT_FONT_SIZE = '150%';
/**
 * Default body line height — injected via CSS hack but only affects in-line vertical positioning.
 * For actual editor line spacing, users must also set `editor.lineHeight` in VS Code settings.
 * Recommended: editor.lineHeight = 2.2 (or higher) when using 150%+ font sizes.
 */
const BODY_DEFAULT_LINE_HEIGHT = '1.8';

/**
 * Heading decoration configuration.
 *
 * Mapping rationale: In practice, H1 is used as the document/file title,
 * so the actual government document heading levels start from H2:
 *   H1 = 文件标题（思源宋体粗体）
 *   H2 = 公文一级标题（黑体）
 *   H3 = 公文二级标题（楷体）
 *   H4 = 公文三级标题（仿宋加粗）
 *   H5 = 公文四级标题（仿宋）
 *   H6 = 备用
 */
const HEADING_CONFIG = [
  { size: '200%', bold: true,  fontFamily: '"Songti SC", "Source Han Serif SC", "Noto Serif CJK SC", "SimSun", serif' },  // H1: 文件标题 — 宋体粗体
  { size: '165%', bold: false, fontFamily: 'SimHei, "Heiti SC", "Microsoft YaHei", sans-serif' },        // H2: 一级标题 — 黑体
  { size: '160%', bold: false, fontFamily: 'KaiTi, STKaiti, "KaiTi_GB2312", serif' },                    // H3: 二级标题 — 楷体
  { size: '150%', bold: true,  fontFamily: 'FangSong, STFangsong, "FangSong_GB2312", serif' },           // H4: 三级标题 — 仿宋加粗
  { size: '150%', bold: false, fontFamily: 'FangSong, STFangsong, "FangSong_GB2312", serif' },           // H5: 四级标题 — 仿宋
  { size: '135%', bold: false, fontFamily: '' },                                                          // H6: 备用
];
/**
 * Creates a heading decoration type with the specified level.
 *
 * @param {number} level - Heading level (1-6)
 * @param {string | ThemeColor | undefined} color - Optional hex or theme color. When **undefined** (empty extension setting = theme default), the decoration **omits** `color` so the editor keeps syntax-highlighted markdown heading colors for the active theme. When set, that color overrides the token foreground for the decorated range.
 * @param {string | undefined} fontFamily - Optional CSS font-family override
 * @param {string | undefined} fontWeight - Optional CSS font-weight override; when undefined, uses HEADING_CONFIG default
 * @param {string | undefined} fontSize - Optional CSS font-size override; when undefined, uses HEADING_CONFIG default
 * @returns {vscode.TextEditorDecorationType} A decoration type for the heading level
 */
function createHeadingDecoration(level: number, color?: string | ThemeColor, fontFamily?: string, fontWeight?: string, fontSize?: string) {
  const cfg = HEADING_CONFIG[level - 1];
  if (!cfg) throw new Error(`Invalid heading level: ${level}`);
  const effectiveSize = fontSize ?? cfg.size;
  const effectiveWeight = fontWeight ?? (cfg.bold ? 'bold' : undefined);
  const effectiveFont = fontFamily ?? cfg.fontFamily;

  // Build CSS injection string via textDecoration hack
  // IMPORTANT: fontWeight MUST go inside the textDecoration string, NOT as a native property.
  // When both textDecoration and native fontWeight are present, VS Code's renderer breaks the CSS hack.
  const cssParts = [`none; font-size: ${effectiveSize}`];
  if (effectiveWeight) cssParts.push(`font-weight: ${effectiveWeight}`);
  if (effectiveFont) cssParts.push(`font-family: ${effectiveFont}`);

  const options: Record<string, unknown> = {
    textDecoration: cssParts.join('; ') + ';',
  };
  if (color !== undefined) {
    options.color = color;
  }
  return window.createTextEditorDecorationType(options);
}

/** @param color - When undefined (empty setting), omit `color` so theme markdown heading syntax colors apply. */
export function Heading1DecorationType(color?: string | ThemeColor, fontFamily?: string, fontWeight?: string, fontSize?: string) {
  return createHeadingDecoration(1, color, fontFamily, fontWeight, fontSize);
}
/** @param color - When undefined (empty setting), omit `color` so theme markdown heading syntax colors apply. */
export function Heading2DecorationType(color?: string | ThemeColor, fontFamily?: string, fontWeight?: string, fontSize?: string) {
  return createHeadingDecoration(2, color, fontFamily, fontWeight, fontSize);
}
/** @param color - When undefined (empty setting), omit `color` so theme markdown heading syntax colors apply. */
export function Heading3DecorationType(color?: string | ThemeColor, fontFamily?: string, fontWeight?: string, fontSize?: string) {
  return createHeadingDecoration(3, color, fontFamily, fontWeight, fontSize);
}
/** @param color - When undefined (empty setting), omit `color` so theme markdown heading syntax colors apply. */
export function Heading4DecorationType(color?: string | ThemeColor, fontFamily?: string, fontWeight?: string, fontSize?: string) {
  return createHeadingDecoration(4, color, fontFamily, fontWeight, fontSize);
}
/** @param color - When undefined (empty setting), omit `color` so theme markdown heading syntax colors apply. */
export function Heading5DecorationType(color?: string | ThemeColor, fontFamily?: string, fontWeight?: string, fontSize?: string) {
  return createHeadingDecoration(5, color, fontFamily, fontWeight, fontSize);
}
/** @param color - When undefined (empty setting), omit `color` so theme markdown heading syntax colors apply. */
export function Heading6DecorationType(color?: string | ThemeColor, fontFamily?: string, fontWeight?: string, fontSize?: string) {
  return createHeadingDecoration(6, color, fontFamily, fontWeight, fontSize);
}

/**
 * Creates a decoration type for body/paragraph text styling.
 *
 * Injects font-size and line-height via the textDecoration CSS hack (same
 * technique used by headings).  Note: CSS `line-height` affects text
 * positioning inside the line box; for actual editor line spacing the user
 * should also set `editor.lineHeight` in VS Code settings.
 *
 * @param {string | undefined} fontFamily - Optional CSS font-family
 * @param {string | undefined} fontWeight - Optional CSS font-weight
 * @param {string | undefined} fontSize - Optional CSS font-size (default: 105%)
 * @param {string | undefined} lineHeight - Optional CSS line-height (default: 1.8)
 * @returns {vscode.TextEditorDecorationType} A decoration type for body text
 */
export function BodyTextDecorationType(fontFamily?: string, fontWeight?: string, fontSize?: string, lineHeight?: string) {
  const effectiveFont = fontFamily ?? BODY_DEFAULT_FONT_FAMILY;
  const effectiveWeight = fontWeight ?? BODY_DEFAULT_FONT_WEIGHT;
  const effectiveFontSize = fontSize ?? BODY_DEFAULT_FONT_SIZE;
  const effectiveLineHeight = lineHeight ?? BODY_DEFAULT_LINE_HEIGHT;

  // IMPORTANT: fontWeight MUST go inside the textDecoration string, NOT as a native property.
  // When both textDecoration and native fontWeight are present, VS Code's renderer breaks the CSS hack.
  const cssParts = [`none; font-size: ${effectiveFontSize}; line-height: ${effectiveLineHeight}`];
  if (effectiveWeight) cssParts.push(`font-weight: ${effectiveWeight}`);
  if (effectiveFont) cssParts.push(`font-family: ${effectiveFont}`);
  return window.createTextEditorDecorationType({
    textDecoration: cssParts.join('; ') + ';',
  });
}

/**
 * Creates a decoration type for link styling.
 *
 * Sets cursor to pointer on hover to indicate clickability.
 *
 * @param {string | ThemeColor | undefined} color - Optional hex or theme color; when undefined uses textLink.foreground
 * @returns {vscode.TextEditorDecorationType} A decoration type for links
 */
export function LinkDecorationType(color?: string | ThemeColor) {
  const resolvedColor = color ?? new ThemeColor('textLink.foreground');
  return window.createTextEditorDecorationType({
    color: resolvedColor,
    textDecoration: 'underline',
    cursor: 'pointer',
    after: {
      contentText: ' 🔗',
      color: resolvedColor,
    },
  });
}

/**
 * Creates a decoration type for image styling.
 *
 * Adds an image icon after the image alt text to visually indicate it's an image.
 * Sets cursor to pointer on hover to indicate clickability (same as links).
 *
 * @param {string | ThemeColor | undefined} color - Optional hex or theme color; when undefined uses textLink.foreground
 * @returns {vscode.TextEditorDecorationType} A decoration type for images
 */
export function ImageDecorationType(color?: string | ThemeColor) {
  const resolvedColor = color ?? new ThemeColor('textLink.foreground');
  return window.createTextEditorDecorationType({
    color: resolvedColor,
    cursor: 'pointer', // Show pointer cursor on hover (same as links)
    textDecoration: 'underline; text-decoration-style: dashed; text-decoration-thickness: 1px;',
    after: {
      contentText: ' ⬔',
      color: resolvedColor,
    },
  });
}

/**
 * Creates a decoration type for GitHub-style @mention styling (link-like).
 *
 * @param color - Optional hex or theme color; when undefined uses textLink.foreground
 */
export function MentionDecorationType(color?: string | ThemeColor) {
  const resolvedColor = color ?? new ThemeColor('textLink.foreground');
  return window.createTextEditorDecorationType({
    color: resolvedColor,
    textDecoration: 'underline',
    cursor: 'pointer',
  });
}

/**
 * Creates a decoration type for GitHub-style #issue reference styling (link-like).
 * Uses the same appearance as MentionDecorationType.
 *
 * @param color - Optional hex or theme color; when undefined uses textLink.foreground
 */
export function IssueReferenceDecorationType(color?: string | ThemeColor) {
  return MentionDecorationType(color);
}

/**
 * Creates a decoration type for blockquote marker styling.
 *
 * Replaces '>' characters with a vertical blue bar.
 * Nested blockquotes automatically show multiple bars (one per '>').
 *
 * @param {string | ThemeColor | undefined} color - Optional hex or theme color; when undefined uses textLink.foreground
 * @returns {vscode.TextEditorDecorationType} A decoration type for blockquote markers
 */
export function BlockquoteDecorationType(color?: string | ThemeColor) {
  const resolvedColor = color ?? new ThemeColor('textLink.foreground');
  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;',
    before: {
      contentText: '│',
      color: resolvedColor,
      fontWeight: 'bold',
    },
  });
}

/**
 * Creates a decoration type for unordered list item styling.
 *
 * Replaces unordered list markers (-, *, +) with a bullet point (•).
 *
 * @param {string | ThemeColor | undefined} color - Optional hex or theme color; when undefined uses editor.foreground
 * @returns {vscode.TextEditorDecorationType} A decoration type for unordered list items
 */
export function ListItemDecorationType(color?: string | ThemeColor) {
  const resolvedColor = color ?? new ThemeColor('editor.foreground');
  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;',
    before: {
      contentText: '• ',
      fontWeight: 'bold',
      color: resolvedColor,
    },
  });
}

/**
 * Creates a decoration type for ordered list item marker styling.
 *
 * @param {string | ThemeColor | undefined} color - Optional hex or theme color; when undefined uses editor.foreground
 * @returns {vscode.TextEditorDecorationType} A decoration type for ordered list item markers
 */
export function OrderedListItemDecorationType(color?: string | ThemeColor) {
  const resolvedColor = color ?? new ThemeColor('editor.foreground');
  return window.createTextEditorDecorationType({
    color: resolvedColor,
  });
}

/**
 * Creates a decoration type for horizontal rules (thematic breaks).
 *
 * Replaces ---, ***, or ___ with a visual horizontal line that spans the full editor width.
 * Uses border-bottom approach to prevent editor width expansion.
 * Hides the original text and shows only the border line.
 * Based on working implementation from examples/horizontal-line-working.
 *
 * @param {string | ThemeColor | undefined} color - Optional hex or theme color for the line; when undefined uses editorWidget.border
 * @returns {vscode.TextEditorDecorationType} A decoration type for horizontal rules
 */
export function HorizontalRuleDecorationType(color?: string | ThemeColor) {
  const resolvedColor = color ?? new ThemeColor('editorWidget.border');
  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;', // Hide the original text (---, ***, ___)
    isWholeLine: true,
    borderWidth: '0 0 1px 0', // Only bottom border, 1px thick
    borderStyle: 'solid',
    borderColor: resolvedColor,
  });
}

/**
 * Creates the before block options for checkbox decorations.
 * Shared between CheckboxUncheckedDecorationType and CheckboxCheckedDecorationType.
 */
function createCheckboxBeforeOptions(resolvedColor: string | ThemeColor) {
  return {
    contentText: ' ',
    color: resolvedColor,
    height: CHECKBOX_BOX_SIZE,
    width: CHECKBOX_BOX_SIZE,
    border: '1px solid',
    borderColor: resolvedColor,
    // Negative margin-right pulls the 'after' element inside the box border.
    textDecoration: `display: inline-block; box-sizing: border-box; vertical-align: middle; margin-right: -${CHECKBOX_BOX_SIZE}; cursor: pointer;`,
  };
}

/**
 * Creates a decoration type for unchecked checkbox styling.
 *
 * Replaces [ ] with an empty checkbox.
 * Click inside the brackets to toggle.
 *
 * @param {string | ThemeColor | undefined} color - Optional hex or theme color; when undefined uses editor.foreground
 * @returns {vscode.TextEditorDecorationType} A decoration type for unchecked checkboxes
 */
export function CheckboxUncheckedDecorationType(color?: string | ThemeColor) {
  const resolvedColor = color ?? new ThemeColor('editor.foreground');

  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;',
    before: createCheckboxBeforeOptions(resolvedColor),
    after: {
      contentText: ' ',
      color: resolvedColor,
      textDecoration: `
        display: inline-block;
        position: relative;
        width: ${CHECKBOX_BOX_SIZE};
        cursor: pointer;
        margin-right: ${CHECKBOX_GAP_SIZE};
        margin-left: ${CHECKBOX_PADDING};
      `
    }
  });
}

/**
 * Creates a decoration type for checked checkbox styling.
 *
 * Replaces [x] or [X] with a checked checkbox.
 * Click inside the brackets to toggle.
 *
 * @param {string | ThemeColor | undefined} color - Optional hex or theme color; when undefined uses editor.foreground
 * @returns {vscode.TextEditorDecorationType} A decoration type for checked checkboxes
 */
export function CheckboxCheckedDecorationType(color?: string | ThemeColor) {
  const resolvedColor = color ?? new ThemeColor('editor.foreground');

  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;',
    before: createCheckboxBeforeOptions(resolvedColor),
    after: {
      contentText: '✔',
      color: resolvedColor,
      textDecoration: `
        display: inline-block;
        position: relative;
        width: ${CHECKBOX_BOX_SIZE};
        cursor: pointer;
        margin-right: ${CHECKBOX_GAP_SIZE};
        margin-left: ${CHECKBOX_PADDING};
      `
    }
  });
}

/**
 * Creates a decoration type for table pipe characters (|).
 *
 * Hides the original pipe and renders a box-drawing vertical line (│) via
 * per-range `renderOptions.before.contentText`.
 *
 * @returns {vscode.TextEditorDecorationType} A decoration type for table pipes
 */
export function TablePipeDecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;',
    before: {
      contentText: '',
      color: new ThemeColor('editorLineNumber.foreground'),
    },
  });
}

/**
 * Creates a decoration type for table separator row pipe characters.
 *
 * Hides the original pipe and renders a vertical line (│), same as data-row pipes,
 * via per-range `renderOptions.before.contentText`.
 *
 * @returns {vscode.TextEditorDecorationType} A decoration type for separator pipes
 */
export function TableSeparatorPipeDecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;',
    before: {
      contentText: '',
      color: new ThemeColor('editorLineNumber.foreground'),
    },
  });
}

/**
 * Creates a decoration type for table separator row dash segments.
 *
 * Hides the original dashes and renders padded ASCII hyphen (`-`) runs via per-range
 * `renderOptions.before.contentText` (matches monospace width; avoids U+2500 misalignment).
 *
 * @returns {vscode.TextEditorDecorationType} A decoration type for separator dashes
 */
export function TableSeparatorDashDecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;',
    before: {
      contentText: '',
      color: new ThemeColor('editorLineNumber.foreground'),
    },
  });
}

/**
 * Creates a decoration type for table cell content.
 *
 * Hides the original cell text (with irregular spacing) and renders
 * uniformly padded content via per-range `renderOptions.before.contentText`.
 *
 * @returns {vscode.TextEditorDecorationType} A decoration type for table cells
 */
export function TableCellDecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;',
    before: {
      contentText: '',
    },
  });
}

/**
 * Creates a decoration type for mermaid hover indicator.
 *
 * Adds a small visual indicator (⧉) at the start of mermaid code blocks
 * to signal that hovering will show a larger diagram preview.
 * The indicator uses a subtle color and cursor pointer to indicate interactivity.
 *
 * @returns {vscode.TextEditorDecorationType} A decoration type for mermaid hover indicator
 */
export function MermaidHoverIndicatorDecorationType() {
  return window.createTextEditorDecorationType({
    before: {
      contentText: '⧉',
      color: new ThemeColor('editor.foreground'),
      fontWeight: 'normal',
    },
    opacity: '0.2', // Apply opacity to the entire decoration
  });
}
