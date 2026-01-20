import { MarkdownParser } from '../../parser';
import { TextDocument, Uri, workspace } from '../../test/__mocks__/vscode';
import { getCachedDecorations, resolveImageTarget, shouldSkipInDiffView } from '../../hover-utils';

// Mock workspace.getConfiguration
const mockGetConfiguration = jest.fn().mockReturnValue({
  get: jest.fn().mockReturnValue(false), // defaultBehaviors.diffView.applyDecorations defaults to false
});

(workspace as any).getConfiguration = mockGetConfiguration;

describe('hover-utils', () => {
  describe('resolveImageTarget', () => {
    const documentUri = Uri.file('/path/to/document.md');

    it('should resolve absolute filesystem paths', () => {
      const result = resolveImageTarget('/absolute/path/image.png', documentUri);
      expect(result).toBeDefined();
      expect(result?.scheme).toBe('file');
      expect(result?.toString()).toContain('/absolute/path/image.png');
    });

    it('should resolve relative paths', () => {
      const result = resolveImageTarget('image.png', documentUri);
      expect(result).toBeDefined();
      expect(result?.toString()).toContain('image.png');
    });

    it('should resolve relative paths with ./ prefix', () => {
      const result = resolveImageTarget('./image.png', documentUri);
      expect(result).toBeDefined();
      expect(result?.toString()).toContain('image.png');
    });

    it('should resolve relative paths with ../ prefix', () => {
      const result = resolveImageTarget('../image.png', documentUri);
      expect(result).toBeDefined();
      expect(result?.toString()).toContain('image.png');
    });

    it('should resolve HTTP URLs', () => {
      const result = resolveImageTarget('http://example.com/image.png', documentUri);
      expect(result).toBeDefined();
      expect(result?.scheme).toBe('http');
    });

    it('should resolve HTTPS URLs', () => {
      const result = resolveImageTarget('https://example.com/image.png', documentUri);
      expect(result).toBeDefined();
      expect(result?.scheme).toBe('https');
    });

    it('should resolve data URLs', () => {
      const result = resolveImageTarget('data:image/png;base64,iVBORw0KGgo=', documentUri);
      expect(result).toBeDefined();
      expect(result?.toString()).toContain('data:');
    });

    it('should resolve file: scheme URLs', () => {
      const result = resolveImageTarget('file:///path/to/image.png', documentUri);
      expect(result).toBeDefined();
      expect(result?.scheme).toBe('file');
    });

    it('should handle empty strings', () => {
      const result = resolveImageTarget('', documentUri);
      expect(result).toBeUndefined();
    });

    it('should handle whitespace-only strings', () => {
      const result = resolveImageTarget('   ', documentUri);
      expect(result).toBeUndefined();
    });

    it('should trim whitespace from URLs', () => {
      const result = resolveImageTarget('  image.png  ', documentUri);
      expect(result).toBeDefined();
      expect(result?.toString()).toContain('image.png');
    });

    it('should handle invalid URI parsing gracefully', () => {
      // This should not throw, but may return undefined for malformed URIs
      expect(() => resolveImageTarget('http://[invalid', documentUri)).not.toThrow();
    });
  });

  describe('shouldSkipInDiffView', () => {
    it('should return false for regular file documents', () => {
      const document = new TextDocument(Uri.file('/path/to/file.md'), 'markdown', 1, 'text');
      mockGetConfiguration.mockReturnValue({
        get: jest.fn().mockReturnValue(false),
      });
      
      expect(shouldSkipInDiffView(document)).toBe(false);
    });

    it('should return true for git scheme when decorations disabled', () => {
      const document = new TextDocument(Uri.parse('git:/path/to/file.md'), 'markdown', 1, 'text');
      mockGetConfiguration.mockReturnValue({
        get: jest.fn().mockReturnValue(false),
      });
      
      expect(shouldSkipInDiffView(document)).toBe(true);
    });

    it('should return true for vscode-merge scheme when decorations disabled', () => {
      const document = new TextDocument(Uri.parse('vscode-merge:/path/to/file.md'), 'markdown', 1, 'text');
      mockGetConfiguration.mockReturnValue({
        get: jest.fn().mockReturnValue(false),
      });
      
      expect(shouldSkipInDiffView(document)).toBe(true);
    });

    it('should return true for vscode-diff scheme when decorations disabled', () => {
      const document = new TextDocument(Uri.parse('vscode-diff:/path/to/file.md'), 'markdown', 1, 'text');
      mockGetConfiguration.mockReturnValue({
        get: jest.fn().mockReturnValue(false),
      });
      
      expect(shouldSkipInDiffView(document)).toBe(true);
    });

    it('should return false for git scheme when decorations enabled', () => {
      const document = new TextDocument(Uri.parse('git:/path/to/file.md'), 'markdown', 1, 'text');
      mockGetConfiguration.mockReturnValue({
        get: jest.fn().mockReturnValue(true), // decorations enabled
      });
      
      expect(shouldSkipInDiffView(document)).toBe(false);
    });
  });

  describe('getCachedDecorations', () => {
    let parser: MarkdownParser;
    let cache: Map<string, { version: number; decorations: any[] }>;

    beforeEach(async () => {
      parser = await MarkdownParser.create();
      cache = new Map();
    });

    it('should parse and cache decorations', () => {
      const document = new TextDocument(Uri.file('/test.md'), 'markdown', 1, '**bold**');
      const decorations = getCachedDecorations(document, parser, cache);
      
      expect(decorations.length).toBeGreaterThan(0);
      expect(cache.has(document.uri.toString())).toBe(true);
      expect(cache.get(document.uri.toString())?.version).toBe(1);
    });

    it('should return cached decorations for same version', () => {
      const document = new TextDocument(Uri.file('/test.md'), 'markdown', 1, '**bold**');
      
      const first = getCachedDecorations(document, parser, cache);
      const second = getCachedDecorations(document, parser, cache);
      
      expect(first).toBe(second); // Same reference
      expect(cache.size).toBe(1);
    });

    it('should reparse when document version changes', () => {
      const document1 = new TextDocument(Uri.file('/test.md'), 'markdown', 1, '**bold**');
      const document2 = new TextDocument(Uri.file('/test.md'), 'markdown', 2, '*italic*');
      
      const first = getCachedDecorations(document1, parser, cache);
      const second = getCachedDecorations(document2, parser, cache);
      
      expect(first).not.toBe(second); // Different references
      expect(cache.get(document1.uri.toString())?.version).toBe(2);
    });

    it('should handle parse errors gracefully', () => {
      const document = new TextDocument(Uri.file('/test.md'), 'markdown', 1, '**bold**');
      
      // Mock parser to throw
      const originalExtract = parser.extractDecorations;
      parser.extractDecorations = jest.fn().mockImplementation(() => {
        throw new Error('Parse error');
      });
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const decorations = getCachedDecorations(document, parser, cache);
      
      expect(decorations).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      
      parser.extractDecorations = originalExtract;
      consoleSpy.mockRestore();
    });

    it('should evict oldest entry when cache exceeds limit', () => {
      const MAX_ENTRIES = 20;
      
      // Fill cache to limit
      for (let i = 0; i < MAX_ENTRIES; i++) {
        const doc = new TextDocument(Uri.file(`/test${i}.md`), 'markdown', 1, 'text');
        getCachedDecorations(doc, parser, cache);
      }
      
      expect(cache.size).toBe(MAX_ENTRIES);
      
      // Add one more - should evict oldest
      const newDoc = new TextDocument(Uri.file('/test-new.md'), 'markdown', 1, 'text');
      getCachedDecorations(newDoc, parser, cache);
      
      expect(cache.size).toBe(MAX_ENTRIES);
      // Check that new entry exists
      expect(cache.has(newDoc.uri.toString())).toBe(true);
      // At least one old entry should be gone (implementation uses first key)
      const keys = Array.from(cache.keys());
      expect(keys.length).toBe(MAX_ENTRIES);
      // The first entry should be evicted (oldest)
      expect(keys).not.toContain('/test0.md');
    });

    it('should handle different documents independently', () => {
      const doc1 = new TextDocument(Uri.file('/test1.md'), 'markdown', 1, '**bold**');
      const doc2 = new TextDocument(Uri.file('/test2.md'), 'markdown', 1, '*italic*');
      
      const dec1 = getCachedDecorations(doc1, parser, cache);
      const dec2 = getCachedDecorations(doc2, parser, cache);
      
      expect(cache.size).toBe(2);
      expect(dec1).not.toBe(dec2);
    });
  });
});
