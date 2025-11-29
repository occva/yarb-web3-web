// 验证工具函数

import { VALIDATION_PATTERNS, ERROR_MESSAGES } from '../constants';
import { GitHubRepoConfig } from '../types';

/**
 * 验证 GitHub 仓库配置
 * @param config 配置对象
 * @returns 错误消息数组，如果没有错误则返回空数组
 */
export const validateConfig = (config: Partial<GitHubRepoConfig>): string[] => {
  const errors: string[] = [];
  
  if (!config.owner?.trim()) {
    errors.push(ERROR_MESSAGES.OWNER_REQUIRED);
  }
  
  if (!config.repo?.trim()) {
    errors.push(ERROR_MESSAGES.REPO_REQUIRED);
  }
  
  if (!config.branch?.trim()) {
    errors.push(ERROR_MESSAGES.BRANCH_REQUIRED);
  }
  
  // 验证owner和repo格式
  if (config.owner && !VALIDATION_PATTERNS.OWNER_REPO.test(config.owner)) {
    errors.push(ERROR_MESSAGES.OWNER_INVALID);
  }
  
  if (config.repo && !VALIDATION_PATTERNS.OWNER_REPO.test(config.repo)) {
    errors.push(ERROR_MESSAGES.REPO_INVALID);
  }
  
  return errors;
};

