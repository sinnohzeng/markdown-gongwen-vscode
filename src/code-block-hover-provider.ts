import * as vscode from 'vscode';
import { mapNormalizedToOriginal } from './position-mapping';
import { shouldSkipInDiffView } from './diff-context';
import { MarkdownParseCache } from './markdown-parse-cache';
import { renderMermaidSvg, renderMermaidSvgNatural, svgToDataUri } from './mermaid/mermaid-renderer';
import * as cheerio from 'cheerio';

/**
 * Configuration for code block hover previews
 */
interface CodeBlockHoverConfig {
  /** Maximum width for hover preview in pixels */
  maxWidth: number;
  /** Maximum height for hover preview in pixels */
  maxHeight: number;
  /** Scale factor for hover preview (e.g., 2.0 = 2x larger than inline) */
  scaleFactor: number;
}

/**
 * Default configuration for code block hover previews
 */
const DEFAULT_HOVER_CONFIG: CodeBlockHoverConfig = {
  maxWidth: 1200,
  maxHeight: 900,
  scaleFactor: 2.5,
};

/**
 * Result of a code block hover handler
 */
interface CodeBlockHoverResult {
  dataUri: string;
  width: number;
  height: number;
}

/**
 * Handler function type for rendering code block content for hover preview
 * @param source - The source code from the code block
 * @param language - The language identifier (e.g., 'mermaid', 'latex')
 * @param config - Hover configuration
 * @returns Promise resolving to hover result with data URI and dimensions, or undefined if not supported
 */
type CodeBlockHoverHandler = (
  source: string,
  language: string,
  config: CodeBlockHoverConfig
) => Promise<CodeBlockHoverResult | undefined>;

/**
 * Generic hover provider for code blocks with special rendering (Mermaid, LaTeX, etc.)
 * 
 * Shows a larger preview when hovering over code blocks that support special rendering.
 */
export class CodeBlockHoverProvider implements vscode.HoverProvider {
  private handlers = new Map<string, CodeBlockHoverHandler>();

  constructor(
    private parseCache: MarkdownParseCache,
    private hoverConfig: CodeBlockHoverConfig = DEFAULT_HOVER_CONFIG
  ) {
    // Register Mermaid handler
    this.registerHandler('mermaid', this.handleMermaidHover.bind(this));
  }

  /**
   * Register a hover handler for a specific language
   * @param language - Language identifier (e.g., 'mermaid', 'latex')
   * @param handler - Handler function that renders the preview
   */
  registerHandler(language: string, handler: CodeBlockHoverHandler): void {
    this.handlers.set(language.toLowerCase(), handler);
  }

  /**
   * Handle Mermaid diagram hover - renders a larger version of the diagram
   * Sizes the hover based on the actual diagram dimensions
   */
  private async handleMermaidHover(
    source: string,
    language: string,
    config: CodeBlockHoverConfig
  ): Promise<{ dataUri: string; width: number; height: number } | undefined> {
    try {
      const theme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark ||
        vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.HighContrast
        ? 'dark'
        : 'default';

      const fontFamily = vscode.workspace.getConfiguration('editor').get<string>('fontFamily');
      
      // Render at natural size first to get actual diagram dimensions
      const naturalSvg = await renderMermaidSvgNatural(source, {
        theme,
        fontFamily,
      });

      // Parse natural SVG to get actual dimensions
      const $ = cheerio.load(naturalSvg, { xmlMode: true });
      const svgNode = $('svg').first();
      
      if (svgNode.length === 0) {
        return undefined;
      }

      // Get SVG dimensions from natural render
      // Try to get width/height from attributes, or viewBox
      let svgWidth = parseFloat(svgNode.attr('width') || '0');
      let svgHeight = parseFloat(svgNode.attr('height') || '0');
      
      // If no explicit width/height, try viewBox
      if ((svgWidth === 0 || svgHeight === 0) && svgNode.attr('viewBox')) {
        const viewBox = svgNode.attr('viewBox')!.split(/\s+/);
        if (viewBox.length >= 4) {
          svgWidth = parseFloat(viewBox[2]) || svgWidth;
          svgHeight = parseFloat(viewBox[3]) || svgHeight;
        }
      }

      // If still no dimensions, use a reasonable default
      if (svgWidth === 0 || svgHeight === 0) {
        svgWidth = 800;
        svgHeight = 600;
      }

      // Use natural dimensions for hover - adapt dialog size to content
      // For large diagrams, show them large; for small diagrams, show them appropriately sized
      let hoverWidth = svgWidth;
      let hoverHeight = svgHeight;

      // Apply a minimum scale to ensure readability for small diagrams
      const minScale = 1.5;
      if (hoverWidth < 400 || hoverHeight < 300) {
        hoverWidth = Math.max(hoverWidth * minScale, 400);
        hoverHeight = Math.max(hoverHeight * minScale, 300);
        // Maintain aspect ratio
        const aspectRatio = svgHeight / svgWidth;
        if (hoverWidth * aspectRatio > hoverHeight) {
          hoverHeight = hoverWidth * aspectRatio;
        } else {
          hoverWidth = hoverHeight / aspectRatio;
        }
      }

      // Respect max dimensions (but allow larger dialogs for large diagrams)
      // Increase max dimensions to accommodate large diagrams
      const maxWidth = Math.max(config.maxWidth, 2000);
      const maxHeight = Math.max(config.maxHeight, 1500);
      
      if (hoverWidth > maxWidth) {
        const aspectRatio = hoverHeight / hoverWidth;
        hoverWidth = maxWidth;
        hoverHeight = hoverWidth * aspectRatio;
      }
      if (hoverHeight > maxHeight) {
        const aspectRatio = hoverWidth / hoverHeight;
        hoverHeight = maxHeight;
        hoverWidth = hoverHeight * aspectRatio;
      }

      // Use the natural SVG for display (it's already at the right size)
      return {
        dataUri: svgToDataUri(naturalSvg),
        width: Math.round(hoverWidth),
        height: Math.round(hoverHeight),
      };
    } catch (error) {
      console.warn('[Code Block Hover] Mermaid render failed:', error instanceof Error ? error.message : error);
      return undefined;
    }
  }

  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    if (document.languageId !== 'markdown') {
      return;
    }

