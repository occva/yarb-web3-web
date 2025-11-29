import React, { useMemo, useState } from 'react';
import YearNavigation from './components/layout/YearNavigation';
import ArticleList from './components/features/ArticleList';
import ArticleContent from './components/features/ArticleContent';
import Settings from './components/features/Settings';
import SettingsButton from './components/ui/SettingsButton';
import BackToTop from './components/ui/BackToTop';
import { useAppState } from './hooks/useAppState';
import { useMobileDetection } from './hooks/useMobileDetection';
import { Article } from './types';
import { formatArticleTitle } from './utils';
import './styles/global-styles.css';

const App: React.FC = () => {
  const { state, actions } = useAppState();
  const isMobile = useMobileDetection();
  const [showSettings, setShowSettings] = useState(false);

  // 格式化文章标题用于显示
  const articleTitle = useMemo(() => {
    if (!state.currentArticle) return '文章内容';
    return formatArticleTitle(state.currentArticle.name);
  }, [state.currentArticle]);

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
              title={articleTitle}
              loading={state.loading.content}
              error={state.error.content}
              isMobile={true}
              onBack={() => actions.selectArticle(null)}
              articleDate={state.currentArticle?.date}
            />
          ) : (
            <ArticleList
              articles={state.articles}
              currentArticle={(state.currentArticle as Article | null)?.path ?? null}
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
                currentArticle={(state.currentArticle as Article | null)?.path ?? null}
                onArticleSelect={actions.selectArticle}
                loading={state.loading.articles}
                year={state.currentYear}
                isMobile={false}
              />
            </aside>
            
            <section className="content-area">
              <ArticleContent
                content={state.articleContent}
                title={articleTitle}
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
              aria-label="重试加载"
            >
              重试
            </button>
          </div>
        </div>
      )}
      {!isMobile && (
        <BackToTop 
          targetSelector=".content-body" 
          alwaysVisible 
          aria-label="回到顶部"
        />
      )}
      
      {/* 设置按钮 */}
      <SettingsButton onClick={() => setShowSettings(true)} />
      
      {/* 设置弹窗 */}
      <Settings 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onConfigChange={() => {
          // 配置更改后重新加载数据
          actions.forceRefresh();
        }}
      />
    </div>
  );
};

export default App;
