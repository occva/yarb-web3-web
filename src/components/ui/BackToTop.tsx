import React, { useEffect, useState, useCallback } from 'react';
import { BackToTopProps } from '../../types';
import './BackToTop.css';

const BackToTop: React.FC<BackToTopProps> = ({ threshold = 200, targetSelector, alwaysVisible = false }) => {
  const [visible, setVisible] = useState(alwaysVisible);

  useEffect(() => {
    if (alwaysVisible) {
      setVisible(true);
      return;
    }
    const targetEl = targetSelector ? document.querySelector(targetSelector) : null;

    const readScrollTop = () => {
      if (targetEl instanceof HTMLElement) {
        return targetEl.scrollTop;
      }
      return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    };

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const handleScroll = () => {
      // 防抖处理，避免频繁更新状态
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        const currentTop = readScrollTop();
        setVisible(currentTop > threshold);
      }, 100);
    };

    handleScroll();

    if (targetEl instanceof HTMLElement) {
      targetEl.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        targetEl.removeEventListener('scroll', handleScroll);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [threshold, targetSelector, alwaysVisible]);

  const scrollToTop = useCallback(() => {
    try {
      const targetEl = targetSelector ? document.querySelector(targetSelector) : null;
      if (targetEl instanceof HTMLElement) {
        targetEl.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('滚动到顶部失败:', error);
      // 降级处理：直接设置 scrollTop
      const targetEl = targetSelector ? document.querySelector(targetSelector) : null;
      if (targetEl instanceof HTMLElement) {
        targetEl.scrollTop = 0;
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, [targetSelector]);

  return (
    <button
      className={`back-to-top ${visible ? 'show' : ''}`}
      onClick={scrollToTop}
      aria-label="回到顶部"
    >
      <svg 
        className="back-to-top-icon" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M18 15L12 9L6 15" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default BackToTop;

