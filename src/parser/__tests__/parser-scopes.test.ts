import { MarkdownParser } from '../../parser';

describe('MarkdownParser - Scope Ranges', () => {
  let parser: MarkdownParser;

  beforeEach(async () => {
    parser = await MarkdownParser.create();
  });

  it('emits scopes for inline constructs', () => {
    const markdown = '**bold** *italic* ~~strike~~ `code`';
    const result = parser.extractDecorationsWithScopes(markdown);
    const scopeTexts = result.scopes.map((scope) => markdown.slice(scope.startPos, scope.endPos));

    expect(scopeTexts).toContain('**bold**');
    expect(scopeTexts).toContain('*italic*');
    expect(scopeTexts).toContain('~~strike~~');
    expect(scopeTexts).toContain('`code`');
  });

  it('emits scopes for links and images', () => {
    const markdown = '[link](https://example.com) ![alt](image.png)';
    const result = parser.extractDecorationsWithScopes(markdown);
    const scopeTexts = result.scopes.map((scope) => markdown.slice(scope.startPos, scope.endPos));

    expect(scopeTexts).toContain('[link](https://example.com)');
    expect(scopeTexts).toContain('![alt](image.png)');
  });

  it('emits scopes for code blocks', () => {
    const markdown = [
      '```ts',
      'const value = 1;',
      '```',
      '',
    ].join('\n');
    const result = parser.extractDecorationsWithScopes(markdown);
    const scopeTexts = result.scopes.map((scope) => markdown.slice(scope.startPos, scope.endPos));
    const codeScope = scopeTexts.find((scope) =>
      scope.startsWith('```') && scope.includes('\n```')
    );

    expect(codeScope).toBeDefined();
  });

  it('emits scopes for frontmatter blocks', () => {
    const markdown = [
      '---',
      'title: Example',
      '---',
      'Body text',
    ].join('\n');
    const result = parser.extractDecorationsWithScopes(markdown);
    const scopeTexts = result.scopes.map((scope) => markdown.slice(scope.startPos, scope.endPos));

    expect(scopeTexts).toContain(['---', 'title: Example', '---'].join('\n'));
  });
});
