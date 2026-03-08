// 翻译服务（Gemini）
import { GoogleGenAI } from '@google/genai';
import { apiKeyService } from './apiKeyService';

const TRANSLATION_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.1-flash-lite-preview';

interface StreamTranslationOptions {
  onChunk: (chunk: string) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

const createClient = (): GoogleGenAI => {
  const apiKey = apiKeyService.getApiKey();
  return new GoogleGenAI({ apiKey });
};

/**
 * 流式翻译文章内容
 * @param content 要翻译的内容
 * @param options 流式翻译选项
 * @param targetLanguage 目标语言，默认为中文
 */
export const translateContentStream = async (
  content: string,
  options: StreamTranslationOptions,
  targetLanguage: string = '中文'
): Promise<void> => {
  let notified = false;
  const emitError = (error: Error) => {
    if (notified) return;
    notified = true;
    options.onError?.(error);
  };

  try {
    if (!content.trim()) {
      throw new Error('没有可翻译的内容');
    }

    if (options.signal?.aborted) {
      throw new Error('翻译已取消');
    }

    const targetLang = targetLanguage === '中文' ? '中文' : targetLanguage;
    const prompt = `你是一个专业的翻译助手。请将以下内容完整翻译成${targetLang}。

重要要求：
1. 如果原文是英文或其他非${targetLang}语言，必须完整翻译成${targetLang}
2. 如果原文已经是${targetLang}，保持原文不变
3. 严格保持原文的 Markdown 格式结构（标题、列表、代码块、链接等）
4. 代码块中的代码保持原样不翻译
5. URL 链接地址（如 https://example.com）保持不变，但链接显示文字必须翻译
6. 只返回翻译后的内容，不要添加任何额外说明

需要翻译的内容：

${content}`;

    const ai = createClient();
    const stream = await ai.models.generateContentStream({
      model: TRANSLATION_MODEL,
      contents: prompt,
    });

    for await (const chunk of stream) {
      if (options.signal?.aborted) {
        throw new Error('翻译已取消');
      }
      const text = chunk.text;
      if (text) {
        options.onChunk(text);
      }
    }

    if (!options.signal?.aborted) {
      options.onComplete?.();
    }
  } catch (error) {
    const normalizedError = error instanceof Error ? error : new Error('流式翻译失败');
    emitError(normalizedError);
    throw normalizedError;
  }
};
