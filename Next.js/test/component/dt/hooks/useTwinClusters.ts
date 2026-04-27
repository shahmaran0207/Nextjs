import { useMemo } from 'react';
import Supercluster from 'supercluster';
import { CCTVPoint } from '@/types/cctv';
import { ConstructionPoint, ThemeTravelPoint } from '@/component/dt/modules/DashboardStatsModule';

interface UseTwinClustersProps {
  bitData: any[];
  filteredConstructionByCategory: ConstructionPoint[];
  filteredTourismData: ThemeTravelPoint[];
  cctvData: CCTVPoint[];
  parkingData?: any[]; // 주차장 데이터
  viewState: any;
}

/**
 * 지도에 표시할 4종 레이어의 Supercluster 인덱스를 생성하고
 * 현재 viewport에 맞는 클러스터 목록을 반환하는 Hook
 *
 * @param bitData - BIT(버스정보) 원시 데이터
 * @param filteredConstructionByCategory - 카테고리 필터링된 공사 데이터
 * @param filteredTourismData - 카테고리 필터링된 테마여행 데이터
 * @param cctvData - CCTV 데이터
 * @param viewState - DeckGL viewState (longitude, latitude, zoom 포함)
 * @returns 각 레이어별 클러스터 배열
 */
export function useTwinClusters({
  bitData,
  filteredConstructionByCategory,
  filteredTourismData,
  cctvData,
  parkingData,
  viewState,
}: UseTwinClustersProps) {
  // ─── Supercluster 인덱스 생성 ──────────────────────────────────

  const bitIndex = useMemo(() => {
    const sc = new Supercluster({ radius: 80, maxZoom: 18, minZoom: 0 });
    sc.load(
      (bitData || [])
        .filter((b: any) => b.lat && b.lng)
        .map((b: any) => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [b.lng, b.lat] as [number, number] },
          properties: b,
        }))
    );
    return sc;
  }, [bitData]);

  const constructionIndex = useMemo(() => {
    const sc = new Supercluster({ radius: 80, maxZoom: 18, minZoom: 0 });
    sc.load(
      (filteredConstructionByCategory || []).map((d) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [d.lng, d.lat] as [number, number] },
        properties: d,
      }))
    );
    return sc;
  }, [filteredConstructionByCategory]);

  const themeTravelIndex = useMemo(() => {
    const sc = new Supercluster({ radius: 80, maxZoom: 18, minZoom: 0 });
    sc.load(
      (filteredTourismData || [])
        .filter((d) => d.lat && d.lng)
        .map((d) => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [d.lng, d.lat] as [number, number] },
          properties: d,
        }))
    );
    return sc;
  }, [filteredTourismData]);

  const cctvIndex = useMemo(() => {
    // CCTV는 개수가 적으므로 클러스터링을 약하게 설정
    // radius: 40 (작은 반경), maxZoom: 14 (줌 14 이상에서는 개별 마커 표시)
    const sc = new Supercluster({ radius: 40, maxZoom: 14, minZoom: 0 });
    sc.load(
      (cctvData || [])
        .filter((c) => c.lat && c.lng)
        .map((c) => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [c.lng, c.lat] as [number, number] },
          properties: c,
        }))
    );
    return sc;
  }, [cctvData]);

  // ─── 현재 viewport bbox ────────────────────────────────────────

  const bbox = useMemo((): [number, number, number, number] => {
    const { longitude, latitude, zoom } = viewState;
    const latR = 90 / Math.pow(2, zoom);
    const lngR = 180 / Math.pow(2, zoom);
    return [longitude - lngR, latitude - latR, longitude + lngR, latitude + latR];
  }, [viewState]);

  const zoomInt = Math.floor(viewState.zoom ?? 12);

  // ─── 클러스터 계산 ────────────────────────────────────────────

  const bitClusters = useMemo(
    () => bitIndex.getClusters(bbox, zoomInt),
    [bitIndex, bbox, zoomInt]
  );

  const constructionClusters = useMemo(
    () => constructionIndex.getClusters(bbox, zoomInt),
    [constructionIndex, bbox, zoomInt]
  );

  const themeTravelClusters = useMemo(
    () => themeTravelIndex.getClusters(bbox, zoomInt),
    [themeTravelIndex, bbox, zoomInt]
  );

  const cctvClusters = useMemo(
    () => cctvIndex.getClusters(bbox, zoomInt),
    [cctvIndex, bbox, zoomInt]
  );

  const parkingIndex = useMemo(() => {
    const sc = new Supercluster({ radius: 80, maxZoom: 18, minZoom: 0 });
    sc.load(
      (parkingData || [])
        .filter((p: any) => p.lat && p.lng)
        .map((p: any) => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] as [number, number] },
          properties: p,
        }))
    );
    return sc;
  }, [parkingData]);

  const parkingClusters = useMemo(
    () => parkingIndex.getClusters(bbox, zoomInt),
    [parkingIndex, bbox, zoomInt]
  );

  return { bitClusters, constructionClusters, themeTravelClusters, cctvClusters, parkingClusters };
}
