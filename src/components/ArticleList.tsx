import React, { useMemo, useCallback } from 'react';
import { Article } from '../services/githubApi';
import './ArticleList.css';

interface ArticleListProps {
  articles: Article[];
  currentArticle: string | null;
  onArticleSelect: (article: Article | null) => void;
  loading?: boolean;
  year: string;
  isMobile?: boolean;
}

const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  currentArticle,
  onArticleSelect,
  loading = false,
  year,
  isMobile = false
}) => {
  // 格式化文章标题（移除 .md 后缀，美化显示）
  const formatArticleTitle = useCallback((name: string): string => {
    return name
      .replace(/\.md$/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }, []);

  // 格式化日期显示
  const formatDate = useCallback((date: Date): string => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  }, []);

  // 处理文章点击
  const handleArticleClick = useCallback((article: Article) => {
    onArticleSelect(article);
  }, [onArticleSelect]);

  // 使用useMemo缓存文章列表渲染
  const articleItems = useMemo(() => {
    return articles.map((article) => (
      <div
        key={article.path}
        className={`article-item ${
          currentArticle === article.path ? 'active' : ''
        }`}
        onClick={() => handleArticleClick(article)}
      >
        {isMobile ? (
          // 移动端紧凑布局：标题和日期在同一行
          <div className="article-info-mobile">
            <div className="article-main">
              <h3 className="article-title">
                {formatArticleTitle(article.name)}
              </h3>
              {article.date && (
                <span className="article-date">
                  {formatDate(article.date)}
                </span>
              )}
            </div>
          </div>
        ) : (
          // PC端原有布局
          <div className="article-info">
            <h3 className="article-title">
              {formatArticleTitle(article.name)}
            </h3>
            {article.date && (
              <p className="article-date">
                {formatDate(article.date)}
              </p>
            )}
          </div>
        )}
      </div>
    ));
  }, [articles, currentArticle, isMobile, formatArticleTitle, formatDate, handleArticleClick]);


  if (loading) {
    return (
      <div className="article-list">
        <div className="list-header">
          <h2>{year} 年文章</h2>
          <div className="loading-indicator">加载中...</div>
        </div>
        <div className="article-skeleton-list">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="article-skeleton-item">
              <div className="skeleton-title"></div>
              <div className="skeleton-size"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="article-list">
        <div className="list-header">
          <h2>{year} 年文章</h2>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <p>该年份暂无文章</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`article-list ${isMobile ? 'mobile' : ''}`}>
      <div className="list-header">
        <div className="header-icon">📚</div>
        <h2>YARB Web3</h2>
      </div>
      <div className="article-items">
        {articleItems}
      </div>
    </div>
  );
};

export default React.memo(ArticleList);
