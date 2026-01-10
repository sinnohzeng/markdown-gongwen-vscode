import { window, ThemeColor } from 'vscode';

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
 * Creates a decoration type for bold text styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for bold text
 */
export function BoldDecorationType() {
  return window.createTextEditorDecorationType({
    fontWeight: 'bold',
  });
}

/**
 * Creates a decoration type for italic text styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for italic text
 */
export function ItalicDecorationType() {
  return window.createTextEditorDecorationType({
    fontStyle: 'italic',
  });
}

/**
 * Creates a decoration type for bold+italic text styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for bold+italic text
 */
export function BoldItalicDecorationType() {
  return window.createTextEditorDecorationType({
    fontWeight: 'bold',
    fontStyle: 'italic',
  });
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
 * @returns {vscode.TextEditorDecorationType} A decoration type for inline code
 */
export function CodeDecorationType() {
  // Note: backgroundColor doesn't work for inline decorations (only for isWholeLine: true)
  // So we just use the theme's default styling
  return window.createTextEditorDecorationType({
    // No custom styling - will use editor's default inline code appearance
  });
}

/**
 * Creates a decoration type for code block styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for code blocks
 */
export function CodeBlockDecorationType() {
  return window.createTextEditorDecorationType({
    backgroundColor: new ThemeColor('textCodeBlock.background'), // Use theme color instead of red
    isWholeLine: true, // Extend background to full line width
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
 * Heading decoration configuration
 */
const HEADING_CONFIG = [
  { size: '200%', bold: true },  // H1
  { size: '150%', bold: true },  // H2
  { size: '110%', bold: true },  // H3
  { size: '100%', bold: false }, // H4
  { size: '90%', bold: false },  // H5
  { size: '80%', bold: false },  // H6
];

/**
 * Creates a heading decoration type with the specified level.
 * 
 * @param {number} level - Heading level (1-6)
 * @returns {vscode.TextEditorDecorationType} A decoration type for the heading level
 */
function createHeadingDecoration(level: number) {
  const config = HEADING_CONFIG[level - 1];
  if (!config) throw new Error(`Invalid heading level: ${level}`);
  
  return window.createTextEditorDecorationType({
    textDecoration: `none; font-size: ${config.size};`,
    ...(config.bold ? { fontWeight: 'bold' } : {}),
  });
}

export const Heading1DecorationType = () => createHeadingDecoration(1);
export const Heading2DecorationType = () => createHeadingDecoration(2);
export const Heading3DecorationType = () => createHeadingDecoration(3);
export const Heading4DecorationType = () => createHeadingDecoration(4);
export const Heading5DecorationType = () => createHeadingDecoration(5);
export const Heading6DecorationType = () => createHeadingDecoration(6);

/**
 * Creates a decoration type for link styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for links
 */
export function LinkDecorationType() {
  return window.createTextEditorDecorationType({
    color: new ThemeColor('textLink.foreground'),
    textDecoration: 'underline',
  });
}

/**
 * Creates a decoration type for image styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for images
 */
export function ImageDecorationType() {
  return window.createTextEditorDecorationType({
    color: new ThemeColor('textLink.foreground'),
  });
}

/**
 * Creates a decoration type for blockquote marker styling.
 * 
 * Replaces '>' characters with a vertical blue bar.
 * Nested blockquotes automatically show multiple bars (one per '>').
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for blockquote markers
 */
export function BlockquoteDecorationType() {
  // Hide the '>' character and replace it with a vertical bar
  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;', // Properly hide the original '>' character
    before: {
      contentText: '│',
      color: new ThemeColor('textLink.foreground'),
      fontWeight: 'bold',
    },
  });
}

/**
 * Creates a decoration type for unordered list item styling.
 * 
 * Replaces unordered list markers (-, *, +) with a bullet point (•).
 * Note: This decoration is NOT applied to ordered lists (1., 2., etc.) which keep their numbers visible.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for unordered list items
 */
export function ListItemDecorationType() {
  // Hide the list marker and replace it with a bullet point
  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;', // Properly hide the original marker
    before: {
      contentText: '• ',
      fontWeight: 'bold',
      color: new ThemeColor('editor.foreground'),
    },
  });
}

/**
 * Creates a decoration type for ordered list item marker styling.
 * 
 * Ensures ordered list markers (1., 2., etc.) use the same color as regular text.
 * This overrides any theme-specific styling that might apply different colors to list markers.
 * 
 * Note: We intentionally do NOT apply bold styling to ordered list numbers.
 * If we use bold on ordered numbers, the fonts look out of line with the rest of the text,
 * causing visual alignment issues. Unordered list bullets and checkboxes can be bold
 * because they are replaced symbols (•, ☐, ☑) rather than the original text.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for ordered list item markers
 */
export function OrderedListItemDecorationType() {
  // Apply color directly to the marker text without hiding/replacing it
  // Note: No fontWeight: 'bold' - see function JSDoc for explanation
  return window.createTextEditorDecorationType({
    color: new ThemeColor('editor.foreground')
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
 * @returns {vscode.TextEditorDecorationType} A decoration type for horizontal rules
 */
export function HorizontalRuleDecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;', // Hide the original text (---, ***, ___)
    isWholeLine: true,
    borderWidth: '0 0 1px 0', // Only bottom border, 1px thick
    borderStyle: 'solid',
    borderColor: new ThemeColor('editorWidget.border'),
  });
}

/**
 * Creates a decoration type for unchecked checkbox styling.
 *
 * Replaces [ ] with an empty checkbox symbol (☐).
 * Click inside the brackets to toggle.
 *
 * @returns {vscode.TextEditorDecorationType} A decoration type for unchecked checkboxes
 */
export function CheckboxUncheckedDecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;', // Hide the original [ ]
    before: {
      contentText: '☐',
      fontWeight: 'bold',
      color: new ThemeColor('editor.foreground'),
    },
  });
}

/**
 * Creates a decoration type for checked checkbox styling.
 *
 * Replaces [x] or [X] with a checked checkbox symbol (☑).
 * Click inside the brackets to toggle.
 *
 * @returns {vscode.TextEditorDecorationType} A decoration type for checked checkboxes
 */
export function CheckboxCheckedDecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;', // Hide the original [x]
    before: {
      contentText: '☑',
      fontWeight: 'bold',
      color: new ThemeColor('editor.foreground'),
    },
  });
}
