import { MarkdownParser } from '../../parser';

describe('MarkdownParser - Code Blocks', () => {
  let parser: MarkdownParser;

  beforeEach(async () => {
    parser = await MarkdownParser.create();
  });

  describe('basic code block', () => {
    it('should hide opening and closing fence markers', () => {
      const markdown = '```\ncode\n```';
      const result = parser.extractDecorations(markdown);
      
      // Should have hide decorations for fences
      const hideDecs = result.filter(d => d.type === 'hide');
      expect(hideDecs.length).toBeGreaterThan(0);
      
      // Opening fence should be hidden
      expect(hideDecs.some(d => d.startPos === 0)).toBe(true);
      
      // Closing fence should be hidden
      const closingFence = hideDecs.find(d => d.startPos > 5);
      expect(closingFence).toBeDefined();
    });
  });

  describe('code block at start of document', () => {
    it('should handle code block at document start', () => {
      const markdown = '```\ncode\n```\ntext';
      const result = parser.extractDecorations(markdown);
      
      const hideDecs = result.filter(d => d.type === 'hide');
      expect(hideDecs.some(d => d.startPos === 0)).toBe(true);
    });
  });

  describe('code block at end of document', () => {
    it('should handle code block at document end', () => {
      const markdown = 'text\n```\ncode\n```';
      const result = parser.extractDecorations(markdown);
      
      const hideDecs = result.filter(d => d.type === 'hide');
      // Should find closing fence
      expect(hideDecs.length).toBeGreaterThan(0);
    });
  });

  describe('code block with content', () => {
    it('should handle code block with content', () => {
      const markdown = '```\nfunction test() {\n  return true;\n}\n```';
      const result = parser.extractDecorations(markdown);
      
      // Should hide both fences
      const hideDecs = result.filter(d => d.type === 'hide');
      expect(hideDecs.length).toBeGreaterThan(0);
    });
  });

  describe('code block with empty content', () => {
    it('should handle code block with no content', () => {
      const markdown = '```\n```';
      const result = parser.extractDecorations(markdown);
      
      // Should still hide fences
      const hideDecs = result.filter(d => d.type === 'hide');
      expect(hideDecs.length).toBeGreaterThan(0);
    });
  });

  describe('code block with only whitespace', () => {
    it('should handle code block with only whitespace', () => {
      const markdown = '```\n   \n```';
      const result = parser.extractDecorations(markdown);
      
      const hideDecs = result.filter(d => d.type === 'hide');
      expect(hideDecs.length).toBeGreaterThan(0);
    });
  });

  describe('multiple code blocks in document', () => {
    it('should handle multiple code blocks', () => {
      const markdown = '```\ncode1\n```\n```\ncode2\n```';
      const result = parser.extractDecorations(markdown);
      
      const hideDecs = result.filter(d => d.type === 'hide');
      // Should have hide decorations for all fences
      expect(hideDecs.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('code block with language identifier', () => {
    it('should hide language identifier along with fence', () => {
      const markdown = '```javascript\ncode\n```';
      const result = parser.extractDecorations(markdown);
      
      const hideDecs = result.filter(d => d.type === 'hide');
      // Opening fence with language should be hidden
      const openingFence = hideDecs.find(d => d.startPos === 0);
      expect(openingFence).toBeDefined();
      // Should include language in the hidden range
      expect(openingFence?.endPos).toBeGreaterThan(3);
    });
  });
});

