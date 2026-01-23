import { MarkdownParser } from '../../parser';

describe('MarkdownParser - Emoji Shortcodes', () => {
  let parser: MarkdownParser;

  beforeEach(async () => {
    parser = await MarkdownParser.create();
  });

  it('should render basic emoji shortcode', () => {
    const markdown = ':smile:';
    const result = parser.extractDecorations(markdown);

    const emojiDec = result.find(d => d.type === 'emoji');
    expect(emojiDec).toBeDefined();
    expect(emojiDec?.startPos).toBe(0);
    expect(emojiDec?.endPos).toBe(7);
    expect(emojiDec?.emoji).toBe('😄');
  });

  it('should render emoji shortcodes with plus', () => {
    const markdown = ':+1:';
    const result = parser.extractDecorations(markdown);

    const emojiDec = result.find(d => d.type === 'emoji');
    expect(emojiDec).toBeDefined();
    expect(emojiDec?.startPos).toBe(0);
    expect(emojiDec?.endPos).toBe(4);
    expect(emojiDec?.emoji).toBe('👍');
  });

  it('should ignore invalid emoji shortcodes', () => {
    const markdown = ':not-an-emoji:';
    const result = parser.extractDecorations(markdown);

    expect(result.some(d => d.type === 'emoji')).toBe(false);
  });

  it('should render emoji shortcodes in paragraphs and not in code', () => {
    const markdown = 'Hello :smile: world `:tada:`';
    const result = parser.extractDecorations(markdown);

    const emojiDecs = result.filter(d => d.type === 'emoji');
    expect(emojiDecs.length).toBe(1);
    expect(emojiDecs[0].startPos).toBe(6);
    expect(emojiDecs[0].endPos).toBe(13);
  });

  it('should render emoji shortcodes inside image alt text', () => {
    const markdown = '![Alt :smile:](url)';
    const result = parser.extractDecorations(markdown);

    const emojiDec = result.find(d => d.type === 'emoji');
    expect(emojiDec).toBeDefined();
    expect(emojiDec?.startPos).toBe(6);
    expect(emojiDec?.endPos).toBe(13);
  });
});
