// API Key 管理服务（从环境变量读取）
const CLIENT_ENV_KEY = 'VITE_GEMINI_API_KEY';

class ApiKeyService {
  /**
   * 获取 API Key
   * @returns API Key
   */
  getApiKey(): string {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim() || '';

    if (!apiKey) {
      throw new Error(`未配置 ${CLIENT_ENV_KEY}`);
    }

    if (!apiKey.startsWith('AIza')) {
      throw new Error('Gemini API Key 格式不正确');
    }

    return apiKey;
  }

  /**
   * 检查是否有 API Key
   * @returns 是否有 API Key
   */
  hasApiKey(): boolean {
    return !!import.meta.env.VITE_GEMINI_API_KEY?.trim();
  }
}

export const apiKeyService = new ApiKeyService();
