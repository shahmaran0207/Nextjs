import { useMemo } from 'react';

interface UseLinkClustersProps {
  linkData: any;
  trafficMap: Map<string, number>;
  viewState: any;
  enabled: boolean;
}

/**
 * 줌 레벨이 낮을 때 주요 도로만 필터링하여 표시
 * 
 * 도로 등급 (road_rank):
 * - 101: 고속국도
 * - 102: 도시고속도로
 * - 103: 일반국도
 * - 104: 특별광역시도
 * - 105: 국가지원지방도
 * - 106: 지방도
 * - 107: 시도
 * - 108: 군도
 * - 기타: 소로
 * 
 * 줌 레벨별 전략:
 * - zoom < 10: 고속도로, 국도만 (101-103)
 * - zoom < 11: 고속도로, 국도, 광역시도, 지방도 (101-106)
 * - zoom >= 11: 모든 도로 표시
 */
export function useLinkClusters({
  linkData,
  trafficMap,
  viewState,
  enabled,
}: UseLinkClustersProps) {

  const shouldFilter = enabled && viewState.zoom < 11;

  const filteredLinks = useMemo(() => {
    if (!shouldFilter || !linkData?.features) {
      return null; // 필터링 안 함
    }

    // 줌 레벨에 따른 도로 등급 필터
    const allowedRanks = getAllowedRoadRanks(viewState.zoom);

    const filtered = linkData.features.filter((feature: any) => {
      const roadRank = feature.properties?.road_rank;
      return allowedRanks.includes(roadRank);
    });

    return {
      type: "FeatureCollection",
      features: filtered,
    };
  }, [shouldFilter, linkData, viewState.zoom]);

  return {
    shouldFilter,
    filteredLinks,
  };
}

/**
 * 줌 레벨에 따른 허용 도로 등급 결정
 */
function getAllowedRoadRanks(zoom: number): string[] {
  if (zoom < 10) {
    // 고속도로, 국도만
    return ['101', '102', '103'];
  } else if (zoom < 11) {
    // 고속도로, 국도, 광역시도, 지방도
    return ['101', '102', '103', '104', '105', '106'];
  }
  // zoom >= 11: 모든 도로
  return [];
}
