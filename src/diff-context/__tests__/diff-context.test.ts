import { TextDocument, Uri, workspace } from '../../test/__mocks__/vscode';
import { isDiffLikeUri, shouldSkipInDiffView } from '../../diff-context';

const mockGetConfiguration = jest.fn().mockReturnValue({
  get: jest.fn().mockReturnValue(false),
});

(workspace as any).getConfiguration = mockGetConfiguration;

describe('diff-context', () => {
  describe('isDiffLikeUri', () => {
    it('detects diff schemes', () => {
      expect(isDiffLikeUri(Uri.parse('git:/path/to/file.md') as any)).toBe(true);
      expect(isDiffLikeUri(Uri.parse('vscode-merge:/path/to/file.md') as any)).toBe(true);
      expect(isDiffLikeUri(Uri.parse('vscode-diff:/path/to/file.md') as any)).toBe(true);
    });

    it('does not flag normal file URIs', () => {
      expect(isDiffLikeUri(Uri.file('/path/to/file.md') as any)).toBe(false);
    });
  });

  describe('shouldSkipInDiffView', () => {
    it('returns false for regular file documents', () => {
      const document = new TextDocument(Uri.file('/path/to/file.md'), 'markdown', 1, 'text');
      mockGetConfiguration.mockReturnValue({
        get: jest.fn().mockReturnValue(false),
      });

      expect(shouldSkipInDiffView(document as any)).toBe(false);
    });

    it('returns true for diff schemes when decorations disabled', () => {
      const document = new TextDocument(Uri.parse('git:/path/to/file.md'), 'markdown', 1, 'text');
      mockGetConfiguration.mockReturnValue({
        get: jest.fn().mockReturnValue(false),
      });

      expect(shouldSkipInDiffView(document as any)).toBe(true);
    });

    it('returns false for diff schemes when decorations enabled', () => {
      const document = new TextDocument(Uri.parse('git:/path/to/file.md'), 'markdown', 1, 'text');
      mockGetConfiguration.mockReturnValue({
        get: jest.fn().mockReturnValue(true),
      });

      expect(shouldSkipInDiffView(document as any)).toBe(false);
    });
  });
});
