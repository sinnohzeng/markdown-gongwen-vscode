import * as vscode from 'vscode';
import { MarkdownParser } from './parser';

/**
 * Provides clickable links for markdown documents.
 * 
 * This class implements VS Code's DocumentLinkProvider to make markdown links
 * clickable. It parses markdown links and creates DocumentLink objects that
 * VS Code can render as clickable.
 */
export class MarkdownLinkProvider implements vscode.DocumentLinkProvider {
  private parser = new MarkdownParser();

  /**
   * Provides document links for a markdown document.
   * 
   * @param document - The text document
   * @param token - Cancellation token
   * @returns Array of DocumentLink objects
   */
  provideDocumentLinks(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DocumentLink[]> {
    if (document.languageId !== 'markdown') {
      return [];
    }

    const config = vscode.workspace.getConfiguration('markdownInlineEditor');
    const diffViewApplyDecorations = config.get<boolean>('defaultBehaviors.diffView.applyDecorations', false);
    
    // Skip links in diff views when decorations are disabled (raw markdown mode)
    if (!diffViewApplyDecorations) {
      const diffSchemes: readonly string[] = ['git', 'vscode-merge', 'vscode-diff'];
      if (diffSchemes.includes(document.uri.scheme)) {
        return [];
      }
    }

    const text = document.getText();
    const decorations = this.parser.extractDecorations(text);
    const links: vscode.DocumentLink[] = [];

    // Find all link decorations with URLs
    for (const decoration of decorations) {
      if (decoration.type === 'link' && decoration.url) {
        const url = decoration.url;
        
        // Map normalized positions to original document positions (handles CRLF -> LF normalization)
        const mappedStart = this.mapNormalizedToOriginal(decoration.startPos, text);
        const mappedEnd = this.mapNormalizedToOriginal(decoration.endPos, text);
        
        // Create range for the link text (not the URL)
        const startPos = document.positionAt(mappedStart);
        const endPos = document.positionAt(mappedEnd);
        const range = new vscode.Range(startPos, endPos);

        // Create document link
        let target: vscode.Uri | undefined;

        if (url.startsWith('#')) {
          // Internal anchor link - use command to navigate within the same document
          const anchor = url.substring(1);
          target = vscode.Uri.parse(`command:markdown-inline-editor.navigateToAnchor?${encodeURIComponent(JSON.stringify([anchor, document.uri.toString()]))}`);
        } else if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) {
          // External URL
          target = vscode.Uri.parse(url);
        } else if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
          // Relative file path
          target = vscode.Uri.joinPath(document.uri, '..', url);
        } else {
          // Try to resolve as relative path
          target = vscode.Uri.joinPath(document.uri, '..', url);
        }

        if (target) {
          const link = new vscode.DocumentLink(range, target);
          links.push(link);
        }
      }
    }

    return links;
  }

  /**
   * Resolves a document link, potentially updating its target.
   * 
   * @param link - The document link to resolve
   * @param token - Cancellation token
   * @returns The resolved link
   */
  resolveDocumentLink(
    link: vscode.DocumentLink,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DocumentLink> {
    return link;
  }

  /**
   * Maps a position from normalized text (LF only) to original document text.
   * This accounts for CRLF -> LF normalization done by the parser.
   * 
   * @private
   * @param normalizedPos - Position in normalized text
   * @param originalText - Original document text
   * @returns Position in original document text
   */
  private mapNormalizedToOriginal(normalizedPos: number, originalText?: string): number {
    if (!originalText) {
      return normalizedPos;
    }

    // If no CRLF, positions match exactly
    if (!originalText.includes('\r\n')) {
      return normalizedPos;
    }

    // Build a direct character-by-character mapping
    // Walk through original text character by character, tracking normalized index
    // When normalized index reaches target, return the corresponding original position
    // 
    // Key insight: For exclusive end positions, when normalized position points to '\n',
    // we want to map to the '\r' position (not '\n') so that the content range excludes '\r'
    // This ensures [start:end) in normalized maps to [start:end) in original with same content
    let normalizedIndex = 0;

    for (let i = 0; i < originalText.length; i++) {
      // Check for CRLF first
      if (originalText[i] === '\r' && i + 1 < originalText.length && originalText[i + 1] === '\n') {
        // CRLF: '\r' is skipped in normalized, '\n' maps to normalized position
        // If target is at the normalized '\n' position, return '\r' position (i)
        // This ensures exclusive end positions work correctly
        if (normalizedIndex === normalizedPos) {
          // Target points to '\n' in normalized, map to '\r' in original
          return i;
        }
        // Advance normalized index by 1 (for the single '\n' in normalized)
        normalizedIndex++;
        i++; // Skip the '\n' in original
        // Continue to next iteration - don't check here, let the loop handle it
      } else {
        // Regular character: check if this is our target before incrementing
        if (normalizedIndex === normalizedPos) {
          return i;
        }
        normalizedIndex++;
      }
    }

    // If we didn't find it (shouldn't happen), return the last position
    return originalText.length;
  }
}

