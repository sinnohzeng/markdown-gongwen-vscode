import { MarkdownParser } from '../../parser';

describe('MarkdownParser - Checkbox/Task List', () => {
  let parser: MarkdownParser;

  beforeEach(async () => {
    parser = await MarkdownParser.create();
  });

  describe('unchecked checkbox (- [ ])', () => {
    it('should detect unchecked checkbox with dash marker', () => {
      const markdown = '- [ ] Task item';
      const result = parser.extractDecorations(markdown);

      // Should have listItem decoration for the dash and space
      expect(result).toContainEqual({
        startPos: 0,
        endPos: 2,
        type: 'listItem'
      });

      // Should have checkboxUnchecked decoration for [ ] only (not trailing space)
      expect(result).toContainEqual({
        startPos: 2,
        endPos: 5,
        type: 'checkboxUnchecked'
      });
    });

    it('should detect unchecked checkbox with asterisk marker', () => {
      const markdown = '* [ ] Task item';
      const result = parser.extractDecorations(markdown);

      expect(result.some(d => d.type === 'listItem')).toBe(true);
      expect(result.some(d => d.type === 'checkboxUnchecked')).toBe(true);
    });

    it('should detect unchecked checkbox with plus marker', () => {
      const markdown = '+ [ ] Task item';
      const result = parser.extractDecorations(markdown);

      expect(result.some(d => d.type === 'listItem')).toBe(true);
      expect(result.some(d => d.type === 'checkboxUnchecked')).toBe(true);
    });
  });

  describe('checked checkbox (- [x])', () => {
    it('should detect checked checkbox with lowercase x', () => {
      const markdown = '- [x] Completed task';
      const result = parser.extractDecorations(markdown);

      // Should have listItem decoration for the dash and space
      expect(result).toContainEqual({
        startPos: 0,
        endPos: 2,
        type: 'listItem'
      });

      // Should have checkboxChecked decoration for [x] only (not trailing space)
      expect(result).toContainEqual({
        startPos: 2,
        endPos: 5,
        type: 'checkboxChecked'
      });
    });

    it('should detect checked checkbox with uppercase X', () => {
      const markdown = '- [X] Completed task';
      const result = parser.extractDecorations(markdown);

      expect(result.some(d => d.type === 'listItem')).toBe(true);
      expect(result.some(d => d.type === 'checkboxChecked')).toBe(true);
    });
  });

  describe('multiple checkboxes', () => {
    it('should handle multiple checkboxes on different lines', () => {
      const markdown = '- [ ] Task 1\n- [x] Task 2\n- [ ] Task 3';
      const result = parser.extractDecorations(markdown);

      const uncheckedDecorations = result.filter(d => d.type === 'checkboxUnchecked');
      const checkedDecorations = result.filter(d => d.type === 'checkboxChecked');

      expect(uncheckedDecorations.length).toBe(2);
      expect(checkedDecorations.length).toBe(1);
    });
  });

  describe('indented checkboxes', () => {
    it('should detect checkbox in indented list item', () => {
      const markdown = '  - [ ] Indented task';
      const result = parser.extractDecorations(markdown);

      expect(result.some(d => d.type === 'listItem')).toBe(true);
      expect(result.some(d => d.type === 'checkboxUnchecked')).toBe(true);
    });
  });

  describe('regular list items without checkbox', () => {
    it('should not create checkbox decoration for regular list item', () => {
      const markdown = '- Regular item';
      const result = parser.extractDecorations(markdown);

      expect(result.some(d => d.type === 'listItem')).toBe(true);
      expect(result.some(d => d.type === 'checkboxUnchecked')).toBe(false);
      expect(result.some(d => d.type === 'checkboxChecked')).toBe(false);
    });

    it('should not match brackets that are not checkboxes', () => {
      const markdown = '- [link] text';
      const result = parser.extractDecorations(markdown);

      // This should be treated as a regular list item, not a checkbox
      expect(result.some(d => d.type === 'listItem')).toBe(true);
      expect(result.some(d => d.type === 'checkboxUnchecked')).toBe(false);
      expect(result.some(d => d.type === 'checkboxChecked')).toBe(false);
    });
  });

  describe('checkbox without trailing space', () => {
    it('should handle checkbox without space after ]', () => {
      const markdown = '- [ ]Task';
      const result = parser.extractDecorations(markdown);

      // Should still detect the checkbox
      expect(result.some(d => d.type === 'checkboxUnchecked')).toBe(true);
      const checkbox = result.find(d => d.type === 'checkboxUnchecked');
      expect(checkbox?.startPos).toBe(2);
      expect(checkbox?.endPos).toBe(5); // Just [ ]
    });
  });
});