    if (shouldSkipInDiffView(document)) {
      return;
    }

    if (token.isCancellationRequested) {
      return;
    }

    const parseEntry = this.parseCache.get(document);
    const text = parseEntry.text;
    if (token.isCancellationRequested) {
      return;
    }

    const hoverOffset = document.offsetAt(position);

    // Check Mermaid blocks from parser
    for (const block of parseEntry.mermaidBlocks) {
      if (token.isCancellationRequested) {
        return;
      }

      const start = mapNormalizedToOriginal(block.startPos, text);
      const end = mapNormalizedToOriginal(block.endPos, text);

      // Find the content start (after opening fence line) where the indicator is placed
      const originalText = document.getText();
      const openingFenceLineEnd = originalText.indexOf('\n', start);
      const contentStart = openingFenceLineEnd !== -1 ? openingFenceLineEnd + 1 : start;
      const indicatorEnd = contentStart + 1; // Indicator is 1 character wide

      // Check if hover position is within the code block OR within the indicator area
      // This allows hovering over the indicator or anywhere in the block
      if ((hoverOffset >= contentStart && hoverOffset < indicatorEnd) || 
          (hoverOffset >= start && hoverOffset < end)) {
        return this.createHoverForCodeBlock(
          block.source,
          'mermaid',
          document,
          start,
          end,
          token
        );
      }
    }

    // Check other code blocks by parsing the AST
    // We need to find code blocks with language identifiers
    // This is a fallback for languages not yet in mermaidBlocks
    return this.findCodeBlockInDecorations(
      parseEntry.decorations,
      text,
      hoverOffset,
      document,
      token
    );
  }

  /**
   * Find code block from decorations (for languages not in mermaidBlocks)
   * Checks if hover is anywhere within a code block (language identifier or content)
   */
  private findCodeBlockInDecorations(
    decorations: Array<{ startPos: number; endPos: number; type: string }>,
    text: string,
    hoverOffset: number,
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    // First, find all code blocks with language identifiers
    const languageDecs = decorations.filter(d => d.type === 'codeBlockLanguage');
    const codeBlockDecs = decorations.filter(d => d.type === 'codeBlock');
    
    // Check each code block to see if hover is within it
    for (const codeBlockDec of codeBlockDecs) {
      if (token.isCancellationRequested) {
        return;
      }

      const codeStart = mapNormalizedToOriginal(codeBlockDec.startPos, text);
      const codeEnd = mapNormalizedToOriginal(codeBlockDec.endPos, text);

      // Check if hover is within this code block
      if (hoverOffset >= codeStart && hoverOffset < codeEnd) {
        // Find the language identifier for this code block
        const langDec = languageDecs.find(l => 
          l.startPos >= codeBlockDec.startPos &&
          l.endPos <= codeBlockDec.endPos
        );

        if (langDec) {
          // Extract language from text
          const language = text.substring(langDec.startPos, langDec.endPos).trim().toLowerCase();
          
          // Check if we have a handler for this language
          if (this.handlers.has(language)) {
            // Extract source code from the code block
            const codeBlockText = document.getText(new vscode.Range(
              document.positionAt(codeStart),
              document.positionAt(codeEnd)
            ));

            // Extract source by removing fence lines
            const lines = codeBlockText.split('\n');
            if (lines.length >= 3) {
              // Remove first line (opening fence with language) and last line (closing fence)
              const source = lines.slice(1, -1).join('\n');
              
              return this.createHoverForCodeBlock(
                source,
                language,
                document,
                codeStart,
                codeEnd,
                token
              );
            }
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Create a hover for a code block with special rendering
   */
  private async createHoverForCodeBlock(
    source: string,
    language: string,
    document: vscode.TextDocument,
    start: number,
    end: number,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover | undefined> {
    const handler = this.handlers.get(language.toLowerCase());
    if (!handler) {
      return undefined;
    }

    try {
      const result = await handler(source, language, this.hoverConfig);
      if (!result || token.isCancellationRequested) {
        return undefined;
      }

      // Create hover with explicit large size (override any SVG max-width constraints)
      const escapedUri = escapeHtmlAttribute(result.dataUri);
      const markdown = new vscode.MarkdownString(
        `<img src="${escapedUri}" width="${result.width}" height="${result.height}" style="width: ${result.width}px; height: ${result.height}px; max-width: ${result.width}px; max-height: ${result.height}px;" />`
      );
      markdown.appendMarkdown(`\n\n*${language} diagram preview*`);
      markdown.supportHtml = true;
      markdown.isTrusted = true; // Data URIs are safe

      // Expand hover range to full line(s) for better UX
      // This makes it easier to trigger hover and includes the indicator area
      const startPos = document.positionAt(start);
      const endPos = document.positionAt(end);
      const hoverRange = new vscode.Range(
        new vscode.Position(startPos.line, 0),
        new vscode.Position(endPos.line, Number.MAX_SAFE_INTEGER)
      );

      return new vscode.Hover(markdown, hoverRange);
    } catch (error) {
      console.warn(`[Code Block Hover] Failed to create hover for ${language}:`, error);
      return undefined;
    }
  }
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
