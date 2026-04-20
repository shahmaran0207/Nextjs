"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseNaverRoadviewProps {
  onPositionChange?: (position: { lat: number; lng: number }, direction: number) => void;
  onAvailabilityChange?: (isAvailable: boolean) => void;
}

interface RoadviewCache {
  [key: string]: any; // 위치별 캐시 데이터
}

export function useNaverRoadview({
  onPositionChange,
  onAvailabilityChange,
}: UseNaverRoadviewProps) {
  // 상태 관리
  const [roadviewInstance, setRoadviewInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  
  // 캐시 관리
  const cacheRef = useRef<RoadviewCache>({});
  const requestCountRef = useRef<{ [key: string]: number }>({});

  // 네이버 지도 API 스크립트 로드 (로드뷰 서브모듈 포함)
  const loadNaverScript = useCallback(() => {
    if (isScriptLoaded || typeof window === "undefined") return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      // 이미 로드되어 있는지 확인
      if (window.naver && window.naver.maps && 
          window.naver.maps.Panorama && 
          window.naver.maps.Service) {
        setIsScriptLoaded(true);
        resolve();
        return;
      }

      const script = document.createElement("script");
      // 로드뷰 사용을 위해 submodules=panorama,geocoder 추가
      script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}&submodules=panorama,geocoder`;
      script.async = true;
      
      script.onload = () => {
        // Panorama와 Service가 로드될 때까지 대기
        const checkModules = setInterval(() => {
          if (window.naver && window.naver.maps && 
              window.naver.maps.Panorama && 
              window.naver.maps.Service) {
            clearInterval(checkModules);
            setIsScriptLoaded(true);
            resolve();
          }
        }, 100);
        
        // 5초 타임아웃
        setTimeout(() => {
          clearInterval(checkModules);
          if (!window.naver?.maps?.Panorama || !window.naver?.maps?.Service) {
            setError("로드뷰 모듈을 로드할 수 없습니다");
            reject(new Error("Panorama or Service module not loaded"));
          }
        }, 5000);
      };
      
      script.onerror = () => {
        setError("로드뷰를 로드할 수 없습니다");
        reject(new Error("Failed to load Naver Maps script"));
      };
      
      document.head.appendChild(script);
    });
  }, [isScriptLoaded]);

  // 로드뷰 인스턴스 초기화
  const initializeRoadview = useCallback(async (container: HTMLElement) => {
    try {
      setIsLoading(true);
      setError(null);

      // API 키 확인
      if (!process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID) {
        throw new Error("API key not configured");
      }

      // 스크립트 로드
      await loadNaverScript();

      // 로드뷰 인스턴스 생성
      const roadview = new window.naver.maps.Panorama(container, {
        position: new window.naver.maps.LatLng(35.1796, 129.0756), // 부산 기본 위치
        pov: {
          pan: 0,
          tilt: 0,
          fov: 100,
        },
      });

      // 위치 변경 이벤트 리스너
      window.naver.maps.Event.addListener(roadview, "position_changed", () => {
        const position = roadview.getPosition();
        const pov = roadview.getPov();
        
        if (onPositionChange) {
          onPositionChange(
            { lat: position.lat(), lng: position.lng() },
            pov.pan
          );
        }
      });

      setRoadviewInstance(roadview);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Roadview initialization error:", err);
      setError(err.message || "로드뷰 초기화에 실패했습니다");
      setIsLoading(false);
    }
  }, [loadNaverScript, onPositionChange]);

  // 로드뷰 위치 설정
  const setRoadviewPosition = useCallback(
    async (position: { lat: number; lng: number }) => {
      if (!roadviewInstance) return;

      try {
        setIsLoading(true);
        setError(null);

        const positionKey = `${position.lat.toFixed(6)},${position.lng.toFixed(6)}`;

        // 캐시 확인
        if (cacheRef.current[positionKey]) {
          // 캐시된 데이터 사용
          roadviewInstance.setPosition(
            new window.naver.maps.LatLng(position.lat, position.lng)
          );
          setIsAvailable(true);
          if (onAvailabilityChange) onAvailabilityChange(true);
          setIsLoading(false);
          
          // 요청 카운트는 증가하지 않음 (캐시 사용)
          return;
        }

        // 요청 카운트 증가
        requestCountRef.current[positionKey] = 
          (requestCountRef.current[positionKey] || 0) + 1;

        // 로드뷰 위치 직접 설정 (네이버 API가 자동으로 가장 가까운 로드뷰 찾음)
        const newPosition = new window.naver.maps.LatLng(position.lat, position.lng);
        
        try {
          roadviewInstance.setPosition(newPosition);
          
          // 위치 설정 후 실제 로드뷰 위치 확인
          setTimeout(() => {
            try {
              const actualPosition = roadviewInstance.getPosition();
              const panoId = roadviewInstance.getPanoId?.();
              
              // panoId가 있으면 로드뷰 존재, 없으면 로드뷰 없음
              if (actualPosition && panoId) {
                setIsAvailable(true);
                if (onAvailabilityChange) onAvailabilityChange(true);
                
                // 캐시에 저장
                cacheRef.current[positionKey] = {
                  position: actualPosition,
                  panoId: panoId,
                  timestamp: Date.now(),
                };
              } else {
                console.warn("No roadview available at this location");
                setIsAvailable(false);
                if (onAvailabilityChange) onAvailabilityChange(false);
              }
            } catch (err) {
              console.error("Failed to get roadview position:", err);
              setIsAvailable(false);
              if (onAvailabilityChange) onAvailabilityChange(false);
            }
            setIsLoading(false);
          }, 1000); // 로드뷰 로딩 대기 시간 증가
        } catch (err) {
          console.error("Failed to set roadview position:", err);
          setIsAvailable(false);
          if (onAvailabilityChange) onAvailabilityChange(false);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error("Roadview position error:", err);
        setError("로드뷰를 불러올 수 없습니다");
        setIsLoading(false);
      }
    },
    [roadviewInstance, onAvailabilityChange]
  );

  // 정리
  useEffect(() => {
    return () => {
      if (roadviewInstance) {
        // 네이버 로드뷰는 자동으로 정리되므로 별도 destroy 불필요
        setRoadviewInstance(null);
      }
    };
  }, [roadviewInstance]);

  return {
    roadviewInstance,
    isLoading,
    error,
    isAvailable,
    isScriptLoaded,
    initializeRoadview,
    setRoadviewPosition,
    requestCount: requestCountRef.current,
  };
}
