import * as vscode from 'vscode';
import { mapNormalizedToOriginal } from './position-mapping';
import { shouldSkipInDiffView } from './diff-context';
import { config } from './config';
import { MarkdownParseCache } from './markdown-parse-cache';

/**
 * Provides a hover that shows the target URL for markdown links.
 */
export class MarkdownLinkHoverProvider implements vscode.HoverProvider {
  constructor(private parseCache: MarkdownParseCache) {}

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
    const decorations = parseEntry.decorations;
    const hoverOffset = document.offsetAt(position);
    const singleClickEnabled = config.links.singleClickOpen();

    for (const decoration of decorations) {
      if (token.isCancellationRequested) {
        return;
      }

      if (decoration.type !== 'link' || !decoration.url) {
        continue;
      }

      const start = mapNormalizedToOriginal(decoration.startPos, text);
      const end = mapNormalizedToOriginal(decoration.endPos, text);

      if (hoverOffset < start || hoverOffset >= end) {
        continue;
      }

      const markdown = new vscode.MarkdownString();
      markdown.appendText(`Link URL: ${decoration.url}`);
      if (!singleClickEnabled) {
        markdown.appendMarkdown('\n\n*Direct click disabled (enable in settings).*');
      }
      const hoverRange = new vscode.Range(document.positionAt(start), document.positionAt(end));
      return new vscode.Hover(markdown, hoverRange);
    }

    return;
  }
}
