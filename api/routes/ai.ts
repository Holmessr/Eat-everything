import { Router, type Request, type Response } from 'express';

const router = Router();

router.post('/recommend', async (req: Request, res: Response): Promise<any> => {
  try {
    const { userPreferences, context } = req.body as {
      userPreferences?: Record<string, unknown>;
      context?: {
        userMessage?: string;
        shops?: Array<Record<string, unknown>>;
        recipes?: Array<Record<string, unknown>>;
      };
    };
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'Missing DeepSeek API key' });
    }
    const systemContent =
      '你是专业的营养规划师和资深大厨。请优先基于用户已导入的店铺和菜谱数据进行健康饮食推荐，并结合用户偏好与消费频率给出可执行建议。';
    const userContent =
      `用户问题: ${context?.userMessage ?? ''}\n店铺数据: ${(context?.shops ?? [])
        .map((s) => JSON.stringify(s))
        .join('; ')}\n菜谱数据: ${(context?.recipes ?? [])
        .map((r) => JSON.stringify(r))
        .join('; ')}\n偏好: ${JSON.stringify(userPreferences ?? {})}`;
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
      return res.status(response.status).json({ success: false, error: data });
    }
    const content =
      data?.choices?.[0]?.message?.content ??
      data?.data?.choices?.[0]?.message?.content ??
      '';
    return res.json({ success: true, content, raw: data });
  } catch (error) {
    console.error('DeepSeek API Error:', error);
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown AI Service Error' });
  }
});

// OCR Mock
router.post('/ocr', async (req: Request, res: Response): Promise<any> => {
  try {
    const { imageUrl } = req.body as { imageUrl: string };
    void imageUrl;

    // TODO: Integrate with Tesseract.js or other OCR service
    // const worker = await createWorker();
    // const { data: { text } } = await worker.recognize(imageUrl);
    // await worker.terminate();

    // Mock Response
    setTimeout(() => {
      res.json({
        success: true,
        text: "Detected Shop Name: Tasty Burger\nRating: 4.5\nAddress: 123 Main St"
      });
    }, 1000);

  } catch {
    res.status(500).json({ success: false, error: 'OCR Service Error' });
  }
});

export default router;
