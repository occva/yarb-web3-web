const DEFAULT_MODEL = 'gemini-3.1-flash-lite-preview';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const getPrompt = (content, targetLanguage) => `你是一个专业的翻译助手。请将以下内容完整翻译成${targetLanguage}。

重要要求：
1. 如果原文是英文或其他非${targetLanguage}语言，必须完整翻译成${targetLanguage}
2. 如果原文已经是${targetLanguage}，保持原文不变
3. 严格保持原文的 Markdown 格式结构（标题、列表、代码块、链接等）
4. 代码块中的代码保持原样不翻译
5. URL 链接地址（如 https://example.com）保持不变，但链接显示文字必须翻译
6. 只返回翻译后的内容，不要添加任何额外说明

需要翻译的内容：

${content}`;

const getErrorMessage = (status, message) => {
  if (status === 401 || status === 403) {
    return '翻译服务鉴权失败，请检查服务端 GEMINI_API_KEY';
  }
  if (status === 429) {
    return '翻译服务请求过于频繁，请稍后重试';
  }
  return message || '翻译服务调用失败';
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim() || '';
  if (!apiKey) {
    return res.status(500).json({ error: '服务端未配置 GEMINI_API_KEY' });
  }

  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  let payload = req.body || {};
  if (typeof req.body === 'string') {
    try {
      payload = JSON.parse(req.body || '{}');
    } catch {
      return res.status(400).json({ error: '请求体必须是合法 JSON' });
    }
  }
  const content = typeof payload.content === 'string' ? payload.content.trim() : '';
  const targetLanguage = typeof payload.targetLanguage === 'string' && payload.targetLanguage.trim()
    ? payload.targetLanguage.trim()
    : '中文';

  if (!content) {
    return res.status(400).json({ error: '没有可翻译的内容' });
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: getPrompt(content, targetLanguage),
              },
            ],
          },
        ],
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      const message = result?.error?.message || '';
      return res.status(response.status).json({
        error: getErrorMessage(response.status, message),
      });
    }

    const text = (result?.candidates || [])
      .flatMap((candidate) => candidate?.content?.parts || [])
      .map((part) => part?.text || '')
      .join('')
      .trim();

    if (!text) {
      return res.status(502).json({ error: '翻译服务未返回有效内容' });
    }

    return res.status(200).json({ text });
  } catch (error) {
    const message = error instanceof Error ? error.message : '翻译服务调用失败';
    return res.status(500).json({ error: message });
  }
}
