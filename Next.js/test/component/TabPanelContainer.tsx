"use client";

import { useState, useRef, useEffect } from 'react';
import { TabConfig } from '@/types/ui-ux';

interface TabPanelContainerProps {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  tabs: TabConfig[];
  defaultActiveIndex?: number;
  onTabChange?: (index: number) => void;
}

/**
 * 탭 기반 패널 전환을 관리하는 컨테이너 컴포넌트
 * 
 * @example
 * <TabPanelContainer
 *   position="top-left"
 *   tabs={[
 *     { id: 'road', label: '도로명', content: <TwinRoadPanel /> },
 *     { id: 'traffic', label: '소통정보', content: <TimeFilterPanel /> },
 *   ]}
 *   defaultActiveIndex={0}
 * />
 */
export default function TabPanelContainer({
  position,
  tabs,
  defaultActiveIndex = 0,
  onTabChange,
}: TabPanelContainerProps) {
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // 위치에 따른 스타일
  const positionStyles: Record<typeof position, React.CSSProperties> = {
    'top-left': { top: '1rem', left: '1rem' },
    'top-right': { top: '1rem', right: '1rem' },
    'bottom-left': { bottom: '1rem', left: '1rem' },
    'bottom-right': { bottom: '1rem', right: '1rem' },
  };

  // 탭 변경 핸들러
  const handleTabClick = (index: number) => {
    setActiveIndex(index);
    onTabChange?.(index);
    
    // 포커스를 패널로 이동
    setTimeout(() => {
      panelRef.current?.focus();
    }, 0);
  };

  // 키보드 네비게이션
  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    let newIndex = index;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = index > 0 ? index - 1 : tabs.length - 1;
        break;
      case 'ArrowRight':
        event.preventDefault();
        newIndex = index < tabs.length - 1 ? index + 1 : 0;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    setActiveIndex(newIndex);
    onTabChange?.(newIndex);
    tabRefs.current[newIndex]?.focus();
  };

  // 초기 포커스 설정
  useEffect(() => {
    if (tabRefs.current[activeIndex]) {
      tabRefs.current[activeIndex]?.focus();
    }
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        ...positionStyles[position],
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        maxWidth: '400px',
      }}
    >
      {/* 탭 목록 */}
      <div
        role="tablist"
        aria-label="패널 탭"
        style={{
          display: 'flex',
          gap: '0.25rem',
          background: 'rgba(10, 14, 26, 0.92)',
          borderRadius: '10px',
          padding: '0.25rem',
          border: '1px solid rgba(56,189,248,0.2)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[index] = el; }}
            role="tab"
            aria-selected={activeIndex === index}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={activeIndex === index ? 0 : -1}
            onClick={() => handleTabClick(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            aria-label={tab.ariaLabel || tab.label}
            style={{
              flex: 1,
              minWidth: '44px',
              minHeight: '44px',
              padding: '0.5rem 1rem',
              background:
                activeIndex === index
                  ? 'rgba(56,189,248,0.2)'
                  : 'transparent',
              color: activeIndex === index ? '#38bdf8' : '#8b90a7',
              border:
                activeIndex === index
                  ? '1px solid rgba(56,189,248,0.5)'
                  : '1px solid transparent',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: activeIndex === index ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
            }}
            onMouseEnter={(e) => {
              if (activeIndex !== index) {
                e.currentTarget.style.background = 'rgba(56,189,248,0.1)';
                e.currentTarget.style.color = '#e8eaf0';
              }
            }}
            onMouseLeave={(e) => {
              if (activeIndex !== index) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#8b90a7';
              }
            }}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 활성 패널 */}
      <div
        ref={panelRef}
        role="tabpanel"
        id={`panel-${tabs[activeIndex].id}`}
        aria-labelledby={`tab-${tabs[activeIndex].id}`}
        tabIndex={0}
        style={{
          outline: 'none',
        }}
      >
        {tabs[activeIndex].content}
      </div>
    </div>
  );
}
