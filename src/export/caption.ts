/**
 * 图表题注匹配与构造——单一权威源。
 *
 * GB/T 7713.2-2022 5.2.4/5.4.3：编号大流水"图1""表1"，编号与题注文字
 * 之间空 1 个汉字（全角空格），题注末尾不加标点。
 * 实现与测试共用本模块导出，防止匹配规则双源漂移。
 */

export type CaptionKind = "图" | "表";

/** 题注编号匹配模式：以"图N"/"表N"开头（允许编号前空白） */
export const CAPTION_NUMBER_PATTERN: Record<CaptionKind, RegExp> = {
  图: /^图\s*(\d+)([\s\S]*)$/,
  表: /^表\s*(\d+)([\s\S]*)$/,
};

/** 编号与题注文字之间的间隔：1 个全角空格 */
export const CAPTION_SEPARATOR = "\u3000";

/**
 * 题注行匹配"图N/表N"时返回渲染后的题注文字，否则返回 null。
 * 编号与题注间统一为 1 个汉字空；末尾不追加标点。
 */
export function buildCaptionText(raw: string, kind: CaptionKind): string | null {
  const m = CAPTION_NUMBER_PATTERN[kind].exec(raw.trim());
  if (!m) return null;
  const number = `${kind}${m[1]}`;
  const title = m[2].trim();
  return title ? `${number}${CAPTION_SEPARATOR}${title}` : number;
}
