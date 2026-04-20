import { useCallback, useRef, useState, useEffect } from 'react';
import { FlyToInterpolator } from '@deck.gl/core';
import { MapNavigationConfig, MapNavigation, ViewState } from '@/types/ui-ux';
import { isValidCoordinate, isValidZoomLevel } from '@/utils/mapValidation';

/**
 * 지도 네비게이션을 관리하는 커스텀 Hook
 * 
 * @param config - 지도 네비게이션 설정
 * @returns 지도 네비게이션 제어 함수
 * 
 * @example
 * const { flyTo, fitBounds, animateTo } = useMapNavigation({
 *   viewState,
 *   setViewState,
 *   animationDuration: 500,
 * });
 * 
 * // 특정 좌표로 이동
 * flyTo([129.0756, 35.1796], 13);
 */
export function useMapNavigation(
  config: MapNavigationConfig
): MapNavigation {
  const { viewState, setViewState, animationDuration = 500 } = config;
  
  // prefers-reduced-motion 감지 (클라이언트에서만)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      // 설정 변경 감지
      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);
  
  // 디바운싱을 위한 타이머 ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  /**
   * 특정 좌표로 부드럽게 이동합니다.
   */
  const flyTo = useCallback(
    (coordinates: [number, number], zoom?: number) => {
      const [lng, lat] = coordinates;
      
      // 좌표 유효성 검증
      if (!isValidCoordinate(lng, lat)) {
        console.warn('Invalid coordinates:', coordinates);
        return;
      }
      
      // 줌 레벨 유효성 검증
      const targetZoom = zoom ?? 13;
      if (!isValidZoomLevel(targetZoom)) {
        console.warn('Invalid zoom level:', targetZoom);
        return;
      }
      
      // 애니메이션 지속 시간 검증 (200ms ~ 800ms)
      // prefers-reduced-motion이 활성화되면 애니메이션 비활성화
      const duration = prefersReducedMotion 
        ? 0 
        : Math.max(200, Math.min(800, animationDuration));
      
      // 항상 최신 viewState를 사용하도록 함수형 업데이트 사용
      setViewState((prevViewState: any) => ({
        ...prevViewState,
        longitude: lng,
        latitude: lat,
        zoom: targetZoom,
        transitionDuration: duration,
        transitionInterpolator: new FlyToInterpolator(),
      }));
    },
    [setViewState, animationDuration, prefersReducedMotion]
  );
  
  /**
   * 경계 박스에 맞춰 viewport를 조정합니다.
   */
  const fitBounds = useCallback(
    (bounds: [[number, number], [number, number]]) => {
      const [[minLng, minLat], [maxLng, maxLat]] = bounds;
      
      // 경계 박스 유효성 검증
      if (
        !isValidCoordinate(minLng, minLat) ||
        !isValidCoordinate(maxLng, maxLat)
      ) {
        console.warn('Invalid bounds:', bounds);
        return;
      }
      
      // 중심 좌표 계산
      const centerLng = (minLng + maxLng) / 2;
      const centerLat = (minLat + maxLat) / 2;
      
      // 줌 레벨 계산 (간단한 휴리스틱)
      const lngDiff = Math.abs(maxLng - minLng);
      const latDiff = Math.abs(maxLat - minLat);
      const maxDiff = Math.max(lngDiff, latDiff);
      
      let zoom: number;
      if (maxDiff > 0.5) {
        zoom = 10;
      } else if (maxDiff > 0.2) {
        zoom = 11;
      } else if (maxDiff > 0.1) {
        zoom = 12;
      } else if (maxDiff > 0.05) {
        zoom = 13;
      } else {
        zoom = 14;
      }
      
      // 유효한 범위 내로 제한
      zoom = Math.max(10, Math.min(18, zoom));
      
      flyTo([centerLng, centerLat], zoom);
    },
    [flyTo]
  );
  
  /**
   * 부분적인 viewState로 애니메이션합니다.
   */
  const animateTo = useCallback(
    (partialViewState: Partial<ViewState>) => {
      // 디바운싱 적용
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(() => {
        const duration = prefersReducedMotion 
          ? 0 
          : Math.max(200, Math.min(800, animationDuration));
        
        // 함수형 업데이트 사용
        setViewState((prevViewState: any) => ({
          ...prevViewState,
          ...partialViewState,
          transitionDuration: duration,
          transitionInterpolator: new FlyToInterpolator(),
        }));
      }, 100); // 100ms 디바운싱
    },
    [setViewState, animationDuration, prefersReducedMotion]
  );
  
  return {
    flyTo,
    fitBounds,
    animateTo,
  };
}
