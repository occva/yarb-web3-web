import axios from 'axios';
import { configService } from './configService';
import { GitHubFile, Article, GitHubRepoConfig } from '../types';
import { GITHUB_API_BASE, CACHE_DURATION, PRELOAD_CONFIG, ERROR_MESSAGES } from '../constants';
import { parseDateFromFilename, parseNumberFromFilename } from '../utils';

class GitHubApiService {
  private cache = new Map<string, any>();
  private cacheTimestamps = new Map<string, number>();
  private readonly CACHE_DURATION = CACHE_DURATION;
  private preloadQueue = new Set<string>();
  private preloadCache = new Map<string, Promise<string>>();

  // 获取当前配置
  private getRepoConfig(): GitHubRepoConfig {
    return configService.getConfig().githubRepo;
  }

  // 创建axios实例，设置默认配置
  private axiosInstance = axios.create({
    baseURL: GITHUB_API_BASE,
    headers: {
      'User-Agent': 'YARB-Web3-App/1.0.0',
      'Accept': 'application/vnd.github.v3+json'
    },
    timeout: 10000 // 10秒超时
  });

  // 添加请求拦截器，处理错误
  constructor() {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 403) {
          console.warn('GitHub API 403错误，可能是请求频率限制');
        }
        return Promise.reject(error);
      }
    );
  }

  // 检查缓存是否过期
  private isCacheExpired(cacheKey: string): boolean {
    const timestamp = this.cacheTimestamps.get(cacheKey);
    if (!timestamp) return true;
    return Date.now() - timestamp > this.CACHE_DURATION;
  }

  // 设置缓存
  private setCache(cacheKey: string, data: any): void {
    this.cache.set(cacheKey, data);
    this.cacheTimestamps.set(cacheKey, Date.now());
  }

  // 获取仓库根目录结构
  async getRepoStructure(path: string = ''): Promise<GitHubFile[]> {
    const config = this.getRepoConfig();
    
    // 构建完整路径，避免多余的斜杠
    let fullPath = '';
    if (config.basePath && path) {
      fullPath = `${config.basePath}/${path}`;
    } else if (config.basePath) {
      fullPath = config.basePath;
    } else if (path) {
      fullPath = path;
    }
    
    const cacheKey = `structure_${fullPath}`;

    if (this.cache.has(cacheKey) && !this.isCacheExpired(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // 如果fullPath为空，不要添加斜杠
      const url = fullPath 
        ? `/repos/${config.owner}/${config.repo}/contents/${fullPath}?ref=${config.branch}`
        : `/repos/${config.owner}/${config.repo}/contents?ref=${config.branch}`;
      
      const response = await this.axiosInstance.get<GitHubFile[]>(url);

      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error: any) {
      console.error('获取仓库结构失败:', error);
      if (error.response?.status === 404) {
        throw new Error(ERROR_MESSAGES.PATH_NOT_FOUND(fullPath));
      } else if (error.response?.status === 403) {
        throw new Error(ERROR_MESSAGES.API_LIMITED);
      }
      throw new Error(ERROR_MESSAGES.REPO_STRUCTURE_FAILED);
    }
  }

  // 获取年份文件夹列表
  async getYearFolders(): Promise<string[]> {
    const config = this.getRepoConfig();
    const cacheKey = `yearFolders_${config.owner}_${config.repo}_${config.basePath}`;

    if (this.cache.has(cacheKey) && !this.isCacheExpired(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // 如果有选中的文件夹，直接返回
      if (config.selectedFolders.length > 0) {
        this.setCache(cacheKey, config.selectedFolders);
        return config.selectedFolders;
      }

      // 否则获取所有文件夹
      const files = await this.getRepoStructure();
      const yearFolders = files
        .filter(item => item.type === 'dir')
        .map(item => item.name)
        .sort();

      this.setCache(cacheKey, yearFolders);
      return yearFolders;
    } catch (error: any) {
      console.error('获取年份文件夹失败:', error);

      // 如果是403错误，提供降级处理
      if (error.response?.status === 403) {
        console.warn('GitHub API访问受限，使用默认年份列表');
        const defaultYears = ['2025', '2024', '2023', '2022'];
        this.setCache(cacheKey, defaultYears);
        return defaultYears;
      }

      throw new Error(ERROR_MESSAGES.YEAR_FOLDERS_FAILED);
    }
  }

  // 获取指定年份的文章列表
  async getArticlesByYear(year: string): Promise<Article[]> {
    const config = this.getRepoConfig();
    const cacheKey = `articles_${config.owner}_${config.repo}_${year}`;

    if (this.cache.has(cacheKey) && !this.isCacheExpired(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // 构建完整路径，避免多余的斜杠
      let fullPath = '';
      if (config.basePath) {
        fullPath = `${config.basePath}/${year}`;
      } else {
        fullPath = year;
      }
      
      const response = await this.axiosInstance.get<GitHubFile[]>(
        `/repos/${config.owner}/${config.repo}/contents/${fullPath}?ref=${config.branch}`
      );

      const articles = response.data
        .filter(item => item.type === 'file' && item.name.endsWith('.md'))
        .map(item => {
          const date = parseDateFromFilename(item.name);
          const number = parseNumberFromFilename(item.name);
          return {
            name: item.name,
            path: item.path,
            downloadUrl: item.download_url || '',
            size: item.size,
            date: date || undefined,
            number: number || undefined
          };
        })
        .sort((a, b) => {
          // 优先按日期倒序排列（最新的在前）
          if (a.date && b.date) {
            return b.date.getTime() - a.date.getTime();
          }

          // 如果只有一个有日期，有日期的排在前面
          if (a.date && !b.date) return -1;
          if (!a.date && b.date) return 1;

          // 如果都没有日期，按序号倒序排列（大序号在前）
          if (a.number !== undefined && b.number !== undefined) {
            return b.number - a.number;
          }

          // 如果只有一个有序号，有序号的排在前面
          if (a.number !== undefined && b.number === undefined) return -1;
          if (a.number === undefined && b.number !== undefined) return 1;

          // 如果都没有日期和序号，按文件名倒序排序
          return b.name.localeCompare(a.name);
        });

      this.setCache(cacheKey, articles);
      return articles;
    } catch (error: any) {
      console.error(`获取 ${year} 年文章列表失败:`, error);

      if (error.response?.status === 404) {
        console.warn(`${year} 年文件夹不存在`);
        return [];
      } else if (error.response?.status === 403) {
        console.warn(`GitHub API访问受限，${year}年文章列表为空`);
        return [];
      }

      throw new Error(ERROR_MESSAGES.ARTICLES_FAILED(year));
    }
  }

  // 获取文章内容
  async getArticleContent(downloadUrl: string): Promise<string> {
    const cacheKey = `content_${downloadUrl}`;
    if (this.cache.has(cacheKey) && !this.isCacheExpired(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // 检查是否正在预加载
    if (this.preloadCache.has(downloadUrl)) {
      return this.preloadCache.get(downloadUrl)!;
    }

    try {
      const response = await this.axiosInstance.get(downloadUrl);
      const content = response.data;

      this.setCache(cacheKey, content);
      return content;
    } catch (error: any) {
      console.error('获取文章内容失败:', error);

      // 如果是403错误，提供降级处理
      if (error.response?.status === 403) {
        console.warn('GitHub API访问受限，返回默认内容');
        return '## 文章内容暂时无法加载\n\n由于GitHub API访问限制，文章内容暂时无法显示。请稍后再试。';
      }

      throw new Error(ERROR_MESSAGES.ARTICLE_CONTENT_FAILED);
    }
  }

  // 预加载文章内容
  async preloadArticleContent(downloadUrl: string): Promise<void> {
    if (this.preloadQueue.has(downloadUrl) || this.cache.has(`content_${downloadUrl}`)) {
      return;
    }

    this.preloadQueue.add(downloadUrl);

    const preloadPromise = this.axiosInstance.get(downloadUrl)
      .then(response => {
        const content = response.data;
        this.setCache(`content_${downloadUrl}`, content);
        this.preloadQueue.delete(downloadUrl);
        this.preloadCache.delete(downloadUrl);
        return content;
      })
      .catch(error => {
        console.warn('预加载文章内容失败:', error);
        this.preloadQueue.delete(downloadUrl);
        this.preloadCache.delete(downloadUrl);
        throw error;
      });

    this.preloadCache.set(downloadUrl, preloadPromise);
  }

  // 批量预加载文章内容
  async preloadArticles(articles: Article[], currentIndex: number, preloadCount: number = PRELOAD_CONFIG.ARTICLE_COUNT): Promise<void> {
    const preloadPromises: Promise<void>[] = [];

    // 预加载当前文章前后的文章
    for (let i = Math.max(0, currentIndex - preloadCount);
      i <= Math.min(articles.length - 1, currentIndex + preloadCount);
      i++) {
      if (i !== currentIndex && articles[i]) {
        preloadPromises.push(this.preloadArticleContent(articles[i].downloadUrl));
      }
    }

    // 并行预加载，不等待结果
    Promise.allSettled(preloadPromises).catch(error => {
      console.warn('批量预加载失败:', error);
    });
  }

  // 获取当前年份
  getCurrentYear(): string {
    return new Date().getFullYear().toString();
  }

  // 从年份列表中获取最新年份
  getLatestYear(years: string[]): string {
    if (years.length === 0) return this.getCurrentYear();

    // 尝试解析为数字并找到最大值
    const numericYears = years
      .map(year => parseInt(year))
      .filter(year => !isNaN(year));

    if (numericYears.length > 0) {
      return Math.max(...numericYears).toString();
    }

    // 如果无法解析为数字，按字符串排序取最后一个
    return years.sort().pop() || this.getCurrentYear();
  }

  // 根据当前日期查找文章
  findArticleByCurrentDate(articles: Article[]): Article | null {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD格式

    // 查找今天的文章
    for (const article of articles) {
      if (article.date) {
        const articleDateStr = article.date.toISOString().split('T')[0];
        if (articleDateStr === todayStr) {
          return article;
        }
      }
    }

    // 如果没找到今天的，找最近的文章
    const articlesWithDate = articles.filter(article => article.date);
    if (articlesWithDate.length > 0) {
      return articlesWithDate[0]; // 已经按日期倒序排列，第一个就是最新的
    }

    return null;
  }

  // 获取所有可用的文件夹（用于设置页面）
  async getAllFolders(): Promise<GitHubFile[]> {
    try {
      const files = await this.getRepoStructure();
      return files.filter(item => item.type === 'dir');
    } catch (error) {
      console.error('获取文件夹列表失败:', error);
      return [];
    }
  }

  // 测试仓库连接
  async testRepoConnection(config: GitHubRepoConfig): Promise<boolean> {
    try {
      // 构建测试URL，避免多余的斜杠
      const url = config.basePath 
        ? `/repos/${config.owner}/${config.repo}/contents/${config.basePath}?ref=${config.branch}`
        : `/repos/${config.owner}/${config.repo}/contents?ref=${config.branch}`;
      
      await this.axiosInstance.get(url);
      return true;
    } catch (error) {
      console.error('测试仓库连接失败:', error);
      return false;
    }
  }

  // 强制刷新缓存
  forceRefresh(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  // 清除缓存
  clearCache(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }
}

export const githubApi = new GitHubApiService();
