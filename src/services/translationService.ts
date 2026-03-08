// 翻译服务（通过服务端 API 代理 Gemini）
const TRANSLATION_API_PATH = '/api/translate';

interface StreamTranslationOptions {
  onChunk: (chunk: string) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

interface TranslationResponsePayload {
  text?: string;
  error?: string;
  done?: boolean;
}

const popNextSseEvent = (buffer: string): { event: string | null; rest: string } => {
  const match = /\r?\n\r?\n/.exec(buffer);
  if (!match || match.index === undefined) {
    return { event: null, rest: buffer };
  }

  const boundaryIndex = match.index;
  const boundaryLength = match[0].length;
  return {
    event: buffer.slice(0, boundaryIndex),
    rest: buffer.slice(boundaryIndex + boundaryLength),
  };
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

  const parseStreamEvent = (rawEvent: string): { event: string; payload: TranslationResponsePayload | null } => {
    let eventName = 'message';
    const dataLines: string[] = [];

    for (const line of rawEvent.split('\n')) {
      const trimmed = line.trimEnd();
      if (!trimmed) continue;
      if (trimmed.startsWith('event:')) {
        eventName = trimmed.slice(6).trim() || 'message';
      } else if (trimmed.startsWith('data:')) {
        dataLines.push(trimmed.slice(5).trim());
      }
    }

    if (dataLines.length === 0) {
      return { event: eventName, payload: null };
    }

    try {
      return {
        event: eventName,
        payload: JSON.parse(dataLines.join('\n')) as TranslationResponsePayload,
      };
    } catch {
      return { event: eventName, payload: null };
    }
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

    if (!response.ok) {
      const result = await response.json().catch(() => ({} as TranslationResponsePayload));
      throw new Error(result.error || '翻译服务调用失败');
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const result = await response.json().catch(() => ({} as TranslationResponsePayload));
      const text = typeof result.text === 'string' ? result.text.trim() : '';
      if (!text) {
        throw new Error('翻译结果为空');
      }
      options.onChunk(text);
      if (!options.signal?.aborted) {
        options.onComplete?.();
      }
      return;
    }

    if (!response.body) {
      throw new Error('翻译流不可用');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let receivedChunk = false;
    let doneReceived = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      while (true) {
        const { event: nextEvent, rest } = popNextSseEvent(buffer);
        if (nextEvent === null) {
          buffer = rest;
          break;
        }

        const rawEvent = nextEvent.trim();
        buffer = rest;

        if (!rawEvent) continue;

        const { event, payload } = parseStreamEvent(rawEvent);
        if (!payload) continue;

        if (event === 'error') {
          throw new Error(payload.error || '翻译服务调用失败');
        }

        if (event === 'chunk' && typeof payload.text === 'string' && payload.text) {
          receivedChunk = true;
          options.onChunk(payload.text);
        }

        if (event === 'done' || payload.done) {
          doneReceived = true;
          break;
        }
      }

      if (doneReceived) {
        break;
      }
    }

    if (!receivedChunk) {
      throw new Error('翻译结果为空');
    }

    if (!options.signal?.aborted) {
      options.onComplete?.();
    }
  } catch (error) {
    const isAborted = options.signal?.aborted || (error instanceof DOMException && error.name === 'AbortError');
    const normalizedError = isAborted
      ? new Error('翻译已取消')
      : (error instanceof Error ? error : new Error('流式翻译失败'));
    emitError(normalizedError);
    throw normalizedError;
  }
};
