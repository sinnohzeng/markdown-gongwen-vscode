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
    ...(config.bold ? { fontWeight: 'bold' } : { color: new ThemeColor('descriptionForeground') }),
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
 * Creates a decoration type for list item styling.
 * 
 * Replaces list markers (-, *, +) with a bullet point (•).
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for list items
 */
export function ListItemDecorationType() {
  // Hide the list marker and replace it with a bullet point
  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;', // Properly hide the original marker
    before: {
      contentText: '• ',
      // No color specified - uses regular text color
    },
  });
}

/**
 * Creates a decoration type for horizontal rules (thematic breaks).
 * 
 * Replaces ---, ***, or ___ with a visual horizontal line that spans the full editor width.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for horizontal rules
 */
export function HorizontalRuleDecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;', // Hide the original text
    after: {
      contentText: '─'.repeat(200), // Very long horizontal line
      color: new ThemeColor('editorWidget.border'),
    },
    isWholeLine: true,
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
    },
  });
}
