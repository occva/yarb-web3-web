// 日期格式化工具函数

import { DATE_FORMATS } from '../constants';

/**
 * 格式化日期为中文显示格式
 * @param date 日期对象
 * @param fullFormat 是否使用完整格式（包含前导零）
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: Date, fullFormat: boolean = false): string => {
  const format = fullFormat ? DATE_FORMATS.DISPLAY_FULL : DATE_FORMATS.DISPLAY;
  return date.toLocaleDateString(DATE_FORMATS.LOCALE, format);
};

/**
 * 格式化文章标题（移除 .md 后缀，美化显示）
 * @param name 文件名
 * @returns 格式化后的标题
 */
export const formatArticleTitle = (name: string): string => {
  return name
    .replace(/\.md$/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l: string) => l.toUpperCase());
};

