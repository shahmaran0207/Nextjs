import { useState, useEffect, useRef } from "react";

interface ViewportBounds {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
  zoom: number;
}

interface UseViewportLinksProps {
  viewState: any;
  enabled?: boolean;
}

export function useViewportLinks({ viewState, enabled = true }: UseViewportLinksProps) {
  const [linkData, setLinkData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 이전 요청 취소를 위한 AbortController
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // 디바운스를 위한 타이머
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // 이전 타이머 취소
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 300ms 디바운스
    debounceTimerRef.current = setTimeout(() => {
      fetchViewportLinks();
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [viewState.longitude, viewState.latitude, viewState.zoom, enabled]);

  const fetchViewportLinks = async () => {
    try {
      // 이전 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      // 뷰포트 바운딩 박스 계산
      const bounds = calculateViewportBounds(viewState);

      const params = new URLSearchParams({
        minLng: bounds.minLng.toString(),
        maxLng: bounds.maxLng.toString(),
        minLat: bounds.minLat.toString(),
        maxLat: bounds.maxLat.toString(),
        zoom: Math.round(bounds.zoom).toString(),
      });

      const response = await fetch(
        `/api/GIS/Busan/Link/getViewportLinks?${params.toString()}`,
        { signal: abortControllerRef.current.signal }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setLinkData(data);
      setIsLoading(false);
    } catch (err: any) {
      if (err.name === "AbortError") {
        // 요청이 취소된 경우 무시
        return;
      }
      console.error("뷰포트 링크 로드 에러:", err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  return {
    linkData,
    isLoading,
    error,
    refetch: fetchViewportLinks,
  };
}

/**
 * 뷰포트 바운딩 박스 계산
 * deck.gl viewState에서 현재 보이는 영역의 경계 좌표 계산
 */
function calculateViewportBounds(viewState: any): ViewportBounds {
  const { longitude, latitude, zoom } = viewState;

  // 줌 레벨에 따른 대략적인 범위 계산
  // 줌이 높을수록 범위가 좁아짐
  const latRange = 180 / Math.pow(2, zoom);
  const lngRange = 360 / Math.pow(2, zoom);

  return {
    minLng: longitude - lngRange / 2,
    maxLng: longitude + lngRange / 2,
    minLat: latitude - latRange / 2,
    maxLat: latitude + latRange / 2,
    zoom,
  };
}
