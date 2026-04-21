import { useState, useCallback, useRef } from "react";

/**
 * 캐시 항목
 */
export interface CacheEntry {
  time: Date;
  data: Map<string, number>;
  timestamp: number;
}

/**
 * useHistoryCache Hook 반환 타입
 */
export interface UseHistoryCacheReturn {
  get: (time: Date) => Map<string, number> | null;
  set: (time: Date, data: Map<string, number>) => void;
  prefetch: (times: Date[]) => Promise<void>;
  clear: () => void;
  size: number;
}

/**
 * 캐시 저장소
 */
interface CacheStore {
  entries: Map<string, CacheEntry>;
  accessOrder: string[];
  totalSize: number;
}

// 상수 정의
const MAX_CACHE_ENTRIES = 10; // 최대 캐시 항목 수
const MAX_MEMORY_BYTES = 100 * 1024 * 1024; // 100MB 임계값
const ESTIMATED_ENTRY_SIZE = 100 * 1024; // 항목당 약 100KB 추정

/**
 * Date를 캐시 키로 변환 (ISO 문자열)
 */
function dateToKey(date: Date): string {
  return date.toISOString();
}

/**
 * Map 크기 추정 (바이트 단위)
 */
function estimateMapSize(map: Map<string, number>): number {
  // linkId (평균 20자) + speed (8바이트) + 오버헤드
  return map.size * 100;
}

/**
 * 교통 데이터 캐싱을 관리하는 커스텀 Hook
 * 
 * LRU 캐시 구현 (최대 10개 항목)
 * 메모리 사용량 모니터링 (100MB 임계값)
 * 
 * 요구사항: 7.1, 7.2, 7.3, 7.4
 */
export function useHistoryCache(): UseHistoryCacheReturn {
  const [cacheSize, setCacheSize] = useState<number>(0);
  
  // useRef로 캐시 저장소 관리 (리렌더링 방지)
  const cacheRef = useRef<CacheStore>({
    entries: new Map(),
    accessOrder: [],
    totalSize: 0,
  });

  /**
   * 캐시에서 데이터 조회
   * 요구사항: 7.3
   */
  const get = useCallback((time: Date): Map<string, number> | null => {
    const key = dateToKey(time);
    const cache = cacheRef.current;
    const entry = cache.entries.get(key);

    if (!entry) {
      return null;
    }

    // LRU: 접근한 항목을 맨 뒤로 이동
    const index = cache.accessOrder.indexOf(key);
    if (index > -1) {
      cache.accessOrder.splice(index, 1);
      cache.accessOrder.push(key);
    }

    return entry.data;
  }, []);

  /**
   * 캐시에 데이터 저장
   * 요구사항: 7.2, 7.4
   */
  const set = useCallback((time: Date, data: Map<string, number>) => {
    const key = dateToKey(time);
    const cache = cacheRef.current;
    const entrySize = estimateMapSize(data);

    // 기존 항목이 있으면 제거
    if (cache.entries.has(key)) {
      const oldEntry = cache.entries.get(key)!;
      const oldSize = estimateMapSize(oldEntry.data);
      cache.totalSize -= oldSize;
      
      const index = cache.accessOrder.indexOf(key);
      if (index > -1) {
        cache.accessOrder.splice(index, 1);
      }
    }

    // 메모리 임계값 초과 시 가장 오래된 항목 제거 (요구사항 7.4)
    while (
      cache.totalSize + entrySize > MAX_MEMORY_BYTES &&
      cache.accessOrder.length > 0
    ) {
      const oldestKey = cache.accessOrder.shift()!;
      const oldestEntry = cache.entries.get(oldestKey);
      
      if (oldestEntry) {
        const oldSize = estimateMapSize(oldestEntry.data);
        cache.totalSize -= oldSize;
        cache.entries.delete(oldestKey);
      }
    }

    // 최대 항목 수 초과 시 가장 오래된 항목 제거 (요구사항 7.2)
    while (cache.accessOrder.length >= MAX_CACHE_ENTRIES) {
      const oldestKey = cache.accessOrder.shift()!;
      const oldestEntry = cache.entries.get(oldestKey);
      
      if (oldestEntry) {
        const oldSize = estimateMapSize(oldestEntry.data);
        cache.totalSize -= oldSize;
        cache.entries.delete(oldestKey);
      }
    }

    // 새 항목 추가
    const newEntry: CacheEntry = {
      time,
      data,
      timestamp: Date.now(),
    };

    cache.entries.set(key, newEntry);
    cache.accessOrder.push(key);
    cache.totalSize += entrySize;

    setCacheSize(cache.entries.size);
  }, []);

  /**
   * 다음 시점 데이터 미리 조회
   * 요구사항: 7.1
   */
  const prefetch = useCallback(async (times: Date[]) => {
    const cache = cacheRef.current;

    // 이미 캐시된 시점은 제외
    const timesToFetch = times.filter((time) => {
      const key = dateToKey(time);
      return !cache.entries.has(key);
    });

    if (timesToFetch.length === 0) {
      return;
    }

    // 백그라운드에서 비동기 로드
    const fetchPromises = timesToFetch.map(async (time) => {
      try {
        const response = await fetch(
          `/api/traffic/history?time=${time.toISOString()}`
        );

        if (!response.ok) {
          console.warn(`[useHistoryCache] 프리페치 실패: ${time.toISOString()}`);
          return;
        }

        const result = await response.json();

        // 응답 데이터를 Map<string, number> 형식으로 변환
        const trafficMap = new Map<string, number>();
        if (result.data && Array.isArray(result.data)) {
          result.data.forEach((item: { linkId: string; speed: number }) => {
            trafficMap.set(item.linkId, item.speed);
          });
        }

        // 캐시에 저장
        if (trafficMap.size > 0) {
          set(time, trafficMap);
        }
      } catch (err) {
        console.warn(`[useHistoryCache] 프리페치 오류: ${time.toISOString()}`, err);
      }
    });

    await Promise.all(fetchPromises);
  }, [set]);

  /**
   * 캐시 초기화
   */
  const clear = useCallback(() => {
    const cache = cacheRef.current;
    cache.entries.clear();
    cache.accessOrder = [];
    cache.totalSize = 0;
    setCacheSize(0);
  }, []);

  return {
    get,
    set,
    prefetch,
    clear,
    size: cacheSize,
  };
}
