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
  isLinkSelectModeRef: any,
  handleLinkSelect: (lkId: string) => void
) {

  // Set을 배열로 변환하여 updateTriggers가 제대로 작동하도록
  const highlightedArray = Array.from(highlightedLinkIds);

  return new PathLayer({
    id: "path-layer",
    data: pathData,
    getPath: (d: any) => d.path,
    getColor: (d: any) => {
      const isHighlighted = highlightedLinkIds.has(d.lkId);
      if (isHighlighted) {
        return [255, 215, 0, 255]; // 하이라이트: 금색
      }

      const spd = trafficMap.get(d.lkId);
      return getSpeedRgba(spd);
    },
    getWidth: (d: any) => {
      const isHighlighted = highlightedLinkIds.has(d.lkId);
      return isHighlighted ? 8 : 4;
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
        handleLinkSelect(info.object.lkId);
      }
      return true;
    },
    updateTriggers: {
      getColor: [highlightedArray, trafficMap.size],
      getWidth: [highlightedArray],
    },
  });
}
