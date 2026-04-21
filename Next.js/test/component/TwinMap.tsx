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
import RoadviewPanel from "@/component/dt/panels/RoadviewPanel";
import WeatherHeader from "@/component/dt/WeatherHeader";
import { TourismCarouselDisplay, ConstructionCarouselDisplay } from "@/component/CarouselInfoDisplay";
import MapLegend from "@/component/MapLegend";
import CctvPopup from "@/component/dt/popups/CctvPopup";
import { useEffect, useRef, useState, useMemo } from "react";
import { createBoundaryLayer, createPathLayer } from "@/component/dt/layers/createBaseLayers";
import { createBitClusterLayers, createConstructionClusterLayers, createThemeTravelClusterLayers, createCctvClusterLayers } from "@/component/dt/layers/createClusterLayers";
import { createRoadviewMarkerLayer } from "@/component/dt/layers/createRoadviewMarker";
import { useTimeFilter } from "@/component/dt/hooks/useTimeFilter";
import { useDashboardStats } from "@/component/dt/hooks/useDashboardStats";
import { useMapNavigation } from "@/hooks/useMapNavigation";
import { useCategoryFilter } from "@/hooks/useCategoryFilter";
import { ConstructionPoint, ThemeTravelPoint } from "@/component/dt/modules/DashboardStatsModule";
import { useTwinClusters } from "@/component/dt/hooks/useTwinClusters";
import { useLinkClusters } from "@/component/dt/hooks/useLinkClusters";
import { useTwinTooltip } from "@/component/dt/hooks/useTwinTooltip";
import { useViewportLinks } from "@/component/dt/hooks/useViewportLinks";
import { useTwinCarousels } from "@/component/dt/hooks/useTwinCarousels";
import { DISTRICT_COORDINATES } from "@/component/dt/constants/districtCoordinates";
import { DistrictBoundary } from "@/types/ui-ux";
import { getDistrictCenter } from "@/utils/mapValidation";
import { CCTVPoint } from "@/types/cctv";
import { RoadviewState } from "@/types/roadview";
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
  trafficData: any[]; // 서버에서 초기값으로 넘겨받음 (비어있을 수 있음)
  bitData: any[];
  boundaryData: DistrictBoundary[];
  constructionData: ConstructionPoint[];
  themeTravelData: ThemeTravelPoint[];
}

