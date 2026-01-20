import * as vscode from 'vscode';

export type LinkTarget =
  | { kind: 'command'; command: string; args: unknown[] }
  | { kind: 'uri'; uri: vscode.Uri };

export function resolveImageTarget(url: string, documentUri: vscode.Uri): vscode.Uri | undefined {
  const trimmed = url.trim();
  if (!trimmed) {
    return;
  }

  if (trimmed.startsWith('/')) {
    return vscode.Uri.file(trimmed);
  }

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('file:')
  ) {
    try {
      return vscode.Uri.parse(trimmed);
    } catch {
      return;
    }
  }

  return vscode.Uri.joinPath(documentUri, '..', trimmed);
}

export function resolveLinkTarget(url: string, documentUri: vscode.Uri): LinkTarget | undefined {
  const trimmed = url.trim();
  if (!trimmed) {
    return;
  }

  if (trimmed.startsWith('#')) {
    const anchor = trimmed.substring(1);
    return { kind: 'command', command: 'markdown-inline-editor.navigateToAnchor', args: [anchor, documentUri.toString()] };
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:')) {
    return { kind: 'uri', uri: vscode.Uri.parse(trimmed) };
  }

  if (trimmed.startsWith('file:')) {
    try {
      return { kind: 'uri', uri: vscode.Uri.parse(trimmed) };
    } catch {
      return;
    }
  }

  if (trimmed.startsWith('/')) {
    return { kind: 'uri', uri: vscode.Uri.file(trimmed) };
  }

  return { kind: 'uri', uri: vscode.Uri.joinPath(documentUri, '..', trimmed) };
}

export function toCommandUri(command: string, args: unknown[]): vscode.Uri {
  return vscode.Uri.parse(`command:${command}?${encodeURIComponent(JSON.stringify(args))}`);
}
