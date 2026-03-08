// 翻译服务（通过服务端 API 代理 Gemini）
const TRANSLATION_API_PATH = '/api/translate';

interface StreamTranslationOptions {
  onChunk: (chunk: string) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

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
    const response = await fetch(TRANSLATION_API_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: options.signal,
      body: JSON.stringify({
        content,
        targetLanguage: targetLang,
      }),
    });

    const result = await response.json().catch(() => ({} as { error?: string; text?: string }));
    if (!response.ok) {
      throw new Error(result.error || '翻译服务调用失败');
    }

    const text = typeof result.text === 'string' ? result.text.trim() : '';
    if (!text) {
      throw new Error('翻译结果为空');
    }
    options.onChunk(text);

    if (!options.signal?.aborted) {
      options.onComplete?.();
    }
  } catch (error) {
    const normalizedError = error instanceof Error ? error : new Error('流式翻译失败');
    emitError(normalizedError);
    throw normalizedError;
  }
};
