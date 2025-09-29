import React, { useEffect, useRef, useState } from 'react';
import './YearNavigation.css';

interface YearNavigationProps {
  years: string[];
  currentYear: string;
  onYearChange: (year: string) => void;
  loading?: boolean;
  onRefresh?: () => void;
}

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
            >
              🔄
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default YearNavigation;
