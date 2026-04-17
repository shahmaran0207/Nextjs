"use client"

import DeckGL from "@deck.gl/react";
import MapGL, { Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTwinMapFunction } from "@/app/hook/useTwinMapFunction";
import TwinRoadPanel from "@/component/dt/TwinRoadPanel";
import TwinSectionPanel from "@/component/dt/TwinSectionPanel";
import TwinLinkPanel from "@/component/dt/TwinLinkPanel";
import { useEffect, useMemo, useRef, useState } from "react";
import Supercluster from "supercluster";
import { createBoundaryLayer, createPathLayer } from "@/component/dt/layers/createBaseLayers";
import { createBitClusterLayers, createConstructionClusterLayers, createThemeTravelClusterLayers } from "@/component/dt/layers/createClusterLayers";
import { FIELD_CONFIG, THEME_CONFIG } from "@/component/dt/constants/iconConfigs";

// Context import를 optional로 처리
let useDataContext: any = null;
try {
  const context = require("@/app/digitalTwin/DataContext");
  useDataContext = context.useDataContext;
} catch (e) {
  // Context가 없으면 무시
}

interface BoundaryFeature {
  id: number;
  code: string;
  name: string;
  contour: number[][];
}

interface ConstructionPoint {
  gid: number;
  lng: number;
  lat: number;
  project_name: string | null;
  progress_rate: number | null;
  plan_rate: number | null;
  achievement_rate: number | null;
  start_date: string | null;
  end_date: string | null;
  location_text: string | null;
  budget_text: string | null;
  d_day: number | null;
  summary: string | null;
  contact: string | null;
  field_code: string | null;
}

interface ThemeTravelPoint {
  gid: number;
  lng: number;
  lat: number;
  content_name: string | null;
  district_name: string | null;
  category_name: string | null;
  place_name: string | null;
  title: string | null;
  subtitle: string | null;
  address: string | null;
  phone: string | null;
  operating_hours: string | null;
  fee_info: string | null;
  closed_days: string | null;
}

interface TwinMapProps {
  linkData: { features: any[] };
  trafficData: any[];
  bitData: any[];
  boundaryData: BoundaryFeature[];
  constructionData: ConstructionPoint[];
  themeTravelData: ThemeTravelPoint[];
}

