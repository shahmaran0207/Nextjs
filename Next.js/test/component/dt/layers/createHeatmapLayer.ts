import { HeatmapLayer } from "@deck.gl/aggregation-layers";

export interface HeatmapPoint {
  position: [number, number];
  weight: number;
}

/**
 * 교통 혼잡 히트맵 레이어
 * - useTwinMapState에서 메모이제이션된 data 배열을 받아 렌더링
 * - 프레임 드랍(렉) 방지
 */
export function createTrafficHeatmapLayer(
  data: HeatmapPoint[],
  visible: boolean
) {
  if (!data?.length || !visible) return null;

  return new HeatmapLayer({
    id: "traffic-heatmap-layer",
    data: data,
    getPosition: (d: HeatmapPoint) => d.position,
    getWeight: (d: HeatmapPoint) => d.weight,
    radiusPixels: 40,
    intensity: 1.2,
    threshold: 0.05,
    colorRange: [
      [0, 200, 100, 0],      // 투명 (원활)
      [100, 220, 50, 80],    // 초록 반투명
      [255, 220, 0, 140],    // 노란색 (보통)
      [255, 140, 0, 180],    // 주황 (정체)
      [220, 50, 50, 210],    // 빨강 (심각 정체)
      [180, 0, 30, 230],     // 진빨강 (극심 정체)
    ],
    opacity: 0.75,
    visible,
    pickable: false,
  });
}
