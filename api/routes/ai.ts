import { Router, Request, Response } from 'express';

const router = Router();

// DeepSeek Chat Completion Mock
router.post('/recommend', async (req: Request, res: Response) => {
  try {
    const { userPreferences, context } = req.body;
    
    // TODO: Integrate with DeepSeek API
    // const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
    //   },
    //   body: JSON.stringify({
    //     model: "deepseek-chat",
    //     messages: [
    //       { role: "system", content: "You are a professional nutritionist and chef." },
    //       { role: "user", content: "Recommend a meal..." }
    //     ]
    //   })
    // });

    // Mock Response
    setTimeout(() => {
      res.json({
        success: true,
        recommendation: {
          reason: "Based on your preference for spicy food, I recommend this Sichuan dish.",
          item: "Mock Spicy Tofu",
          type: "recipe"
        }
      });
    }, 1000);
    
  } catch (error) {
    res.status(500).json({ success: false, error: 'AI Service Error' });
  }
});

// OCR Mock
router.post('/ocr', async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body;

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

  } catch (error) {
    res.status(500).json({ success: false, error: 'OCR Service Error' });
  }
});

export default router;
