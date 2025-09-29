import { useState, useEffect, useCallback } from 'react';
import { githubApi, Article } from '../services/githubApi';

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

export const useAppState = () => {
  const [state, setState] = useState<AppState>({
    years: [],
    currentYear: '',
    articles: [],
    currentArticle: null,
    articleContent: '',
    loading: {
      years: false,
      articles: false,
      content: false,
    },
    error: {
      years: null,
      articles: null,
      content: null,
    },
  });

  // 加载年份列表
  const loadYears = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, years: true },
      error: { ...prev.error, years: null },
    }));

    try {
      const years = await githubApi.getYearFolders();
      const currentYear = githubApi.getCurrentYear();
      
      // 优先选择当前年份，如果不存在则选择最新年份
      const getLatestYear = (yearList: string[]): string => {
        if (yearList.length === 0) return currentYear;
        
        // 尝试解析为数字并找到最大值
        const numericYears = yearList
          .map(year => parseInt(year))
          .filter(year => !isNaN(year));
        
        if (numericYears.length > 0) {
          return Math.max(...numericYears).toString();
        }
        
        // 如果无法解析为数字，按字符串排序取最后一个
        return yearList.sort().pop() || currentYear;
      };
      
      const latestYear = getLatestYear(years);
      const defaultYear = years.includes(currentYear) ? currentYear : latestYear;
      
      setState(prev => ({
        ...prev,
        years,
        currentYear: defaultYear,
        loading: { ...prev.loading, years: false },
      }));

      // 自动加载默认年份的文章
      if (defaultYear) {
        await loadArticles(defaultYear);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, years: false },
        error: { ...prev.error, years: error instanceof Error ? error.message : '加载年份失败' },
      }));
    }
  }, []);

  // 加载指定年份的文章列表
  const loadArticles = useCallback(async (year: string) => {
    setState(prev => ({
      ...prev,
      currentYear: year,
      articles: [],
      currentArticle: null,
      articleContent: '',
      loading: { ...prev.loading, articles: true },
      error: { ...prev.error, articles: null },
    }));

    try {
      const articles = await githubApi.getArticlesByYear(year);
      setState(prev => ({
        ...prev,
        articles,
        loading: { ...prev.loading, articles: false },
      }));

      // 自动选择当前日期的文章，如果没有则选择最新的文章（第一篇，因为已经按时间/序号倒序排列）
      if (articles.length > 0) {
        const currentDateArticle = githubApi.findArticleByCurrentDate(articles);
        const articleToLoad = currentDateArticle || articles[0]; // articles[0]就是最新的文章
        await loadArticleContent(articleToLoad);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, articles: false },
        error: { ...prev.error, articles: error instanceof Error ? error.message : '加载文章列表失败' },
      }));
    }
  }, []);

  // 加载文章内容
  const loadArticleContent = useCallback(async (article: Article) => {
    setState(prev => ({
      ...prev,
      currentArticle: article,
      articleContent: '',
      loading: { ...prev.loading, content: true },
      error: { ...prev.error, content: null },
    }));

    try {
      const content = await githubApi.getArticleContent(article.downloadUrl);
      setState(prev => ({
        ...prev,
        articleContent: content,
        loading: { ...prev.loading, content: false },
      }));

      // 预加载相邻文章
      const currentIndex = state.articles.findIndex(a => a.path === article.path);
      if (currentIndex !== -1) {
        githubApi.preloadArticles(state.articles, currentIndex, 2);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, content: false },
        error: { ...prev.error, content: error instanceof Error ? error.message : '加载文章内容失败' },
      }));
    }
  }, [state.articles]);

  // 切换年份
  const changeYear = useCallback((year: string) => {
    if (year !== state.currentYear) {
      loadArticles(year);
    }
  }, [state.currentYear, loadArticles]);

  // 选择文章
  const selectArticle = useCallback((article: Article | null) => {
    if (article === null) {
      // 清除当前文章选择
      setState(prev => ({
        ...prev,
        currentArticle: null,
        articleContent: '',
      }));
    } else if (article.path !== state.currentArticle?.path) {
      loadArticleContent(article);
    }
  }, [state.currentArticle, loadArticleContent]);

  // 清除错误
  const clearError = useCallback((type: keyof AppState['error']) => {
    setState(prev => ({
      ...prev,
      error: { ...prev.error, [type]: null },
    }));
  }, []);

  // 强制刷新所有数据
  const forceRefresh = useCallback(async () => {
    githubApi.forceRefresh();
    await loadYears();
  }, [loadYears]);

  // 重试加载
  const retry = useCallback((type: 'years' | 'articles' | 'content') => {
    switch (type) {
      case 'years':
        loadYears();
        break;
      case 'articles':
        if (state.currentYear) {
          loadArticles(state.currentYear);
        }
        break;
      case 'content':
        if (state.currentArticle) {
          loadArticleContent(state.currentArticle);
        }
        break;
    }
  }, [loadYears, loadArticles, loadArticleContent, state.currentYear, state.currentArticle]);

  // 初始化加载
  useEffect(() => {
    loadYears();
  }, [loadYears]);

  return {
    state,
    actions: {
      changeYear,
      selectArticle,
      clearError,
      retry,
      forceRefresh,
      loadYears,
      loadArticles,
      loadArticleContent,
    },
  };
};
