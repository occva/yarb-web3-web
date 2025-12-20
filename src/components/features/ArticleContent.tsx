import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Globe, RotateCcw, Copy, AlertTriangle, BookOpen, ChevronLeft, Loader2 } from 'lucide-react';
import { ArticleContentProps } from '../../types';
import { formatDate, fixMarkdownLinks } from '../../utils';
import { translateContentStream } from '../../services/translationService';
import Toast from '../ui/Toast';
import './ArticleContent.css';

const ArticleContent: React.FC<ArticleContentProps> = ({
  content,
  title,
  loading = false,
  error = null,
  isMobile = false,
  onBack,
  articleDate
}) => {
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [isShowingTranslation, setIsShowingTranslation] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 当内容变化时，清理翻译状态并中断正在进行的翻译
  useEffect(() => {
    // 中断正在进行的翻译
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // 清理所有翻译相关状态
    setIsTranslating(false);
    setTranslatedContent(null);
    setIsShowingTranslation(false);
    setTranslationError(null);
    setToastMessage(null);
  }, [content]);

  // 处理复制内容
  const handleCopyContent = useCallback(async () => {
    try {
      const textToCopy = isShowingTranslation && translatedContent ? translatedContent : content;
      if (!textToCopy) {
        setToastMessage('没有可复制的内容');
        return;
      }
      await navigator.clipboard.writeText(textToCopy);
      setToastMessage('文章内容已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      setToastMessage('复制失败，请稍后重试');
    }
  }, [content, translatedContent, isShowingTranslation]);

  // 处理翻译
  const handleTranslate = useCallback(async () => {
    // 如果已经有翻译内容，切换显示原文/翻译
    if (translatedContent) {
      setIsShowingTranslation(!isShowingTranslation);
      return;
    }

    // 获取当前显示的内容（可能是原文，也可能是之前的翻译）
    const currentContent = isShowingTranslation && translatedContent 
      ? translatedContent 
      : content;

    // 中断之前的翻译（如果存在）
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 创建新的AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // 开始翻译
    setIsTranslating(true);
    setTranslationError(null);
    setTranslatedContent(''); // 清空之前的翻译内容
    setIsShowingTranslation(true); // 立即切换到翻译视图
    const startTime = Date.now();
    let accumulatedContent = '';

    try {
      // 使用流式翻译
      await translateContentStream(
        currentContent,
        {
          signal: abortController.signal,
          onChunk: (chunk: string) => {
            // 检查是否已取消
            if (abortController.signal.aborted) {
              return;
            }
            // 累积内容并立即更新显示
            accumulatedContent += chunk;
            setTranslatedContent(accumulatedContent);
          },
          onComplete: () => {
            // 检查是否已取消
            if (abortController.signal.aborted) {
              return;
            }
            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            
            // 确保最终内容被设置（防止最后的数据块丢失）
            if (accumulatedContent.trim().length > 0) {
              setTranslatedContent(accumulatedContent.trim());
              setToastMessage(`翻译完成，翻译用时${duration}秒`);
            }
            
            setIsTranslating(false);
            setTranslationError(null);
            abortControllerRef.current = null;
          },
          onError: (error: Error) => {
            // 如果是取消操作，不显示错误
            if (error.message === '翻译已取消' || abortController.signal.aborted) {
              setIsTranslating(false);
              setTranslatedContent(null);
              setIsShowingTranslation(false);
              setTranslationError(null);
              abortControllerRef.current = null;
              return;
            }
            const errorMessage = error.message || '翻译失败，请稍后重试';
            setTranslationError(errorMessage);
            setIsShowingTranslation(false);
            setIsTranslating(false);
            setTranslatedContent(null);
            abortControllerRef.current = null;
            setToastMessage(errorMessage);
          },
        },
        '中文'
      );
    } catch (error) {
      // 如果是取消操作，不显示错误
      if (error instanceof Error && (error.message === '翻译已取消' || abortController.signal.aborted)) {
        setIsTranslating(false);
        setTranslatedContent(null);
        setIsShowingTranslation(false);
        setTranslationError(null);
        abortControllerRef.current = null;
        return;
      }
      const errorMessage = error instanceof Error ? error.message : '翻译失败，请稍后重试';
      setTranslationError(errorMessage);
      setIsShowingTranslation(false);
      setIsTranslating(false);
      setTranslatedContent(null);
      abortControllerRef.current = null;
      setToastMessage(errorMessage);
    }
  }, [content, translatedContent, isShowingTranslation]);

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
          <div className="error-icon">
            <AlertTriangle size={48} />
          </div>
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
          <div className="empty-icon">
            <BookOpen size={48} />
          </div>
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
            aria-label="返回文章列表"
          >
            <ChevronLeft size={16} className="back-icon" /> 返回
          </button>
        )}
        {isMobile ? (
          <div className="mobile-title-section">
            {articleDate ? (
              <span className="mobile-date">{formatDate(articleDate, true)}</span>
            ) : (
              <h2 className="mobile-title">{title}</h2>
            )}
          </div>
        ) : (
          <h2>{title}</h2>
        )}
        <div className="content-actions">
          <button 
            className={`action-button ${isShowingTranslation ? 'active' : ''} ${isTranslating ? 'translating' : ''}`}
            onClick={handleTranslate}
            title={
              isTranslating 
                ? '翻译中...' 
                : translatedContent 
                  ? (isShowingTranslation ? '显示原文' : '显示翻译')
                  : '翻译文章'
            }
            aria-label={
              isTranslating 
                ? '翻译中...' 
                : translatedContent 
                  ? (isShowingTranslation ? '显示原文' : '显示翻译')
                  : '翻译文章'
            }
            disabled={isTranslating}
          >
            {isTranslating ? (
              <Loader2 size={18} className="spin-icon" />
            ) : translatedContent ? (
              isShowingTranslation ? <RotateCcw size={18} /> : <Globe size={18} />
            ) : (
              <Globe size={18} />
            )}
          </button>
          <button 
            className="action-button"
            onClick={handleCopyContent}
            title="复制内容"
            aria-label="复制内容"
          >
            <Copy size={18} />
          </button>
        </div>
      </div>
      <div className="content-body">
        {translationError && !isTranslating && (
          <div className="translation-error">
            <div className="error-icon">
              <AlertTriangle size={24} />
            </div>
            <h3>翻译失败</h3>
            <p>{translationError}</p>
          </div>
        )}
        {!translationError && (
          <>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
              key={`${isShowingTranslation ? 'translated' : 'original'}-${content.substring(0, 50)}`}
            >
              {isShowingTranslation && translatedContent 
                ? fixMarkdownLinks(translatedContent) 
                : content}
            </ReactMarkdown>
            {isTranslating && (
              <div className="streaming-indicator">
                <span className="streaming-dot"></span>
                <span className="streaming-text">正在翻译中...</span>
              </div>
            )}
          </>
        )}
      </div>
      {toastMessage && (
        <Toast
          message={toastMessage}
          duration={3000}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};

export default React.memo(ArticleContent);