export default function TwinMap({ linkData: initLinkData, trafficData, bitData, boundaryData, constructionData, themeTravelData }: TwinMapProps) {
  // Context를 안전하게 사용
  let setDataStats: any = () => { };
  try {
    if (useDataContext) {
      const context = useDataContext();
      setDataStats = context.setDataStats;
    }
  } catch (e) {
    // Context 사용 불가능하면 무시
  }

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
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    isLinkSelectModeState.current = isLinkSelectMode;
    isLinkSelectModeRef.current = isLinkSelectMode;
  }, [isLinkSelectMode, isLinkSelectModeRef]);

  // 도로 목록 초기 fetch
  useEffect(() => {
    fetch("/api/GIS/Busan/Road/getRoadList")
      .then(res => res.json())
      .then(data => setRoadData(Array.isArray(data) ? data : []));
  }, [setRoadData]);

  // 실시간 시계 업데이트
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 데이터 통계 계산 및 Context 업데이트
  useEffect(() => {
    const speeds = trafficData.map((t: any) => t.spd).filter((s: number) => s > 0);
    const avgSpeed = speeds.length > 0 ? Math.round(speeds.reduce((a: number, b: number) => a + b, 0) / speeds.length) : 0;
    const activeConstruction = (constructionData || []).filter((c: any) => (c.progress_rate ?? 0) < 100).length;

    setDataStats({
      totalTraffic: trafficData.length,
      avgSpeed,
      activeConstruction,
    });
  }, [trafficData, constructionData, setDataStats]);

  // ─── 교통 속도 맵 ─────────────────────────────────────────────
  const trafficMap = new Map<string, number>();
  trafficData.forEach((item: any) => trafficMap.set(item.lkId, item.spd));

  // ─── PathLayer 데이터 빌드 ────────────────────────────────────
  const pathData = (busanLinkData?.features ?? []).flatMap((feature: any) => {
    const lkId: string = feature.properties?.link_id ?? "";
    const coords = feature.geometry?.coordinates ?? [];

    // MultiLineString의 각 LineString을 개별 경로로 변환
    return coords.map((line: number[][]) => ({
      lkId,
      path: line, // 이미 [lng, lat] 형식이므로 그대로 사용
    }));
  });

  // ─── Supercluster 인덱스 생성 ──────────────────────────────────
  const bitIndex = useMemo(() => {
    const sc = new Supercluster({ radius: 80, maxZoom: 18, minZoom: 0 });
    sc.load(
      (bitData || [])
        .filter((b: any) => b.lat && b.lng)
        .map((b: any) => ({
          type: "Feature" as const,
          geometry: { type: "Point" as const, coordinates: [b.lng, b.lat] as [number, number] },
          properties: b,
        }))
    );
    return sc;
  }, [bitData]);

  const constructionIndex = useMemo(() => {
    const sc = new Supercluster({ radius: 80, maxZoom: 18, minZoom: 0 });
    sc.load(
      (constructionData || []).map((d) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [d.lng, d.lat] as [number, number] },
        properties: d,
      }))
    );
    return sc;
  }, [constructionData]);

  const themeTravelIndex = useMemo(() => {
    const sc = new Supercluster({ radius: 80, maxZoom: 18, minZoom: 0 });
    sc.load(
      (themeTravelData || [])
        .filter((d) => d.lat && d.lng)
        .map((d) => ({
          type: "Feature" as const,
          geometry: { type: "Point" as const, coordinates: [d.lng, d.lat] as [number, number] },
          properties: d,
        }))
    );
    return sc;
  }, [themeTravelData]);

  // 현재 viewport bbox
  const bbox = useMemo((): [number, number, number, number] => {
    const { longitude, latitude, zoom } = viewState as any;
    const latR = 90 / Math.pow(2, zoom);
    const lngR = 180 / Math.pow(2, zoom);
    return [longitude - lngR, latitude - latR, longitude + lngR, latitude + latR];
  }, [viewState]);

  const zoomInt = Math.floor((viewState as any).zoom ?? 12);

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

  // ─── 레이어 생성 ──────────────────────────────────────────────
  const boundaryLayer = createBoundaryLayer(boundaryData);
  const pathLayer = createPathLayer(pathData, trafficMap, highlightedLinkIds, isLinkSelectModeRef, handleLinkSelect);
  const bitLayers = createBitClusterLayers(bitClusters);
  const constructionLayers = createConstructionClusterLayers(constructionClusters);
  const themeTravelLayers = createThemeTravelClusterLayers(themeTravelClusters);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <style>{`
        .dt-panel-scroll::-webkit-scrollbar { width: 6px; }
        .dt-panel-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 3px; }
        .dt-panel-scroll::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.3); border-radius: 3px; }
        .dt-panel-scroll::-webkit-scrollbar-thumb:hover { background: rgba(56,189,248,0.5); }
      `}</style>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }: any) => setViewState(vs)}
        controller={{
          dragPan: true,
          dragRotate: true,
          scrollZoom: true,
          touchZoom: true,
          touchRotate: true,
          keyboard: true,
          doubleClickZoom: true,
        }}
        layers={[
          boundaryLayer,
          ...bitLayers,
          ...constructionLayers,
          ...themeTravelLayers,
          pathLayer,  // PathLayer를 맨 위로 이동 - 클릭 우선순위 최상위
        ]}
        onHover={(info: any) => {
          if (info.layer?.id === "bit-layer" && info.object) {
            const p = info.object.properties;
            setTooltip({
              x: info.x, y: info.y,
              content: `📍 ${p?.stationLoc ?? ""}\n${p?.addr ?? ""}`,
            });
          } else if (info.layer?.id === "bit-cluster-layer" && info.object) {
            setTooltip({
              x: info.x, y: info.y,
              content: `🚌 버스 정류장 ${info.object.properties.point_count}개`,
            });
          } else if (info.layer?.id === "boundary-layer" && info.object) {
            setTooltip({
              x: info.x, y: info.y,
              content: `🗺 ${info.object.name}\n코드: ${info.object.code}`,
            });
          } else if (info.layer?.id === "construction-layer" && info.object) {
            const p = info.object.properties as ConstructionPoint;
            const rate = p?.progress_rate ?? 0;
            const plan = p?.plan_rate ?? 0;
            const fieldLabel = FIELD_CONFIG[p?.field_code ?? ""]?.label ?? "기타";
            const lines = [
              `🚧 ${p?.project_name ?? "공사현장"}`,
              `📋 분야: ${fieldLabel}`,
              p?.location_text ? `📍 ${p.location_text}` : null,
              `📅 ${p?.start_date ?? "?"} ~ ${p?.end_date ?? "?"}`,
              `📊 공정률: ${rate}%  (계획 ${plan}%)`,
              p?.budget_text ? `💰 ${p.budget_text}` : null,
              p?.contact ? `☎ ${p.contact}` : null,
            ].filter(Boolean).join("\n");
            setTooltip({ x: info.x, y: info.y, content: lines });
          } else if (info.layer?.id === "construction-cluster-layer" && info.object) {
            setTooltip({
              x: info.x, y: info.y,
              content: `🚧 공사현장 ${info.object.properties.point_count}개`,
            });
          } else if (info.layer?.id === "theme-layer" && info.object) {
            const p = info.object.properties as ThemeTravelPoint;
            const cfg = THEME_CONFIG[p?.category_name ?? ""] ?? THEME_CONFIG["기타"];
            const lines = [
              `${cfg.emoji} [${p?.category_name ?? "테마여행"}] ${p?.content_name ?? ""}`,
              p?.title ? `✨ ${p.title}` : null,
              p?.subtitle ? `  ${p.subtitle}` : null,
              p?.place_name ? `📍 ${p.place_name}` : null,
              p?.district_name ? `🏙 ${p.district_name}` : null,
              p?.address ? `🏠 ${p.address}` : null,
              p?.operating_hours ? `🕐 ${p.operating_hours}` : null,
              p?.closed_days ? `🚫 휴무: ${p.closed_days}` : null,
              p?.fee_info ? `💳 ${p.fee_info}` : null,
              p?.phone ? `☎ ${p.phone}` : null,
            ].filter(Boolean).join("\n");
            setTooltip({ x: info.x, y: info.y, content: lines });
          } else if (info.layer?.id === "theme-cluster-layer" && info.object) {
            setTooltip({
              x: info.x, y: info.y,
              content: `🗺 테마여행 ${info.object.properties.point_count}개`,
            });
          } else if (info.layer?.id === "path-layer" && info.object) {
            setTooltip({
              x: info.x, y: info.y,
              content: `🛣 링크 ID: ${info.object.lkId}`,
            });
          } else {
            setTooltip(null);
          }
        }}
        getCursor={({ isDragging }: any) =>
          isDragging ? "grabbing" : isLinkSelectMode ? "crosshair" : "grab"
        }
        style={{ position: 'relative', zIndex: '1' }}
      >
        <MapGL
          mapStyle={`https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`}
          interactiveLayerIds={[]} // MapLibre 레이어의 클릭 이벤트 비활성화
          style={{ position: 'relative', zIndex: 0 }}
        >
          {/* 건물 레이어들 제거 - PathLayer 가시성 테스트 */}
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
        background: "rgba(10,14,26,0.92)",
        border: "1px solid rgba(56,189,248,0.2)",
        borderRadius: "12px",
        padding: "12px 16px",
        zIndex: 100,
        backdropFilter: "blur(16px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        width: "240px",
        maxHeight: "calc(50vh - 2rem)",
        display: "flex",
        flexDirection: "column",
      }}>
        <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }} className="dt-panel-scroll">
          <p style={{ color: "#38bdf8", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "8px", textTransform: "uppercase", borderBottom: "1px solid rgba(56,189,248,0.2)", paddingBottom: "4px" }}>교통 속도</p>
          {[
            { label: "≥60 km/h", color: "#00ff64" },
            { label: "≥40 km/h", color: "#96ff00" },
            { label: "≥20 km/h", color: "#ffc800" },
            { label: "≥10 km/h", color: "#ff6400" },
            { label: " <10 km/h", color: "#ff0050" },
            { label: "정보 없음", color: "#8c8c8c" },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ display: "inline-block", width: "28px", height: "3px", background: color, borderRadius: "2px", boxShadow: `0 0 8px ${color}66` }} />
              <span style={{ color: "#e8eaf0", fontSize: "11px" }}>{label}</span>
            </div>
          ))}

          <div style={{ borderTop: "1px solid rgba(56,189,248,0.15)", marginTop: "10px", paddingTop: "8px" }}>
            <p style={{ color: "#38bdf8", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "8px", textTransform: "uppercase", borderBottom: "1px solid rgba(56,189,248,0.2)", paddingBottom: "4px" }}>공사 분야</p>
            {Object.entries(FIELD_CONFIG).map(([code, cfg]) => (
              <div key={code} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{
                  display: "inline-block", width: "12px", height: "12px",
                  background: cfg.fill, borderRadius: "50%",
                  border: `2px solid ${cfg.stroke}`,
                  boxShadow: `0 0 8px ${cfg.fill}88, inset 0 0 4px ${cfg.stroke}44`,
                  flexShrink: 0,
                }} />
                <span style={{ color: "#e8eaf0", fontSize: "10px" }}>
                  <span style={{ color: cfg.stroke, fontWeight: 700, marginRight: 4 }}>{code}</span>
                  {cfg.label}
                </span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(56,189,248,0.15)", marginTop: "10px", paddingTop: "8px" }}>
            <p style={{ color: "#38bdf8", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "8px", textTransform: "uppercase", borderBottom: "1px solid rgba(56,189,248,0.2)", paddingBottom: "4px" }}>테마여행</p>
            {Object.entries(THEME_CONFIG).map(([cat, cfg]) => (
              <div key={cat} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{
                  display: "inline-block", width: "12px", height: "12px",
                  background: cfg.fill, borderRadius: "50%",
                  border: `2px solid ${cfg.stroke}`,
                  boxShadow: `0 0 8px ${cfg.fill}88, inset 0 0 4px ${cfg.stroke}44`,
                  flexShrink: 0,
                }} />
                <span style={{ color: "#e8eaf0", fontSize: "10px" }}>
                  <span style={{ marginRight: 4 }}>{cfg.emoji}</span>
                  {cfg.label}
                </span>
              </div>
            ))}
          </div>
        </div>
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
