import { Router } from 'express';
import type { Request, Response } from 'express';
import { getRecommendation } from '../services/ai.js';
import { processImage } from '../services/ocr.js';

const router = Router();

router.post('/recommend', async (req: Request, res: Response): Promise<void> => {
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
      res.status(500).json({ success: false, error: 'Missing DeepSeek API key' });
      return;
    }

    const result = await getRecommendation(
      userPreferences || {},
      context || {},
      apiKey
    );

    if (!result.success) {
      res.status(500).json({ success: false, error: result.error });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('DeepSeek API Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown AI Service Error',
    });
  }
});

// OCR Mock
router.post('/ocr', async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageUrl } = req.body as { imageUrl: string };
    const result = await processImage(imageUrl);

    if (!result.success) {
      res.status(500).json({ success: false, error: result.error });
      return;
    }

    res.json(result);
  } catch {
    res.status(500).json({ success: false, error: 'OCR Service Error' });
  }
});

export default router;
