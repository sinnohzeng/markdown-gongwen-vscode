import { MarkdownParser } from '../../parser';

describe('MarkdownParser - Links', () => {
  let parser: MarkdownParser;

  beforeEach(async () => {
    parser = await MarkdownParser.create();
  });

  describe('basic link ([text](url))', () => {
    it('should hide delimiters and style link text', () => {
      const markdown = '[text](url)';
      const result = parser.extractDecorations(markdown);
      
      // Should hide [, ], (, )
      expect(result.some(d => d.type === 'hide' && d.startPos === 0)).toBe(true); // [
      expect(result.some(d => d.type === 'hide' && d.startPos === 5)).toBe(true); // ]
      expect(result.some(d => d.type === 'hide' && d.startPos === 6)).toBe(true); // (
      expect(result.some(d => d.type === 'hide' && d.startPos === 10)).toBe(true); // )
      
      // Should style text as link
      const linkDec = result.find(d => d.type === 'link');
      expect(linkDec).toBeDefined();
      expect(linkDec?.startPos).toBe(1);
      expect(linkDec?.endPos).toBe(5);
    });
  });

  describe('link with full URL', () => {
    it('should handle link with full URL', () => {
      const markdown = '[link text](https://example.com)';
      const result = parser.extractDecorations(markdown);
      
      const linkDec = result.find(d => d.type === 'link');
      expect(linkDec).toBeDefined();
      expect(linkDec?.startPos).toBe(1);
      expect(linkDec?.endPos).toBe(10);
    });
  });

  describe('link at start of line', () => {
    it('should handle link at line start', () => {
      const markdown = '[link](url) text';
      const result = parser.extractDecorations(markdown);
      
      const linkDec = result.find(d => d.type === 'link');
      expect(linkDec).toBeDefined();
      expect(linkDec?.startPos).toBe(1);
    });
  });

  describe('link at end of line', () => {
    it('should handle link at line end', () => {
      const markdown = 'text [link](url)';
      const result = parser.extractDecorations(markdown);
      
      const linkDec = result.find(d => d.type === 'link');
      expect(linkDec).toBeDefined();
      expect(linkDec?.startPos).toBeGreaterThan(5);
    });
  });

  describe('link in middle of text', () => {
    it('should handle link in middle of text', () => {
      const markdown = 'start [link](url) end';
      const result = parser.extractDecorations(markdown);
      
      const linkDec = result.find(d => d.type === 'link');
      expect(linkDec).toBeDefined();
      expect(linkDec?.startPos).toBeGreaterThan(6);
      expect(linkDec?.endPos).toBeLessThan(17);
    });
  });

  describe('link with spaces in text', () => {
    it('should handle link with spaces in text', () => {
      const markdown = '[link text](url)';
      const result = parser.extractDecorations(markdown);
      
      const linkDec = result.find(d => d.type === 'link');
      expect(linkDec).toBeDefined();
      expect(linkDec?.startPos).toBe(1);
      expect(linkDec?.endPos).toBe(10);
    });
  });

  describe('link with special characters in text', () => {
    it('should handle link with special characters', () => {
      const markdown = '[link!@#](url)';
      const result = parser.extractDecorations(markdown);
      
      const linkDec = result.find(d => d.type === 'link');
      expect(linkDec).toBeDefined();
      expect(linkDec?.startPos).toBe(1);
      expect(linkDec?.endPos).toBe(8);
    });
  });

  describe('multiple links in same line', () => {
    it('should handle multiple links', () => {
      const markdown = '[one](url1) and [two](url2)';
      const result = parser.extractDecorations(markdown);
      
      const linkDecs = result.filter(d => d.type === 'link');
      expect(linkDecs.length).toBe(2);
      
      // First link: "one"
      expect(linkDecs[0].startPos).toBe(1);
      expect(linkDecs[0].endPos).toBe(4);
      
      // Second link: "two"
      expect(linkDecs[1].startPos).toBe(17);
      expect(linkDecs[1].endPos).toBe(20);
    });
  });

  describe('link with empty text', () => {
    it('should handle link with empty text gracefully', () => {
      const markdown = '[](url)';
      const result = parser.extractDecorations(markdown);
      
      // Should still hide delimiters
      expect(result.some(d => d.type === 'hide')).toBe(true);
      // May or may not have link decoration for empty text
    });
  });

  describe('link with empty URL', () => {
    it('should handle link with empty URL gracefully', () => {
      const markdown = '[text]()';
      const result = parser.extractDecorations(markdown);
      
      // Should still style text as link
      const linkDec = result.find(d => d.type === 'link');
      expect(linkDec).toBeDefined();
      expect(linkDec?.startPos).toBe(1);
      expect(linkDec?.endPos).toBe(5);
    });
  });

  describe('links inside code blocks', () => {
    it('should NOT parse links inside fenced code blocks', () => {
      const markdown = '```\n[link](url)\n```';
      const result = parser.extractDecorations(markdown);
      
      const linkDecs = result.filter(d => d.type === 'link');
      expect(linkDecs.length).toBe(0);
    });

    it('should NOT parse links inside inline code', () => {
      const markdown = '`[link](url)`';
      const result = parser.extractDecorations(markdown);
      
      const linkDecs = result.filter(d => d.type === 'link');
      expect(linkDecs.length).toBe(0);
    });

    it('should NOT parse links inside code blocks with language', () => {
      const markdown = '```markdown\n[link](url)\n```';
      const result = parser.extractDecorations(markdown);
      
      const linkDecs = result.filter(d => d.type === 'link');
      expect(linkDecs.length).toBe(0);
    });

    it('should still parse links outside code blocks', () => {
      const markdown = '```\ncode\n```\n[link](url)';
      const result = parser.extractDecorations(markdown);
      
      const linkDecs = result.filter(d => d.type === 'link');
      expect(linkDecs.length).toBe(1);
      expect(linkDecs[0].startPos).toBeGreaterThan(10); // After the code block
    });

    it('should NOT parse links inside mermaid code blocks', () => {
      const markdown = '```mermaid\ngraph TD\nA[Start] --> B{Is Markdown beautiful?}\n```';
      const result = parser.extractDecorations(markdown);
      
      const linkDecs = result.filter(d => d.type === 'link');
      expect(linkDecs.length).toBe(0);
    });
  });
});

