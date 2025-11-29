// 应用常量配置

// GitHub API 配置
export const GITHUB_API_BASE = 'https://api.github.com';

// 缓存配置
export const CACHE_DURATION = 30 * 60 * 1000; // 30分钟缓存

// 存储键名
export const STORAGE_KEYS = {
  CONFIG: 'yarb-web3-config',
} as const;

// 默认配置
export const DEFAULT_CONFIG = {
  githubRepo: {
    owner: 'dubuqingfeng',
    repo: 'yarb-web3',
    branch: 'main',
    basePath: 'archive',
    selectedFolders: [],
  },
} as const;

// 响应式断点
export const BREAKPOINTS = {
  MOBILE: 1000,
  TABLET: 1200,
  DESKTOP: 1400,
} as const;

// 虚拟滚动配置
export const VIRTUAL_SCROLL_DEFAULTS = {
  OVERSCAN: 5,
} as const;

// 预加载配置
export const PRELOAD_CONFIG = {
  ARTICLE_COUNT: 2,
} as const;

// 日期格式
export const DATE_FORMATS = {
  LOCALE: 'zh-CN',
  DISPLAY: {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  },
  DISPLAY_FULL: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  },
} as const;

// 文件名解析模式
export const FILENAME_PATTERNS = {
  DATE: [
    /(\d{4})\.(\d{1,2})\.(\d{1,2})/,  // 2025.9.9, 2025.09.09
    /(\d{4})-(\d{1,2})-(\d{1,2})/,   // 2025-9-9, 2025-09-09
    /(\d{4})(\d{2})(\d{2})/,         // 20250909
    /(\d{1,2})\.(\d{1,2})\.(\d{4})/, // 9.9.2025
    /(\d{1,2})-(\d{1,2})-(\d{4})/,   // 9-9-2025
  ],
  NUMBER: [
    /^(\d+)[.\-_\s]/,     // 01. 或 01- 或 01_ 或 01 开头
    /^第(\d+)[期章节]/,    // 第01期 或 第01章
    /^No\.?(\d+)/i,       // No.01 或 NO01
    /^#(\d+)/,            // #01
  ],
} as const;

// GitHub URL 解析模式
export const GITHUB_URL_PATTERNS = [
  /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/,
  /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)\/?$/,
  /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)\/(.+)$/,
] as const;

// 验证规则
export const VALIDATION_PATTERNS = {
  OWNER_REPO: /^[a-zA-Z0-9\-_.]+$/,
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  CONFIG_SAVE_FAILED: '配置保存失败，请检查浏览器存储权限',
  OWNER_REQUIRED: '仓库所有者不能为空',
  REPO_REQUIRED: '仓库名称不能为空',
  BRANCH_REQUIRED: '分支名称不能为空',
  OWNER_INVALID: '仓库所有者格式不正确',
  REPO_INVALID: '仓库名称格式不正确',
  PATH_NOT_FOUND: (path: string) => `路径不存在: ${path || '根目录'}`,
  API_LIMITED: 'GitHub API访问受限，请稍后再试',
  REPO_STRUCTURE_FAILED: '无法获取仓库结构',
  YEAR_FOLDERS_FAILED: '无法获取年份文件夹列表',
  ARTICLES_FAILED: (year: string) => `无法获取 ${year} 年的文章列表`,
  ARTICLE_CONTENT_FAILED: '无法获取文章内容',
  CONNECTION_TEST_FAILED: '无法连接到指定的GitHub仓库，请检查配置',
  FOLDERS_LOAD_FAILED: '获取文件夹列表失败',
} as const;

