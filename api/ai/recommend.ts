import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
    return;
  }
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    res.status(500).json({ success: false, error: 'Missing DeepSeek API key' });
    return;
  }
  const { userPreferences, context } = req.body ?? {};
  const systemContent =
    '你是专业的营养规划师和资深大厨。请优先基于用户已导入的店铺和菜谱数据进行健康饮食推荐，并结合用户偏好与消费频率给出可执行建议。';
  const userContent =
    `用户问题: ${context?.userMessage ?? ''}\n店铺数据: ${(context?.shops ?? [])
      .map((s: unknown) => JSON.stringify(s))
      .join('; ')}\n菜谱数据: ${(context?.recipes ?? [])
      .map((r: unknown) => JSON.stringify(r))
      .join('; ')}\n偏好: ${JSON.stringify(userPreferences ?? {})}`;
  const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
  const data = await resp.json();
  if (!resp.ok) {
    res.status(resp.status).json({ success: false, error: data });
    return;
  }
  const content =
    data?.choices?.[0]?.message?.content ??
    data?.data?.choices?.[0]?.message?.content ??
    '';
  res.json({ success: true, content, raw: data });
}
