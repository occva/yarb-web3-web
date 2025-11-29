// GitHub URL 解析工具函数

import { GITHUB_URL_PATTERNS } from '../constants';
import { GitHubRepoConfig } from '../types';

/**
 * 解析 GitHub URL 为配置对象
 * @param url GitHub 仓库 URL
 * @returns 解析出的配置对象，如果无法解析则返回 null
 */
export const parseGitHubUrl = (url: string): Partial<GitHubRepoConfig> | null => {
  try {
    for (const pattern of GITHUB_URL_PATTERNS) {
      const match = url.match(pattern);
      if (match) {
        const [, owner, repo, branch = 'main', path = ''] = match;
        return {
          owner,
          repo,
          branch,
          basePath: path || '',
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('解析GitHub URL失败:', error);
    return null;
  }
};

