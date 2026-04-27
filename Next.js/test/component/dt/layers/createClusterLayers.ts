import { IconLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import { BUS_PIN_URL } from "../constants/iconConfigs";
import { getConstructionPinUrl, getThemePinUrl } from "../utils/iconUtils";
import { getProgressColor } from "../utils/colorUtils";

export function createBitClusterLayers(bitClusters: any[]) {
  // 버스 정류장 클러스터: 밝은 하늘색 (Sky Blue)
  const bitClusterGlow = new ScatterplotLayer({
    id: "bit-cluster-glow",
    data: bitClusters.filter((c: any) => c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: (d: any) => {
      const count = d.properties.point_count;
      return 12 + Math.log2(count) * 3;
    },
    getFillColor: [125, 211, 252, 30], // 밝은 하늘색 glow
    getLineColor: [125, 211, 252, 0],
    lineWidthMinPixels: 0,
    stroked: false,
    filled: true,
    radiusUnits: "pixels",
    pickable: false,
  });

  const bitClusterLayer = new ScatterplotLayer({
    id: "bit-cluster-layer",
    data: bitClusters.filter((c: any) => c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: (d: any) => {
      const count = d.properties.point_count;
      return 10 + Math.log2(count) * 3;
    },
    getFillColor: [56, 189, 248, 40], // 하늘색 fill
    getLineColor: [125, 211, 252, 255], // 밝은 하늘색 테두리
    lineWidthMinPixels: 2,
    stroked: true,
    filled: true,
    radiusUnits: "pixels",
    pickable: true,
  });

  const bitClusterText = new TextLayer({
    id: "bit-cluster-text",
    data: bitClusters.filter((c: any) => c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getText: (d: any) => String(d.properties.point_count),
    getSize: 11,
    getColor: [224, 242, 254, 255], // 매우 밝은 하늘색
    getTextAnchor: "middle",
    getAlignmentBaseline: "center",
    fontWeight: "700",
    fontFamily: "system-ui",
  });

  const bitPointLayer = new IconLayer({
    id: "bit-layer",
    data: bitClusters.filter((c: any) => !c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getIcon: () => ({ url: BUS_PIN_URL, width: 48, height: 62, anchorY: 62 }),
    getSize: 28,
    pickable: true,
  });

  return [bitClusterGlow, bitClusterLayer, bitClusterText, bitPointLayer];
}

export function createConstructionClusterLayers(constructionClusters: any[]) {
  // 공사 클러스터: 밝은 주황색 (Bright Orange)
  const constructionClusterGlow = new ScatterplotLayer({
    id: "construction-cluster-glow",
    data: constructionClusters.filter((c: any) => c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: (d: any) => {
      const count = d.properties.point_count;
      return 12 + Math.log2(count) * 3;
    },
    getFillColor: [251, 146, 60, 30], // 밝은 주황색 glow
    getLineColor: [251, 146, 60, 0],
    lineWidthMinPixels: 0,
    stroked: false,
    filled: true,
    radiusUnits: "pixels",
    pickable: false,
  });

  const constructionClusterLayer = new ScatterplotLayer({
    id: "construction-cluster-layer",
    data: constructionClusters.filter((c: any) => c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: (d: any) => {
      const count = d.properties.point_count;
      return 10 + Math.log2(count) * 3;
    },
    getFillColor: [249, 115, 22, 40], // 주황색 fill
    getLineColor: [251, 146, 60, 255], // 밝은 주황색 테두리
    lineWidthMinPixels: 2,
    stroked: true,
    filled: true,
    radiusUnits: "pixels",
    pickable: true,
  });

  const constructionClusterText = new TextLayer({
    id: "construction-cluster-text",
    data: constructionClusters.filter((c: any) => c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getText: (d: any) => String(d.properties.point_count),
    getSize: 11,
    getColor: [254, 215, 170, 255], // 매우 밝은 주황색
    getTextAnchor: "middle",
    getAlignmentBaseline: "center",
    fontWeight: "700",
    fontFamily: "system-ui",
  });

  // 공사 개별 마커: 노란색 (Yellow) - 클러스터와 명확한 차이
  const constructionPointGlow = new ScatterplotLayer({
    id: "construction-point-glow",
    data: constructionClusters.filter((c: any) => !c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: 20,
    getFillColor: [250, 204, 21, 50], // 노란색 glow
    getLineColor: [250, 204, 21, 0],
    lineWidthMinPixels: 0,
    stroked: false,
    filled: true,
    radiusUnits: "pixels",
    pickable: false,
  });

  const constructionPointRing = new ScatterplotLayer({
    id: "construction-point-ring",
    data: constructionClusters.filter((c: any) => !c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: 12,
    getFillColor: [0, 0, 0, 0],
    getLineColor: [250, 204, 21, 255], // 밝은 노란색 링
    lineWidthMinPixels: 2,
    stroked: true,
    filled: false,
    radiusUnits: "pixels",
    pickable: false,
  });

  const constructionPointCore = new ScatterplotLayer({
    id: "construction-point-core",
    data: constructionClusters.filter((c: any) => !c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: 8,
    getFillColor: (d: any) => {
      const rate = d.properties?.progress_rate ?? 0;
      return getProgressColor(rate);
    },
    getLineColor: [234, 179, 8, 255], // 진한 노란색 테두리
    lineWidthMinPixels: 1.5,
    stroked: true,
    filled: true,
    radiusUnits: "pixels",
    pickable: true,
    updateTriggers: { getFillColor: [] },
  });

  const constructionPointDot = new ScatterplotLayer({
    id: "construction-point-dot",
    data: constructionClusters.filter((c: any) => !c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: 3,
    getFillColor: [255, 255, 255, 255],
    getLineColor: [0, 0, 0, 0],
    lineWidthMinPixels: 0,
    stroked: false,
    filled: true,
    radiusUnits: "pixels",
    pickable: false,
  });

  return [constructionClusterGlow, constructionClusterLayer, constructionClusterText, constructionPointGlow, constructionPointRing, constructionPointCore, constructionPointDot];
}

export function createThemeTravelClusterLayers(themeTravelClusters: any[]) {
  // 관광 클러스터: 밝은 핑크색 (Bright Pink)
  const themeTravelClusterGlow = new ScatterplotLayer({
    id: "theme-cluster-glow",
    data: themeTravelClusters.filter((c: any) => c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: (d: any) => {
      const count = d.properties.point_count;
      return 12 + Math.log2(count) * 3;
    },
    getFillColor: [244, 114, 182, 30], // 밝은 핑크 glow
    getLineColor: [244, 114, 182, 0],
    lineWidthMinPixels: 0,
    stroked: false,
    filled: true,
    radiusUnits: "pixels",
    pickable: false,
  });

  const themeTravelClusterLayer = new ScatterplotLayer({
    id: "theme-cluster-layer",
    data: themeTravelClusters.filter((c: any) => c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: (d: any) => {
      const count = d.properties.point_count;
      return 10 + Math.log2(count) * 3;
    },
    getFillColor: [236, 72, 153, 40], // 핑크 fill
    getLineColor: [244, 114, 182, 255], // 밝은 핑크 테두리
    lineWidthMinPixels: 2,
    stroked: true,
    filled: true,
    radiusUnits: "pixels",
    pickable: true,
  });

  const themeTravelClusterText = new TextLayer({
    id: "theme-cluster-text",
    data: themeTravelClusters.filter((c: any) => c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getText: (d: any) => String(d.properties.point_count),
    getSize: 11,
    getColor: [252, 231, 243, 255], // 매우 밝은 핑크
    getTextAnchor: "middle",
    getAlignmentBaseline: "center",
    fontWeight: "700",
    fontFamily: "system-ui",
  });

  // 관광 개별 마커: 보라색 (Purple) - 클러스터와 명확한 차이
  const themeTravelPointGlow = new ScatterplotLayer({
    id: "theme-point-glow",
    data: themeTravelClusters.filter((c: any) => !c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: 20,
    getFillColor: [168, 85, 247, 50], // 보라색 glow
    getLineColor: [168, 85, 247, 0],
    lineWidthMinPixels: 0,
    stroked: false,
    filled: true,
    radiusUnits: "pixels",
    pickable: false,
  });

  const themeTravelPointRing = new ScatterplotLayer({
    id: "theme-point-ring",
    data: themeTravelClusters.filter((c: any) => !c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: 12,
    getFillColor: [0, 0, 0, 0],
    getLineColor: [192, 132, 252, 255], // 밝은 보라색 링
    lineWidthMinPixels: 2,
    stroked: true,
    filled: false,
    radiusUnits: "pixels",
    pickable: false,
  });

  const themeTravelPointCore = new ScatterplotLayer({
    id: "theme-point-core",
    data: themeTravelClusters.filter((c: any) => !c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: 8,
    getFillColor: [147, 51, 234, 220], // 진한 보라색 코어
    getLineColor: [168, 85, 247, 255],
    lineWidthMinPixels: 1.5,
    stroked: true,
    filled: true,
    radiusUnits: "pixels",
    pickable: true,
  });

  const themeTravelPointDot = new ScatterplotLayer({
    id: "theme-point-dot",
    data: themeTravelClusters.filter((c: any) => !c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: 3,
    getFillColor: [255, 255, 255, 255],
    getLineColor: [0, 0, 0, 0],
    lineWidthMinPixels: 0,
    stroked: false,
    filled: true,
    radiusUnits: "pixels",
    pickable: false,
  });

  return [themeTravelClusterGlow, themeTravelClusterLayer, themeTravelClusterText, themeTravelPointGlow, themeTravelPointRing, themeTravelPointCore, themeTravelPointDot];
}

/**
 * CCTV 클러스터 레이어 생성
 * 사이버펑크 스타일 - 클러스터(Cyan), 개별 마커(Green)로 명확한 구분
 */
export function createCctvClusterLayers(
  cctvClusters: any[],
  options?: { onMarkerClick?: (cctv: any) => void }
) {
  const { onMarkerClick } = options || {};

  // CCTV 클러스터: 밝은 Cyan
  const cctvClusterGlow = new ScatterplotLayer({
    id: "cctv-cluster-glow",
    data: cctvClusters.filter((c: any) => c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: (d: any) => {
      const count = d.properties.point_count;
      return 14 + Math.log2(count) * 3;
    },
    getFillColor: [34, 211, 238, 30], // 밝은 cyan glow
    getLineColor: [34, 211, 238, 0],
    lineWidthMinPixels: 0,
    stroked: false,
    filled: true,
    radiusUnits: "pixels",
    pickable: false,
  });

  const cctvClusterLayer = new ScatterplotLayer({
    id: "cctv-cluster-layer",
    data: cctvClusters.filter((c: any) => c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: (d: any) => {
      const count = d.properties.point_count;
      return 12 + Math.log2(count) * 3;
    },
    getFillColor: [6, 182, 212, 40], // cyan fill
    getLineColor: [34, 211, 238, 255], // 밝은 cyan 테두리
    lineWidthMinPixels: 2.5,
    stroked: true,
    filled: true,
    radiusUnits: "pixels",
    pickable: true,
  });

  const cctvClusterText = new TextLayer({
    id: "cctv-cluster-text",
    data: cctvClusters.filter((c: any) => c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getText: (d: any) => String(d.properties.point_count),
    getSize: 12,
    getColor: [224, 242, 254, 255], // 매우 밝은 cyan
    getTextAnchor: "middle",
    getAlignmentBaseline: "center",
    fontWeight: "700",
    fontFamily: "system-ui",
  });

  // CCTV 개별 마커: 밝은 Green (클러스터와 명확한 차이)
  const cctvPointGlow = new ScatterplotLayer({
    id: "cctv-point-glow",
    data: cctvClusters.filter((c: any) => !c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: 28,
    getFillColor: [34, 197, 94, 60], // 밝은 초록색 glow
    getLineColor: [34, 197, 94, 0],
    lineWidthMinPixels: 0,
    stroked: false,
    filled: true,
    radiusUnits: "pixels",
    pickable: false,
  });

  const cctvPointRing = new ScatterplotLayer({
    id: "cctv-point-ring",
    data: cctvClusters.filter((c: any) => !c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: 16,
    getFillColor: [0, 0, 0, 0],
    getLineColor: [74, 222, 128, 255], // 밝은 초록색 링
    lineWidthMinPixels: 2.5,
    stroked: true,
    filled: false,
    radiusUnits: "pixels",
    pickable: false,
  });

  const cctvPointCore = new ScatterplotLayer({
    id: "cctv-point-core",
    data: cctvClusters.filter((c: any) => !c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: 11,
    getFillColor: [22, 163, 74, 220], // 진한 초록색 코어
    getLineColor: [34, 197, 94, 255],
    lineWidthMinPixels: 2,
    stroked: true,
    filled: true,
    radiusUnits: "pixels",
    pickable: true,
    onClick: (info: any) => {
      if (onMarkerClick && info.object) {
        onMarkerClick(info.object.properties);
      }
    },
  });

  const cctvPointDot = new ScatterplotLayer({
    id: "cctv-point-dot",
    data: cctvClusters.filter((c: any) => !c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: 4,
    getFillColor: [255, 255, 255, 255],
    getLineColor: [22, 163, 74, 255],
    lineWidthMinPixels: 1,
    stroked: true,
    filled: true,
    radiusUnits: "pixels",
    pickable: false,
  });

  return [
    cctvClusterGlow,
    cctvClusterLayer,
    cctvClusterText,
    cctvPointGlow,
    cctvPointRing,
    cctvPointCore,
    cctvPointDot,
  ];
}

export function createParkingClusterLayers(parkingClusters: any[]) {
  const parkingClusterGlow = new ScatterplotLayer({
    id: "parking-cluster-glow",
    data: parkingClusters.filter((c: any) => c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: (d: any) => 12 + Math.log2(d.properties.point_count) * 3,
    getFillColor: [59, 130, 246, 30],
    getLineColor: [59, 130, 246, 0],
    lineWidthMinPixels: 0,
    stroked: false,
    filled: true,
    radiusUnits: "pixels",
    pickable: false,
  });

  const parkingClusterLayer = new ScatterplotLayer({
    id: "parking-cluster-layer",
    data: parkingClusters.filter((c: any) => c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: (d: any) => 10 + Math.log2(d.properties.point_count) * 3,
    getFillColor: [37, 99, 235, 40],
    getLineColor: [96, 165, 250, 255],
    lineWidthMinPixels: 2,
    stroked: true,
    filled: true,
    radiusUnits: "pixels",
    pickable: true,
  });

  const parkingClusterText = new TextLayer({
    id: "parking-cluster-text",
    data: parkingClusters.filter((c: any) => c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getText: (d: any) => String(d.properties.point_count),
    getSize: 11,
    getColor: [219, 234, 254, 255],
    getTextAnchor: "middle",
    getAlignmentBaseline: "center",
    fontWeight: "700",
    fontFamily: "system-ui",
  });

  const parkingPointGlow = new ScatterplotLayer({
    id: "parking-point-glow",
    data: parkingClusters.filter((c: any) => !c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: 20,
    getFillColor: [29, 78, 216, 50],
    getLineColor: [29, 78, 216, 0],
    lineWidthMinPixels: 0,
    stroked: false,
    filled: true,
    radiusUnits: "pixels",
    pickable: false,
  });

  const parkingPointRing = new ScatterplotLayer({
    id: "parking-point-ring",
    data: parkingClusters.filter((c: any) => !c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: 12,
    getFillColor: [0, 0, 0, 0],
    getLineColor: [59, 130, 246, 255],
    lineWidthMinPixels: 2,
    stroked: true,
    filled: true,
    radiusUnits: "pixels",
    pickable: false,
  });

  const parkingPointCore = new ScatterplotLayer({
    id: "parking-point-core",
    data: parkingClusters.filter((c: any) => !c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: 6,
    getFillColor: [59, 130, 246, 255],
    getLineColor: [0, 0, 0, 0],
    lineWidthMinPixels: 0,
    stroked: false,
    filled: true,
    radiusUnits: "pixels",
    pickable: true,
  });

  const parkingPointText = new TextLayer({
    id: "parking-point-text",
    data: parkingClusters.filter((c: any) => !c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getText: () => "P",
    getSize: 10,
    getColor: [255, 255, 255, 255],
    getTextAnchor: "middle",
    getAlignmentBaseline: "center",
    fontWeight: "800",
    fontFamily: "system-ui",
  });

  return [parkingClusterGlow, parkingClusterLayer, parkingClusterText, parkingPointGlow, parkingPointRing, parkingPointCore, parkingPointText];
}
