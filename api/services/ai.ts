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

export const getRecommendation = async (
  userPreferences: Record<string, unknown>,
  context: AIContext,
  apiKey: string
): Promise<AIResponse> => {
  const systemContent =
    '你是专业的营养规划师和资深大厨。请优先基于用户已导入的店铺和菜谱数据进行健康饮食推荐，并结合用户偏好与消费频率给出可执行建议。';

  // Optimize data size by removing images and unnecessary fields
  const optimizedShops = (context.shops ?? []).map((s: any) => ({
    name: s.name,
    type: s.type,
    rating: s.rating,
    tags: s.tags,
    visit_count: s.visit_count,
  }));

  const optimizedRecipes = (context.recipes ?? []).map((r: any) => ({
    name: r.name,
    rating: r.rating,
    tags: r.tags,
    difficulty: r.difficulty,
    ingredients: r.ingredients,
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

    const data: any = await response.json();

    if (!response.ok) {
      return { success: false, error: JSON.stringify(data) };
    }

    const content =
      data?.choices?.[0]?.message?.content ??
      data?.data?.choices?.[0]?.message?.content ??
      '';

    return { success: true, content, raw: data };
  } catch (error) {
    console.error('DeepSeek API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown AI Service Error',
    };
  }
};
