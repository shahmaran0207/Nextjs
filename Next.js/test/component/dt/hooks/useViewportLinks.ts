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

    // 줌 레벨이 너무 낮으면 링크 요청 안 함 (의미없는 요청 방지)
    if (viewState.zoom < 5) return;

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
 * deck.gl viewState + 실제 화면 픽셀 크기를 기반으로 현재 보이는 영역의 경계 좌표 계산
 *
 * deck.gl/MapLibre zoom=0: 전체 지구가 256px 타일 1개에 해당
 * zoom N: 256 * 2^N px 크기
 * → 화면 너비/높이가 W, H px일 때 보이는 범위:
 *   lngRange = (W / 256) * (360 / 2^zoom)
 *   latRange = (H / 256) * (180 / 2^zoom)  (Mercator 보정 미적용 근사)
 */
function calculateViewportBounds(viewState: any): ViewportBounds {
  const { longitude, latitude, zoom } = viewState;

  // 실제 화면 크기 (SSR 안전 처리)
  const screenW = typeof window !== "undefined" ? window.innerWidth : 1920;
  const screenH = typeof window !== "undefined" ? window.innerHeight : 1080;

  // 타일 해상도(256px) 기준, 1 타일당 경도/위도 범위
  const tileRes = Math.pow(2, zoom);
  const degPerTileX = 360 / tileRes;
  const degPerTileY = 180 / tileRes;

  // 화면에 보이는 경도/위도 범위 (margin 20% 추가로 경계 근처 링크도 미리 로드)
  const margin = 1.2;
  const lngRange = (screenW / 256) * degPerTileX * margin;
  const latRange = (screenH / 256) * degPerTileY * margin;

  return {
    minLng: longitude - lngRange / 2,
    maxLng: longitude + lngRange / 2,
    minLat: latitude - latRange / 2,
    maxLat: latitude + latRange / 2,
    zoom,
  };
}
