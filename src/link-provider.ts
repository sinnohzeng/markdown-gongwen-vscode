import * as vscode from 'vscode';
import { MarkdownParseCache } from './markdown-parse-cache';
import { mapNormalizedToOriginal } from './position-mapping';
import { shouldSkipInDiffView } from './diff-context';
import { resolveImageTarget, resolveLinkTarget, toCommandUri } from './link-targets';

/**
 * Provides clickable links and images for markdown documents.
 * 
 * This class implements VS Code's DocumentLinkProvider to make markdown links
 * and images clickable. It parses markdown links/images and creates DocumentLink
 * objects that VS Code can render as clickable.
 * 
 * - Links: Click to navigate to URL or anchor
 * - Images: Click to open image file in VS Code's image viewer
 */
export class MarkdownLinkProvider implements vscode.DocumentLinkProvider {
  constructor(private parseCache: MarkdownParseCache) {}

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

    // Skip links in diff views when decorations are disabled (raw markdown mode)
    if (shouldSkipInDiffView(document)) {
      return [];
    }

    const parseEntry = this.parseCache.get(document);
    const text = parseEntry.text;
    const decorations = parseEntry.decorations;
    const links: vscode.DocumentLink[] = [];

    // Find all link decorations with URLs
    for (const decoration of decorations) {
      if ((decoration.type === 'link' || decoration.type === 'image') && decoration.url) {
        const url = decoration.url;
        
        // Map normalized positions to original document positions (handles CRLF -> LF normalization)
        const mappedStart = mapNormalizedToOriginal(decoration.startPos, text);
        const mappedEnd = mapNormalizedToOriginal(decoration.endPos, text);
        
        // Create range for the link/image text (not the URL)
        const startPos = document.positionAt(mappedStart);
        const endPos = document.positionAt(mappedEnd);
        const range = new vscode.Range(startPos, endPos);

        // Create document link
        let target: vscode.Uri | undefined;

        if (decoration.type === 'image') {
          target = resolveImageTarget(url, document.uri);
        } else {
          const resolved = resolveLinkTarget(url, document.uri);
          if (resolved?.kind === 'command') {
            target = toCommandUri(resolved.command, resolved.args);
          } else {
            target = resolved?.uri;
          }
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

