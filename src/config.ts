import * as vscode from 'vscode';

const SECTION = 'markdownInlineEditor' as const;

export const config = {
  diffView: {
    applyDecorations(): boolean {
      return vscode.workspace
        .getConfiguration(SECTION)
        .get<boolean>('defaultBehaviors.diffView.applyDecorations', false);
    },
  },
  links: {
    singleClickOpen(): boolean {
      return vscode.workspace
        .getConfiguration(SECTION)
        .get<boolean>('links.singleClickOpen', false);
    },
  },
  decorations: {
    ghostFaintOpacity(): number {
      return vscode.workspace
        .getConfiguration(SECTION)
        .get<number>('decorations.ghostFaintOpacity', 0.3);
    },
    frontmatterDelimiterOpacity(): number {
      return vscode.workspace
        .getConfiguration(SECTION)
        .get<number>('decorations.frontmatterDelimiterOpacity', 0.3);
    },
    codeBlockLanguageOpacity(): number {
      return vscode.workspace
        .getConfiguration(SECTION)
        .get<number>('decorations.codeBlockLanguageOpacity', 0.3);
    },
  },
  emojis: {
    enabled(): boolean {
      return vscode.workspace
        .getConfiguration(SECTION)
        .get<boolean>('emojis.enabled', true);
    },
  },
} as const;
