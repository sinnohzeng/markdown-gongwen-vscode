import { MarkdownParser } from '../../parser';

describe('MarkdownParser - Images', () => {
  let parser: MarkdownParser;

  beforeEach(async () => {
    parser = await MarkdownParser.create();
  });

  describe('basic image (![alt](url))', () => {
    it('should hide delimiters and style alt text', () => {
      const markdown = '![alt](url)';
      const result = parser.extractDecorations(markdown);
      
      // Should hide !, [, ], (, )
      expect(result.some(d => d.type === 'hide' && d.startPos === 0)).toBe(true); // ![
      expect(result.some(d => d.type === 'hide' && d.startPos === 5)).toBe(true); // ]
      expect(result.some(d => d.type === 'hide' && d.startPos === 6)).toBe(true); // (
      expect(result.some(d => d.type === 'hide' && d.startPos === 10)).toBe(true); // )
      
      // Should style alt text as image
      expect(result).toContainEqual({
        startPos: 2,
        endPos: 5,
        type: 'image'
      });
    });
  });

  describe('image with alt text', () => {
    it('should handle image with alt text', () => {
      const markdown = '![alt text](image.png)';
      const result = parser.extractDecorations(markdown);
      
      const imageDec = result.find(d => d.type === 'image');
      expect(imageDec).toBeDefined();
      expect(imageDec?.startPos).toBe(2);
      expect(imageDec?.endPos).toBe(10);
    });
  });

  describe('image at start of line', () => {
    it('should handle image at line start', () => {
      const markdown = '![alt](url) text';
      const result = parser.extractDecorations(markdown);
      
      const imageDec = result.find(d => d.type === 'image');
      expect(imageDec).toBeDefined();
      expect(imageDec?.startPos).toBe(2);
    });
  });

  describe('image at end of line', () => {
    it('should handle image at line end', () => {
      const markdown = 'text ![alt](url)';
      const result = parser.extractDecorations(markdown);
      
      const imageDec = result.find(d => d.type === 'image');
      expect(imageDec).toBeDefined();
      expect(imageDec?.startPos).toBeGreaterThan(5);
    });
  });

  describe('image in middle of text', () => {
    it('should handle image in middle of text', () => {
      const markdown = 'start ![alt](url) end';
      const result = parser.extractDecorations(markdown);
      
      const imageDec = result.find(d => d.type === 'image');
      expect(imageDec).toBeDefined();
      expect(imageDec?.startPos).toBeGreaterThan(6);
      expect(imageDec?.endPos).toBeLessThan(17);
    });
  });

  describe('image with spaces in alt', () => {
    it('should handle image with spaces in alt', () => {
      const markdown = '![alt text](url)';
      const result = parser.extractDecorations(markdown);
      
      const imageDec = result.find(d => d.type === 'image');
      expect(imageDec).toBeDefined();
      expect(imageDec?.startPos).toBe(2);
      expect(imageDec?.endPos).toBe(10);
    });
  });

  describe('image with special characters in alt', () => {
    it('should handle image with special characters in alt', () => {
      const markdown = '![alt!@#](url)';
      const result = parser.extractDecorations(markdown);
      
      const imageDec = result.find(d => d.type === 'image');
      expect(imageDec).toBeDefined();
      expect(imageDec?.startPos).toBe(2);
      expect(imageDec?.endPos).toBe(8);
    });
  });

  describe('multiple images in same line', () => {
    it('should handle multiple images', () => {
      const markdown = '![one](url1) and ![two](url2)';
      const result = parser.extractDecorations(markdown);
      
      const imageDecs = result.filter(d => d.type === 'image');
      expect(imageDecs.length).toBe(2);
      
      // First image: "one"
      expect(imageDecs[0].startPos).toBe(2);
      expect(imageDecs[0].endPos).toBe(5);
      
      // Second image: "two"
      expect(imageDecs[1].startPos).toBe(19);
      expect(imageDecs[1].endPos).toBe(22);
    });
  });

  describe('image with empty alt', () => {
    it('should handle image with empty alt gracefully', () => {
      const markdown = '![]';
      const result = parser.extractDecorations(markdown);
      
      // Should still hide delimiters
      expect(result.some(d => d.type === 'hide')).toBe(true);
      // May or may not have image decoration for empty alt
    });
  });
});

