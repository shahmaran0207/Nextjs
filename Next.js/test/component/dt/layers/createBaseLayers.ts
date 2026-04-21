import { PathLayer, PolygonLayer } from "@deck.gl/layers";
import { getBoundaryColor, getSpeedRgba } from "../utils/iconUtils";

interface BoundaryFeature {
  id: number;
  code: string;
  name: string;
  contour: number[][];
}

export function createBoundaryLayer(boundaryData: BoundaryFeature[]) {
  return new PolygonLayer({
    id: "boundary-layer",
    data: boundaryData,
    getPolygon: (d: BoundaryFeature) => d.contour,
    getFillColor: (d: BoundaryFeature) => {
      const [r, g, b] = getBoundaryColor(d.id);
      return [r, g, b, 35];
    },
    getLineColor: (d: BoundaryFeature) => {
      const [r, g, b] = getBoundaryColor(d.id);
      return [r, g, b, 190];
    },
    lineWidthMinPixels: 1.5,
    stroked: true,
    filled: true,
    pickable: true,
    updateTriggers: { getFillColor: [], getLineColor: [] },
  });
}

export function createPathLayer(
  pathData: any[],
  trafficMap: Map<string, number>,
  highlightedLinkIds: Set<string>,
  activeLinkId: string | null,
  isLinkSelectModeRef: any,
  handleLinkSelect: (lkId: string, busanLinkData: any) => void,
  busanLinkData: any,
  selectableLinkIds: Set<string>,
  onHistoryClick?: (lkId: string, speed: number | null, screenX: number, screenY: number) => void
) {

  // Set을 배열로 변환하여 updateTriggers가 제대로 작동하도록
  const highlightedArray = Array.from(highlightedLinkIds);
  const selectableArray = Array.from(selectableLinkIds);

  // 디버깅: 소통정보 매칭 확인
  let matchedCount = 0;
  let unmatchedCount = 0;
  pathData.forEach((d: any) => {
    if (trafficMap.has(d.lkId)) {
      matchedCount++;
    } else {
      unmatchedCount++;
    }
  });

  return new PathLayer({
    id: "path-layer",
    data: pathData,
    getPath: (d: any) => d.path,
    getColor: (d: any) => {
      if (activeLinkId && d.lkId === activeLinkId) {
        return [56, 189, 248, 255]; // 특별 하이라이트: 테마 Cyan
      }

      const isHighlighted = highlightedLinkIds.has(d.lkId);
      if (isHighlighted) {
        return [255, 215, 0, 200]; // 하이라이트 (같은 구역 내 기타 링크): 금색 (opacity 조절)
      }

      // 링크 선택 모드일 때 선택 가능한 링크 표시
      if (isLinkSelectModeRef.current && selectableLinkIds.has(d.lkId)) {
        return [74, 222, 128, 180]; // 선택 가능: 밝은 초록색
      }

      // 링크 선택 모드일 때 선택 불가능한 링크는 어둡게
      if (isLinkSelectModeRef.current) {
        return [100, 100, 100, 80]; // 선택 불가: 어두운 회색
      }

      // 소통정보 색상 적용
      const spd = trafficMap.get(d.lkId);
      return getSpeedRgba(spd);
    },
    getWidth: (d: any) => {
      if (activeLinkId && d.lkId === activeLinkId) {
        return 10; // 가장 두껍게
      }
      const isHighlighted = highlightedLinkIds.has(d.lkId);
      if (isHighlighted) {
        return 6;
      }
      // 링크 선택 모드일 때 선택 가능한 링크는 두껍게
      if (isLinkSelectModeRef.current && selectableLinkIds.has(d.lkId)) {
        return 5;
      }
      return 3.5;
    },
    widthUnits: 'pixels',
    widthMinPixels: 2,
    widthMaxPixels: 12,
    pickable: true,
    visible: true,
    opacity: 0.7,
    billboard: false,
    onClick: (info: any) => {
      if (info.object && isLinkSelectModeRef.current) {
        // 선택 가능한 링크만 클릭 처리
        if (selectableLinkIds.size === 0 || selectableLinkIds.has(info.object.lkId)) {
          handleLinkSelect(info.object.lkId, busanLinkData);
        }
      } else if (info.object && !isLinkSelectModeRef.current && onHistoryClick) {
        // 일반 모드: 속도 이력 팝업 열기
        const spd = trafficMap.get(info.object.lkId) ?? null;
        onHistoryClick(info.object.lkId, spd, info.x, info.y);
      }
      return true;
    },
    updateTriggers: {
      getColor: [highlightedArray, trafficMap.size, activeLinkId, selectableArray],
      getWidth: [highlightedArray, activeLinkId, selectableArray],
    },
  });
}
