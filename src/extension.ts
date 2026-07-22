import * as vscode from 'vscode';
import { Decorator } from './decorator';
import { MarkdownLinkProvider } from './link-provider';
import { MarkdownImageHoverProvider } from './image-hover-provider';
import { MarkdownLinkHoverProvider } from './link-hover-provider';
import { CodeBlockHoverProvider } from './code-block-hover-provider';
import { LinkClickHandler } from './link-click-handler';
import { normalizeAnchorText } from './position-mapping';
import { config } from './config';
import { MarkdownParser } from './parser';
import { MarkdownParseCache } from './markdown-parse-cache';
import { initMermaidRenderer, disposeMermaidRenderer } from './mermaid/mermaid-renderer';
import { processSvg } from './mermaid/svg-processor';
import { createExportDocxCommand, createExportDocxQuickCommand } from './export/export-command';

/**
 * Public API exposed via `vscode.extensions.getExtension(id).exports`.
 *
 * Intended for integration / E2E tests — allows test code to inspect the
 * parse cache and decorator without monkey-patching or modifying the source.
 */
export type ExtensionApi = {
  /** The live parse cache; call `.get(document)` to read decoration ranges. */
  parseCache: MarkdownParseCache;
  /** The live decorator instance; exposes isEnabled(), activeEditor, etc. */
  decorator: Decorator;
  /** SVG processing utilities exposed for integration tests. */
  svgProcessor: {
    processSvg: (svgString: string, height: number, maxWidth?: number) => string;
  };
};

/**
 * Activates the markdown inline preview extension.
 *
 * This function is called by VS Code when the extension is activated (typically
 * when a markdown file is opened). It sets up event listeners for:
 * - Active editor changes
 * - Text selection changes
 * - Document content changes
 *
 * All event subscriptions are registered with the extension context for proper
 * cleanup when the extension is deactivated.
 *
 * @param {vscode.ExtensionContext} context - The extension context provided by VS Code
 *
 * @example
 * // Called automatically by VS Code when extension is activated
 * activate(context);
 */
