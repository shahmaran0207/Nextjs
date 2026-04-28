"use client"

import DeckGL from "@deck.gl/react";
import { WebMercatorViewport } from "@deck.gl/core";
import MapGL, { Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTwinMapFunction } from "@/app/hook/useTwinMapFunction";
import TwinRoadPanel from "@/component/dt/TwinRoadPanel";
import TwinSectionPanel from "@/component/dt/TwinSectionPanel";
import TwinLinkPanel from "@/component/dt/TwinLinkPanel";
import TimeFilterPanel from "@/component/dt/panels/TimeFilterPanel";
import DashboardPanel from "@/component/dt/panels/DashboardPanel";
import RoadviewPanel from "@/component/dt/panels/RoadviewPanel";
import TrafficHistoryPanel from "@/component/dt/panels/TrafficHistoryPanel";
import WeatherHeader from "@/component/dt/WeatherHeader";
import { TourismCarouselDisplay, ConstructionCarouselDisplay } from "@/component/CarouselInfoDisplay";
import MapLegend from "@/component/MapLegend";
import CctvPopup from "@/component/dt/popups/CctvPopup";
import CctvPlayer from "@/component/dt/modules/CctvPlayer";
import LinkSpeedHistoryPopup from "@/component/dt/popups/LinkSpeedHistoryPopup";
import { useEffect, useRef, useMemo } from "react";
import { createBoundaryLayer, createPathLayer } from "@/component/dt/layers/createBaseLayers";
import { createBitClusterLayers, createConstructionClusterLayers, createThemeTravelClusterLayers, createCctvClusterLayers, createParkingClusterLayers } from "@/component/dt/layers/createClusterLayers";
import { createRoadviewMarkerLayer } from "@/component/dt/layers/createRoadviewMarker";
import { createTrafficHeatmapLayer } from "@/component/dt/layers/createHeatmapLayer";
import RainOverlay from "@/component/dt/RainOverlay";
import { useMapNavigation } from "@/hooks/useMapNavigation";
import { ConstructionPoint, ThemeTravelPoint } from "@/component/dt/modules/DashboardStatsModule";
import { useTwinTooltip } from "@/component/dt/hooks/useTwinTooltip";
import { DistrictBoundary } from "@/types/ui-ux";
import styles from "./TwinMap.module.css";
import { useDeliverySimulation } from "@/component/dt/hooks/useDeliverySimulation";
import { useTwinMapHandlers } from "@/component/dt/hooks/useTwinMapHandlers";
import { useTwinMapState } from "@/component/dt/hooks/useTwinMapState";

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
  trackingNumber?: string;
  shippingAddress?: string;
}

