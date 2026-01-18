jest.mock('../../parser', () => ({
  MarkdownParser: class {
    extractDecorations() {
      return [];
    }
  }
}));

import { Decorator } from '../../decorator';
import type { DecorationRange, DecorationType } from '../../parser';
import { isMarkerDecorationType } from '../decoration-categories';
import { TextDocument, TextEditor, Selection, Position, Uri } from '../../test/__mocks__/vscode';

function filterDecorationsForSelection(
  text: string,
  decorations: DecorationRange[],
  selection: ReturnType<typeof Selection>
): Map<DecorationType, unknown[]> {
  const document = new TextDocument(Uri.file('test.md'), 'markdown', 1, text);
  const editor = new TextEditor(document, [selection]);
  const decorator = new Decorator() as unknown as {
    activeEditor: ReturnType<typeof TextEditor>;
    filterDecorations: (ranges: DecorationRange[], originalText: string) => Map<DecorationType, unknown[]>;
  };

  decorator.activeEditor = editor;
  return decorator.filterDecorations(decorations, text);
}

describe('Decorator filtering behavior', () => {
  it('keeps semantic styling while revealing markers on active line', () => {
    const text = '**bold**';
    const decorations: DecorationRange[] = [
      { startPos: 0, endPos: 2, type: 'hide' },
      { startPos: 2, endPos: 6, type: 'bold' },
      { startPos: 6, endPos: 8, type: 'hide' },
    ];

    const selection = new Selection(new Position(0, 3), new Position(0, 3));
    const filtered = filterDecorationsForSelection(text, decorations, selection);

    expect(filtered.get('bold')?.length).toBe(1);
    expect(filtered.has('hide')).toBe(false);
  });

  it('reveals heading markers on active line', () => {
    const text = '# Heading';
    const decorations: DecorationRange[] = [
      { startPos: 0, endPos: 2, type: 'hide' },
      { startPos: 2, endPos: 9, type: 'heading1' },
      { startPos: 2, endPos: 9, type: 'heading' },
    ];

    const selection = new Selection(new Position(0, 1), new Position(0, 1));
    const filtered = filterDecorationsForSelection(text, decorations, selection);

    expect(filtered.has('heading1')).toBe(false);
    expect(filtered.has('heading')).toBe(false);
  });

  it('does not suppress marker decorations on non-active lines', () => {
    const text = '- item\nnext';
    const decorations: DecorationRange[] = [
      { startPos: 0, endPos: 2, type: 'listItem' },
    ];

    const selection = new Selection(new Position(1, 0), new Position(1, 0));
    const filtered = filterDecorationsForSelection(text, decorations, selection);

    expect(filtered.get('listItem')?.length).toBe(1);
  });

  it('keeps checkbox decoration when cursor is inside the checkbox', () => {
    const text = '- [ ] task';
    const decorations: DecorationRange[] = [
      { startPos: 0, endPos: 2, type: 'listItem' },
      { startPos: 2, endPos: 5, type: 'checkboxUnchecked' },
    ];

    const selection = new Selection(new Position(0, 3), new Position(0, 3));
    const filtered = filterDecorationsForSelection(text, decorations, selection);

    expect(filtered.get('checkboxUnchecked')?.length).toBe(1);
    expect(filtered.has('listItem')).toBe(false);
  });

  it('reveals horizontal rule in raw state when cursor/selection intersects', () => {
    const text = '---';
    const decorations: DecorationRange[] = [
      { startPos: 0, endPos: 3, type: 'horizontalRule' },
    ];

    // Test with cursor inside horizontal rule
    const selection = new Selection(new Position(0, 1), new Position(0, 1));
    const filtered = filterDecorationsForSelection(text, decorations, selection);

    // Horizontal rule decoration should be skipped (raw state - show actual ---)
    expect(filtered.has('horizontalRule')).toBe(false);
  });

  it('shows horizontal rule in rendered state when cursor/selection does not intersect', () => {
    const text = '---\nother text';
    const decorations: DecorationRange[] = [
      { startPos: 0, endPos: 3, type: 'horizontalRule' },
    ];

    // Test with cursor on different line
    const selection = new Selection(new Position(1, 0), new Position(1, 0));
    const filtered = filterDecorationsForSelection(text, decorations, selection);

    // Horizontal rule decoration should be applied (rendered state - show visual separator)
    expect(filtered.get('horizontalRule')?.length).toBe(1);
  });

  it('reveals horizontal rule in raw state when selection covers it', () => {
    const text = '---';
    const decorations: DecorationRange[] = [
      { startPos: 0, endPos: 3, type: 'horizontalRule' },
    ];

    // Test with selection covering the entire horizontal rule
    const selection = new Selection(new Position(0, 0), new Position(0, 3));
    const filtered = filterDecorationsForSelection(text, decorations, selection);

    // Horizontal rule decoration should be skipped (raw state - show actual ---)
    expect(filtered.has('horizontalRule')).toBe(false);
  });
});

describe('Marker decoration categorization', () => {
  it('identifies marker/replacement decorations', () => {
    const markerTypes: DecorationType[] = [
      'hide',
      'transparent',
      'blockquote',
      'heading',
      'heading1',
      'heading2',
      'heading3',
      'heading4',
      'heading5',
      'heading6',
      'listItem',
      'checkboxUnchecked',
      'checkboxChecked',
      'horizontalRule',
    ];

    markerTypes.forEach((type) => {
      expect(isMarkerDecorationType(type)).toBe(true);
    });
    expect(isMarkerDecorationType('bold')).toBe(false);
    expect(isMarkerDecorationType('link')).toBe(false);
  });
});