export function activate(context: vscode.ExtensionContext): ExtensionApi {
  // Initialize mermaid renderer with extension context
  initMermaidRenderer(context);

  const parser = new MarkdownParser();
  const parseCache = new MarkdownParseCache(parser);
  const decorator = new Decorator(parseCache, context.workspaceState);
  const diffViewApplyDecorations = config.diffView.applyDecorations();
  decorator.updateDiffViewDecorationSetting(!diffViewApplyDecorations);
  
  decorator.setActiveEditor(vscode.window.activeTextEditor);

  // Register link provider for clickable markdown links
  const linkProvider = new MarkdownLinkProvider(parseCache);
  const linkProviderDisposable = vscode.languages.registerDocumentLinkProvider(
    { language: 'markdown', scheme: 'file' },
    linkProvider
  );

  // Register hover provider for image previews on hover
  const imageHoverProvider = new MarkdownImageHoverProvider(parseCache);
  const imageHoverProviderDisposable = vscode.languages.registerHoverProvider(
    { language: 'markdown', scheme: 'file' },
    imageHoverProvider
  );

  // Register hover provider for link URL previews
  const linkHoverProvider = new MarkdownLinkHoverProvider(parseCache);
  const linkHoverProviderDisposable = vscode.languages.registerHoverProvider(
    { language: 'markdown', scheme: 'file' },
    linkHoverProvider
  );

  // Register hover provider for code block previews (Mermaid, LaTeX, etc.)
  const codeBlockHoverProvider = new CodeBlockHoverProvider(parseCache);
  const codeBlockHoverProviderDisposable = vscode.languages.registerHoverProvider(
    { language: 'markdown', scheme: 'file' },
    codeBlockHoverProvider
  );

  // Setup single-click link handler (configurable)
  const linkClickHandler = new LinkClickHandler(parseCache);
  const singleClickEnabled = config.links.singleClickOpen();
  linkClickHandler.setEnabled(singleClickEnabled);

  // Register command for toggling markdown decorations
  const toggleDecorationsCommand = vscode.commands.registerCommand(
    'gongwen.toggleDecorations',
    () => {
      const enabled = decorator.toggleDecorations();
      const fileName = decorator.activeEditor
        ? vscode.workspace.asRelativePath(decorator.activeEditor.document.uri)
        : '当前文件';
      vscode.window.showInformationMessage(
        `已${enabled ? '开启' : '关闭'} Markdown 渲染：${fileName}`
      );
    }
  );

  // Register command for navigating to anchor links
  const navigateToAnchorCommand = vscode.commands.registerCommand(
    'gongwen.navigateToAnchor',
    async (anchor: string, documentUri: string) => {
      const uri = vscode.Uri.parse(documentUri);
      const document = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(document);
      
      // Find the heading with this anchor
      const text = document.getText();
      const lines = text.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Check if this line is a heading that matches the anchor
        const headingMatch = line.match(/^#+\s+(.+)$/);
        if (headingMatch) {
          const headingText = normalizeAnchorText(headingMatch[1]);
          
          if (headingText === anchor) {
            // Navigate to this line
            const position = new vscode.Position(i, 0);
            editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
            editor.selection = new vscode.Selection(position, position);
            return;
          }
        }
      }
      
      // If not found, show a message
      vscode.window.showInformationMessage(`未找到锚点 "${anchor}"`);
    }
  );

  // Register commands for DOCX export
  const exportDocxCommand = vscode.commands.registerCommand(
    'gongwen.exportDocx',
    createExportDocxCommand(context),
  );
  const exportDocxQuickCommand = vscode.commands.registerCommand(
    'gongwen.exportDocxQuick',
    createExportDocxQuickCommand(context),
  );

  const changeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor((editor) => {
    decorator.setActiveEditor(editor);
  });
  
  const changeTextEditorSelection = vscode.window.onDidChangeTextEditorSelection((event) => {
    decorator.updateDecorationsForSelection(event.kind);
  });

  const changeDocument = vscode.workspace.onDidChangeTextDocument((event) => {
    if (event.document === vscode.window.activeTextEditor?.document) {
      decorator.updateDecorationsFromChange(event);
    }
  });

  const renameFiles = vscode.workspace.onDidRenameFiles((event) => {
    for (const { oldUri, newUri } of event.files) {
      decorator.renameFile(oldUri.toString(), newUri.toString());
    }
  });

  const changeConfiguration = vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('markdownGongwen.defaultBehaviors.diffView.applyDecorations')) {
      const diffViewApplyDecorations = config.diffView.applyDecorations();
      decorator.updateDiffViewDecorationSetting(!diffViewApplyDecorations);
      decorator.updateDecorationsForSelection();
    }
    
    if (event.affectsConfiguration('markdownGongwen.decorations.ghostFaintOpacity')) {
      decorator.recreateGhostFaintDecorationType();
    }
    
    if (event.affectsConfiguration('markdownGongwen.decorations.frontmatterDelimiterOpacity')) {
      decorator.recreateFrontmatterDelimiterDecorationType();
    }
    
    if (event.affectsConfiguration('markdownGongwen.decorations.codeBlockLanguageOpacity')) {
      decorator.recreateCodeBlockLanguageDecorationType();
    }

    if (event.affectsConfiguration('markdownGongwen.links.singleClickOpen')) {
      const singleClickEnabled = config.links.singleClickOpen();
      linkClickHandler.setEnabled(singleClickEnabled);
    }

    if (event.affectsConfiguration('markdownGongwen.links.showEmoji')) {
      decorator.recreateLinkDecorationType();
    }

    if (event.affectsConfiguration('markdownGongwen.colors') || event.affectsConfiguration('markdownGongwen.fonts')) {
      decorator.recreateColorDependentTypes();
    }

    // 内容渲染类设置（解析/装饰时读取，缓存在解析结果里），改动后需清缓存重解析才即时生效
    if (
      event.affectsConfiguration('markdownGongwen.orderedLists') ||
      event.affectsConfiguration('markdownGongwen.emojis.enabled') ||
      event.affectsConfiguration('markdownGongwen.math.enabled') ||
      event.affectsConfiguration('markdownGongwen.mentions')
    ) {
      decorator.refreshContentDecorations();
    }

    if (event.affectsConfiguration('editor.fontSize') || event.affectsConfiguration('editor.lineHeight')) {
      decorator.clearMathDecorationCache();
    }
  });

  // Listen for theme changes to update code and color-dependent decoration types
  const changeColorTheme = vscode.window.onDidChangeActiveColorTheme(() => {
    decorator.recreateColorDependentTypes();
  });

  context.subscriptions.push(changeActiveTextEditor);
  context.subscriptions.push(changeTextEditorSelection);
  context.subscriptions.push(changeDocument);
  context.subscriptions.push(renameFiles);
  context.subscriptions.push(changeConfiguration);
  context.subscriptions.push(changeColorTheme);
  context.subscriptions.push(linkProviderDisposable);
  context.subscriptions.push(imageHoverProviderDisposable);
  context.subscriptions.push(linkHoverProviderDisposable);
  context.subscriptions.push(codeBlockHoverProviderDisposable);
  context.subscriptions.push(toggleDecorationsCommand);
  context.subscriptions.push(navigateToAnchorCommand);
  context.subscriptions.push(exportDocxCommand);
  context.subscriptions.push(exportDocxQuickCommand);
  context.subscriptions.push({ dispose: () => decorator.dispose() });
  context.subscriptions.push({ dispose: () => linkClickHandler.dispose() });

  return { parseCache, decorator, svgProcessor: { processSvg } };
}

/**
 * Deactivates the markdown inline preview extension.
 * 
 * This function is called by VS Code when the extension is deactivated.
 * It properly disposes of all event subscriptions and cleans up resources.
 * 
 * @param {vscode.ExtensionContext} context - The extension context provided by VS Code
 * 
 * @example
 * // Called automatically by VS Code when extension is deactivated
 * deactivate(context);
 */
export function deactivate(): void {
  // Dispose mermaid renderer webview
  disposeMermaidRenderer();
  // VS Code disposes subscriptions automatically on deactivation.
}
