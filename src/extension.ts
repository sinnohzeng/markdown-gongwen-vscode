import * as vscode from 'vscode';
import { Decorator } from './decorator';
import { MarkdownLinkProvider } from './link-provider';
import { MarkdownImageHoverProvider } from './image-hover-provider';
import { MarkdownLinkHoverProvider } from './link-hover-provider';
import { CodeBlockHoverProvider } from './code-block-hover-provider';
import { LinkClickHandler } from './link-click-handler';
import { config } from './config';
import { MarkdownParser } from './parser';
import { MarkdownParseCache } from './markdown-parse-cache';
import { initMermaidRenderer, disposeMermaidRenderer } from './mermaid/mermaid-renderer';
import { processSvg } from './mermaid/svg-processor';
import { createNavigateToAnchorCommand } from './commands/navigate-to-anchor';
import { createToggleDecorationsCommand } from './commands/toggle-decorations';
import { registerDocumentProviders } from './registration/register-document-providers';
import { registerEventHandlers } from './registration/register-event-handlers';
import { disposeLogger } from './logging';
import { createExportDocxCommand, createExportDocxQuickCommand } from './export/export-command';

/** Public API exposed for integration tests without monkey-patching source modules. */
export type ExtensionApi = {
  parseCache: MarkdownParseCache;
  decorator: Decorator;
  svgProcessor: {
    processSvg: (svgString: string, height: number, maxWidth?: number) => string;
  };
};

/** Activates the Markdown 公文 extension and wires independent feature modules. */
export function activate(context: vscode.ExtensionContext): ExtensionApi {
  initMermaidRenderer(context);

  const parser = new MarkdownParser();
  const parseCache = new MarkdownParseCache(parser);
  const decorator = new Decorator(parseCache, context.workspaceState);
  const diffViewApplyDecorations = config.diffView.applyDecorations();
  decorator.updateDiffViewDecorationSetting(!diffViewApplyDecorations);
  decorator.setActiveEditor(vscode.window.activeTextEditor);

  const linkProvider = new MarkdownLinkProvider(parseCache);
  const imageHoverProvider = new MarkdownImageHoverProvider(parseCache);
  const linkHoverProvider = new MarkdownLinkHoverProvider(parseCache);
  const codeBlockHoverProvider = new CodeBlockHoverProvider(parseCache);
  const linkClickHandler = new LinkClickHandler(parseCache);
  linkClickHandler.setEnabled(config.links.singleClickOpen());

  context.subscriptions.push(
    ...registerDocumentProviders({
      linkProvider,
      imageHoverProvider,
      linkHoverProvider,
      codeBlockHoverProvider,
    }),
    ...registerEventHandlers(decorator, linkClickHandler),
    createToggleDecorationsCommand(decorator),
    createNavigateToAnchorCommand(),
    vscode.commands.registerCommand('gongwen.exportDocx', createExportDocxCommand(context)),
    vscode.commands.registerCommand('gongwen.exportDocxQuick', createExportDocxQuickCommand(context)),
    { dispose: () => decorator.dispose() },
    { dispose: () => linkClickHandler.dispose() },
    { dispose: () => disposeLogger() },
  );

  return { parseCache, decorator, svgProcessor: { processSvg } };
}

/** Releases resources that are not owned by the extension subscription list. */
export function deactivate(): void {
  disposeMermaidRenderer();
}
