// 配置管理服务
export interface GitHubRepoConfig {
  owner: string;
  repo: string;
  branch: string;
  basePath: string;
  selectedFolders: string[];
}

export interface AppConfig {
  githubRepo: GitHubRepoConfig;
}

class ConfigService {
  private readonly STORAGE_KEY = 'yarb-web3-config';
  
  // 默认配置
  private defaultConfig: AppConfig = {
    githubRepo: {
      owner: 'dubuqingfeng',
      repo: 'yarb-web3',
      branch: 'main',
      basePath: 'archive',
      selectedFolders: []
    }
  };

  // 解析GitHub URL
  parseGitHubUrl(url: string): Partial<GitHubRepoConfig> | null {
    try {
      // 支持多种GitHub URL格式
      const patterns = [
        // https://github.com/owner/repo
        /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/,
        // https://github.com/owner/repo/tree/branch
        /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)\/?$/,
        // https://github.com/owner/repo/tree/branch/path/to/folder
        /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)\/(.+)$/,
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          const [, owner, repo, branch = 'main', path = ''] = match;
          return {
            owner,
            repo,
            branch,
            basePath: path || ''
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('解析GitHub URL失败:', error);
      return null;
    }
  }

  // 获取配置
  getConfig(): AppConfig {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored);
        // 合并默认配置，确保所有字段都存在
        return {
          ...this.defaultConfig,
          ...config,
          githubRepo: {
            ...this.defaultConfig.githubRepo,
            ...config.githubRepo
          }
        };
      }
    } catch (error) {
      console.error('读取配置失败:', error);
    }
    
    return this.defaultConfig;
  }

  // 保存配置
  saveConfig(config: AppConfig): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('保存配置失败:', error);
      throw new Error('配置保存失败，请检查浏览器存储权限');
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
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // 验证配置是否有效
  validateConfig(config: Partial<GitHubRepoConfig>): string[] {
    const errors: string[] = [];
    
    if (!config.owner?.trim()) {
      errors.push('仓库所有者不能为空');
    }
    
    if (!config.repo?.trim()) {
      errors.push('仓库名称不能为空');
    }
    
    if (!config.branch?.trim()) {
      errors.push('分支名称不能为空');
    }
    
    // 验证owner和repo格式
    if (config.owner && !/^[a-zA-Z0-9\-_.]+$/.test(config.owner)) {
      errors.push('仓库所有者格式不正确');
    }
    
    if (config.repo && !/^[a-zA-Z0-9\-_.]+$/.test(config.repo)) {
      errors.push('仓库名称格式不正确');
    }
    
    return errors;
  }
}

export const configService = new ConfigService();