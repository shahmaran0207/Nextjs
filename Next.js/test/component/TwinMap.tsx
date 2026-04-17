"use client"

import DeckGL from "@deck.gl/react";
import MapGL from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTwinMapFunction } from "@/app/hook/useTwinMapFunction";
import TwinRoadPanel from "@/component/dt/TwinRoadPanel";
import TwinSectionPanel from "@/component/dt/TwinSectionPanel";
import TwinLinkPanel from "@/component/dt/TwinLinkPanel";
import TimeFilterPanel from "@/component/dt/panels/TimeFilterPanel";
import DashboardPanel from "@/component/dt/panels/DashboardPanel";
import { TourismCarouselDisplay, ConstructionCarouselDisplay } from "@/component/CarouselInfoDisplay";
import MapLegend from "@/component/MapLegend";
import CctvPopup from "@/component/dt/popups/CctvPopup";
import { useEffect, useRef, useState } from "react";
import { createBoundaryLayer, createPathLayer } from "@/component/dt/layers/createBaseLayers";
import { createBitClusterLayers, createConstructionClusterLayers, createThemeTravelClusterLayers, createCctvClusterLayers } from "@/component/dt/layers/createClusterLayers";
import { useTimeFilter } from "@/component/dt/hooks/useTimeFilter";
import { useDashboardStats } from "@/component/dt/hooks/useDashboardStats";
import { useMapNavigation } from "@/hooks/useMapNavigation";
import { useCategoryFilter } from "@/hooks/useCategoryFilter";
import { ConstructionPoint, ThemeTravelPoint } from "@/component/dt/modules/DashboardStatsModule";
import { useTwinClusters } from "@/component/dt/hooks/useTwinClusters";
import { useTwinTooltip } from "@/component/dt/hooks/useTwinTooltip";
import { useTwinCarousels } from "@/component/dt/hooks/useTwinCarousels";
import { DISTRICT_COORDINATES } from "@/component/dt/constants/districtCoordinates";
import { DistrictBoundary } from "@/types/ui-ux";
import { getDistrictCenter } from "@/utils/mapValidation";
import { CCTVPoint } from "@/types/cctv";
import styles from "./TwinMap.module.css";

// Context import를 optional로 처리
let useDataContext: any = null;
try {
  const context = require("@/app/digitalTwin/DataContext");
  useDataContext = context.useDataContext;
} catch (e) {
  // Context가 없으면 무시
}

