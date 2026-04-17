import { IconLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import { BUS_PIN_URL } from "../constants/iconConfigs";
import { getConstructionPinUrl, getThemePinUrl } from "../utils/iconUtils";

export function createBitClusterLayers(bitClusters: any[]) {
  const bitClusterGlow = new ScatterplotLayer({
    id: "bit-cluster-glow",
    data: bitClusters.filter((c: any) => c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: (d: any) => {
      const count = d.properties.point_count;
      return 12 + Math.log2(count) * 3;
    },
    getFillColor: [56, 189, 248, 20],
    getLineColor: [56, 189, 248, 0],
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
    getFillColor: [14, 165, 233, 0],
    getLineColor: [56, 189, 248, 200],
    lineWidthMinPixels: 1.8,
    stroked: true,
    filled: false,
    radiusUnits: "pixels",
    pickable: true,
  });

  const bitClusterText = new TextLayer({
    id: "bit-cluster-text",
    data: bitClusters.filter((c: any) => c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getText: (d: any) => String(d.properties.point_count),
    getSize: 11,
    getColor: [186, 230, 253, 255],
    getTextAnchor: "middle",
    getAlignmentBaseline: "center",
    fontWeight: "600",
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
  const constructionClusterGlow = new ScatterplotLayer({
    id: "construction-cluster-glow",
    data: constructionClusters.filter((c: any) => c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: (d: any) => {
      const count = d.properties.point_count;
      return 12 + Math.log2(count) * 3;
    },
    getFillColor: [249, 115, 22, 20],
    getLineColor: [251, 191, 36, 0],
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
    getFillColor: [249, 115, 22, 0],
    getLineColor: [251, 191, 36, 200],
    lineWidthMinPixels: 1.8,
    stroked: true,
    filled: false,
    radiusUnits: "pixels",
    pickable: true,
  });

  const constructionClusterText = new TextLayer({
    id: "construction-cluster-text",
    data: constructionClusters.filter((c: any) => c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getText: (d: any) => String(d.properties.point_count),
    getSize: 11,
    getColor: [251, 191, 36, 255],
    getTextAnchor: "middle",
    getAlignmentBaseline: "center",
    fontWeight: "600",
    fontFamily: "system-ui",
  });

  const constructionPointLayer = new IconLayer({
    id: "construction-layer",
    data: constructionClusters.filter((c: any) => !c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getIcon: (d: any) => {
      const code: string | null = d.properties?.field_code ?? null;
      return { url: getConstructionPinUrl(code), width: 48, height: 62, anchorY: 62 };
    },
    getSize: 28,
    pickable: true,
    updateTriggers: { getIcon: [] },
  });

  return [constructionClusterGlow, constructionClusterLayer, constructionClusterText, constructionPointLayer];
}

export function createThemeTravelClusterLayers(themeTravelClusters: any[]) {
  const themeTravelClusterGlow = new ScatterplotLayer({
    id: "theme-cluster-glow",
    data: themeTravelClusters.filter((c: any) => c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getRadius: (d: any) => {
      const count = d.properties.point_count;
      return 12 + Math.log2(count) * 3;
    },
    getFillColor: [236, 72, 153, 20],
    getLineColor: [251, 207, 232, 0],
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
    getFillColor: [236, 72, 153, 0],
    getLineColor: [251, 207, 232, 200],
    lineWidthMinPixels: 1.8,
    stroked: true,
    filled: false,
    radiusUnits: "pixels",
    pickable: true,
  });

  const themeTravelClusterText = new TextLayer({
    id: "theme-cluster-text",
    data: themeTravelClusters.filter((c: any) => c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getText: (d: any) => String(d.properties.point_count),
    getSize: 11,
    getColor: [251, 207, 232, 255],
    getTextAnchor: "middle",
    getAlignmentBaseline: "center",
    fontWeight: "600",
    fontFamily: "system-ui",
  });

  const themeTravelPointLayer = new IconLayer({
    id: "theme-layer",
    data: themeTravelClusters.filter((c: any) => !c.properties.cluster),
    getPosition: (d: any) => d.geometry.coordinates,
    getIcon: (d: any) => {
      const cat: string | null = d.properties?.category_name ?? null;
      return { url: getThemePinUrl(cat), width: 48, height: 62, anchorY: 62 };
    },
    getSize: 28,
    pickable: true,
    updateTriggers: { getIcon: [] },
  });

  return [themeTravelClusterGlow, themeTravelClusterLayer, themeTravelClusterText, themeTravelPointLayer];
}
