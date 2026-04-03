import * as vscode from 'vscode';

const SECTION = 'markdownGongwen' as const;

/** Matches `#` + 3, 4, 6, or 8 hex digits (#RGB, #RGBA, #RRGGBB, #RRGGBBAA). Invalid values are treated as unset. */
/** Matches `#` + 3, 4, 6, or 8 hex digits (#RGB, #RGBA, #RRGGBB, #RRGGBBAA). Invalid values are treated as unset. */
const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

/** Matches valid CSS font-weight values: named keywords or numeric hundreds. */
const FONT_WEIGHT_REGEX = /^(normal|bold|lighter|bolder|[1-9]00)$/;

/** Matches valid CSS font-size values: number + unit. */
const FONT_SIZE_REGEX = /^[\d.]+(px|pt|em|rem|%|vw|vh)$/;

/** Matches valid CSS line-height values: bare number (1.8) or number + unit (28px). */
const LINE_HEIGHT_REGEX = /^[\d.]+(px|pt|em|rem|%)?$/;

function parseHexColor(value: string | undefined | null): string | undefined {
  if (value === undefined || value === null || typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return HEX_COLOR_REGEX.test(trimmed) ? trimmed : undefined;
}

function getColorConfig(key: string): string | undefined {
  return parseHexColor(
    vscode.workspace.getConfiguration(SECTION).get<string>(`colors.${key}`)
  );
}

function getFontConfig(key: string): string | undefined {
  const value = vscode.workspace.getConfiguration(SECTION).get<string>(`fonts.${key}`);
  if (value === undefined || value === null || typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getFontWeightConfig(key: string): string | undefined {
  const value = getFontConfig(key);
  if (value === undefined) return undefined;
  return FONT_WEIGHT_REGEX.test(value) ? value : undefined;
}

function getFontSizeConfig(key: string): string | undefined {
  const value = getFontConfig(key);
  if (value === undefined) return undefined;
  return FONT_SIZE_REGEX.test(value) ? value : undefined;
}

function getLineHeightConfig(key: string): string | undefined {
  const value = getFontConfig(key);
  if (value === undefined) return undefined;
  return LINE_HEIGHT_REGEX.test(value) ? value : undefined;
}

export const config = {
  diffView: {
    applyDecorations(): boolean {
      return vscode.workspace
        .getConfiguration(SECTION)
        .get<boolean>('defaultBehaviors.diffView.applyDecorations', false);
    },
  },
  links: {
    singleClickOpen(): boolean {
      return vscode.workspace
        .getConfiguration(SECTION)
        .get<boolean>('links.singleClickOpen', false);
    },
  },
  decorations: {
    ghostFaintOpacity(): number {
      return vscode.workspace
        .getConfiguration(SECTION)
        .get<number>('decorations.ghostFaintOpacity', 0.3);
    },
    frontmatterDelimiterOpacity(): number {
      return vscode.workspace
        .getConfiguration(SECTION)
        .get<number>('decorations.frontmatterDelimiterOpacity', 0.3);
    },
    codeBlockLanguageOpacity(): number {
      return vscode.workspace
        .getConfiguration(SECTION)
        .get<number>('decorations.codeBlockLanguageOpacity', 0.3);
    },
  },
  emojis: {
    enabled(): boolean {
      return vscode.workspace
        .getConfiguration(SECTION)
        .get<boolean>('emojis.enabled', true);
    },
  },
  math: {
    enabled(): boolean {
      return vscode.workspace
        .getConfiguration(SECTION)
        .get<boolean>('math.enabled', true);
    },
  },
  mentions: {
    /** If set, overrides GitHub context: true = force links on, false = force off. Unset = use git remote auto-detect. */
    linksEnabled(): boolean | undefined {
      return vscode.workspace
        .getConfiguration(SECTION)
        .get<boolean>('mentions.linksEnabled');
    },
    /** Optional: master switch to enable/disable mention and issue-reference styling and detection. */
    enabled(): boolean {
      return vscode.workspace
        .getConfiguration(SECTION)
        .get<boolean>('mentions.enabled', true);
    },
  },
  colors: {
    heading1(): string | undefined {
      return getColorConfig('heading1');
    },
    heading2(): string | undefined {
      return getColorConfig('heading2');
    },
    heading3(): string | undefined {
      return getColorConfig('heading3');
    },
    heading4(): string | undefined {
      return getColorConfig('heading4');
    },
    heading5(): string | undefined {
      return getColorConfig('heading5');
    },
    heading6(): string | undefined {
      return getColorConfig('heading6');
    },
    link(): string | undefined {
      return getColorConfig('link');
    },
    listMarker(): string | undefined {
      return getColorConfig('listMarker');
    },
    inlineCode(): string | undefined {
      return getColorConfig('inlineCode');
    },
    inlineCodeBackground(): string | undefined {
      return getColorConfig('inlineCodeBackground');
    },
    emphasis(): string | undefined {
      return getColorConfig('emphasis');
    },
    blockquote(): string | undefined {
      return getColorConfig('blockquote');
    },
    image(): string | undefined {
      return getColorConfig('image');
    },
    horizontalRule(): string | undefined {
      return getColorConfig('horizontalRule');
    },
    checkbox(): string | undefined {
      return getColorConfig('checkbox');
    },
  },
  fonts: {
    heading1FontFamily(): string | undefined { return getFontConfig('heading1.fontFamily'); },
    heading1FontWeight(): string | undefined { return getFontWeightConfig('heading1.fontWeight'); },
    heading1FontSize(): string | undefined { return getFontSizeConfig('heading1.fontSize'); },
    heading2FontFamily(): string | undefined { return getFontConfig('heading2.fontFamily'); },
    heading2FontWeight(): string | undefined { return getFontWeightConfig('heading2.fontWeight'); },
    heading2FontSize(): string | undefined { return getFontSizeConfig('heading2.fontSize'); },
    heading3FontFamily(): string | undefined { return getFontConfig('heading3.fontFamily'); },
    heading3FontWeight(): string | undefined { return getFontWeightConfig('heading3.fontWeight'); },
    heading3FontSize(): string | undefined { return getFontSizeConfig('heading3.fontSize'); },
    heading4FontFamily(): string | undefined { return getFontConfig('heading4.fontFamily'); },
    heading4FontWeight(): string | undefined { return getFontWeightConfig('heading4.fontWeight'); },
    heading4FontSize(): string | undefined { return getFontSizeConfig('heading4.fontSize'); },
    heading5FontFamily(): string | undefined { return getFontConfig('heading5.fontFamily'); },
    heading5FontWeight(): string | undefined { return getFontWeightConfig('heading5.fontWeight'); },
    heading5FontSize(): string | undefined { return getFontSizeConfig('heading5.fontSize'); },
    heading6FontFamily(): string | undefined { return getFontConfig('heading6.fontFamily'); },
    heading6FontWeight(): string | undefined { return getFontWeightConfig('heading6.fontWeight'); },
    heading6FontSize(): string | undefined { return getFontSizeConfig('heading6.fontSize'); },
    emphasisFontFamily(): string | undefined { return getFontConfig('emphasis.fontFamily'); },
    emphasisFontWeight(): string | undefined { return getFontWeightConfig('emphasis.fontWeight'); },
    bodyFontFamily(): string | undefined { return getFontConfig('body.fontFamily'); },
    bodyFontWeight(): string | undefined { return getFontWeightConfig('body.fontWeight'); },
    bodyFontSize(): string | undefined { return getFontSizeConfig('body.fontSize'); },
    bodyLineHeight(): string | undefined { return getLineHeightConfig('body.lineHeight'); },
  },
} as const;
