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
    it('should hide fence markers and render language identifier with opacity', () => {
      const markdown = '```javascript\ncode\n```';
      const result = parser.extractDecorations(markdown);
      
      // Opening fence (```) should be hidden (3 characters)
      const openingFence = result.find(d => d.type === 'hide' && d.startPos === 0);
      expect(openingFence).toBeDefined();
      expect(openingFence?.endPos).toBe(3);
      
      // Language identifier should have codeBlockLanguage decoration
      const languageDec = result.find(d => d.type === 'codeBlockLanguage');
      expect(languageDec).toBeDefined();
      expect(languageDec?.startPos).toBe(3); // After ```
      expect(languageDec?.endPos).toBe(13); // "javascript" is 10 chars, so 3 + 10 = 13
      
      // Newline after language should be hidden
      const newlineHide = result.find(d => d.type === 'hide' && d.startPos === 13);
      expect(newlineHide).toBeDefined();
      expect(newlineHide?.endPos).toBe(14); // Newline is 1 char
    });

    it('should handle code block with different language identifiers', () => {
      const markdown = '```python\ncode\n```\n```typescript\ncode\n```';
      const result = parser.extractDecorations(markdown);
      
      // Should have language decorations for both code blocks
      const languageDecs = result.filter(d => d.type === 'codeBlockLanguage');
      expect(languageDecs.length).toBe(2);
      
      // First language should be "python"
      const pythonDec = languageDecs.find(d => d.startPos === 3);
      expect(pythonDec).toBeDefined();
      
      // Second language should be "typescript"
      const tsDec = languageDecs.find(d => d.startPos > 20);
      expect(tsDec).toBeDefined();
    });
  });

  describe('GFM code block variants', () => {
    it('should support tilde fences (~~~)', () => {
      const markdown = '~~~python\ncode\n~~~';
      const result = parser.extractDecorations(markdown);
      
      // Should have code block decoration
      const codeBlock = result.find(d => d.type === 'codeBlock');
      expect(codeBlock).toBeDefined();
      
      // Should have hide decorations for fences
      const hideDecs = result.filter(d => d.type === 'hide');
      expect(hideDecs.length).toBeGreaterThan(0);
      
      // Should have language decoration
      const languageDec = result.find(d => d.type === 'codeBlockLanguage');
      expect(languageDec).toBeDefined();
    });

    it('should support fences with more than 3 characters', () => {
      const markdown = '````python\ncode\n````';
      const result = parser.extractDecorations(markdown);
      
      // Should have code block decoration
      const codeBlock = result.find(d => d.type === 'codeBlock');
      expect(codeBlock).toBeDefined();
      
      // Should have hide decorations for fences
      const hideDecs = result.filter(d => d.type === 'hide');
      expect(hideDecs.length).toBeGreaterThan(0);
    });

    it('should support tilde fences with more than 3 characters', () => {
      const markdown = '~~~~python\ncode\n~~~~';
      const result = parser.extractDecorations(markdown);
      
      // Should have code block decoration
      const codeBlock = result.find(d => d.type === 'codeBlock');
      expect(codeBlock).toBeDefined();
      
      // Should have language decoration
      const languageDec = result.find(d => d.type === 'codeBlockLanguage');
      expect(languageDec).toBeDefined();
    });

    it('should handle closing fence that is longer than opening fence', () => {
      const markdown = '```python\ncode\n````';
      const result = parser.extractDecorations(markdown);
      
      // Should have code block decoration
      const codeBlock = result.find(d => d.type === 'codeBlock');
      expect(codeBlock).toBeDefined();
    });

    it('should handle mixed backtick and tilde fences separately', () => {
      const markdown = '```python\ncode\n```\n~~~javascript\ncode\n~~~';
      const result = parser.extractDecorations(markdown);
      
      // Should have two code block decorations
      const codeBlocks = result.filter(d => d.type === 'codeBlock');
      expect(codeBlocks.length).toBe(2);
      
      // Should have language decorations for both
      const languageDecs = result.filter(d => d.type === 'codeBlockLanguage');
      expect(languageDecs.length).toBe(2);
    });

    it('should handle code block without language identifier', () => {
      const markdown = '~~~\ncode\n~~~';
      const result = parser.extractDecorations(markdown);
      
      // Should have code block decoration
      const codeBlock = result.find(d => d.type === 'codeBlock');
      expect(codeBlock).toBeDefined();
      
      // Should not have language decoration
      const languageDec = result.find(d => d.type === 'codeBlockLanguage');
      expect(languageDec).toBeUndefined();
    });
  });
});

