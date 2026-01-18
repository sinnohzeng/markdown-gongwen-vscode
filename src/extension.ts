import * as vscode from 'vscode';
import { Decorator } from './decorator';
import { MarkdownLinkProvider } from './link-provider';
import { normalizeAnchorText } from './position-mapping';

/**
 * Reads the defaultBehaviors.diffView.applyDecorations configuration setting.
 * 
 * @returns {boolean} True if decorations should be applied in diff views
 */
function getDiffViewApplyDecorationsSetting(): boolean {
  const config = vscode.workspace.getConfiguration('markdownInlineEditor');
  return config.get<boolean>('defaultBehaviors.diffView.applyDecorations', false);
}

/**
 * Reads the decorations.ghostFaintOpacity configuration setting.
 * 
 * @returns {number} Opacity value between 0.0 and 1.0 for ghost faint decorations
 */
function getGhostFaintOpacitySetting(): number {
  const config = vscode.workspace.getConfiguration('markdownInlineEditor');
  return config.get<number>('decorations.ghostFaintOpacity', 0.3);
}

/**
 * Reads the decorations.frontmatterDelimiterOpacity configuration setting.
 * 
 * @returns {number} Opacity value between 0.0 and 1.0 for frontmatter delimiters
 */
function getFrontmatterDelimiterOpacitySetting(): number {
  const config = vscode.workspace.getConfiguration('markdownInlineEditor');
  return config.get<number>('decorations.frontmatterDelimiterOpacity', 0.3);
}

/**
 * Reads the decorations.codeBlockLanguageOpacity configuration setting.
 * 
 * @returns {number} Opacity value between 0.0 and 1.0 for code block language identifiers
 */
function getCodeBlockLanguageOpacitySetting(): number {
  const config = vscode.workspace.getConfiguration('markdownInlineEditor');
  return config.get<number>('decorations.codeBlockLanguageOpacity', 0.3);
}

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
export function activate(context: vscode.ExtensionContext) {
  const decorator = new Decorator();
  const diffViewApplyDecorations = getDiffViewApplyDecorationsSetting();
  decorator.updateDiffViewDecorationSetting(!diffViewApplyDecorations);
  
  decorator.setActiveEditor(vscode.window.activeTextEditor);

  // Register link provider for clickable markdown links
  const linkProvider = new MarkdownLinkProvider();
  const linkProviderDisposable = vscode.languages.registerDocumentLinkProvider(
    { language: 'markdown', scheme: 'file' },
    linkProvider
  );

  // Register command for toggling markdown decorations
  const toggleDecorationsCommand = vscode.commands.registerCommand(
    'mdInline.toggleDecorations',
    () => {
      const enabled = decorator.toggleDecorations();
      vscode.window.showInformationMessage(
        `Markdown decorations ${enabled ? 'enabled' : 'disabled'}`
      );
    }
  );

  // Register command for navigating to anchor links
  const navigateToAnchorCommand = vscode.commands.registerCommand(
    'markdown-inline-editor.navigateToAnchor',
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
      vscode.window.showInformationMessage(`Anchor "${anchor}" not found`);
    }
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

  const changeConfiguration = vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('markdownInlineEditor.defaultBehaviors.diffView.applyDecorations')) {
      const diffViewApplyDecorations = getDiffViewApplyDecorationsSetting();
      decorator.updateDiffViewDecorationSetting(!diffViewApplyDecorations);
      decorator.updateDecorationsForSelection();
    }
    
    if (event.affectsConfiguration('markdownInlineEditor.decorations.ghostFaintOpacity')) {
      decorator.recreateGhostFaintDecorationType();
    }
    
    if (event.affectsConfiguration('markdownInlineEditor.decorations.frontmatterDelimiterOpacity')) {
      decorator.recreateFrontmatterDelimiterDecorationType();
    }
    
    if (event.affectsConfiguration('markdownInlineEditor.decorations.codeBlockLanguageOpacity')) {
      decorator.recreateCodeBlockLanguageDecorationType();
    }
  });

  // Listen for theme changes to update code decoration colors
  const changeColorTheme = vscode.window.onDidChangeActiveColorTheme(() => {
    decorator.recreateCodeDecorationType();
  });

  context.subscriptions.push(changeActiveTextEditor);
  context.subscriptions.push(changeTextEditorSelection);
  context.subscriptions.push(changeDocument);
  context.subscriptions.push(changeConfiguration);
  context.subscriptions.push(changeColorTheme);
  context.subscriptions.push(linkProviderDisposable);
  context.subscriptions.push(toggleDecorationsCommand);
  context.subscriptions.push(navigateToAnchorCommand);
  context.subscriptions.push({ dispose: () => decorator.dispose() });
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
export function deactivate(context: vscode.ExtensionContext) {
  context.subscriptions.forEach((subscription) => subscription.dispose());
}
