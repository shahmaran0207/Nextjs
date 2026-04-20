import { ScatterplotLayer } from "@deck.gl/layers";

interface MarkerPosition {
  lat: number;
  lng: number;
}

/**
 * 로드뷰 마커 레이어 생성
 * 
 * 3개의 레이어로 구성:
 * 1. Glow Layer - 외부 발광 효과
 * 2. Ring Layer - 중간 링
 * 3. Core Layer - 중심 코어
 * 
 * @param markerPosition - 마커 위치 (lat, lng)
 * @param direction - 시야 방향 (0-360도, 북쪽 기준 시계방향) - 현재 미사용
 * @returns deck.gl 레이어 배열
 */
export function createRoadviewMarkerLayer(
  markerPosition: MarkerPosition | null,
  direction: number = 0
) {
  if (!markerPosition) return [];

  // 1. Glow Layer - 외부 발광 효과
  const glowLayer = new ScatterplotLayer({
    id: "roadview-marker-glow",
    data: [markerPosition],
    getPosition: (d: MarkerPosition) => [d.lng, d.lat],
    getRadius: 25,
    getFillColor: [236, 72, 153, 40], // pink glow with low opacity
    getLineColor: [236, 72, 153, 0],
    lineWidthMinPixels: 0,
    stroked: false,
    filled: true,
    radiusUnits: "pixels",
    pickable: false,
  });

  // 2. Ring Layer - 중간 링
  const ringLayer = new ScatterplotLayer({
    id: "roadview-marker-ring",
    data: [markerPosition],
    getPosition: (d: MarkerPosition) => [d.lng, d.lat],
    getRadius: 15,
    getFillColor: [0, 0, 0, 0],
    getLineColor: [251, 207, 232, 255], // light pink
    lineWidthMinPixels: 2,
    stroked: true,
    filled: false,
    radiusUnits: "pixels",
    pickable: false,
  });

  // 3. Core Layer - 중심 코어
  const coreLayer = new ScatterplotLayer({
    id: "roadview-marker-core",
    data: [markerPosition],
    getPosition: (d: MarkerPosition) => [d.lng, d.lat],
    getRadius: 10,
    getFillColor: [236, 72, 153, 200], // pink
    getLineColor: [236, 72, 153, 255],
    lineWidthMinPixels: 1.5,
    stroked: true,
    filled: true,
    radiusUnits: "pixels",
    pickable: true,
  });

  return [glowLayer, ringLayer, coreLayer];
}
