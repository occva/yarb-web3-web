import React from 'react';
import YearNavigation from './components/YearNavigation';
import ArticleList from './components/ArticleList';
import ArticleContent from './components/ArticleContent';
import { useAppState } from './hooks/useAppState';
import { useMobileDetection } from './hooks/useMobileDetection';
import './App.css';

const App: React.FC = () => {
  const { state, actions } = useAppState();
  const isMobile = useMobileDetection();

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
        {isMobile ? (
          // 移动端布局：根据当前状态显示列表或内容
          state.currentArticle ? (
            <ArticleContent
              content={state.articleContent}
              title={formatArticleTitle(state.currentArticle)}
              loading={state.loading.content}
              error={state.error.content}
              isMobile={true}
              onBack={() => actions.selectArticle(null)} // 返回列表
              articleDate={state.currentArticle?.date}
            />
          ) : (
            <ArticleList
              articles={state.articles}
              currentArticle={state.currentArticle?.path || null}
              onArticleSelect={actions.selectArticle}
              loading={state.loading.articles}
              year={state.currentYear}
              isMobile={true}
            />
          )
        ) : (
          // PC端布局：保持原有样式
          <div className="content-grid">
            <aside className="sidebar">
              <ArticleList
                articles={state.articles}
                currentArticle={state.currentArticle?.path || null}
                onArticleSelect={actions.selectArticle}
                loading={state.loading.articles}
                year={state.currentYear}
                isMobile={false}
              />
            </aside>
            
            <section className="content-area">
              <ArticleContent
                content={state.articleContent}
                title={formatArticleTitle(state.currentArticle)}
                loading={state.loading.content}
                error={state.error.content}
                isMobile={false}
              />
            </section>
          </div>
        )}
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
