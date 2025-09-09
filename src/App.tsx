import React from 'react';
import YearNavigation from './components/YearNavigation';
import ArticleList from './components/ArticleList';
import ArticleContent from './components/ArticleContent';
import { useAppState } from './hooks/useAppState';
import './App.css';

const App: React.FC = () => {
  const { state, actions } = useAppState();

  // 格式化文章标题用于显示
  const formatArticleTitle = (article: any): string => {
    if (!article) return '文章内容';
    return article.name
      .replace(/\.md$/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l: string) => l.toUpperCase());
  };

  return (
    <div className="app">
      <YearNavigation
        years={state.years}
        currentYear={state.currentYear}
        onYearChange={actions.changeYear}
        loading={state.loading.years}
        onRefresh={actions.forceRefresh}
      />
      
      <main className="main-content">
        <div className="content-grid">
          <aside className="sidebar">
            <ArticleList
              articles={state.articles}
              currentArticle={state.currentArticle?.path || null}
              onArticleSelect={actions.selectArticle}
              loading={state.loading.articles}
              year={state.currentYear}
            />
          </aside>
          
          <section className="content-area">
            <ArticleContent
              content={state.articleContent}
              title={formatArticleTitle(state.currentArticle)}
              loading={state.loading.content}
              error={state.error.content}
            />
          </section>
        </div>
      </main>

      {/* 全局错误提示 */}
      {(state.error.years || state.error.articles) && (
        <div className="error-banner">
          <div className="error-content">
            <span className="error-message">
              {state.error.years || state.error.articles}
            </span>
            <button 
              className="retry-button"
              onClick={() => {
                if (state.error.years) {
                  actions.retry('years');
                } else if (state.error.articles) {
                  actions.retry('articles');
                }
              }}
            >
              重试
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
