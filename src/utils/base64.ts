// Base64 工具函数

/**
 * Base64 解密
 * @param encoded Base64 编码的字符串
 * @returns 解密后的字符串
 */
export const decodeBase64 = (encoded: string): string => {
  try {
    return atob(encoded);
  } catch (error) {
    console.error('Base64 解密失败:', error);
    throw new Error('Base64 解密失败');
  }
};

/**
 * Base64 加密
 * @param text 原始字符串
 * @returns Base64 编码的字符串
 */
export const encodeBase64 = (text: string): string => {
  try {
    return btoa(text);
  } catch (error) {
    console.error('Base64 加密失败:', error);
    throw new Error('Base64 加密失败');
  }
};

