import type { Paragraph } from 'mdast';
import type { DecorationRange } from './types';
import { hasValidPosition } from './common';

/** Emits a paragraph-level range so editor typography stays independent from parsing other inline marks. */
export function processParagraph(node: Paragraph, decorations: DecorationRange[]): void {
  if (!hasValidPosition(node)) return;
  decorations.push({
    startPos: node.position!.start.offset!,
    endPos: node.position!.end.offset!,
    type: 'body',
  });
}
