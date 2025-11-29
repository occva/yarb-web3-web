// 应用类型定义

// GitHub API 相关类型
export interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size: number;
  download_url?: string | null;
  sha: string;
  url: string;
}

// 文章类型
export interface Article {
  name: string;
  path: string;
  downloadUrl: string;
  size: number;
  date?: Date;
  number?: number;
}

// GitHub 仓库配置
export interface GitHubRepoConfig {
  owner: string;
  repo: string;
  branch: string;
  basePath: string;
  selectedFolders: string[];
}

// 应用配置
export interface AppConfig {
  githubRepo: GitHubRepoConfig;
}

// 应用状态
export interface AppState {
  years: string[];
  currentYear: string;
  articles: Article[];
  currentArticle: Article | null;
  articleContent: string;
  loading: {
    years: boolean;
    articles: boolean;
    content: boolean;
  };
  error: {
    years: string | null;
    articles: string | null;
    content: string | null;
  };
}

// 组件 Props 类型
export interface YearNavigationProps {
  years: string[];
  currentYear: string;
  onYearChange: (year: string) => void;
  loading?: boolean;
  onRefresh?: () => void;
}

export interface ArticleListProps {
  articles: Article[];
  currentArticle: string | null;
  onArticleSelect: (article: Article | null) => void;
  loading?: boolean;
  year: string;
  isMobile?: boolean;
}

export interface ArticleContentProps {
  content: string;
  title: string;
  loading?: boolean;
  error?: string | null;
  isMobile?: boolean;
  onBack?: () => void;
  articleDate?: Date;
}

export interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChange: () => void;
}

export interface SettingsButtonProps {
  onClick: () => void;
}

export interface BackToTopProps {
  threshold?: number;
  targetSelector?: string;
  alwaysVisible?: boolean;
}

// 虚拟滚动相关类型
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export interface VirtualScrollResult {
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  offsetY: number;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

