import * as vscode from 'vscode';

/** Filesystem providers for which this extension reads and writes document resources. */
const DOCUMENT_RESOURCE_SCHEMES = new Set(['file', 'vscode-remote']);

export function isDocumentResourceUri(uri: vscode.Uri): boolean {
  return DOCUMENT_RESOURCE_SCHEMES.has(uri.scheme);
}

/** Builds an absolute resource URI without discarding Remote-SSH scheme or authority. */
export function uriFromDocumentPath(documentUri: vscode.Uri, fsPath: string): vscode.Uri {
  if (documentUri.scheme === 'file') {
    return vscode.Uri.file(fsPath);
  }
  return documentUri.with({ path: fsPath, query: '', fragment: '' });
}
