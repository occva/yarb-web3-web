import React, { useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ArticleContent.css';

interface ArticleContentProps {
  content: string;
  title: string;
  loading?: boolean;
  error?: string | null;
  isMobile?: boolean;
  onBack?: () => void;
  articleDate?: Date;
}

const ArticleContent: React.FC<ArticleContentProps> = ({
  content,
  title,
  loading = false,
  error = null,
  isMobile = false,
  onBack,
  articleDate
}) => {
  // 格式化日期显示
  const formatDate = useCallback((date: Date): string => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }, []);

  // 处理复制内容
  const handleCopyContent = useCallback(() => {
    navigator.clipboard.writeText(content);
    // 简单的提示，实际项目中可以用更好的提示组件
    alert('文章内容已复制到剪贴板');
  }, [content]);

  // 处理打印
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // 使用useMemo缓存markdown组件配置
  const markdownComponents = useMemo(() => ({
    // 自定义代码块样式
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <pre className="code-block">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      ) : (
        <code className="inline-code" {...props}>
          {children}
        </code>
      );
    },
    // 自定义表格样式
    table: ({ children }: any) => (
      <div className="table-wrapper">
        <table className="markdown-table">{children}</table>
      </div>
    ),
    // 自定义链接样式
    a: ({ href, children }: any) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="markdown-link"
      >
        {children}
      </a>
    ),
    // 自定义图片样式
    img: ({ src, alt }: any) => (
      <img 
        src={src} 
        alt={alt} 
        className="markdown-image"
        loading="lazy"
      />
    )
  }), []);

  if (loading) {
    return (
      <div className="article-content">
        <div className="content-header">
          <h2>文章内容</h2>
        </div>
        <div className="content-skeleton">
          <div className="skeleton-line skeleton-title-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line skeleton-short"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line skeleton-short"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line skeleton-short"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="article-content">
        <div className="content-header">
          <h2>文章内容</h2>
        </div>
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>加载失败</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="article-content">
        <div className="content-header">
          <h2>文章内容</h2>
        </div>
        <div className="empty-content">
          <div className="empty-icon">📖</div>
          <p>请选择一篇文章查看内容</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`article-content ${isMobile ? 'mobile' : ''}`}>
      <div className="content-header">
        {isMobile && onBack && (
          <button 
            className="back-button"
            onClick={onBack}
            title="返回文章列表"
          >
            ← 返回
          </button>
        )}
        {isMobile ? (
          <div className="mobile-title-section">
            {articleDate ? (
              <span className="mobile-date">{formatDate(articleDate)}</span>
            ) : (
              <h2 className="mobile-title">{title}</h2>
            )}
          </div>
        ) : (
          <h2>{title}</h2>
        )}
        <div className="content-actions">
          <button 
            className="action-button"
            onClick={handlePrint}
            title="打印文章"
          >
            🖨️
          </button>
          <button 
            className="action-button"
            onClick={handleCopyContent}
            title="复制内容"
          >
            📋
          </button>
        </div>
      </div>
      <div className="content-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default React.memo(ArticleContent);
