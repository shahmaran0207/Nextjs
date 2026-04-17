import { useState, useRef, useEffect, useCallback } from 'react';
import { CarouselConfig, CarouselController, CarouselItem } from '@/types/ui-ux';
import { getNextIndex, getPreviousIndex, clampIndex } from '@/utils/carouselUtils';

/**
 * 자동 순환을 관리하는 커스텀 Hook
 * 
 * @param config - 순환 설정
 * @returns 순환 상태 및 제어 함수
 * 
 * @example
 * const carousel = useCarouselController({
 *   items: carouselItems,
 *   interval: 3000,
 *   animationDuration: 500,
 *   onItemChange: (item, index) => {
 *     console.log('Current item:', item, 'at index:', index);
 *   },
 * });
 * 
 * // 순환 시작
 * carousel.start();
 * 
 * // 순환 중지
 * carousel.stop();
 */
export function useCarouselController(
  config: CarouselConfig
): CarouselController {
  const { items, interval, animationDuration, onItemChange } = config;
  
  // 순환 활성화 상태
  const [isActive, setIsActive] = useState(false);
  
  // 현재 인덱스
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 타이머 ID ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 현재 항목
  const currentItem = items.length > 0 ? items[currentIndex] : null;
  
  /**
   * 순환 시작
   */
  const start = useCallback(() => {
    // 항목이 1개 이하면 순환하지 않음
    if (items.length <= 1) {
      console.warn('Cannot start carousel with 1 or fewer items');
      return;
    }
    
    setIsActive(true);
  }, [items.length]);
  
  /**
   * 순환 중지
   */
  const stop = useCallback(() => {
    setIsActive(false);
    
    // 타이머 정리
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  
  /**
   * 다음 항목으로 이동
   */
  const next = useCallback(() => {
    if (items.length === 0) return;
    
    setCurrentIndex((prevIndex) => {
      const nextIdx = getNextIndex(prevIndex, items.length);
      return nextIdx;
    });
  }, [items.length]);
  
  /**
   * 이전 항목으로 이동
   */
  const previous = useCallback(() => {
    if (items.length === 0) return;
    
    setCurrentIndex((prevIndex) => {
      const prevIdx = getPreviousIndex(prevIndex, items.length);
      return prevIdx;
    });
  }, [items.length]);
  
  /**
   * 특정 인덱스로 이동
   */
  const goTo = useCallback(
    (index: number) => {
      if (items.length === 0) return;
      
      const clampedIndex = clampIndex(index, items.length);
      setCurrentIndex(clampedIndex);
    },
    [items.length]
  );
  
  /**
   * items 변경 시 인덱스 초기화
   */
  useEffect(() => {
    setCurrentIndex(0);
  }, [items]);

  /**
   * 자동 순환 효과
   */
  useEffect(() => {
    if (!isActive || items.length <= 1) {
      return;
    }
    
    // 타이머 설정
    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIdx = getNextIndex(prevIndex, items.length);
        return nextIdx;
      });
    }, interval);
    
    // cleanup: 타이머 정리
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, items.length, interval]);
  
  /**
   * 항목 변경 시 콜백 호출
   */
  useEffect(() => {
    if (currentItem && isActive) {
      onItemChange(currentItem, currentIndex);
    }
  }, [currentItem, currentIndex, isActive, onItemChange]);
  
  /**
   * 컴포넌트 언마운트 시 타이머 정리
   */
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);
  
  return {
    isActive,
    currentIndex,
    currentItem,
    start,
    stop,
    next,
    previous,
    goTo,
  };
}
