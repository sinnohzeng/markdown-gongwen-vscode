jest.mock('../../parser', () => ({
  MarkdownParser: class {
    extractDecorations() {
      return [];
    }
  }
}));

import { Decorator } from '../../decorator';
import { TextDocument, TextEditor, Selection, Position, Uri } from '../../test/__mocks__/vscode';

function makeMockWorkspaceState() {
  const stateMap = new Map<string, unknown>();
  return {
    get: jest.fn(<T>(key: string, defaultValue: T): T =>
      stateMap.has(key) ? (stateMap.get(key) as T) : defaultValue
    ),
    update: jest.fn((key: string, value: unknown) => {
      if (value === undefined) {
        stateMap.delete(key);
      } else {
        stateMap.set(key, value);
      }
      return Promise.resolve();
    }),
    keys: () => [...stateMap.keys()],
  };
}

function makeEditor(uriString: string) {
  const uri = Uri.parse(uriString);
  const doc = new TextDocument(uri, 'markdown', 1, '# Hello');
  return new TextEditor(doc, [new Selection(new Position(0, 0), new Position(0, 0))]);
}

function makeDecorator(workspaceState?: ReturnType<typeof makeMockWorkspaceState>) {
  const parseCache = {
    get: () => ({ version: 1, text: '# Hello', decorations: [], scopes: [], mermaidBlocks: [], mathRegions: [] }),
    invalidate: () => {},
    clear: () => {},
  };
  return new Decorator(parseCache as any, workspaceState as any);
}

describe('Per-file toggle state', () => {
  describe('isEnabled() default behavior', () => {
    it('returns true for a file that has never been toggled', () => {
      const decorator = makeDecorator();
      const editor = makeEditor('file:///test/file-a.md');
      (decorator as any).activeEditor = editor;
      expect(decorator.isEnabled()).toBe(true);
    });

    it('returns true when there is no active editor', () => {
      const decorator = makeDecorator();
      (decorator as any).activeEditor = undefined;
      expect(decorator.isEnabled()).toBe(true);
    });
  });

  describe('toggleDecorations() per-file isolation', () => {
    it('toggling file A does not affect file B', () => {
      const decorator = makeDecorator();
      const editorA = makeEditor('file:///test/file-a.md');
      const editorB = makeEditor('file:///test/file-b.md');

      // Toggle file A off
      (decorator as any).activeEditor = editorA;
      decorator.toggleDecorations();
      expect(decorator.isEnabled()).toBe(false);

      // File B should still be enabled
      (decorator as any).activeEditor = editorB;
      expect(decorator.isEnabled()).toBe(true);
    });

    it('toggling file A twice restores it to enabled', () => {
      const decorator = makeDecorator();
      const editor = makeEditor('file:///test/file-a.md');
      (decorator as any).activeEditor = editor;

      decorator.toggleDecorations();
      expect(decorator.isEnabled()).toBe(false);

      decorator.toggleDecorations();
      expect(decorator.isEnabled()).toBe(true);
    });

    it('returns true without toggling when there is no active editor', () => {
      const decorator = makeDecorator();
      (decorator as any).activeEditor = undefined;
      const result = decorator.toggleDecorations();
      expect(result).toBe(true);
    });
  });

  describe('state persistence via workspaceState', () => {
    it('reads persisted state on first access', () => {
      const ws = makeMockWorkspaceState();
      const uri = 'file:///test/file-a.md';
      // Pre-populate persisted state: decorations disabled
      ws.update(`gongwen.decorationsEnabled.${uri}`, false);
      ws.update.mockClear();

      const decorator = makeDecorator(ws);
      const editor = makeEditor(uri);
      (decorator as any).activeEditor = editor;

      expect(decorator.isEnabled()).toBe(false);
      expect(ws.get).toHaveBeenCalledWith(`gongwen.decorationsEnabled.${uri}`, true);
    });

    it('writes to workspaceState on toggle', () => {
      const ws = makeMockWorkspaceState();
      const uri = 'file:///test/file-a.md';
      const decorator = makeDecorator(ws);
      const editor = makeEditor(uri);
      (decorator as any).activeEditor = editor;

      decorator.toggleDecorations(); // disable

      expect(ws.update).toHaveBeenCalledWith(`gongwen.decorationsEnabled.${uri}`, false);
    });

    it('new files default to enabled even with workspaceState provided', () => {
      const ws = makeMockWorkspaceState();
      const decorator = makeDecorator(ws);
      const editor = makeEditor('file:///test/new-file.md');
      (decorator as any).activeEditor = editor;

      expect(decorator.isEnabled()).toBe(true);
    });

    it('works without workspaceState (no persistence)', () => {
      const decorator = makeDecorator(undefined);
      const editor = makeEditor('file:///test/file-a.md');
      (decorator as any).activeEditor = editor;

      expect(decorator.isEnabled()).toBe(true);
      decorator.toggleDecorations();
      expect(decorator.isEnabled()).toBe(false);
    });
  });

  describe('renameFile()', () => {
    it('migrates in-memory state from old URI to new URI', () => {
      const decorator = makeDecorator();
      const oldUri = 'file:///test/old.md';
      const newUri = 'file:///test/new.md';

      // Disable old file
      (decorator as any).activeEditor = makeEditor(oldUri);
      decorator.toggleDecorations();
      expect(decorator.isEnabled()).toBe(false);

      // Rename
      decorator.renameFile(oldUri, newUri);

      // Old URI should revert to default (true)
      (decorator as any).activeEditor = makeEditor(oldUri);
      expect(decorator.isEnabled()).toBe(true);

      // New URI should carry the disabled state
      (decorator as any).activeEditor = makeEditor(newUri);
      expect(decorator.isEnabled()).toBe(false);
    });

    it('migrates persisted state from old URI to new URI', () => {
      const ws = makeMockWorkspaceState();
      const oldUri = 'file:///test/old.md';
      const newUri = 'file:///test/new.md';
      const decorator = makeDecorator(ws);

      // Disable old file (writes to workspaceState)
      (decorator as any).activeEditor = makeEditor(oldUri);
      decorator.toggleDecorations();
      ws.update.mockClear();

      // Rename
      decorator.renameFile(oldUri, newUri);

      expect(ws.update).toHaveBeenCalledWith(`gongwen.decorationsEnabled.${newUri}`, false);
      expect(ws.update).toHaveBeenCalledWith(`gongwen.decorationsEnabled.${oldUri}`, undefined);
    });

    it('is a no-op for URIs with no toggle state', () => {
      const ws = makeMockWorkspaceState();
      const decorator = makeDecorator(ws);
      ws.update.mockClear();

      // Should not throw and should not write to workspaceState
      expect(() => decorator.renameFile('file:///test/unknown.md', 'file:///test/other.md')).not.toThrow();
      expect(ws.update).not.toHaveBeenCalled();
    });
  });
});
