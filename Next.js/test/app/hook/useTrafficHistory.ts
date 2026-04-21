import { useState, useCallback } from "react";

/**
 * 시간 가용성 정보
 */
export interface TimeAvailability {
  start: Date;
  end: Date;
  hasData: boolean;
}

/**
 * useTrafficHistory Hook 옵션
 */
export interface UseTrafficHistoryOptions {
  initialStartTime?: Date;
  initialEndTime?: Date;
  onError?: (error: Error) => void;
}

/**
 * useTrafficHistory Hook 반환 타입
 */
export interface UseTrafficHistoryReturn {
  currentTime: Date;
  startTime: Date;
  endTime: Date;
  trafficData: Map<string, number>;
  availability: TimeAvailability[];
  isLoading: boolean;
  error: Error | null;
  
  setCurrentTime: (time: Date) => void;
  setTimeRange: (start: Date, end: Date) => void;
  fetchTrafficData: (time: Date) => Promise<void>;
  returnToNow: () => void;
}

/**
 * 교통 이력 데이터를 관리하는 커스텀 Hook
 * 
 * 요구사항: 1.1, 1.2, 1.3, 1.5, 6.2, 6.3
 */
export function useTrafficHistory(
  options: UseTrafficHistoryOptions = {}
): UseTrafficHistoryReturn {
  const now = new Date();
  const defaultStartTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24시간 전
  
  const [currentTime, setCurrentTime] = useState<Date>(
    options.initialStartTime || now
  );
  const [startTime, setStartTime] = useState<Date>(
    options.initialStartTime || defaultStartTime
  );
  const [endTime, setEndTime] = useState<Date>(
    options.initialEndTime || now
  );
  const [trafficData, setTrafficData] = useState<Map<string, number>>(new Map());
  const [availability, setAvailability] = useState<TimeAvailability[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 특정 시점의 교통 데이터 조회
   * 정확한 시간의 데이터가 없으면 시간 범위 내에서 가장 가까운 데이터를 조회
   * 요구사항: 1.1, 1.2, 1.3, 1.5
   */
  const fetchTrafficData = useCallback(async (time: Date) => {
    setIsLoading(true);
    setError(null);

    try {
      // 먼저 정확한 시간으로 조회 시도
      let response = await fetch(
        `/api/traffic/history?time=${time.toISOString()}`
      );

      if (!response.ok) {
        throw new Error("데이터를 불러오는 중 오류가 발생했습니다");
      }

      let result = await response.json();

      // 응답 데이터를 Map<string, number> 형식으로 변환
      let trafficMap = new Map<string, number>();
      if (result.data && Array.isArray(result.data)) {
        result.data.forEach((item: { linkId: string; speed: number }) => {
          trafficMap.set(item.linkId, item.speed);
        });
      }

      // 데이터가 없는 경우, 시간 범위 내에서 가장 가까운 데이터 조회
      if (trafficMap.size === 0) {
        console.log("[useTrafficHistory] 정확한 시간의 데이터 없음, 범위 내 검색 시도");
        
        // 시간 범위 내에서 가장 가까운 데이터 조회
        response = await fetch(
          `/api/traffic/history?time=${time.toISOString()}&findNearest=true&startTime=${startTime.toISOString()}&endTime=${endTime.toISOString()}`
        );

        if (!response.ok) {
          throw new Error("데이터를 불러오는 중 오류가 발생했습니다");
        }

        result = await response.json();

        // 가장 가까운 데이터 변환
        trafficMap = new Map<string, number>();
        if (result.data && Array.isArray(result.data)) {
          result.data.forEach((item: { linkId: string; speed: number }) => {
            trafficMap.set(item.linkId, item.speed);
          });
        }

        // 여전히 데이터가 없으면 에러
        if (trafficMap.size === 0) {
          throw new Error("해당 시간 범위에 데이터가 없습니다");
        }

        // 실제 데이터의 시간으로 currentTime 업데이트
        if (result.actualTime) {
          const actualTimeDate = new Date(result.actualTime);
          if (!isNaN(actualTimeDate.getTime())) {
            setCurrentTime(actualTimeDate);
            console.log("[useTrafficHistory] 가장 가까운 데이터 사용:", result.actualTime);
          } else {
            console.warn("[useTrafficHistory] Invalid actualTime:", result.actualTime);
            setCurrentTime(time);
          }
        } else {
          setCurrentTime(time);
        }
      } else {
        setCurrentTime(time);
      }

      setTrafficData(trafficMap);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      
      // 에러 콜백 호출 (요구사항 1.5)
      if (options.onError) {
        options.onError(errorObj);
      }
      
      console.error("[useTrafficHistory] 데이터 조회 실패:", err);
    } finally {
      setIsLoading(false);
    }
  }, [options, startTime, endTime]);

  /**
   * 시간 범위 설정 및 검증
   * 요구사항: 2.6, 2.7
   */
  const setTimeRange = useCallback((start: Date, end: Date) => {
    // 시간 범위 검증 (시작 < 종료)
    if (start >= end) {
      const validationError = new Error(
        "시작 시간은 종료 시간보다 이전이어야 합니다"
      );
      setError(validationError);
      
      if (options.onError) {
        options.onError(validationError);
      }
      
      return;
    }

    setStartTime(start);
    setEndTime(end);
    setError(null);
  }, [options]);

  /**
   * 현재 시간으로 복귀
   * 요구사항: 6.2, 6.3
   */
  const returnToNow = useCallback(() => {
    const now = new Date();
    setCurrentTime(now);
    setEndTime(now);
    setError(null);
    
    // 실시간 데이터로 전환하기 위해 trafficData 초기화
    setTrafficData(new Map());
  }, []);

  return {
    currentTime,
    startTime,
    endTime,
    trafficData,
    availability,
    isLoading,
    error,
    
    setCurrentTime,
    setTimeRange,
    fetchTrafficData,
    returnToNow,
  };
}
