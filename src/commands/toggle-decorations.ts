import * as vscode from 'vscode';
import { Decorator } from '../decorator';

export function createToggleDecorationsCommand(decorator: Decorator): vscode.Disposable {
  return vscode.commands.registerCommand('gongwen.toggleDecorations', () => {
    const enabled = decorator.toggleDecorations();
    const fileName = decorator.activeEditor
      ? vscode.workspace.asRelativePath(decorator.activeEditor.document.uri)
      : '当前文件';
    void vscode.window.showInformationMessage(
      `已${enabled ? '开启' : '关闭'} Markdown 渲染：${fileName}`
    );
  });
}
