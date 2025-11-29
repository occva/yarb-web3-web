// 文件名解析工具函数

import { FILENAME_PATTERNS } from '../constants';

/**
 * 从文件名解析日期
 * @param filename 文件名
 * @returns 解析出的日期对象，如果无法解析则返回 null
 */
export const parseDateFromFilename = (filename: string): Date | null => {
  for (const pattern of FILENAME_PATTERNS.DATE) {
    const match = filename.match(pattern);
    if (match) {
      let year: string, month: string, day: string;

      if (pattern === FILENAME_PATTERNS.DATE[0] || pattern === FILENAME_PATTERNS.DATE[1]) {
        // 2025.9.9 或 2025-9-9 格式
        [, year, month, day] = match;
      } else if (pattern === FILENAME_PATTERNS.DATE[2]) {
        // 20250909 格式
        const fullMatch = match[1];
        year = fullMatch.substring(0, 4);
        month = fullMatch.substring(4, 6);
        day = fullMatch.substring(6, 8);
      } else {
        // 9.9.2025 或 9-9-2025 格式
        [, day, month, year] = match;
      }

      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  return null;
};

/**
 * 从文件名解析序号
 * @param filename 文件名
 * @returns 解析出的序号，如果无法解析则返回 null
 */
export const parseNumberFromFilename = (filename: string): number | null => {
  for (const pattern of FILENAME_PATTERNS.NUMBER) {
    const match = filename.match(pattern);
    if (match) {
      const num = parseInt(match[1]);
      if (!isNaN(num)) {
        return num;
      }
    }
  }

  return null;
};

