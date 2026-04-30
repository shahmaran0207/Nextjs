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
import DeliveryTelemetryPanel from "@/component/dt/panels/DeliveryTelemetryPanel";
import TrafficHistoryPanel from "@/component/dt/panels/TrafficHistoryPanel";
import WeatherHeader from "@/component/dt/WeatherHeader";
import { TourismCarouselDisplay, ConstructionCarouselDisplay } from "@/component/CarouselInfoDisplay";
import MapLegend from "@/component/MapLegend";
import CctvPopup from "@/component/dt/popups/CctvPopup";
import CctvPlayer from "@/component/dt/modules/CctvPlayer";
import LinkSpeedHistoryPopup from "@/component/dt/popups/LinkSpeedHistoryPopup";
import { useEffect, useRef, useMemo, useState } from "react";
import { createBoundaryLayer, createPathLayer } from "@/component/dt/layers/createBaseLayers";
import { createBitClusterLayers, createConstructionClusterLayers, createThemeTravelClusterLayers, createCctvClusterLayers, createParkingClusterLayers } from "@/component/dt/layers/createClusterLayers";
import { createRoadviewMarkerLayer } from "@/component/dt/layers/createRoadviewMarker";
import { createTrafficHeatmapLayer } from "@/component/dt/layers/createHeatmapLayer";
import { createLandParcelLayer, createDrawingPreviewLayer } from "@/component/dt/layers/createLandParcelLayer";
import { useLandMode } from "@/component/dt/hooks/useLandMode";
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

  // ─── 🏠 랜드 모드 (가상 부동산) ──────────────────────────────
  // 현재 로그인한 유저의 지갑 주소를 세션스토리지에서 읽어옴
  const [myWallet, setMyWallet] = useState<string | null>(null);
  useEffect(() => {
    const wallet = sessionStorage.getItem("walletAddress") ?? localStorage.getItem("walletAddress");
    setMyWallet(wallet);
  }, []);

  const {
    isLandMode, setIsLandMode,
    landSubMode, setLandSubMode,
    parcels, isLoading: isLandLoading,
    hoveredParcelId, setHoveredParcelId,
    selectedPopup, setSelectedPopup,
    drawingPoints, drawForm, setDrawForm,
    handleLandModeMapClick, handleParcelClick,
    undoLastPoint, clearDrawing, saveDrawing, isSaving,
    purchaseParcel,
  } = useLandMode(myWallet);

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


  // 링크 레이어: 랜드 모드일 때는 pickable 비활성화 (클릭 차단)
  const linkLayers = [createPathLayer(pathData, trafficMap, highlightedLinkIds, activeLinkId, isLinkSelectModeRef, handleLinkSelect, busanLinkData, selectableLinkIds,
    (lkId, speed, x, y) => {
      // 같은 링크 재클릭 시 팝업 닫기
      if (historyPopup?.linkId === lkId) {
        setHistoryPopup(null);
      } else {
        setHistoryPopup({ linkId: lkId, speed, x, y });
      }
    },
    isLandMode  // 랜드 모드 ON이면 링크 클릭 비활성화
  )];

  // 교통 혼잡 히트맵 레이어
  const trafficHeatmapLayer = createTrafficHeatmapLayer(heatmapData, isHeatmapVisible);

  // 랜드 구역 레이어 (랜드 모드 ON일 때만 생성)
  const landParcelLayer = useMemo(() => {
    if (!isLandMode) return null;
    return createLandParcelLayer({
      parcels,
      myWallet,
      onParcelClick: handleParcelClick,
      hoveredParcelId,
    });
  }, [isLandMode, parcels, myWallet, handleParcelClick, hoveredParcelId]);

  // 드로잉 미리보기 레이어 (그리기 서브모드 + 꼭짓점 2개 이상일 때)
  const drawingPreviewLayer = useMemo(() => {
    if (!isLandMode || landSubMode !== "draw") return null;
    return createDrawingPreviewLayer(drawingPoints);
  }, [isLandMode, landSubMode, drawingPoints]);

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
          ...roadviewMarkerLayers,
          trafficHeatmapLayer,
          ...linkLayers,
          // 🏠 랜드 레이어: 항상 최상위에 렌더링
          ...(landParcelLayer ? [landParcelLayer] : []),
          ...(drawingPreviewLayer ? [drawingPreviewLayer] : []),
        ]}
        onHover={(info) => {
          // 랜드 모드일 때 호버 상태 갱신
          if (isLandMode && info.layer?.id === 'land-parcel-layer') {
            setHoveredParcelId(info.object?.id ?? null);
          } else if (isLandMode) {
            setHoveredParcelId(null);
          }
          handleHover(info);
        }}
        onClick={(info) => {
          // 랜드 모드가 켜져 있으면 랜드 클릭 핸들러를 먼저 실행
          if (isLandMode) {
            const consumed = handleLandModeMapClick(info);
            if (consumed) return;
          }
          handleMapClick(info);
        }}
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

      {/* FPV 모드 HUD 오버레이 — leftPane 안에 있어야 오른쪽으로 넘치지 않음 */}
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

      {/* 최상단 HTML 오버레이: 배송 트럭 아이콘 — leftPane 안에 위치해야 분할 화면에서 지도 밖으로 넘치지 않음 */}
      {truckScreenPos && (
        <div
          className={styles.truckOverlay}
          style={{ left: truckScreenPos.x, top: truckScreenPos.y }}
        >
          🚛
        </div>
      )}

      {/* 쿠폰 상자 HTML 오버레이 — leftPane 안에 있어야 우측 텔레메트리 패널 위로 넘치지 않음 */}
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

      </div>

      {/* ─── 오른쪽 (텔레메트리 / CCTV 분할 영역) ─── */}
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
            <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
              <DeliveryTelemetryPanel
                progress={deliveryProgress}
                speed={Math.round(deliveryProgress * 80)}
                trackingNumber={trackingNumber || undefined}
                shippingAddress={shippingAddress}
              />
            </div>
          )}
        </div>
      )}


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
      {!isSimulating && !isLandMode && <MapLegend />}

      {/* ── 🏠 랜드 모드 오버레이 UI ──────────────────────────── */}
      {isLandMode && (
        <div style={{
          position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
          background: 'rgba(10,14,26,0.92)', border: '1px solid rgba(56,189,248,0.4)',
          borderRadius: 12, padding: '10px 18px', backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
        }}>
          <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: 14 }}>🏠 랜드 모드</span>
          <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.2)' }} />
          <button
            onClick={() => setLandSubMode('view')}
            style={{
              padding: '4px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
              border: 'none', fontWeight: 'bold',
              background: landSubMode === 'view' ? '#38bdf8' : 'rgba(255,255,255,0.1)',
              color: landSubMode === 'view' ? '#000' : '#fff',
            }}
          >👁️ 구경/구매</button>
          <button
            onClick={() => { setLandSubMode('draw'); clearDrawing(); }}
            style={{
              padding: '4px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
              border: 'none', fontWeight: 'bold',
              background: landSubMode === 'draw' ? '#facc15' : 'rgba(255,255,255,0.1)',
              color: landSubMode === 'draw' ? '#000' : '#fff',
            }}
          >✏️ 구역 그리기</button>

          {/* 지갑 연결 상태 */}
          <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.2)' }} />
          {myWallet ? (
            <span style={{
              fontSize: 12, color: '#4ade80',
              background: 'rgba(74,222,128,0.1)', padding: '3px 10px',
              borderRadius: 6, border: '1px solid rgba(74,222,128,0.3)'
            }}>
              🔗 {myWallet.slice(0, 6)}...{myWallet.slice(-4)}
            </span>
          ) : (
            <button
              onClick={async () => {
                const eth = (window as any).ethereum;
                if (typeof window === 'undefined' || !eth) {
                  alert('메타마스크가 설치되어 있지 않습니다.');
                  return;
                }
                try {
                  const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
                  if (accounts[0]) {
                    localStorage.setItem('walletAddress', accounts[0]);
                    sessionStorage.setItem('walletAddress', accounts[0]);
                    setMyWallet(accounts[0]);
                  }
                } catch (e: any) {
                  alert('지갑 연결 거부: ' + e.message);
                }
              }}
              style={{
                padding: '4px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                border: '1px solid rgba(249,115,22,0.5)',
                background: 'rgba(249,115,22,0.15)', color: '#f97316', fontWeight: 'bold',
              }}
            >🦊 지갑 연결</button>
          )}

          {isLandLoading && <span style={{ color: '#94a3b8', fontSize: 12 }}>로딩 중...</span>}
        </div>
      )}

      {/* ── 드로잉 서브모드 안내 패널 (우하단 귀퉁이) ──────────── */}
      {isLandMode && landSubMode === 'draw' && (
        <div style={{
          position: 'absolute', bottom: 80, right: 16,
          zIndex: 1000, background: 'rgba(10,14,26,0.95)',
          border: '1px solid rgba(250,204,21,0.5)', borderRadius: 12,
          padding: '14px 16px', backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)', width: 280,
        }}>
          <div style={{ color: '#facc15', fontWeight: 'bold', marginBottom: 8, fontSize: 13 }}>
            ✏️ 구역 그리기 — 지도 클릭으로 꼭짓점 추가
          </div>
          <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 10 }}>
            꼭짓점: {drawingPoints.length}개
            {drawingPoints.length >= 3 && <span style={{ color: '#4ade80' }}> ✅ 저장 가능</span>}
          </div>
          {drawingPoints.length >= 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input
                type="text"
                placeholder="구역 이름 (필수)"
                value={drawForm.name}
                onChange={e => setDrawForm(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 6, padding: '6px 10px', color: '#fff', fontSize: 12, width: '100%',
                  boxSizing: 'border-box'
                }}
              />
              <input
                type="text"
                placeholder="가격 (ETH, 예: 0.1)"
                value={drawForm.price_eth}
                onChange={e => setDrawForm(prev => ({ ...prev, price_eth: e.target.value }))}
                style={{
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 6, padding: '6px 10px', color: '#fff', fontSize: 12, width: '100%',
                  boxSizing: 'border-box'
                }}
              />
              <textarea
                placeholder="설명 (선택)"
                value={drawForm.description}
                onChange={e => setDrawForm(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                style={{
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 6, padding: '6px 10px', color: '#fff', fontSize: 12, width: '100%',
                  resize: 'none', boxSizing: 'border-box'
                }}
              />
            </div>
          )}
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <button
              onClick={undoLastPoint}
              disabled={drawingPoints.length === 0}
              style={{
                flex: 1, padding: '5px 0', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff'
              }}
            >↩ 되돌리기</button>
            <button
              onClick={clearDrawing}
              style={{
                flex: 1, padding: '5px 0', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                border: 'none', background: 'rgba(239,68,68,0.2)', color: '#ef4444'
              }}
            >🗑 초기화</button>
            {drawingPoints.length >= 3 && (
              <button
                onClick={saveDrawing}
                disabled={isSaving || !drawForm.name.trim()}
                style={{
                  flex: 1, padding: '5px 0', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                  border: 'none', background: '#facc15', color: '#000', fontWeight: 'bold'
                }}
              >{isSaving ? '저장 중...' : '💾 등록'}</button>
            )}
          </div>
        </div>
      )}

      {/* ── 구역 클릭 팝업 (구경/구매 모드) ─────────────────── */}
      {isLandMode && selectedPopup && (
        <div style={{
          position: 'absolute',
          left: Math.min(selectedPopup.screenX + 12, window.innerWidth - 280),
          top: Math.min(selectedPopup.screenY - 10, window.innerHeight - 220),
          zIndex: 1100,
          background: 'rgba(10,14,26,0.97)',
          border: `1px solid ${
            selectedPopup.parcel.status === 'owned'
              ? (myWallet && selectedPopup.parcel.owner_wallet?.toLowerCase() === myWallet.toLowerCase() ? 'rgba(56,189,248,0.6)' : 'rgba(239,68,68,0.6)')
              : 'rgba(74,222,128,0.6)'
          }`,
          borderRadius: 12, padding: '16px 18px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          minWidth: 240,
        }}>
          <button
            onClick={() => setSelectedPopup(null)}
            style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16 }}
          >✕</button>

          <div style={{ fontWeight: 'bold', color: '#e2e8f0', fontSize: 15, marginBottom: 6 }}>
            🏠 {selectedPopup.parcel.name}
          </div>

          {selectedPopup.parcel.description && (
            <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>
              {selectedPopup.parcel.description}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>가격</span>
            <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: 14 }}>
              {selectedPopup.parcel.price_eth} ETH
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>상태</span>
            <span style={{
              fontSize: 12, fontWeight: 'bold', padding: '2px 8px', borderRadius: 4,
              background: selectedPopup.parcel.status === 'owned' ? 'rgba(239,68,68,0.2)' : 'rgba(74,222,128,0.2)',
              color: selectedPopup.parcel.status === 'owned' ? '#ef4444' : '#4ade80',
            }}>
              {selectedPopup.parcel.status === 'owned' ? '소유됨' : '구매 가능'}
            </span>
          </div>

          {selectedPopup.parcel.status === 'owned' && (
            <div style={{ color: '#64748b', fontSize: 11, marginBottom: 10, wordBreak: 'break-all' }}>
              소유자: {myWallet && selectedPopup.parcel.owner_wallet?.toLowerCase() === myWallet.toLowerCase()
                ? '🎉 나의 땅'
                : selectedPopup.parcel.owner_wallet?.slice(0, 6) + '...' + selectedPopup.parcel.owner_wallet?.slice(-4)
              }
            </div>
          )}

          {/* 구매 버튼 — LandNFT.purchase() 호출 후 DB 소유권 동기화 */}
          {selectedPopup.parcel.status === 'available' && myWallet && (() => {
            // 구매 핸들러를 IIFE로 분리해 async 처리
            const handleBuy = async () => {
              const parcel = selectedPopup.parcel;
              if (!window.confirm(
                `[${parcel.name}]\n가격: ${parcel.price_eth} ETH\n\n메타마스크로 구매하시겠습니까?`
              )) return;

              try {
                const eth = (window as any).ethereum;
                if (!eth) { alert('메타마스크가 필요합니다.'); return; }

                // ethers.js v6 BrowserProvider로 MetaMask 연결
                const { ethers } = await import('ethers');
                const provider   = new ethers.BrowserProvider(eth);
                const signer     = await provider.getSigner();

                // LandNFT 컨트랙트 주소 (배포 후 생성된 파일에서 로드)
                // 서버 환경에서 파일시스템 접근이 불가하므로 API를 통해 주소를 가져옴
                const addrRes = await fetch('/api/land-parcels/contract-address');
                if (!addrRes.ok) throw new Error('컨트랙트 주소를 가져올 수 없습니다.');
                const { address: contractAddress, abi } = await addrRes.json();

                const contract = new ethers.Contract(contractAddress, abi, signer);

                // wei 단위로 변환 (price_eth: "0.1" → 0.1 * 10^18 wei)
                const priceWei = ethers.parseEther(parcel.price_eth);

                // LandNFT.purchase(dbParcelId) 호출 + ETH 전송
                const tx = await contract.purchase(BigInt(parcel.id), { value: priceWei });

                alert('⏳ 트랜잭션 전송됨! 블록 확인 중...\n' + tx.hash);

                const receipt = await tx.wait(1);
                const txHash  = receipt.hash;

                // DB 소유권 업데이트 + 지도 갱신 (purchaseParcel 내부에서 PATCH 호출)
                const ok = await purchaseParcel(parcel.id, myWallet, txHash);
                if (ok) {
                  alert(`🎉 구매 완료!\n[${parcel.name}] 이 당신의 땅이 되었습니다!\nTx: ${txHash.slice(0, 20)}...`);
                }

              } catch (e: any) {
                if (e?.code === 4001) {
                  alert('취소되었습니다.');
                } else {
                  alert('❌ 구매 실패: ' + (e?.reason || e?.message || '알 수 없는 오류'));
                }
              }
            };

            return (
              <button
                onClick={handleBuy}
                style={{
                  width: '100%', padding: '8px 0', borderRadius: 8, fontSize: 13,
                  cursor: 'pointer', border: 'none',
                  background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                  color: '#000', fontWeight: 'bold',
                }}
              >
                🛒 {selectedPopup.parcel.price_eth} ETH로 구매하기
              </button>
            );
          })()}
          {selectedPopup.parcel.status === 'available' && !myWallet && (
            <div style={{ color: '#f59e0b', fontSize: 12, textAlign: 'center' }}>
              ⚠️ 구매하려면 먼저 메타마스크 지갑을 연결하세요
            </div>
          )}
        </div>
      )}

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
          {/* 로드뷰 패널 (Task 5.5) - Overlay 모드 (분할 화면 아닐 때) — 랜드 모드에서 숨김 */}
          {!isLandMode && (
            <RoadviewPanel
              isOpen={roadviewState.isOpen}
              position={roadviewState.position}
              onClose={() => setRoadviewState(prev => ({ ...prev, isOpen: false }))}
              onPositionChange={handleRoadviewPositionChange}
              onAvailabilityChange={handleRoadviewAvailabilityChange}
              mode="overlay"
            />
          )}

          {/* 교통 이력 패널 (Task 7.1) — 랜드 모드에서 숨김 */}
          {!isLandMode && (
            <TrafficHistoryPanel
              isOpen={isHistoryPanelOpen}
              onClose={() => setIsHistoryPanelOpen(false)}
              onTrafficDataChange={handleTrafficDataChange}
            />
          )}

          {/* 날씨 헤더 — 랜드 모드에서 숨김 */}
          {!isLandMode && <WeatherHeader />}

          {/* 하단 중앙 버튼 그룹: 🏠 버튼은 항상 표시, 나머지는 랜드 모드에서 숨김 */}
          <div className={styles.btnGroup}>
            {!isLandMode && (
              <>
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
              </>
            )}

            {/* 🏠 랜드 모드 토글 버튼: 항상 표시 */}
            <button
              onClick={() => setIsLandMode(prev => !prev)}
              className={`${styles.circleBtnInline} ${isLandMode ? styles.roadviewBtnActive : styles.roadviewBtn}`}
              aria-label={isLandMode ? "랜드 모드 종료" : "랜드 모드 (가상 부동산)"}
              title="🏠 가상 부동산 랜드 모드"
            >
              🏠
            </button>
          </div>

          {/* 왼쪽 상단: 도로 테이블 — 랜드 모드에서 숨김 */}
          {!isLandMode && (
            <TwinRoadPanel
              roadData={roadData}
              handleRoad={handleRoad}
              clearAllHighlights={clearAllHighlights}
              showTrafficOnly={showTrafficOnly}
              selectedRoadId={selectedRoadId}
            />
          )}

          {/* 오른쪽 상단: 구역 관리 / 시간 관리 — 랜드 모드에서 숨김 */}
          {!isLandMode && (
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
          )}

          {/* 오른쪽 하단: 링크 테이블 / 통계 대시보드 — 랜드 모드에서 숨김 */}
          {!isLandMode && (
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
          )}
        </>
      )}
    </div>
  );
}
