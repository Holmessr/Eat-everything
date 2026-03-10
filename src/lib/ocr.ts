export interface OcrResult {
  name?: string;
  address?: string;
  tags?: string[];
}

const normalizeLines = (text: string): string[] => {
  return text
    .split('\n')
    .map((line) =>
      line
        .replace(/[®>]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter((line) => line.length > 0);
};

const pickFirstMatch = (text: string, patterns: RegExp[]): string | undefined => {
  for (const pattern of patterns) {
    const m = text.match(pattern);
    const value = m?.[1]?.trim();
    if (value) return value;
  }
  return undefined;
};

const parseTags = (text: string): string[] | undefined => {
  const match = text.match(/(?:Tags?|标签)\s*[:：]\s*(.+)$/im);
  if (!match?.[1]) return undefined;
  const tags = match[1]
    .split(/[,，、]/)
    .map((t) => t.trim())
    .filter(Boolean);
  return tags.length ? tags : undefined;
};

const pickBestLine = (lines: string[], predicate: (line: string) => boolean): string | undefined => {
  const candidates = lines.filter(predicate);
  if (!candidates.length) return undefined;
  candidates.sort((a, b) => b.length - a.length);
  return candidates[0];
};

const isLikelyShopName = (line: string): boolean => {
  if (line.length < 5) return false;
  if (/[￥$]/.test(line)) return false;
  if (/(评价|条评价|营业中|距您|步行|电话|打车|外卖|优惠|菜品|商家服务|相册|封面|直播)/.test(line)) return false;
  if (/^\d{1,2}[:：]\d{2}$/.test(line)) return false;
  if (/(分|人|公里|米)/.test(line) && /\d/.test(line)) return false;
  const hasChinese = /[\u4e00-\u9fa5]/.test(line);
  if (!hasChinese) return false;
  return true;
};

const isLikelyAddress = (line: string): boolean => {
  if (!/[\u4e00-\u9fa5]/.test(line)) return false;
  if (/(营业中|评价|外卖|电话|打车|优惠|菜品|商家服务|相册|封面)/.test(line)) return false;
  const hasDistrict = /(区|县)/.test(line);
  const hasRoad = /(路|街|道|巷|大道|里|弄)/.test(line);
  const hasNumber = /\d/.test(line);
  return (hasDistrict && hasRoad) || (hasRoad && hasNumber);
};

const extractServiceTags = (lines: string[]): string[] | undefined => {
  const serviceLine = pickBestLine(lines, (l) => /(可停车|包间|大桌|预订|宝宝椅|停车|Wi-?Fi|洗手间|外摆)/.test(l));
  if (!serviceLine) return undefined;
  const normalized = serviceLine.replace(/·/g, ' ').replace(/\s+/g, ' ').trim();
  const raw = normalized
    .split(/有|可|、|，|,|\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
  const tags = Array.from(new Set(raw))
    .map((t) => (t.length <= 1 ? '' : t))
    .filter(Boolean)
    .slice(0, 8);
  return tags.length ? tags : undefined;
};

export const extractShopFields = (text: string): OcrResult => {
  const lines = normalizeLines(text);

  const name = pickFirstMatch(text, [
    /Detected\s*Shop\s*Name\s*[:：]\s*(.+)$/im,
    /Shop\s*Name\s*[:：]\s*(.+)$/im,
    /店铺名称\s*[:：]\s*(.+)$/im,
    /店名\s*[:：]\s*(.+)$/im,
  ]) ?? pickBestLine(lines, (l) => isLikelyShopName(l) && /（.+店）|店/.test(l)) ?? pickBestLine(lines, isLikelyShopName);

  const address = pickFirstMatch(text, [
    /Address\s*[:：]\s*(.+)$/im,
    /地址\s*[:：]\s*(.+)$/im,
  ]) ?? pickBestLine(lines, isLikelyAddress);

  const tags = parseTags(text) ?? extractServiceTags(lines);
  return { name, address, tags };
};

export const extractRecipeFields = (text: string): OcrResult => {
  const lines = normalizeLines(text);
  const name = pickFirstMatch(text, [
    /Detected\s*Recipe\s*Name\s*[:：]\s*(.+)$/im,
    /Recipe\s*Name\s*[:：]\s*(.+)$/im,
    /菜谱名称\s*[:：]\s*(.+)$/im,
    /菜名\s*[:：]\s*(.+)$/im,
  ]) ?? pickBestLine(lines, (l) => /[\u4e00-\u9fa5]/.test(l) && !/(评价|营业中|外卖|优惠|电话|打车|￥|分)/.test(l));
  const tags = parseTags(text);
  return { name, tags };
};

export const requestOcr = async (imageUrl: string): Promise<{ success: boolean; text?: string; error?: string }> => {
  const res = await fetch('/api/ai/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl }),
  });
  const data = (await res.json()) as { success: boolean; text?: string; error?: string };
  if (!res.ok) {
    return { success: false, error: data?.error ?? 'OCR Service Error' };
  }
  return data;
};
