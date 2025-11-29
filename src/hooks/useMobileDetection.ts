import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../constants';

export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(() => {
    // 服务端渲染兼容
    if (typeof window === 'undefined') return false;
    return window.innerWidth < BREAKPOINTS.MOBILE;
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const checkIsMobile = () => {
      // 清除之前的定时器
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // 防抖处理，避免频繁更新
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < BREAKPOINTS.MOBILE);
      }, 150);
    };

    // 初始检查
    checkIsMobile();

    // 监听窗口大小变化
    window.addEventListener('resize', checkIsMobile, { passive: true });

    // 清理事件监听器和定时器
    return () => {
      window.removeEventListener('resize', checkIsMobile);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return isMobile;
};
