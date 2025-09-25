import React, { useEffect, useState } from 'react';
import './BackToTop.css';

interface BackToTopProps {
  /** 显示的滚动阈值（像素） */
  threshold?: number;
  /** 可选：指定滚动容器的选择器（如 .content-body）。不传则监听 window */
  targetSelector?: string;
  /** 是否始终显示按钮（忽略滚动阈值） */
  alwaysVisible?: boolean;
}

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

    const handleScroll = () => {
      const currentTop = readScrollTop();
      setVisible(currentTop > threshold);
    };

    handleScroll();

    if (targetEl instanceof HTMLElement) {
      targetEl.addEventListener('scroll', handleScroll, { passive: true });
      return () => targetEl.removeEventListener('scroll', handleScroll);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, targetSelector, alwaysVisible]);

  const scrollToTop = () => {
    const targetEl = targetSelector ? document.querySelector(targetSelector) : null;
    if (targetEl instanceof HTMLElement) {
      targetEl.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      className={`back-to-top ${visible ? 'show' : ''}`}
      onClick={scrollToTop}
      aria-label="回到顶部"
    >
      ↑
    </button>
  );
};

export default BackToTop;