export default function TwinMap({ linkData: initLinkData, trafficData: initTrafficData, bitData, boundaryData, constructionData, themeTravelData }: TwinMapProps) {
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

  const [busanLinkData, setBusanLinkData] = useState(initLinkData);
  const [allLinksData, setAllLinksData] = useState<any>(null); // 링크 선택 모드용 전체 링크 데이터

  // 뷰포트 기반 동적 링크 로딩 (링크 선택 모드가 아닐 때만)
  const { linkData: viewportLinkData, isLoading: isLinksLoading } = useViewportLinks({
    viewState,
    enabled: !isLinkSelectMode, // 링크 선택 모드일 때는 비활성화
  });

  // 뷰포트 링크 데이터가 로드되면 업데이트 (링크 선택 모드가 아닐 때만)
  useEffect(() => {
    if (viewportLinkData && !isLinkSelectMode) {
      setBusanLinkData(viewportLinkData);
    }
  }, [viewportLinkData, isLinkSelectMode]);

  // 링크 선택 모드일 때는 전체 링크 데이터 사용
  useEffect(() => {
    if (isLinkSelectMode && allLinksData) {
      setBusanLinkData(allLinksData);
    }
  }, [isLinkSelectMode, allLinksData]);

  const isLinkSelectModeState = useRef(isLinkSelectMode);

  // ─── 소통정보(교통 속도) 상태 ────────────────────────────────────
  // 서버가 IP 제한으로 외부 API 호출 실패 시, 브라우저에서 직접 호출
  const [trafficData, setTrafficData] = useState<any[]>(initTrafficData);

  // CCTV 상태
  const [cctvData, setCctvData] = useState<CCTVPoint[]>([]);
  const [selectedCctv, setSelectedCctv] = useState<CCTVPoint | null>(null);
  const [isCctvPopupOpen, setIsCctvPopupOpen] = useState(false);
  const [isCctvOnly, setIsCctvOnly] = useState(false);  // CCTV 단독 표시 모드

  // 로드뷰 상태 (Task 5.1)
  const [roadviewState, setRoadviewState] = useState<RoadviewState>({
    isOpen: false,
    position: null,
    direction: 0,
    zoom: 0,
    isAvailable: false,
  });
  const [roadviewMarker, setRoadviewMarker] = useState<{ lat: number; lng: number } | null>(null);

  // Time Filter Hook
  const {
    config: timeFilterConfig, setStartDate, setEndDate,
    toggleOngoingOnly, filteredConstruction, visibleCount,
    totalCount, resetFilters,
  } = useTimeFilter(constructionData);

  // Dashboard Stats Hook
  const { stats, isLoading: statsLoading } = useDashboardStats(
    filteredConstruction, themeTravelData, boundaryData,
    cctvData
  );

  // Map Navigation Hook
  const { flyTo } = useMapNavigation({
    viewState, setViewState, animationDuration: 500,
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
    filteredTourismData, filteredConstructionByCategory, flyTo,
  });

  // ─── 교통 속도 맵 ─────────────────────────────────────────────
  const trafficMap = useMemo(() => {
    const map = new Map<string, number>();
    let sampleItems = 0;
    trafficData.forEach((item: any) => {
      // lkId가 숫자로 올 수도 있어 String 변환, spd도 문자열일 수 있어 Number 변환
      const id = String(item.lkId ?? "").trim();
      const spd = Number(item.spd);
      if (id) {
        map.set(id, isNaN(spd) ? 0 : spd);
        // 처음 5개 샘플 로그
        if (sampleItems < 5) {
          console.log(`[TwinMap] 소통정보 샘플 ${sampleItems + 1}: lkId="${id}", spd=${spd}`);
          sampleItems++;
        }
      }
    });
    console.log(`[TwinMap] trafficMap 생성: ${map.size}개 링크, 원본 데이터: ${trafficData.length}개`);
    return map;
  }, [trafficData]);

  // 클러스터링 Hook
  const { bitClusters, constructionClusters, themeTravelClusters, cctvClusters } = useTwinClusters({
    bitData, filteredConstructionByCategory,
    filteredTourismData, cctvData, viewState,
  });

  // 링크 클러스터링 Hook (줌 레벨이 낮을 때 주요 도로만 필터링)
  const { shouldFilter: shouldFilterLinks, filteredLinks } = useLinkClusters({
    linkData: busanLinkData,
    trafficMap,
    viewState,
    enabled: !isLinkSelectMode, // 링크 선택 모드일 때는 비활성화
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

  // 지도 클릭 핸들러 (Task 5.2)
  const handleMapClick = (info: any) => {
    // 링크 선택 모드일 때는 로드뷰 클릭 무시
    if (isLinkSelectModeState.current) return;

    // 로드뷰가 열려있지 않으면 클릭 무시 (토글 버튼으로만 열기)
    if (!roadviewState.isOpen) return;

    // 다른 레이어 클릭 시 로드뷰 클릭 무시
    if (info.layer?.id && !info.layer.id.includes('boundary')) return;

    if (!info.coordinate) return;

    const [lng, lat] = info.coordinate;

    // 부산 지역 좌표 유효성 검증 (대략적인 범위)
    if (lat < 34.8 || lat > 35.4 || lng < 128.7 || lng > 129.3) {
      console.warn('Clicked position is outside Busan area');
      return;
    }

    // 로드뷰 위치만 변경 (이미 열려있으므로)
    setRoadviewState(prev => ({
      ...prev,
      position: { lat, lng },
    }));

    // 마커 표시
    setRoadviewMarker({ lat, lng });
  };

  // 로드뷰 패널 토글 (Task 5.3)
  const toggleRoadviewPanel = () => {
    setRoadviewState(prev => {
      const newIsOpen = !prev.isOpen;

      // 패널을 열 때 기본 위치 설정 (부산역)
      if (newIsOpen && !prev.position) {
        const defaultPosition = { lat: 35.1796, lng: 129.0756 };
        setRoadviewMarker(defaultPosition);
        return {
          ...prev,
          isOpen: true,
          position: defaultPosition,
        };
      }

      return {
        ...prev,
        isOpen: newIsOpen,
      };
    });
  };

  // 로드뷰 위치 동기화 핸들러 (Task 5.4)
  const handleRoadviewPositionChange = (newPosition: { lat: number; lng: number }, direction: number) => {
    setRoadviewState(prev => ({
      ...prev,
      position: newPosition,
      direction,
    }));

    setRoadviewMarker(newPosition);
  };

  // 로드뷰 가용성 변경 핸들러
  const handleRoadviewAvailabilityChange = (isAvailable: boolean) => {
    setRoadviewState(prev => ({
      ...prev,
      isAvailable,
    }));
  };

  // MapLibre 인스턴스 ref
  const mapRef = useRef<any>(null);

  // MapLibre 로드 시 styleimagemissing 이벤트 핸들러 등록
  const handleMapLoad = (event: any) => {
    const map = event.target;
    mapRef.current = map;

    // styleimagemissing 이벤트 리스너 등록 (스타일 로드 전에 등록)
    map.on('styleimagemissing', (e: any) => {
      const id = e.id;

      // 존재하지 않는 이미지에 대해 투명 이미지 생성
      if (!map.hasImage(id)) {
        try {
          const size = 64;
          const data = new Uint8Array(size * size * 4);
          // 완전 투명 이미지
          for (let i = 0; i < data.length; i += 4) {
            data[i] = 0;     // R
            data[i + 1] = 0; // G
            data[i + 2] = 0; // B
            data[i + 3] = 0; // A (투명)
          }
          map.addImage(id, {
            width: size,
            height: size,
            data: data
          });
        } catch (err) {
          // 무시
        }
      }
    });

    // 스타일이 완전히 로드된 후 3D 건물 활성화
    map.once('styledata', () => {
      try {
        // MapTiler 스타일에 이미 3D 건물이 포함되어 있음
        // 3D 건물 레이어의 가시성 확인 및 조정
        const buildingLayer = map.getLayer('building-3d');
        if (buildingLayer) {
          map.setLayoutProperty('building-3d', 'visibility', 'visible');
        }
      } catch (err) {
        console.warn('지도 레이어 설정 실패:', err);
      }
    });
  };

  useEffect(() => {
    isLinkSelectModeState.current = isLinkSelectMode;
    isLinkSelectModeRef.current = isLinkSelectMode;
  }, [isLinkSelectMode, isLinkSelectModeRef]);

  // 소통정보: 서버 API 실패 시 클라이언트에서 직접 외부 API 호출
  useEffect(() => {
    // 서버에서 데이터가 정상적으로 넘어왔으면 재요청 불필요
    if (initTrafficData.length > 0) {
      setTrafficData(initTrafficData);
      return;
    }

    // 서버 API 호출 시도
    fetch("/api/GIS/Busan/Traffic")
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setTrafficData(data);
            return;
          }
          // 데이터 없음 + clientFallbackUrl: 직접 외부 API 호출
          if (data?.clientFallbackUrl) {
            console.log("[TwinMap] 서버 Traffic API 실패 - 클라이언트 직접 호출 시도");
            return fetch(data.clientFallbackUrl)
              .then(r => r.json())
              .then(d => {
                const items = d?.content?.items;
                if (items && items.length > 0) {
                  setTrafficData(Array.isArray(items) ? items : [items]);
                  console.log(`[TwinMap] 클라이언트 직접 호출 성공: ${items.length}개`);
                }
              })
              .catch(e => console.warn("[TwinMap] 클라이언트 직접 호출 실패:", e));
          }
        } else if (res.status === 503) {
          const errData = await res.json().catch(() => ({}));
          if (errData?.clientFallbackUrl) {
            console.log("[TwinMap] 서버 503 - 클라이언트 직접 외부 API 호출");
            return fetch(errData.clientFallbackUrl)
              .then(r => r.json())
              .then(d => {
                const items = d?.content?.items;
                if (items && items.length > 0) {
                  setTrafficData(Array.isArray(items) ? items : [items]);
                  console.log(`[TwinMap] 클라이언트 직접 호출 성공: ${items.length}개`);
                }
              })
              .catch(e => console.warn("[TwinMap] 직접 호출 실패:", e));
          }
        }
      })
      .catch(e => console.warn("[TwinMap] Traffic API 호출 실패:", e));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initTrafficData]);

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
      avgSpeed, activeConstruction,
    });
  }, [trafficData, constructionData, setDataStats]);

  // ─── 선택 가능한 링크 ID 계산 ──────────────────────────────────
  const selectableLinkIds = useMemo(() => {
    if (!isLinkSelectMode) return new Set<string>();
    return getSelectableLinkIds(selectedLinks, busanLinkData);
  }, [isLinkSelectMode, selectedLinks, busanLinkData, getSelectableLinkIds]);

  // ─── PathLayer 데이터 빌드 ────────────────────────────────────
  const pathData = useMemo(() => {
    // 필터링된 링크가 있으면 사용, 없으면 원본 사용
    const sourceData = shouldFilterLinks && filteredLinks ? filteredLinks : busanLinkData;
    
    const data = (sourceData?.features ?? []).map((feature: any) => {
      // link_id를 String으로 변환해 trafficMap 키와 타입 통일
      const lkId: string = String(feature.properties?.link_id ?? "").trim();
      const coords = feature.geometry?.coordinates ?? [];

      // LineString: coordinates = [[lng, lat], [lng, lat], ...]
      return {
        lkId,
        path: coords, // 이미 [lng, lat] 형식의 배열
      };
    });
    
    // 처음 5개 링크 샘플 로그
    if (data.length > 0 && data.length <= 5) {
      data.forEach((item: any, idx: number) => {
        console.log(`[TwinMap] 링크 샘플 ${idx + 1}: lkId="${item.lkId}", path length=${item.path.length}`);
      });
    }
    
    console.log(`[TwinMap] pathData 생성: ${data.length}개 링크, zoom: ${viewState.zoom.toFixed(2)}, 필터링: ${shouldFilterLinks ? 'ON' : 'OFF'}`);
    return data;
  }, [busanLinkData, shouldFilterLinks, filteredLinks, viewState.zoom]);

  // ─── 레이어 생성 ──────────────────────────────────────────────
  const boundaryLayer = createBoundaryLayer(boundaryData);
  
  // 링크 레이어: 필터링 여부와 관계없이 PathLayer 사용 (소통정보 색상 유지)
  const linkLayers = [createPathLayer(pathData, trafficMap, highlightedLinkIds, activeLinkId, isLinkSelectModeRef, handleLinkSelect, busanLinkData, selectableLinkIds)];
  
  // isCctvOnly 모드 시 CCTV 레이어만 표시 (다른 마커 숨김)
  const bitLayers = isCctvOnly ? [] : createBitClusterLayers(bitClusters);
  const constructionLayers = isCctvOnly ? [] : createConstructionClusterLayers(constructionClusters);
  const themeTravelLayers = isCctvOnly ? [] : createThemeTravelClusterLayers(themeTravelClusters);
  const cctvLayers = createCctvClusterLayers(cctvClusters, {
    onMarkerClick: (cctv) => {
      setSelectedCctv(cctv);
      setIsCctvPopupOpen(true);
    }
  });

  // 로드뷰 마커 레이어 (Task 5.5 - useMemo로 메모이제이션)
  const roadviewMarkerLayers = useMemo(() => {
    return createRoadviewMarkerLayer(roadviewMarker, roadviewState.direction);
  }, [roadviewMarker, roadviewState.direction]);

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
          ...cctvLayers,
          ...roadviewMarkerLayers,  // 로드뷰 마커 레이어 추가 (Task 5.5)
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
          mapStyle={`https://api.maptiler.com/maps/streets-v2-dark/style.json?key=fKF8gmBWlA2Re9H6cfet`}
          interactiveLayerIds={[]}
          style={{ position: 'relative', zIndex: '0' }}
          onLoad={handleMapLoad}
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

      {/* 로드뷰 패널 (Task 5.5) */}
      <RoadviewPanel
        isOpen={roadviewState.isOpen}
        position={roadviewState.position}
        onClose={() => setRoadviewState(prev => ({ ...prev, isOpen: false }))}
        onPositionChange={handleRoadviewPositionChange}
        onAvailabilityChange={handleRoadviewAvailabilityChange}
      />

      {/* 로드뷰 토글 버튼 (Task 5.3) */}
      <button
        onClick={toggleRoadviewPanel}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: roadviewState.isOpen
            ? "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)"
            : "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
          border: "2px solid rgba(56, 189, 248, 0.4)",
          boxShadow: roadviewState.isOpen
            ? "0 4px 20px rgba(236, 72, 153, 0.4), 0 0 40px rgba(236, 72, 153, 0.2)"
            : "0 4px 20px rgba(56, 189, 248, 0.4), 0 0 40px rgba(56, 189, 248, 0.2)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          transition: "all 0.3s ease",
          zIndex: 1001,
        }}
        aria-label={roadviewState.isOpen ? "로드뷰 패널 닫기" : "로드뷰 패널 열기"}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = roadviewState.isOpen
            ? "0 6px 30px rgba(236, 72, 153, 0.6), 0 0 60px rgba(236, 72, 153, 0.3)"
            : "0 6px 30px rgba(56, 189, 248, 0.6), 0 0 60px rgba(56, 189, 248, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = roadviewState.isOpen
            ? "0 4px 20px rgba(236, 72, 153, 0.4), 0 0 40px rgba(236, 72, 153, 0.2)"
            : "0 4px 20px rgba(56, 189, 248, 0.4), 0 0 40px rgba(56, 189, 248, 0.2)";
        }}
      >
        {roadviewState.isOpen ? "🗺️" : "👁️"}
      </button>

      {/* 날씨 헤더 */}
      <WeatherHeader />

      {/* 내 위치로 이동 버튼 */}
      <button
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                setViewState(prev => ({
                  ...prev,
                  longitude,
                  latitude,
                  zoom: 15,
                  transitionDuration: 600,
                }));
              },
              (error) => {
                console.error("위치 조회 실패:", error);
                alert("위치 정보를 가져올 수 없습니다. 브라우저 설정을 확인해주세요.");
              }
            );
          } else {
            alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
          }
        }}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "92px",
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
          border: "2px solid rgba(16, 185, 129, 0.4)",
          boxShadow: "0 4px 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.2)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          transition: "all 0.3s ease",
          zIndex: 1001,
        }}
        aria-label="내 위치로 이동"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 6px 30px rgba(16, 185, 129, 0.6), 0 0 60px rgba(16, 185, 129, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.2)";
        }}
      >
        📍
      </button>

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
              // 관광 카테고리 클릭 시 바로 순환 시작
              carousels.handleTourismCategoryPress(category);
            }}
            onConstructionFieldClick={(fieldCode) => {
              // 공사 분야 클릭 시 바로 순환 시작
              carousels.handleConstructionCategoryPress(fieldCode);
            }}
            activeCarouselCategory={carousels.activeCarouselCategory}
            activeCarouselType={carousels.activeCarouselType}
            isCctvOnly={isCctvOnly}
            onStatClick={(statType) => {
              // 도로 CCTV 카드 클릭 시 CCTV 단독 모드 토글
              if (statType === 'cctv') {
                setIsCctvOnly(prev => !prev);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
