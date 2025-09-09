import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ArticleContent.css';

interface ArticleContentProps {
  content: string;
  title: string;
  loading?: boolean;
  error?: string | null;
}

const ArticleContent: React.FC<ArticleContentProps> = ({
  content,
  title,
  loading = false,
  error = null
}) => {
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
    <div className="article-content">
      <div className="content-header">
        <h2>{title}</h2>
        <div className="content-actions">
          <button 
            className="action-button"
            onClick={() => window.print()}
            title="打印文章"
          >
            🖨️
          </button>
          <button 
            className="action-button"
            onClick={() => {
              navigator.clipboard.writeText(content);
              // 简单的提示，实际项目中可以用更好的提示组件
              alert('文章内容已复制到剪贴板');
            }}
            title="复制内容"
          >
            📋
          </button>
        </div>
      </div>
      <div className="content-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // 自定义代码块样式
            code: ({ node, inline, className, children, ...props }) => {
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
            table: ({ children }) => (
              <div className="table-wrapper">
                <table className="markdown-table">{children}</table>
              </div>
            ),
            // 自定义链接样式
            a: ({ href, children }) => (
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
            img: ({ src, alt }) => (
              <img 
                src={src} 
                alt={alt} 
                className="markdown-image"
                loading="lazy"
              />
            )
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default ArticleContent;
