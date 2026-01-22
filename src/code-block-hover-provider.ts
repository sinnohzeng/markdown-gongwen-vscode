import * as vscode from 'vscode';
import { mapNormalizedToOriginal } from './position-mapping';
import { shouldSkipInDiffView } from './diff-context';
import { MarkdownParseCache } from './markdown-parse-cache';
import { renderMermaidSvg, svgToDataUri } from './mermaid/mermaid-renderer';
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
      
      // Render without size constraints first to get natural dimensions
      // Use a generous height to let Mermaid render at its natural size
      const numLines = 1 + (source.match(/\n/g) || []).length;
      const svg = await renderMermaidSvg(source, {
        theme,
        fontFamily,
        numLines,
      });

      // Parse SVG to get actual dimensions
      const $ = cheerio.load(svg, { xmlMode: true });
      const svgNode = $('svg').first();
      
      if (svgNode.length === 0) {
        return undefined;
      }

      // Get SVG dimensions
      // Try to get width/height from attributes, or viewBox, or use defaults
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

      // If still no dimensions, use a reasonable default based on content
      if (svgWidth === 0 || svgHeight === 0) {
        svgWidth = 800;
        svgHeight = 600;
      }

      // Scale up for hover preview (make it larger but not too large)
      const scale = config.scaleFactor;
      let hoverWidth = svgWidth * scale;
      let hoverHeight = svgHeight * scale;

      // Respect max dimensions
      if (hoverWidth > config.maxWidth) {
        const aspectRatio = hoverHeight / hoverWidth;
        hoverWidth = config.maxWidth;
        hoverHeight = hoverWidth * aspectRatio;
      }
      if (hoverHeight > config.maxHeight) {
        const aspectRatio = hoverWidth / hoverHeight;
        hoverHeight = config.maxHeight;
        hoverWidth = hoverHeight * aspectRatio;
      }

      // Ensure minimum size for readability
      const minSize = 400;
      if (hoverWidth < minSize) {
        const aspectRatio = hoverHeight / hoverWidth;
        hoverWidth = minSize;
        hoverHeight = hoverWidth * aspectRatio;
      }
      if (hoverHeight < minSize) {
        const aspectRatio = hoverWidth / hoverHeight;
        hoverHeight = minSize;
        hoverWidth = hoverHeight * aspectRatio;
      }

      return {
        dataUri: svgToDataUri(svg),
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

      // Check if hover position is within this code block
      if (hoverOffset >= start && hoverOffset < end) {
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

      const hoverRange = new vscode.Range(
        document.positionAt(start),
        document.positionAt(end)
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
