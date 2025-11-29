import { useState, useMemo } from 'react';
import { VirtualScrollOptions, VirtualScrollResult } from '../types';

export const useVirtualScroll = (
  itemCount: number,
  options: VirtualScrollOptions
): VirtualScrollResult => {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  
  const [scrollTop, setScrollTop] = useState(0);

  const result = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(itemCount - 1, startIndex + visibleCount + overscan * 2);
    
    return {
      startIndex,
      endIndex,
      totalHeight: itemCount * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [scrollTop, itemCount, itemHeight, containerHeight, overscan]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return {
    ...result,
    handleScroll,
  };
};
