interface OCRResponse {
  success: boolean;
  text?: string;
  error?: string;
}

interface BaiduTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface BaiduOcrWord {
  words?: string;
}

interface BaiduOcrResponse {
  words_result?: BaiduOcrWord[];
  error_code?: number;
  error_msg?: string;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

const getBaiduAccessToken = async (): Promise<string> => {
  const apiKey = process.env.BAIDU_OCR_API_KEY;
  const secretKey = process.env.BAIDU_OCR_SECRET_KEY;
  if (!apiKey || !secretKey) {
    throw new Error('Missing Baidu OCR API key/secret key');
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.value;
  }

  const url =
    `https://aip.baidubce.com/oauth/2.0/token` +
    `?grant_type=client_credentials&client_id=${encodeURIComponent(apiKey)}` +
    `&client_secret=${encodeURIComponent(secretKey)}`;

  const resp = await fetch(url, { method: 'POST' });
  const data = (await resp.json()) as BaiduTokenResponse;

  const token = data.access_token;
  const expiresIn = data.expires_in ?? 0;
  if (!resp.ok || !token) {
    throw new Error(data.error_description || data.error || 'Failed to get Baidu access token');
  }

  cachedToken = { value: token, expiresAt: now + Math.max(0, expiresIn - 60) * 1000 };
  return token;
};

const dataUrlToBase64 = (dataUrl: string): string | null => {
  const idx = dataUrl.indexOf(',');
  if (idx === -1) return null;
  return dataUrl.slice(idx + 1);
};

const urlToBase64 = async (url: string): Promise<string> => {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('Failed to fetch image url');
  const arrayBuffer = await resp.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
};

export const processImage = async (imageUrl: string): Promise<OCRResponse> => {
  try {
    const token = await getBaiduAccessToken();

    let base64: string | null = null;
    if (imageUrl.startsWith('data:')) {
      base64 = dataUrlToBase64(imageUrl);
    } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      base64 = await urlToBase64(imageUrl);
    }

    if (!base64) {
      return { success: false, error: 'Invalid image input' };
    }

    const ocrUrl = `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${encodeURIComponent(token)}`;
    const body = `image=${encodeURIComponent(base64)}&detect_direction=true`;

    const resp = await fetch(ocrUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    const data = (await resp.json()) as BaiduOcrResponse;
    if (!resp.ok || data.error_code) {
      return { success: false, error: data.error_msg || 'Baidu OCR failed' };
    }

    const text = (data.words_result ?? [])
      .map((w) => w.words)
      .filter((w): w is string => typeof w === 'string' && w.trim().length > 0)
      .join('\n');

    return { success: true, text };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
};