interface TwinMapProps {
  linkData: { features: any[] };
  trafficData: any[];
  bitData: any[];
  boundaryData: DistrictBoundary[];
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
    activeLinkId,
  } = useTwinMapFunction();

  const [busanLinkData] = useState(initLinkData);
  const isLinkSelectModeState = useRef(isLinkSelectMode);

  // CCTV 상태
  const [cctvData, setCctvData] = useState<CCTVPoint[]>([]);
  const [selectedCctv, setSelectedCctv] = useState<CCTVPoint | null>(null);
  const [isCctvPopupOpen, setIsCctvPopupOpen] = useState(false);

  // Time Filter Hook
  const {
    config: timeFilterConfig,
    setStartDate,
    setEndDate,
    toggleOngoingOnly,
    filteredConstruction,
    visibleCount,
    totalCount,
    resetFilters,
  } = useTimeFilter(constructionData);

  // Dashboard Stats Hook
  const { stats, isLoading: statsLoading } = useDashboardStats(
    filteredConstruction,
    themeTravelData,
    boundaryData,
    cctvData
  );

  // Map Navigation Hook
  const { flyTo } = useMapNavigation({
    viewState,
    setViewState,
    animationDuration: 500,
  });

  // 관광 카테고리 필터링 Hook
  const { filteredData: filteredTourismData } = useCategoryFilter({
    data: themeTravelData,
    getCategoryKey: (item) => item.category_name || '기타',
  });

  // 공사 카테고리 필터링 Hook
  const { filteredData: filteredConstructionByCategory } = useCategoryFilter({
    data: filteredConstruction, // 시간 필터링된 데이터를 카테고리 필터링
    getCategoryKey: (item) => item.field_code || 'F08',
  });

  // 카루젤 관리 Hook
  const carousels = useTwinCarousels({
    filteredTourismData,
    filteredConstructionByCategory,
    flyTo,
  });

  // 클러스터링 Hook
  const { bitClusters, constructionClusters, themeTravelClusters, cctvClusters } = useTwinClusters({
    bitData,
    filteredConstructionByCategory,
    filteredTourismData,
    cctvData,
    viewState,
  });

  // 툴팁 Hook
  const { tooltip, handleHover } = useTwinTooltip();

  // District 클릭 핸들러
  const handleDistrictClick = (districtName: string) => {
    // 구 이름 → 좌표 직접 매핑
    if (DISTRICT_COORDINATES[districtName]) {
      flyTo(DISTRICT_COORDINATES[districtName], 13);
      return;
    }

    // boundaryData에서 해당 district 찾기 (동 단위)
    const district = boundaryData.find(
      (d) => d.name === districtName || d.name.includes(districtName)
    );

    if (district) {
      flyTo(getDistrictCenter(district), 13);
    } else {
      console.warn(`District not found: ${districtName}`);
      flyTo([129.0756, 35.1796], 12);
    }
  };

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

  // CCTV 데이터 페칭
  useEffect(() => {
    fetch("/api/GIS/Busan/CCTV/getCCTVList")
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setCctvData(data.data);
        }
      })
      .catch(err => {
        console.error("Failed to fetch CCTV data:", err);
        setCctvData([]); // Graceful degradation
      });
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

  // ─── 레이어 생성 ──────────────────────────────────────────────
  const boundaryLayer = createBoundaryLayer(boundaryData);
  const pathLayer = createPathLayer(pathData, trafficMap, highlightedLinkIds, activeLinkId, isLinkSelectModeRef, handleLinkSelect);
  const bitLayers = createBitClusterLayers(bitClusters);
  const constructionLayers = createConstructionClusterLayers(constructionClusters);
  const themeTravelLayers = createThemeTravelClusterLayers(themeTravelClusters);
  const cctvLayers = createCctvClusterLayers(cctvClusters, {
    onMarkerClick: (cctv) => {
      setSelectedCctv(cctv);
      setIsCctvPopupOpen(true);
    }
  });

  return (
    <div className={styles.mapContainer}>
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
          ...cctvLayers,  // CCTV 레이어 추가
          pathLayer,  // PathLayer를 맨 위로 이동 - 클릭 우선순위 최상위
        ]}
        onHover={handleHover}
        getCursor={({ isDragging }: any) =>
          isDragging ? "grabbing" : isLinkSelectMode ? "crosshair" : "grab"
        }
        style={{ position: 'relative', zIndex: '1' }}
      >
        <MapGL
          mapStyle={`https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`}
          interactiveLayerIds={[]} // MapLibre 레이어의 클릭 이벤트 비활성화
          style={{ position: 'relative', zIndex: '0' }}
        >
        </MapGL>
      </DeckGL>

      {/* Tooltip */}
      {tooltip && (
        <div
          className={styles.tooltip}
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 10,
          }}
        >
          {tooltip.content}
        </div>
      )}

      {/* 링크 선택 모드 안내 배너 */}
      {isLinkSelectMode && (
        <div className={`${styles.banner} ${styles.linkSelectBanner}`}>
          🔗 링크 선택 모드 — 지도의 도로를 클릭하세요
        </div>
      )}

      {/* 관광 순환 UI 표시 */}
      {carousels.tourismCarousel.isActive && carousels.tourismCarousel.currentItem && carousels.selectedTourismCategoryForCarousel && (
        <TourismCarouselDisplay
          categoryName={carousels.selectedTourismCategoryForCarousel}
          currentIndex={carousels.tourismCarousel.currentIndex}
          totalCount={carousels.tourismCarouselItems.length}
          currentItem={carousels.tourismCarousel.currentItem.data as ThemeTravelPoint}
        />
      )}

      {/* 공사 순환 UI 표시 */}
      {carousels.constructionCarousel.isActive && carousels.constructionCarousel.currentItem && carousels.selectedConstructionCategoryForCarousel && (
        <ConstructionCarouselDisplay
          fieldCode={carousels.selectedConstructionCategoryForCarousel}
          currentIndex={carousels.constructionCarousel.currentIndex}
          totalCount={carousels.constructionCarouselItems.length}
          currentItem={carousels.constructionCarousel.currentItem.data as ConstructionPoint}
        />
      )}

      {/* 범례 */}
      <MapLegend />

      {/* CCTV 팝업 */}
      {selectedCctv && (
        <CctvPopup
          cctv={selectedCctv}
          isOpen={isCctvPopupOpen}
          onClose={() => setIsCctvPopupOpen(false)}
        />
      )}

      {/* 왼쪽 상단: 도로 테이블 (독립) */}
      <TwinRoadPanel
        roadData={roadData}
        handleRoad={handleRoad}
        clearAllHighlights={clearAllHighlights}
        showTrafficOnly={showTrafficOnly}
        selectedRoadId={selectedRoadId}
      />

      {/* 오른쪽 상단: 구역 관리 / 시간 관리 (도로 선택 여부에 따라 자동 전환) */}
      <div className={styles.topRightPanel}>
        {selectedRoadId ? (
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
        ) : (
          <TimeFilterPanel
            startDate={timeFilterConfig.startDate}
            endDate={timeFilterConfig.endDate}
            ongoingOnly={timeFilterConfig.ongoingOnly}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onOngoingToggle={toggleOngoingOnly}
            onReset={resetFilters}
            visibleCount={visibleCount}
            totalCount={totalCount}
          />
        )}
      </div>

      {/* 오른쪽 하단: 도로 선택 시 링크 테이블, 아니면 통계 대시보드 */}
      <div className={styles.bottomRightPanel}>
        {selectedRoadId ? (
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
        ) : (
          <DashboardPanel
            stats={stats}
            isLoading={statsLoading}
            boundaryData={boundaryData}
            onDistrictClick={handleDistrictClick}
            onTourismCategoryClick={(category) => {
              // 관광 카테고리 클릭 시 바로 순환 시작
              carousels.handleTourismCategoryPress(category);
            }}
            onConstructionFieldClick={(fieldCode) => {
              // 공사 분야 클릭 시 바로 순환 시작
              carousels.handleConstructionCategoryPress(fieldCode);
            }}
            activeCarouselCategory={carousels.activeCarouselCategory}
            activeCarouselType={carousels.activeCarouselType}
          />
        )}
      </div>
    </div>
  );
}
