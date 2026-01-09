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
        
        // Create range for the link text (not the URL)
        const startPos = document.positionAt(decoration.startPos);
        const endPos = document.positionAt(decoration.endPos);
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
}

