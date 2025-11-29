// 翻译服务
import { apiKeyService } from './apiKeyService';

const TRANSLATION_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const TRANSLATION_MODEL = 'inclusionAI/Ling-mini-2.0';

export interface TranslationResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
    delta?: {
      content?: string;
    };
  }>;
  error?: {
    message: string;
  };
}

export interface StreamTranslationOptions {
  onChunk: (chunk: string) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

/**
 * 翻译文章内容
 * @param content 要翻译的内容
 * @param targetLanguage 目标语言，默认为中文
 * @returns 翻译后的内容
 */
export const translateContent = async (
  content: string,
  targetLanguage: string = '中文'
): Promise<string> => {
  try {
    // 获取并解密 API Key
    const apiKey = apiKeyService.getApiKey();
    if (!apiKey) {
      throw new Error('API Key 未设置');
    }

    // 验证 API Key 格式
    if (!apiKey.startsWith('sk-')) {
      throw new Error('API Key 格式不正确');
    }

    // 确保 API Key 已解密（去除可能的空白字符）
    const decryptedApiKey = apiKey.trim();

    // 构建翻译提示词
    const targetLang = targetLanguage === '中文' ? '中文' : targetLanguage;
    const prompt = `你是一个专业的翻译助手。请将以下内容翻译成${targetLang}。

重要要求：
1. 如果原文是英文或其他非${targetLang}语言，必须翻译成${targetLang}
2. 如果原文已经是${targetLang}，保持原文不变
3. 严格保持原文的 Markdown 格式结构（标题、列表、代码块、链接等）
4. 代码块中的代码保持原样不翻译
5. URL链接地址（如 https://example.com）保持不变，但链接的显示文字需要翻译成${targetLang}
6. 只返回翻译后的内容，不要添加任何说明或注释

需要翻译的内容：

${content}

请直接输出翻译结果：`;

    const requestBody = {
      model: TRANSLATION_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    };

    // 使用解密后的 API Key 构建 Authorization header
    const authorizationHeader = `Bearer ${decryptedApiKey}`;

    // 添加超时控制（120秒）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    let response: Response;
    try {
      response = await fetch(TRANSLATION_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': authorizationHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('翻译请求超时，请稍后重试');
      }
      throw error;
    }

    if (!response.ok) {
      let errorMessage = `翻译请求失败: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // 忽略解析错误
      }
      
      // 401 错误特殊处理
      if (response.status === 401) {
        errorMessage = 'API Key 认证失败，请检查 API Key 是否正确';
      }
      
      throw new Error(errorMessage);
    }

    let data: TranslationResponse;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error('API 响应格式错误，无法解析 JSON');
    }

    if (data.error) {
      throw new Error(data.error.message || '翻译 API 返回错误');
    }

    if (data.choices && data.choices.length > 0) {
      const firstChoice = data.choices[0];
      
      if (firstChoice.message?.content) {
        const translatedText = firstChoice.message.content.trim();
        if (translatedText.length === 0) {
          throw new Error('翻译结果为空');
        }
        return translatedText;
      }
    }

    throw new Error('翻译响应格式错误：未找到翻译内容');
  } catch (error) {
    throw error;
  }
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
  try {
    // 获取并解密 API Key
    const apiKey = apiKeyService.getApiKey();
    if (!apiKey) {
      throw new Error('API Key 未设置');
    }

    // 确保 API Key 已解密（去除可能的空白字符）
    const decryptedApiKey = apiKey.trim();

    // 构建翻译提示词
    const targetLang = targetLanguage === '中文' ? '中文' : targetLanguage;
    const prompt = `你是一个专业的翻译助手。请将以下内容完整翻译成${targetLang}。

重要要求：
1. 如果原文是英文或其他非${targetLang}语言，必须完整翻译成${targetLang}，不要保留英文原文
2. 如果原文已经是${targetLang}，保持原文不变
3. 严格保持原文的 Markdown 格式结构（标题、列表、代码块、链接等）
4. 代码块中的代码保持原样不翻译
5. URL链接地址（如 https://example.com）保持不变，但链接的显示文字必须完整翻译成${targetLang}
6. 确保翻译完整，不要截断内容，翻译所有英文文本
7. 对于Markdown链接格式 [文本](URL)，必须完整输出，包括所有括号和URL，不能截断
8. 确保每个链接都以右括号")"结束
9. 只返回翻译后的内容，不要添加任何说明、注释或提示词

需要翻译的内容：

${content}

请直接输出完整的翻译结果，确保所有链接格式完整：`;

    const requestBody = {
      model: TRANSLATION_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: true, // 启用流式输出
    };

    // 使用解密后的 API Key 构建 Authorization header
    const authorizationHeader = `Bearer ${decryptedApiKey}`;

    // 添加超时控制（120秒）
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), 120000);

    // 合并外部signal和超时signal
    let fetchSignal: AbortSignal;
    if (options.signal) {
      const combinedController = new AbortController();
      const abort = () => combinedController.abort();
      options.signal.addEventListener('abort', abort);
      timeoutController.signal.addEventListener('abort', abort);
      fetchSignal = combinedController.signal;
    } else {
      fetchSignal = timeoutController.signal;
    }

    let response: Response;
    try {
      response = await fetch(TRANSLATION_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': authorizationHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: fetchSignal,
      });
      clearTimeout(timeoutId);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        if (options.signal?.aborted) {
          throw new Error('翻译已取消');
        }
        throw new Error('翻译请求超时，请稍后重试');
      }
      throw error;
    }

    if (!response.ok) {
      let errorMessage = `翻译请求失败: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // 忽略解析错误
      }
      
      // 401 错误特殊处理
      if (response.status === 401) {
        errorMessage = 'API Key 认证失败，请检查 API Key 是否正确';
      }
      
      throw new Error(errorMessage);
    }

    // 处理流式响应
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取流式响应');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    // 处理数据行的辅助函数
    const processLine = (line: string): boolean => {
      const trimmedLine = line.trim();
      
      // 跳过空行和注释
      if (!trimmedLine || trimmedLine.startsWith(':')) {
        return false;
      }

      // 处理 SSE 格式：data: {...}
      if (trimmedLine.startsWith('data: ')) {
        const jsonStr = trimmedLine.slice(6); // 移除 'data: ' 前缀
        
        // 检查是否是结束标记
        if (jsonStr === '[DONE]') {
          return true; // 返回 true 表示已结束
        }

        try {
          const data: TranslationResponse = JSON.parse(jsonStr);
          
          // 处理错误
          if (data.error) {
            throw new Error(data.error.message || '翻译 API 返回错误');
          }

          // 提取内容增量
          if (data.choices && data.choices.length > 0) {
            const choice = data.choices[0];
            const content = choice.delta?.content || choice.message?.content;
            
            if (content && !options.signal?.aborted) {
              options.onChunk(content);
            }
          }
        } catch (parseError) {
          // 忽略解析错误，继续处理下一行
        }
      }
      
      return false;
    };

    try {
      while (true) {
        // 检查是否已取消
        if (options.signal?.aborted) {
          reader.cancel();
          throw new Error('翻译已取消');
        }

        const { done, value } = await reader.read();
        
        // 如果有数据，解码并添加到缓冲区
        if (value) {
          // 使用 stream: false 确保最后的数据块被完全解码
          buffer += decoder.decode(value, { stream: !done });
        }
        
        // 按行分割处理
        const lines = buffer.split('\n');
        
        if (done) {
          // 流结束时，处理所有剩余的行
          buffer = '';
          for (const line of lines) {
            if (options.signal?.aborted) {
              reader.cancel();
              throw new Error('翻译已取消');
            }
            if (processLine(line)) {
              // 遇到 [DONE] 标记
              options.onComplete?.();
              return;
            }
          }
          break;
        } else {
          // 流未结束时，保留最后一个不完整的行
          buffer = lines.pop() || '';
          
          // 处理完整的行
          for (const line of lines) {
            // 检查是否已取消
            if (options.signal?.aborted) {
              reader.cancel();
              throw new Error('翻译已取消');
            }
            
            if (processLine(line)) {
              // 遇到 [DONE] 标记
              options.onComplete?.();
              return;
            }
          }
        }
      }

      // 处理最后剩余的缓冲区内容（如果有）
      if (buffer.trim()) {
        if (!options.signal?.aborted) {
          processLine(buffer);
        }
      }

      // 确保在完成前检查是否已取消
      if (!options.signal?.aborted) {
        options.onComplete?.();
      }
    } catch (error) {
      options.onError?.(error instanceof Error ? error : new Error('流式翻译失败'));
      throw error;
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    options.onError?.(error instanceof Error ? error : new Error('流式翻译失败'));
    throw error;
  }
};

