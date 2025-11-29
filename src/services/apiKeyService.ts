// API Key 管理服务
import { decodeBase64 } from '../utils/base64';

const ENCRYPTED_API_KEY = 'c2stZGVieGtvanlwamdncHRudmhzZ2tkZXVtdWRyenVtdWdldHl1eHdleXFzb2J6a2d2';
const STORAGE_KEY = 'yarb-web3-api-key';

class ApiKeyService {
  private cachedApiKey: string | null = null;

  /**
   * 获取解密后的 API Key
   * @returns 解密后的 API Key
   */
  getApiKey(): string {
    // 优先使用缓存的 API Key（如果格式正确）
    if (this.cachedApiKey && this.cachedApiKey.startsWith('sk-')) {
      return this.cachedApiKey;
    }

    // 清除可能错误的缓存
    this.cachedApiKey = null;

    // 尝试从 localStorage 获取用户自定义的 API Key
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const trimmedStored = stored.trim();
        if (trimmedStored.startsWith('sk-')) {
          this.cachedApiKey = trimmedStored;
          return this.cachedApiKey;
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      // 忽略读取错误
    }

    // 使用默认的加密 API Key
    try {
      const decrypted = decodeBase64(ENCRYPTED_API_KEY);
      const trimmedKey = decrypted.trim();
      if (!trimmedKey || trimmedKey.length === 0) {
        throw new Error('解密后的 API Key 为空');
      }
      if (!trimmedKey.startsWith('sk-')) {
        throw new Error('解密后的 API Key 格式不正确');
      }
      
      this.cachedApiKey = trimmedKey;
      return this.cachedApiKey;
    } catch (error) {
      throw new Error('无法获取 API Key');
    }
  }

  /**
   * 保存用户自定义的 API Key
   * @param apiKey API Key
   */
  saveApiKey(apiKey: string): void {
    try {
      localStorage.setItem(STORAGE_KEY, apiKey);
      this.cachedApiKey = apiKey;
    } catch (error) {
      throw new Error('保存 API Key 失败，请检查浏览器存储权限');
    }
  }

  /**
   * 检查是否有 API Key
   * @returns 是否有 API Key
   */
  hasApiKey(): boolean {
    try {
      return !!localStorage.getItem(STORAGE_KEY) || !!ENCRYPTED_API_KEY;
    } catch (error) {
      return false;
    }
  }

  /**
   * 清除 API Key（包括缓存和存储）
   */
  clearApiKey(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      this.cachedApiKey = null;
    } catch (error) {
      // 忽略清除错误
    }
  }
}

export const apiKeyService = new ApiKeyService();

