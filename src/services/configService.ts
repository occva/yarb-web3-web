// 配置管理服务
import { GitHubRepoConfig, AppConfig } from '../types';
import { STORAGE_KEYS, DEFAULT_CONFIG, ERROR_MESSAGES } from '../constants';
import { validateConfig } from '../utils';

class ConfigService {

  // 获取配置
  getConfig(): AppConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (stored) {
        const config = JSON.parse(stored);
        // 合并默认配置，确保所有字段都存在
        return {
          ...DEFAULT_CONFIG,
          ...config,
          githubRepo: {
            ...DEFAULT_CONFIG.githubRepo,
            ...config.githubRepo
          }
        };
      }
    } catch (error) {
      console.error('读取配置失败:', error);
    }
    
    return DEFAULT_CONFIG;
  }

  // 保存配置
  saveConfig(config: AppConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch (error) {
      console.error('保存配置失败:', error);
      throw new Error(ERROR_MESSAGES.CONFIG_SAVE_FAILED);
    }
  }

  // 更新GitHub仓库配置
  updateGitHubRepo(repoConfig: Partial<GitHubRepoConfig>): void {
    const currentConfig = this.getConfig();
    const newConfig: AppConfig = {
      ...currentConfig,
      githubRepo: {
        ...currentConfig.githubRepo,
        ...repoConfig
      }
    };
    this.saveConfig(newConfig);
  }

  // 更新选中的文件夹
  updateSelectedFolders(folders: string[]): void {
    this.updateGitHubRepo({ selectedFolders: folders });
  }

  // 重置为默认配置
  resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
  }

  // 验证配置是否有效
  validateConfig(config: Partial<GitHubRepoConfig>): string[] {
    return validateConfig(config);
  }
}

export const configService = new ConfigService();
