import * as vscode from 'vscode';
import { Decorator } from './decorator';
import { config } from './config';
import { MarkdownParser } from './parser';
import { MarkdownParseCache } from './markdown-parse-cache';
import { initMermaidRenderer, disposeMermaidRenderer } from './mermaid/mermaid-renderer';
import { processSvg } from './mermaid/svg-processor';
import { createNavigateToAnchorCommand } from './commands/navigate-to-anchor';
import { createToggleDecorationsCommand } from './commands/toggle-decorations';
import { registerProviders } from './registration/register-providers';
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

  const { disposables: providerDisposables, linkClickHandler } = registerProviders(parseCache);
  linkClickHandler.setEnabled(config.links.singleClickOpen());

  context.subscriptions.push(
    ...providerDisposables,
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
