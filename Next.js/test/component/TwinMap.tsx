"use client"

import DeckGL from "@deck.gl/react";
import { PathLayer, ScatterplotLayer } from "@deck.gl/layers";
import MapGL, { Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTwinMapFunction } from "@/app/hook/useTwinMapFunction";
import TwinRoadPanel from "@/component/dt/TwinRoadPanel";
import TwinSectionPanel from "@/component/dt/TwinSectionPanel";
import TwinLinkPanel from "@/component/dt/TwinLinkPanel";
import { useEffect, useRef, useState } from "react";

// ─── 교통 속도 → RGBA 색상 ──────────────────────────────────────
function getSpeedRgba(spd: number | undefined): [number, number, number, number] {
  if (spd === undefined || spd === null) return [180, 180, 180, 150];
  if (spd >= 60) return [0, 204, 68, 210];
  if (spd >= 40) return [136, 204, 0, 210];
  if (spd >= 20) return [255, 170, 0, 210];
  if (spd >= 10) return [255, 85, 0, 210];
  return [255, 0, 0, 210];
}

interface TwinMapProps {
  linkData: { features: any[] };
  trafficData: any[];
  bitData: any[];
}

export default function TwinMap({ linkData: initLinkData, trafficData, bitData }: TwinMapProps) {
  const {
    viewState, setViewState,
    roadData, setRoadData,
    sectionData,
    linkData, setLinkData,
    selectedRoadId,
    selectedSectionId,
    selectedLinks, setSelectedLinks,
    isLinkSelectMode, setIsLinkSelectMode,
    isLinkSelectModeRef,
    highlightedLinkIds,
    existingLinkIdsRef,
    handleRoad, handleSection, handleLink,
    handleLinkSelect,
    enterLinkSelectMode,
    clearAllHighlights,
    showTrafficOnly,
    saveLinks,
  } = useTwinMapFunction();

  const [busanLinkData] = useState(initLinkData);
  const isLinkSelectModeState = useRef(isLinkSelectMode);

  useEffect(() => {
    isLinkSelectModeState.current = isLinkSelectMode;
    isLinkSelectModeRef.current = isLinkSelectMode;
  }, [isLinkSelectMode, isLinkSelectModeRef]);

  // 도로 목록 초기 fetch
  useEffect(() => {
    fetch("/api/GIS/Busan/Road/getRoadList")
      .then(res => res.json())
      .then(data => setRoadData(Array.isArray(data) ? data : []));
  }, []);

  // ─── 교통 속도 맵 ─────────────────────────────────────────────
  const trafficMap = new Map<string, number>();
  trafficData.forEach((item: any) => trafficMap.set(item.lkId, item.spd));

  // ─── PathLayer 데이터 빌드 ────────────────────────────────────
  const pathData = (busanLinkData?.features ?? []).flatMap((feature: any) => {
    const lkId: string = feature.properties?.link_id ?? "";
    return feature.geometry.coordinates.map((line: number[][]) => ({
      lkId,
      path: line.map(([lng, lat]) => [lng, lat]),
    }));
  });

  // ─── ScatterplotLayer (BIT 정류소) ────────────────────────────
  const bitLayer = new ScatterplotLayer({
    id: "bit-layer",
    data: bitData.filter((b: any) => b.lat && b.lng),
    getPosition: (d: any) => [d.lng, d.lat],
    getRadius: 18,
    getFillColor: [56, 189, 248, 200],
    getLineColor: [255, 255, 255, 120],
    lineWidthMinPixels: 1,
    stroked: true,
    pickable: true,
  });

  // ─── PathLayer (링크 폴리라인) ────────────────────────────────
  const pathLayer = new PathLayer({
    id: "path-layer",
    data: pathData,
    getPath: (d: any) => d.path,
    getColor: (d: any) => {
      const lkId = d.lkId;
      if (highlightedLinkIds.has(lkId)) {
        return [56, 189, 248, 255]; // 선택 강조 (스카이블루)
      }
      return getSpeedRgba(trafficMap.get(lkId));
    },
    getWidth: (d: any) => highlightedLinkIds.has(d.lkId) ? 8 : 4,
    widthMinPixels: 2,
    pickable: true,
    onClick: (info: any) => {
      if (isLinkSelectModeRef.current && info.object) {
        handleLinkSelect(info.object.lkId);
      }
    },
    updateTriggers: {
      getColor: [highlightedLinkIds],
      getWidth: [highlightedLinkIds],
    },
  });

  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }: any) => setViewState(vs)}
        controller={true}
        layers={[bitLayer, pathLayer]}
        onHover={(info: any) => {
          if (info.layer?.id === "bit-layer" && info.object) {
            setTooltip({
              x: info.x,
              y: info.y,
              content: `📍 ${info.object.stationLoc}\n${info.object.addr}`,
            });
          } else {
            setTooltip(null);
          }
        }}
        getCursor={({ isDragging }: any) =>
          isDragging ? "grabbing" : isLinkSelectMode ? "crosshair" : "grab"
        }
      >
        <MapGL
          mapStyle={`https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`}
        >
          {/* ① 건물 바닥 네온 아웃라인 (홀로그래픽 그리드) */}
          <Layer
            id="building-footprint-glow"
            source="openmaptiles"
            source-layer="building"
            type="fill"
            minzoom={13}
            paint={{
              "fill-color": "rgba(0, 212, 255, 0.04)",
              "fill-outline-color": "rgba(0, 212, 255, 0.55)",
            }}
          />

          {/* ② 3D 건물 본체 (다크 홀로그래픽) */}
          <Layer
            id="3d-buildings-body"
            source="openmaptiles"
            source-layer="building"
            type="fill-extrusion"
            minzoom={13}
            paint={{
              "fill-extrusion-color": [
                "interpolate", ["linear"],
                ["coalesce", ["get", "render_height"], ["get", "height"], 5],
                0,   "#040d1f",
                10,  "#06152e",
                30,  "#081e42",
                60,  "#0a2756",
                100, "#0c306a",
                200, "#0e3a80",
              ],
              "fill-extrusion-height": [
                "*",
                ["coalesce", ["get", "render_height"], ["get", "height"], 5],
                1.8
              ],
              "fill-extrusion-base": [
                "coalesce", ["get", "render_min_height"], 0
              ],
              "fill-extrusion-opacity": 0.92,
            }}
          />

          {/* ③ 건물 최상단 네온 캡 (글로우 효과) */}
          <Layer
            id="3d-buildings-top-cap"
            source="openmaptiles"
            source-layer="building"
            type="fill-extrusion"
            minzoom={13}
            paint={{
              "fill-extrusion-color": "#00d4ff",
              "fill-extrusion-height": [
                "*",
                ["coalesce", ["get", "render_height"], ["get", "height"], 5],
                1.8
              ],
              "fill-extrusion-base": [
                "-",
                ["*", ["coalesce", ["get", "render_height"], ["get", "height"], 5], 1.8],
                2.0
              ],
              "fill-extrusion-opacity": 0.75,
            }}
          />
        </MapGL>
      </DeckGL>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: "absolute",
          left: tooltip.x + 12,
          top: tooltip.y - 10,
          background: "rgba(10,14,26,0.92)",
          border: "1px solid rgba(56,189,248,0.4)",
          borderRadius: "8px",
          padding: "8px 12px",
          color: "#e8eaf0",
          fontSize: "12px",
          pointerEvents: "none",
          zIndex: 200,
          whiteSpace: "pre-line",
          maxWidth: "220px",
        }}>
          {tooltip.content}
        </div>
      )}

      {/* 링크 선택 모드 안내 배너 */}
      {isLinkSelectMode && (
        <div style={{
          position: "absolute",
          top: "1rem",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(56,189,248,0.15)",
          border: "1px solid rgba(56,189,248,0.5)",
          borderRadius: "10px",
          padding: "8px 20px",
          color: "#38bdf8",
          fontSize: "13px",
          fontWeight: 600,
          zIndex: 150,
          backdropFilter: "blur(12px)",
          animation: "dtFadeIn 0.2s ease-out",
        }}>
          🔗 링크 선택 모드 — 지도의 도로를 클릭하세요
        </div>
      )}

      {/* 범례 */}
      <div style={{
        position: "absolute",
        bottom: "1.5rem",
        left: "1rem",
        background: "rgba(10,14,26,0.85)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "10px 14px",
        zIndex: 100,
        backdropFilter: "blur(12px)",
      }}>
        <p style={{ color: "#8b90a7", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "6px", textTransform: "uppercase" }}>교통 속도</p>
        {[
          { label: "≥60 km/h", color: "#00cc44" },
          { label: "≥40 km/h", color: "#88cc00" },
          { label: "≥20 km/h", color: "#ffaa00" },
          { label: "≥10 km/h", color: "#ff5500" },
          { label: " <10 km/h", color: "#ff0000" },
          { label: "정보 없음",  color: "#b4b4b4" },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
            <span style={{ display: "inline-block", width: "24px", height: "4px", background: color, borderRadius: "2px" }} />
            <span style={{ color: "#8b90a7", fontSize: "11px" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* 패널들 */}
      <TwinRoadPanel
        roadData={roadData}
        handleRoad={handleRoad}
        clearAllHighlights={clearAllHighlights}
        showTrafficOnly={showTrafficOnly}
        selectedRoadId={selectedRoadId}
      />

      <TwinSectionPanel
        sectionData={sectionData}
        handleSection={handleSection}
        selectedRoadId={selectedRoadId}
        selectedSectionId={selectedSectionId}
        setLinkData={setLinkData}
        setSelectedLinks={setSelectedLinks}
        setIsLinkSelectMode={setIsLinkSelectMode}
        clearAllHighlights={clearAllHighlights}
      />

      <TwinLinkPanel
        linkData={linkData}
        selectedSectionId={selectedSectionId}
        isLinkSelectMode={isLinkSelectMode}
        selectedLinks={selectedLinks}
        existingLinkIds={existingLinkIdsRef.current}
        enterLinkSelectMode={() => enterLinkSelectMode(busanLinkData)}
        handleLink={(id) => handleLink(id, busanLinkData)}
        clearAllHighlights={clearAllHighlights}
        saveLinks={saveLinks}
      />
    </div>
  );
}