export default function TwinMap({ linkData: initLinkData, trafficData: initTrafficData, bitData, boundaryData, constructionData, themeTravelData, trackingNumber, shippingAddress }: TwinMapProps) {
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
    viewState, setViewState, roadData, setRoadData,
    sectionData, linkData, setLinkData, selectedRoadId,
    selectedSectionId, selectedLinks, setSelectedLinks,
    isLinkSelectMode, setIsLinkSelectMode, isLinkSelectModeRef,
    highlightedLinkIds, existingLinkIdsRef, handleRoad,
    handleSection, handleLink, handleLinkSelect, enterLinkSelectMode,
    clearAllHighlights, showTrafficOnly, saveLinks, activeLinkId,
    getSelectableLinkIds,
  } = useTwinMapFunction();

  // Map Navigation Hook (flyTo가 useTwinMapState보다 먼저 필요)
  const { flyTo } = useMapNavigation({ viewState, setViewState, animationDuration: 500 });

  // ─── 상태 / 데이터 훅 통합 ─────────────────────────────────────
  const {
    busanLinkData, allLinksData, setAllLinksData,
    isLinkSelectModeState,
    trafficData,
    cctvData, setCctvData,
    selectedCctv, setSelectedCctv,
    isCctvPopupOpen, setIsCctvPopupOpen,
    isCctvOnly, setIsCctvOnly,
    historyPopup, setHistoryPopup,
    roadviewState, setRoadviewState,
    roadviewMarker, setRoadviewMarker,
    isHistoryPanelOpen, setIsHistoryPanelOpen,
    isHistoryMode, setIsHistoryMode,
    historyTrafficMap, setHistoryTrafficMap,
    isRainy, mapStyleUrl,
    timeFilterConfig, setStartDate, setEndDate,
    toggleOngoingOnly, filteredConstruction,
    visibleCount, totalCount, resetFilters,
    stats, statsLoading,
    filteredTourismData, filteredConstructionByCategory, carousels,
    trafficMap, bitClusters, constructionClusters, themeTravelClusters, cctvClusters, parkingClusters,
    shouldFilterLinks, filteredLinks,
    isFpvMode, toggleFpvMode,
    isHeatmapVisible, setIsHeatmapVisible, heatmapData,
    couponBoxes, collectedCoupon, handleCouponClick,
    spawnCoupons, updateCouponVisibility,
  } = useTwinMapState({
    initTrafficData, initLinkData,
    constructionData, themeTravelData, boundaryData, bitData,
    isLinkSelectMode, isLinkSelectModeRef, selectedLinks,
    flyTo, viewState, setViewState,
    setRoadData, setDataStats,
  });

  // ─── 🚚 배송 시뮬레이션 (OSRM 기반) ──────────────────────────
  const {
    deliveryRoute, deliveryProgress, isSimulating,
    truckPos, nearbyEvent, truckAngle, autoOpenedCctvRef,
  } = useDeliverySimulation({
    trackingNumber, shippingAddress,
    cctvData, constructionData,
    setViewState, setSelectedCctv, setIsCctvPopupOpen,
  });

  // 쿠폰 경로 배치 (시뮬레이션 시작 시)
  useEffect(() => { spawnCoupons(deliveryRoute ?? []); }, [deliveryRoute, spawnCoupons]);
  // 트럭 근접 시 쿠폰 visible 갱신
  useEffect(() => { updateCouponVisibility(truckPos ?? null, isSimulating); }, [truckPos, isSimulating, updateCouponVisibility]);

  // 툴팁 Hook
  const { tooltip, handleHover } = useTwinTooltip();

  // ─── 핸들러 / 이벤트 함수 통합 Hook ──────────────────────────
  const {
    mapRef, handleDistrictClick, handleMapClick,
    toggleRoadviewPanel, handleRoadviewPositionChange, handleRoadviewAvailabilityChange,
    toggleHistoryPanel, handleTrafficDataChange, goToMyLocation, handleMapLoad,
  } = useTwinMapHandlers({
    boundaryData, flyTo, isLinkSelectModeRef,
    roadviewState, setRoadviewState, setRoadviewMarker,
    setIsHistoryPanelOpen, setIsHistoryMode, setHistoryTrafficMap, setViewState,
  });

  // ─── 선택 가능한 링크 ID 계산 ─────────────────────────────────
  const selectableLinkIds = useMemo(() => {
    if (!isLinkSelectMode) return new Set<string>();
    return getSelectableLinkIds(selectedLinks, busanLinkData);
  }, [isLinkSelectMode, selectedLinks, busanLinkData, getSelectableLinkIds]);

  // ─── PathLayer 데이터 빌드 ────────────────────────────────────
  const pathData = useMemo(() => {
    const sourceData = shouldFilterLinks && filteredLinks ? filteredLinks : busanLinkData;
    return (sourceData?.features ?? []).map((feature: any) => ({
      lkId: String(feature.properties?.link_id ?? "").trim(),
      path: feature.geometry?.coordinates ?? [],
    }));
  }, [busanLinkData, shouldFilterLinks, filteredLinks, viewState.zoom]);

  // ─── 레이어 생성 ──────────────────────────────────────────────
  const boundaryLayer = createBoundaryLayer(boundaryData);


  // 링크 레이어: 필터링 여부와 관계없이 PathLayer 사용 (소통정보 색상 유지)
  const linkLayers = [createPathLayer(pathData, trafficMap, highlightedLinkIds, activeLinkId, isLinkSelectModeRef, handleLinkSelect, busanLinkData, selectableLinkIds,
    (lkId, speed, x, y) => {
      // 같은 링크 재클릭 시 팝업 닫기
      if (historyPopup?.linkId === lkId) {
        setHistoryPopup(null);
      } else {
        setHistoryPopup({ linkId: lkId, speed, x, y });
      }
    }
  )];

  // 교통 혼잡 히트맵 레이어
  const trafficHeatmapLayer = createTrafficHeatmapLayer(heatmapData, isHeatmapVisible);

  // isCctvOnly 모드 시 CCTV 레이어만 표시 (다른 마커 숨김)
  const bitLayers = isCctvOnly ? [] : createBitClusterLayers(bitClusters);
  const constructionLayers = isCctvOnly ? [] : createConstructionClusterLayers(constructionClusters);
  const themeTravelLayers = isCctvOnly ? [] : createThemeTravelClusterLayers(themeTravelClusters);
  const parkingLayers = isCctvOnly ? [] : createParkingClusterLayers(parkingClusters);
  const cctvLayers = createCctvClusterLayers(cctvClusters, {
    onMarkerClick: (cctv) => {
      setSelectedCctv(cctv);
      setIsCctvPopupOpen(true);
      autoOpenedCctvRef.current = false; // 마커를 직접 클릭한 건 풀사이즈(default)로 띄움
    }
  });

  // 로드뷰 마커 레이어 (Task 5.5 - useMemo로 메모이제이션)
  const roadviewMarkerLayers = useMemo(() => {
    return createRoadviewMarkerLayer(roadviewMarker, roadviewState.direction);
  }, [roadviewMarker, roadviewState.direction]);

  // 트럭 아이콘 2D 스크린 좌표 계산
  const truckScreenPos = useMemo(() => {
    if (!truckPos) return null;
    const viewport = new WebMercatorViewport(viewState);
    const [x, y] = viewport.project([truckPos.longitude, truckPos.latitude]);
    return { x, y };
  }, [truckPos, viewState]);

  // 쿠폰 상자 화면 좌표 계산
  const couponScreenPositions = useMemo(() => {
    const viewport = new WebMercatorViewport(viewState);
    return couponBoxes
      .filter(b => b.visible && !b.collected)
      .map(b => {
        const [x, y] = viewport.project([b.lng, b.lat]);
        return { ...b, x, y };
      });
  }, [couponBoxes, viewState]);

  const showSplitScreen = isSimulating && isFpvMode;

  return (
    <div className={showSplitScreen ? styles.splitContainer : styles.mapContainer}>
      {/* ─── 왼쪽 (지도 영역) ─── */}
      <div className={showSplitScreen ? styles.leftPane : ""} style={showSplitScreen ? {} : { width: '100%', height: '100%', position: 'relative' }}>
        <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs, interactionState }: any) => {
          setViewState(vs);
          if (historyPopup && interactionState && (interactionState.isDragging || interactionState.isPanning || interactionState.isZooming || interactionState.isRotating)) {
            setHistoryPopup(null);
          }
        }}
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
          ...parkingLayers,
          ...cctvLayers,
          ...roadviewMarkerLayers,  // 로드뷰 마커 레이어 추가 (Task 5.5)
          trafficHeatmapLayer,      // 교통 혼잡 히트맵
          ...linkLayers,  // 링크 레이어 (클러스터 또는 개별) - 클릭 우선순위 최상위
        ]}
        onHover={handleHover}
        onClick={handleMapClick}  // 지도 클릭 핸들러 추가 (Task 5.2)
        getCursor={({ isDragging }: any) =>
          isDragging ? "grabbing" : isLinkSelectMode ? "crosshair" : "grab"
        }
        style={{ position: 'relative', zIndex: '1' }}
      >
        <MapGL
          mapStyle={mapStyleUrl}
          interactiveLayerIds={[]}
          style={{ position: 'relative', zIndex: '0' }}
          onLoad={handleMapLoad}
        >
          {deliveryRoute && (
            <Source id="delivery-route" type="geojson" data={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: deliveryRoute
              }
            }}>
              <Layer
                id="delivery-route-line"
                type="line"
                paint={{
                  'line-color': '#f59e0b',
                  'line-width': 8,
                  'line-opacity': 0.8,
                  'line-dasharray': [2, 2]
                }}
              />
            </Source>
          )}
        </MapGL>
      </DeckGL>

      {/* 날씨에 따른 비 내리는 효과 (지도 위에 오버레이) */}
      {isRainy && <RainOverlay />}

      {/* FPV 모드 HUD 오버레이 */}
      {isSimulating && isFpvMode && (
        <div className={styles.fpvHudRoot}>
          <div className={styles.fpvPillar} />
          <div className={styles.fpvSpeedometer}>
            <span className={styles.fpvSpeed}>
              {Math.round(deliveryProgress * 80)} <span className={styles.fpvSpeedUnit}>km/h</span>
            </span>
            <span className={styles.fpvLabel}>DRIVE MODE</span>
          </div>
          <div className={styles.fpvProgressBar}>
            <div className={styles.fpvProgressFill} style={{ width: `${deliveryProgress * 100}%` }} />
          </div>
          <div className={styles.fpvCrosshair}>
            <div className={styles.fpvCrosshairH} />
            <div className={styles.fpvCrosshairV} />
          </div>
        </div>
      )}

      </div>

      {/* ─── 오른쪽 (로드뷰 / CCTV 분할 영역) ─── */}
      {showSplitScreen && (
        <div className={styles.rightPane}>
          {nearbyEvent && nearbyEvent.type === 'cctv' ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#000' }}>
              <div style={{ padding: '12px 16px', background: 'rgba(10,14,26,0.9)', borderBottom: '1px solid rgba(56,189,248,0.3)' }}>
                <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>🎥 전방 CCTV 화면 ({nearbyEvent.data.name})</span>
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                <CctvPlayer url={nearbyEvent.data.url} />
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, position: 'relative' }}>
              <RoadviewPanel
                isOpen={true}
                position={{ lat: truckPos?.latitude || 0, lng: truckPos?.longitude || 0 }}
                onClose={() => {}}
                onPositionChange={() => {}}
                onAvailabilityChange={() => {}}
                mode="split"
              />
            </div>
          )}
        </div>
      )}


      {/* 최상단 HTML 오버레이: 배송 트럭 아이콘 */}
      {truckScreenPos && (
        <div
          className={styles.truckOverlay}
          style={{ left: truckScreenPos.x, top: truckScreenPos.y }}
        >
          🚛
        </div>
      )}

      {/* 쿠폰 상자 HTML 오버레이 */}
      {isSimulating && couponScreenPositions.map(box => (
        <div
          key={box.id}
          onClick={() => handleCouponClick(box)}
          className={styles.couponMarker}
          style={{ left: box.x, top: box.y }}
          title={`${box.discount}% 할인 쿠폰! 클릭하세요`}
        >
          🎁
          <div className={styles.couponBadge}>{box.discount}% OFF</div>
        </div>
      ))}

      {/* 쿠폰 획득 알림 */}
      {collectedCoupon && (
        <div className={styles.couponCollectPopup}>
          <div className={styles.couponCollectIcon}>🎉</div>
          <div className={styles.couponCollectAmount}>{collectedCoupon.discount}% 할인</div>
          <div className={styles.couponCollectMsg}>GET! 쿠폰을 획득했습니다!</div>
        </div>
      )}


      {/* 주변 CCTV / 공사 감지 UI */}
      {nearbyEvent && !showSplitScreen && (
        <div
          className={styles.eventFloatingPopup}
          style={{ borderColor: nearbyEvent.type === 'cctv' ? '#06b6d4' : '#f97316', boxShadow: `0 0 20px ${nearbyEvent.type === 'cctv' ? 'rgba(6,182,212,0.3)' : 'rgba(249,115,22,0.3)'}` }}
        >
          <div className={styles.eventPopupHeader}>
            <span className={`${styles.eventPopupTitle} ${nearbyEvent.type === 'cctv' ? styles.eventPopupTitleCctv : styles.eventPopupTitleConst}`}>
              {nearbyEvent.type === 'cctv' ? '🎥 전방 CCTV 감지' : '🚧 전방 공사구간 감지'}
            </span>
            <span className={styles.eventPopupDist}>{nearbyEvent.distance.toFixed(1)}km 앞</span>
          </div>
          <div className={styles.eventPopupBody}>
            {nearbyEvent.type === 'cctv'
              ? (nearbyEvent.data.name || 'CCTV')
              : (<><span className={styles.eventPopupFieldCode}>[{nearbyEvent.data.field_code || '진행중 공사'}]</span>{nearbyEvent.data.project_name || '도로 공사구간'}</>)
            }
          </div>
          {nearbyEvent.type === 'construction' && nearbyEvent.data.progress_rate !== undefined && (
            <div className={styles.eventPopupProgress}>진행률: {Math.round(nearbyEvent.data.progress_rate)}%</div>
          )}
        </div>
      )}

      {/* Tooltip */}
      {!isSimulating && tooltip && (
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
      {!isSimulating && isLinkSelectMode && (
        <div className={`${styles.banner} ${styles.linkSelectBanner}`}>
          🔗 링크 선택 모드 — 지도의 도로를 클릭하세요
        </div>
      )}

      {/* 관광 순환 UI 표시 */}
      {!isSimulating && carousels.tourismCarousel.isActive && carousels.tourismCarousel.currentItem && carousels.selectedTourismCategoryForCarousel && (
        <TourismCarouselDisplay
          categoryName={carousels.selectedTourismCategoryForCarousel}
          currentIndex={carousels.tourismCarousel.currentIndex}
          totalCount={carousels.tourismCarouselItems.length}
          currentItem={carousels.tourismCarousel.currentItem.data as ThemeTravelPoint}
        />
      )}

      {/* 공사 순환 UI 표시 */}
      {!isSimulating && carousels.constructionCarousel.isActive && carousels.constructionCarousel.currentItem && carousels.selectedConstructionCategoryForCarousel && (
        <ConstructionCarouselDisplay
          fieldCode={carousels.selectedConstructionCategoryForCarousel}
          currentIndex={carousels.constructionCarousel.currentIndex}
          totalCount={carousels.constructionCarouselItems.length}
          currentItem={carousels.constructionCarousel.currentItem.data as ConstructionPoint}
        />
      )}

      {/* 범례 */}
      {!isSimulating && <MapLegend />}

      {/* CCTV 팝업 */}
      {selectedCctv && !showSplitScreen && (
        <CctvPopup
          cctv={selectedCctv}
          isOpen={isCctvPopupOpen}
          onClose={() => {
            setIsCctvPopupOpen(false);
            autoOpenedCctvRef.current = false;
          }}
          variant={autoOpenedCctvRef.current ? "mini" : "default"}
        />
      )}

      {/* 링크 속도 히스토리 팝업 */}
      {!isSimulating && historyPopup && !isLinkSelectMode && (
        <LinkSpeedHistoryPopup
          linkId={historyPopup.linkId}
          currentSpeed={historyPopup.speed}
          position={{ x: historyPopup.x, y: historyPopup.y }}
          onClose={() => setHistoryPopup(null)}
        />
      )}

      {/* FPV 모드 전환 버튼 (시뮬레이션 중에만 표시) */}
      {isSimulating && (
        <button
          onClick={toggleFpvMode}
          className={`${styles.fpvBtn} ${isFpvMode ? styles.fpvBtnOn : styles.fpvBtnOff}`}
          aria-label={isFpvMode ? '3인칭 관제 뷰로 전환' : '1인칭 FPV 뷰로 전환'}
        >
          {isFpvMode ? '🗺️ 관제 뷰' : '🎮 1인칭 뷰'}
        </button>
      )}

      {!isSimulating && (
        <>
          {/* 로드뷰 패널 (Task 5.5) - Overlay 모드 (분할 화면 아닐 때) */}
          <RoadviewPanel
            isOpen={roadviewState.isOpen}
            position={roadviewState.position}
            onClose={() => setRoadviewState(prev => ({ ...prev, isOpen: false }))}
            onPositionChange={handleRoadviewPositionChange}
            onAvailabilityChange={handleRoadviewAvailabilityChange}
            mode="overlay"
          />

          {/* 교통 이력 패널 (Task 7.1) */}
          <TrafficHistoryPanel
            isOpen={isHistoryPanelOpen}
            onClose={() => setIsHistoryPanelOpen(false)}
            onTrafficDataChange={handleTrafficDataChange}
          />

          {/* 날씨 헤더 */}
          <WeatherHeader />

          {/* 하단 중앙 버튼 그룹 */}
          <div className={styles.btnGroup}>
            <button
              onClick={() => setIsHeatmapVisible(prev => !prev)}
              className={`${styles.circleBtnInline} ${isHeatmapVisible ? styles.roadviewBtnActive : styles.roadviewBtn}`}
              aria-label={isHeatmapVisible ? "교통 히트맵 끄기" : "교통 히트맵 켜기"}
              title="교통 혼잡 히트맵"
            >
              🔥
            </button>

            <button
              onClick={toggleRoadviewPanel}
              className={`${styles.circleBtnInline} ${roadviewState.isOpen ? styles.roadviewBtnActive : styles.roadviewBtn}`}
              aria-label={roadviewState.isOpen ? "로드뷰 패널 닫기" : "로드뷰 패널 열기"}
              title="로드뷰 보기"
            >
              {roadviewState.isOpen ? "🗺️" : "👁️"}
            </button>

            <button
              onClick={toggleHistoryPanel}
              className={`${styles.circleBtnInline} ${isHistoryPanelOpen ? styles.historyBtnActive : styles.historyBtn}`}
              aria-label={isHistoryPanelOpen ? "교통 이력 패널 닫기" : "교통 이력 패널 열기"}
              title="교통 이력"
            >
              ⏱️
            </button>

            <button
              onClick={goToMyLocation}
              className={`${styles.circleBtnInline} ${styles.locationBtn}`}
              aria-label="내 위치로 이동"
              title="내 위치"
            >
              📍
            </button>
          </div>

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
                enterLinkSelectMode={() => enterLinkSelectMode(busanLinkData, setAllLinksData)}
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
                  carousels.handleTourismCategoryPress(category);
                }}
                onConstructionFieldClick={(fieldCode) => {
                  carousels.handleConstructionCategoryPress(fieldCode);
                }}
                activeCarouselCategory={carousels.activeCarouselCategory}
                activeCarouselType={carousels.activeCarouselType}
                isCctvOnly={isCctvOnly}
                onStatClick={(statType) => {
                  if (statType === 'cctv') {
                    setIsCctvOnly(prev => !prev);
                  }
                }}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
