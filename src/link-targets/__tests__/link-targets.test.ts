import { Uri } from '../../test/__mocks__/vscode';
import { resolveImageTarget, resolveLinkTarget, toCommandUri } from '../../link-targets';

describe('link-targets', () => {
  const documentUri = Uri.file('/path/to/document.md');

  describe('resolveImageTarget', () => {
    it('resolves absolute filesystem paths', () => {
      const result = resolveImageTarget('/absolute/path/image.png', documentUri as any);
      expect(result?.scheme).toBe('file');
    });

    it('resolves relative paths', () => {
      const result = resolveImageTarget('image.png', documentUri as any);
      expect(result?.toString()).toContain('image.png');
    });

    it('resolves external URLs', () => {
      const result = resolveImageTarget('https://example.com/image.png', documentUri as any);
      expect(result?.scheme).toBe('https');
    });
  });

  describe('resolveLinkTarget', () => {
    it('creates command targets for anchors', () => {
      const result = resolveLinkTarget('#heading-1', documentUri as any);
      expect(result?.kind).toBe('command');
    });

    it('resolves http URLs', () => {
      const result = resolveLinkTarget('https://example.com', documentUri as any);
      expect(result?.kind).toBe('uri');
    });

    it('resolves absolute file paths', () => {
      const result = resolveLinkTarget('/absolute/path/file.md', documentUri as any);
      expect(result?.kind).toBe('uri');
      expect(result?.uri.toString()).toContain('/absolute/path/file.md');
    });

    it('resolves relative paths', () => {
      const result = resolveLinkTarget('relative.md', documentUri as any);
      expect(result?.kind).toBe('uri');
      expect(result?.uri.toString()).toContain('relative.md');
    });
  });

  describe('toCommandUri', () => {
    it('encodes command uris with args', () => {
      const uri = toCommandUri('command.test', ['a', 'b']);
      expect(uri.toString()).toContain('command:command.test');
    });
  });
});
