"use client";

import { useState, useRef, useEffect } from 'react';
import { CategoryItem } from '@/types/ui-ux';

interface CategoryFilterPanelProps {
  title: string;
  categories: CategoryItem[];
  selectedCategories: Set<string>;
  onCategoryToggle: (category: string) => void;
  onCategoryPress?: (category: string) => void;
  onCategoryRelease?: () => void;
  visibleCount?: number;
  totalCount?: number;
}

/**
 * 카테고리 필터링 UI를 제공하는 패널 컴포넌트
 * 
 * @example
 * <CategoryFilterPanel
 *   title="관광 카테고리"
 *   categories={tourismCategories}
 *   selectedCategories={selectedTourismCategories}
 *   onCategoryToggle={toggleTourismCategory}
 *   onCategoryPress={startCarousel}
 *   onCategoryRelease={stopCarousel}
 *   visibleCount={10}
 *   totalCount={50}
 * />
 */
export default function CategoryFilterPanel({
  title,
  categories,
  selectedCategories,
  onCategoryToggle,
  onCategoryPress,
  onCategoryRelease,
  visibleCount,
  totalCount,
}: CategoryFilterPanelProps) {
  const [pressedCategory, setPressedCategory] = useState<string | null>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pressStartTimeRef = useRef<number>(0);

  // 길게 누르기 시작
  const handlePressStart = (category: string) => {
    pressStartTimeRef.current = Date.now();
    setPressedCategory(category);

    // 300ms 후 자동 순환 모드 진입
    pressTimerRef.current = setTimeout(() => {
      if (onCategoryPress) {
        onCategoryPress(category);
      }
    }, 300);
  };

  // 길게 누르기 종료
  const handlePressEnd = (category: string) => {
    const pressDuration = Date.now() - pressStartTimeRef.current;

    // 타이머 정리
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }

    setPressedCategory(null);

    // 300ms 미만이면 일반 클릭으로 처리 (토글)
    if (pressDuration < 300) {
      onCategoryToggle(category);
    } else {
      // 300ms 이상이면 순환 중지
      if (onCategoryRelease) {
        onCategoryRelease();
      }
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <style jsx>{`
        .category-filter-button:not([aria-pressed="true"]):hover {
          background: rgba(56,189,248,0.1) !important;
          border-color: rgba(56,189,248,0.3) !important;
        }
      `}</style>
      <div
        style={{
          background: 'rgba(10, 14, 26, 0.92)',
          border: '1px solid rgba(56,189,248,0.2)',
          borderRadius: '12px',
          padding: '1rem',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
      {/* 헤더 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid rgba(56,189,248,0.2)',
        }}
      >
        <h3
          style={{
            color: '#38bdf8',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          {title}
        </h3>
        {visibleCount !== undefined && totalCount !== undefined && (
          <span
            style={{
              color: '#8b90a7',
              fontSize: '11px',
            }}
          >
            {visibleCount} / {totalCount}
          </span>
        )}
      </div>

      {/* 카테고리 목록 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        {categories.map((category) => {
          const isSelected = selectedCategories.has(category.id);
          const isPressed = pressedCategory === category.id;

          return (
            <button
              key={category.id}
              onMouseDown={() => handlePressStart(category.id)}
              onMouseUp={() => handlePressEnd(category.id)}
              onMouseLeave={() => {
                if (pressTimerRef.current) {
                  clearTimeout(pressTimerRef.current);
                  pressTimerRef.current = null;
                }
                setPressedCategory(null);
              }}
              onTouchStart={() => handlePressStart(category.id)}
              onTouchEnd={() => handlePressEnd(category.id)}
              aria-pressed={isSelected}
              aria-label={`${category.label} 카테고리 ${isSelected ? '선택됨' : '선택 안됨'}`}
              className="category-filter-button"
              style={{
                minWidth: '44px',
                minHeight: '44px',
                padding: '0.75rem 1rem',
                background: isSelected
                  ? 'rgba(56,189,248,0.2)'
                  : isPressed
                  ? 'rgba(56,189,248,0.15)'
                  : 'rgba(26, 29, 39, 0.5)',
                color: isSelected ? '#38bdf8' : '#e8eaf0',
                border: isSelected
                  ? `2px solid ${category.color}`
                  : '1px solid rgba(56,189,248,0.15)',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: isSelected ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {category.icon && <span>{category.icon}</span>}
                <span>{category.label}</span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  color: '#8b90a7',
                  background: 'rgba(56,189,248,0.1)',
                  padding: '2px 6px',
                  borderRadius: '10px',
                }}
              >
                {category.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 도움말 텍스트 */}
      {onCategoryPress && (
        <div
          style={{
            marginTop: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(56,189,248,0.1)',
            fontSize: '11px',
            color: '#8b90a7',
            textAlign: 'center',
          }}
        >
          💡 카테고리를 길게 누르면 자동 순환합니다
        </div>
      )}
    </div>
    </>
  );
}
