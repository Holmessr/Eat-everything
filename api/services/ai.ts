interface AIContext {
  userMessage?: string;
  shops?: Array<Record<string, unknown>>;
  recipes?: Array<Record<string, unknown>>;
}

interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
  raw?: unknown;
}

const toString = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined);
const toNumber = (v: unknown): number | undefined => (typeof v === 'number' ? v : undefined);
const toStringArray = (v: unknown): string[] | undefined =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : undefined;

const getDeepSeekContent = (data: unknown): string => {
  const fromChoices = (choices: unknown): string | undefined => {
    if (!Array.isArray(choices) || choices.length === 0) return undefined;
    const first = choices[0];
    if (typeof first !== 'object' || first === null) return undefined;
    const msg = (first as Record<string, unknown>)['message'];
    if (typeof msg !== 'object' || msg === null) return undefined;
    return toString((msg as Record<string, unknown>)['content']);
  };

  if (typeof data !== 'object' || data === null) return '';
  const root = data as Record<string, unknown>;

  const direct = fromChoices(root['choices']);
  if (direct) return direct;

  const nested = root['data'];
  if (typeof nested !== 'object' || nested === null) return '';
  return fromChoices((nested as Record<string, unknown>)['choices']) ?? '';
};

export const getRecommendation = async (
  userPreferences: Record<string, unknown>,
  context: AIContext,
  apiKey: string
): Promise<AIResponse> => {
  const systemContent =
    '你是专业的营养规划师和资深大厨。请优先基于用户已导入的店铺和菜谱数据进行健康饮食推荐，并结合用户偏好与消费频率给出可执行建议。';

  const optimizedShops = (context.shops ?? []).map((s) => ({
    name: toString(s.name),
    type: toString(s.type),
    rating: toNumber(s.rating),
    tags: toStringArray(s.tags),
    visit_count: toNumber(s.visit_count),
  }));

  const optimizedRecipes = (context.recipes ?? []).map((r) => ({
    name: toString(r.name),
    rating: toNumber(r.rating),
    tags: toStringArray(r.tags),
    difficulty: toString(r.difficulty),
    ingredients: toStringArray(r.ingredients),
  }));

  const userContent = `用户问题: ${context.userMessage ?? ''}\n店铺数据: ${JSON.stringify(
    optimizedShops
  )}\n菜谱数据: ${JSON.stringify(optimizedRecipes)}\n偏好: ${JSON.stringify(
    userPreferences ?? {}
  )}`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: userContent },
        ],
      }),
    });

    const data = (await response.json()) as unknown;

    if (!response.ok) {
      return { success: false, error: JSON.stringify(data) };
    }

    const content = getDeepSeekContent(data);

    return { success: true, content, raw: data };
  } catch (error) {
    console.error('DeepSeek API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown AI Service Error',
    };
  }
};
