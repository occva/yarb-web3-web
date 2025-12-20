import React, { useMemo, useCallback } from 'react';
import { Book, FileText, Calendar, Loader2 } from 'lucide-react';
import { ArticleListProps } from '../../types';
import { formatArticleTitle, formatDate } from '../../utils';
import './ArticleList.css';

const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  currentArticle,
  onArticleSelect,
  loading = false,
  year,
  isMobile = false
}) => {
  // 处理文章点击
  const handleArticleClick = useCallback((article: any) => {
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
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleArticleClick(article);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`查看文章: ${formatArticleTitle(article.name)}`}
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
                <Calendar size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
                {formatDate(article.date)}
              </p>
            )}
          </div>
        )}
      </div>
    ));
  }, [articles, currentArticle, isMobile, handleArticleClick]);


  if (loading) {
    return (
      <div className="article-list">
        <div className="list-header">
          <h2>{year} 年文章</h2>
          <div className="loading-indicator">
            <Loader2 size={16} className="spin-icon" />
            <span>加载中...</span>
          </div>
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
          <div className="empty-icon">
            <FileText size={48} />
          </div>
          <p>该年份暂无文章</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`article-list ${isMobile ? 'mobile' : ''}`}>
      <div className="list-header">
        <div className="header-icon">
          <Book size={24} />
        </div>
        <h2>YARB Web3</h2>
      </div>
      <div className="article-items">
        {articleItems}
      </div>
    </div>
  );
};

export default ArticleList;

