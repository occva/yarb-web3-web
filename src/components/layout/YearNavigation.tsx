import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { YearNavigationProps } from '../../types';
import './YearNavigation.css';

const YearNavigation: React.FC<YearNavigationProps> = ({
  years,
  currentYear,
  onYearChange,
  loading = false,
  onRefresh
}) => {
  const navContentRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  // 检查是否需要显示滑动提示
  useEffect(() => {
    const checkScrollable = () => {
      if (navContentRef.current && window.innerWidth <= 768) {
        const { scrollWidth, clientWidth } = navContentRef.current;
        setShowScrollHint(scrollWidth > clientWidth);
      } else {
        setShowScrollHint(false);
      }
    };

    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, [years]);

  return (
    <nav className="year-navigation">
      <div className="nav-container">
        <div 
          className={`nav-content ${showScrollHint ? 'scrollable' : ''}`}
          ref={navContentRef}
        >
          <div className="year-buttons">
            {loading ? (
              <div className="loading-skeleton">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="skeleton-button"></div>
                ))}
              </div>
            ) : (
              years.map(year => (
                <button
                  key={year}
                  className={`year-button ${currentYear === year ? 'active' : ''}`}
                  onClick={() => onYearChange(year)}
                  disabled={loading}
                  aria-label={`选择 ${year} 年`}
                  aria-pressed={currentYear === year}
                >
                  {year}
                </button>
              ))
            )}
          </div>
          {onRefresh && (
            <button
              className="refresh-button"
              onClick={onRefresh}
              disabled={loading}
              title="刷新数据"
              aria-label="刷新数据"
            >
              <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default YearNavigation;

