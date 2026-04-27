/**
 * useTwinMapState
 * TwinMap 컴포넌트에서 사용하는 모든 상태(State), 데이터 훅, 파생 값을 통합 관리합니다.
 * FPV 모드, 쿠폰 헌팅, 날씨/맵스타일, 교통/CCTV/시간 필터, 클러스터링까지 포함.
 */
import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { useWeather } from "@/app/hook/useWeather";
import { useTimeFilter } from "@/component/dt/hooks/useTimeFilter";
import { useDashboardStats } from "@/component/dt/hooks/useDashboardStats";
import { useCategoryFilter } from "@/hooks/useCategoryFilter";
import { useTwinClusters } from "@/component/dt/hooks/useTwinClusters";
import { useLinkClusters } from "@/component/dt/hooks/useLinkClusters";
import { useTwinCarousels } from "@/component/dt/hooks/useTwinCarousels";
import { useViewportLinks } from "@/component/dt/hooks/useViewportLinks";
import { CCTVPoint } from "@/types/cctv";
import { RoadviewState } from "@/types/roadview";

// ─── 쿠폰 타입 ───────────────────────────────────────────────
export interface CouponBox {
  id: string;
  lng: number;
  lat: number;
  discount: number; // % 할인
  collected: boolean;
  visible: boolean;  // 트럭 2km 이내면 true
}

// ─── 링크 속도 히스토리 팝업 타입 ────────────────────────────
interface HistoryPopup {
  linkId: string;
  speed: number | null;
  x: number;
  y: number;
}

interface UseTwinMapStateProps {
  initTrafficData: any[];
  initLinkData: any;
  constructionData: any[];
  themeTravelData: any[];
  boundaryData: any[];
  bitData: any[];
  isLinkSelectMode: boolean;
  isLinkSelectModeRef: React.MutableRefObject<boolean>;
  selectedLinks: any[];
  flyTo: (coords: [number, number], zoom?: number) => void;
  viewState: any;
  setViewState: React.Dispatch<React.SetStateAction<any>>;
  setRoadData: (data: any[]) => void;
  setDataStats: (stats: any) => void;
  trackingNumber?: string;
  shippingAddress?: string;
}

// maptiler 키 (환경 변수 or 하드코딩)
const MAPTILER_KEY = "fKF8gmBWlA2Re9H6cfet";

export function useTwinMapState({
  initTrafficData,
  initLinkData,
  constructionData,
  themeTravelData,
  boundaryData,
  bitData,
  isLinkSelectMode,
  isLinkSelectModeRef,
  selectedLinks,
  flyTo,
  viewState,
  setViewState,
  setRoadData,
  setDataStats,
}: UseTwinMapStateProps) {

  // ─── 링크 데이터 ──────────────────────────────────────────
  const [busanLinkData, setBusanLinkData] = useState(initLinkData);
  const [allLinksData, setAllLinksData] = useState<any>(null);

  const { linkData: viewportLinkData } = useViewportLinks({
    viewState,
    enabled: !isLinkSelectMode,
  });

  useEffect(() => {
    if (viewportLinkData && !isLinkSelectMode) setBusanLinkData(viewportLinkData);
  }, [viewportLinkData, isLinkSelectMode]);

  useEffect(() => {
    if (isLinkSelectMode && allLinksData) setBusanLinkData(allLinksData);
  }, [isLinkSelectMode, allLinksData]);

  const isLinkSelectModeState = useRef(isLinkSelectMode);
  useEffect(() => {
    isLinkSelectModeState.current = isLinkSelectMode;
    isLinkSelectModeRef.current = isLinkSelectMode;
  }, [isLinkSelectMode, isLinkSelectModeRef]);

  // ─── 교통·CCTV 상태 ────────────────────────────────────────
  const [trafficData, setTrafficData] = useState<any[]>(initTrafficData);
  const [cctvData, setCctvData] = useState<CCTVPoint[]>([]);
  const [selectedCctv, setSelectedCctv] = useState<CCTVPoint | null>(null);
  const [isCctvPopupOpen, setIsCctvPopupOpen] = useState(false);
  const [isCctvOnly, setIsCctvOnly] = useState(false);

  // 링크 속도 히스토리 팝업
  const [historyPopup, setHistoryPopup] = useState<HistoryPopup | null>(null);

  // ─── 로드뷰 상태 ──────────────────────────────────────────
  const [roadviewState, setRoadviewState] = useState<RoadviewState>({
    isOpen: false, position: null, direction: 0, zoom: 0, isAvailable: false,
  });
  const [roadviewMarker, setRoadviewMarker] = useState<{ lat: number; lng: number } | null>(null);

  // ─── 교통 이력 패널 상태 ────────────────────────────────────
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [isHistoryMode, setIsHistoryMode] = useState(false);
  const [historyTrafficMap, setHistoryTrafficMap] = useState<Map<string, number>>(new Map());

  // ─── 날씨 / 맵 스타일 ──────────────────────────────────────
  const { weather } = useWeather();
  const isRainy = !!(weather && weather.rainfall !== null && weather.rainfall > 0);
  const isNight = (() => { const h = new Date().getHours(); return h >= 18 || h < 6; })();
  const mapStyleUrl = isNight
    ? `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${MAPTILER_KEY}`
    : `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;

  // ─── 시간 필터 ─────────────────────────────────────────────
  const {
    config: timeFilterConfig, setStartDate, setEndDate,
    toggleOngoingOnly, filteredConstruction, visibleCount,
    totalCount, resetFilters,
  } = useTimeFilter(constructionData);

  // ─── 대시보드 통계 ──────────────────────────────────────────
  const { stats, isLoading: statsLoading } = useDashboardStats(
    filteredConstruction, themeTravelData, boundaryData, cctvData
  );

  // ─── 카테고리 필터링 ────────────────────────────────────────
  const { filteredData: filteredTourismData } = useCategoryFilter({
    data: themeTravelData,
    getCategoryKey: (item: any) => item.category_name || '기타',
  });
  const { filteredData: filteredConstructionByCategory } = useCategoryFilter({
    data: filteredConstruction,
    getCategoryKey: (item: any) => item.field_code || 'F08',
  });

  // ─── 카루젤 ────────────────────────────────────────────────
  const carousels = useTwinCarousels({
    filteredTourismData, filteredConstructionByCategory, flyTo,
  });

  // ─── 교통 속도 맵 ──────────────────────────────────────────
  const trafficMap = useMemo(() => {
    if (isHistoryMode && historyTrafficMap.size > 0) return historyTrafficMap;
    const map = new Map<string, number>();
    trafficData.forEach((item: any) => {
      const id = String(item.lkId ?? "").trim();
      const spd = Number(item.spd);
      if (id) map.set(id, isNaN(spd) ? 0 : spd);
    });
    return map;
  }, [trafficData, isHistoryMode, historyTrafficMap]);

  // 히트맵용 포인트 데이터 메모이제이션 (프레임 드랍 방지)
  const heatmapData = useMemo(() => {
    if (!busanLinkData?.features?.length) return [];

    const points: { position: [number, number]; weight: number }[] = [];
    busanLinkData.features.forEach((feature: any) => {
      const coords: number[][] = feature.geometry?.coordinates ?? [];
      if (coords.length === 0) return;

      const mid = coords[Math.floor(coords.length / 2)];
      if (!mid || mid.length < 2) return;

      const linkId = String(feature.properties?.link_id ?? "").trim();
      const spd = trafficMap.get(linkId);

      const weight = spd !== undefined ? Math.max(0.05, 1 - spd / 100) : 0.1;
      points.push({ position: [mid[0], mid[1]], weight });
    });
    return points;
  }, [busanLinkData, trafficMap]);

  // 주차장 데이터
  const [parkingData, setParkingData] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/GIS/Busan/Parking")
      .then(res => res.json())
      .then(data => { if (data.data) setParkingData(data.data); })
      .catch(() => setParkingData([]));
  }, []);

  // ─── 클러스터링 ────────────────────────────────────────────
  const { bitClusters, constructionClusters, themeTravelClusters, cctvClusters, parkingClusters } = useTwinClusters({
    bitData, filteredConstructionByCategory,
    filteredTourismData, cctvData, parkingData, viewState,
  });
  const { shouldFilter: shouldFilterLinks, filteredLinks } = useLinkClusters({
    linkData: busanLinkData,
    trafficMap,
    viewState,
    enabled: !isLinkSelectMode,
  });

  // ─── B안: FPV 모드 ─────────────────────────────────────────
  const [isFpvMode, setIsFpvMode] = useState(false);
  const toggleFpvMode = useCallback(() => {
    setIsFpvMode(prev => {
      const next = !prev;
      setViewState((vs: any) => next
        ? { ...vs, pitch: 85, zoom: 18, transitionDuration: 800 }
        : { ...vs, pitch: 45, zoom: 16.5, transitionDuration: 800 }
      );
      return next;
    });
  }, [setViewState]);

  // ─── C안: 쿠폰 헌팅 ────────────────────────────────────────
  const [couponBoxes, setCouponBoxes] = useState<CouponBox[]>([]);
  const [collectedCoupon, setCollectedCoupon] = useState<CouponBox | null>(null);
  const couponAudioRef = useRef<AudioContext | null>(null);

  // ─── 교통 히트맵 상태 ──────────────────────────────────────
  const [isHeatmapVisible, setIsHeatmapVisible] = useState(false);

  const handleCouponClick = useCallback((box: CouponBox) => {
    if (box.collected) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880; osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    } catch (_) { }

    setCouponBoxes(prev => prev.map(b => b.id === box.id ? { ...b, collected: true, visible: false } : b));
    setCollectedCoupon(box);
    setTimeout(() => setCollectedCoupon(null), 3000);

    // localStorage에 저장 → checkout 페이지에서 사용 가능
    try {
      const stored = JSON.parse(localStorage.getItem('mapCoupons') || '[]');
      // 중복 방지
      if (!stored.find((c: any) => c.id === box.id)) {
        stored.push({
          id: box.id,
          name: `🗺️ 지도 쿠폰 ${box.discount}% 할인`,
          discount: box.discount,
          collected_at: new Date().toISOString(),
        });
        localStorage.setItem('mapCoupons', JSON.stringify(stored));
      }
    } catch (_) { }
  }, []);

  // ─── Data Fetching Effects ──────────────────────────────────

  // 소통정보 fetch
  useEffect(() => {
    if (initTrafficData.length > 0) { setTrafficData(initTrafficData); return; }
    const tryFallback = async (url: string) => {
      try {
        const r = await fetch(url).then(r => r.json());
        const items = r?.content?.items;
        if (items?.length > 0) setTrafficData(Array.isArray(items) ? items : [items]);
      } catch (e) { console.warn("[useTwinMapState] fallback 실패:", e); }
    };
    fetch("/api/GIS/Busan/Traffic")
      .then(async res => {
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) { setTrafficData(data); return; }
          if (data?.clientFallbackUrl) tryFallback(data.clientFallbackUrl);
        } else if (res.status === 503) {
          const err = await res.json().catch(() => ({}));
          if (err?.clientFallbackUrl) tryFallback(err.clientFallbackUrl);
        }
      })
      .catch(e => console.warn("[useTwinMapState] Traffic API 호출 실패:", e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initTrafficData]);

  // 도로 목록 fetch
  useEffect(() => {
    fetch("/api/GIS/Busan/Road/getRoadList")
      .then(res => res.json())
      .then(data => setRoadData(Array.isArray(data) ? data : []));
  }, [setRoadData]);

  // CCTV fetch
  useEffect(() => {
    fetch("/api/GIS/Busan/CCTV/getCCTVList")
      .then(res => res.json())
      .then(data => { if (data.data) setCctvData(data.data); })
      .catch(() => setCctvData([]));
  }, []);

  // Context 통계 업데이트
  useEffect(() => {
    const speeds = trafficData.map((t: any) => t.spd).filter((s: number) => s > 0);
    const avgSpeed = speeds.length > 0
      ? Math.round(speeds.reduce((a: number, b: number) => a + b, 0) / speeds.length)
      : 0;
    const activeConstruction = (constructionData || []).filter((c: any) => (c.progress_rate ?? 0) < 100).length;
    setDataStats({ totalTraffic: trafficData.length, avgSpeed, activeConstruction });
  }, [trafficData, constructionData, setDataStats]);

  // 쿠폰 경로 배치 (시뮬레이션 시작 시)
  const spawnCoupons = useCallback((deliveryRoute: number[][]) => {
    if (!deliveryRoute?.length) return;
    const discounts = [5, 10, 15, 20, 30];
    const boxes: CouponBox[] = Array.from({ length: 5 }, (_, i) => {
      const segIdx = Math.floor(deliveryRoute.length * (0.2 + i * 0.12));
      const seg = deliveryRoute[Math.min(segIdx, deliveryRoute.length - 1)];
      return {
        id: `coupon-${i}`,
        lng: seg[0] + (Math.random() - 0.5) * 0.002,
        lat: seg[1] + (Math.random() - 0.5) * 0.002,
        discount: discounts[i],
        collected: false,
        visible: false,
      };
    });
    setCouponBoxes(boxes);
  }, []);

  // 트럭 근접 시 쿠폰 visible 갱신
  const updateCouponVisibility = useCallback((truckPos: { latitude: number; longitude: number } | null, isSimulating: boolean) => {
    if (!truckPos || !isSimulating) return;
    setCouponBoxes(prev => prev.map(box => {
      if (box.collected) return box;
      const dLat = box.lat - truckPos.latitude;
      const dLng = box.lng - truckPos.longitude;
      const distKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
      return { ...box, visible: distKm < 2 };
    }));
  }, []);

  return {
    // 링크
    busanLinkData, setBusanLinkData, allLinksData, setAllLinksData,
    isLinkSelectModeState,
    // 교통·CCTV
    trafficData, setTrafficData,
    cctvData, setCctvData,
    selectedCctv, setSelectedCctv,
    isCctvPopupOpen, setIsCctvPopupOpen,
    isCctvOnly, setIsCctvOnly,
    historyPopup, setHistoryPopup,
    // 로드뷰
    roadviewState, setRoadviewState,
    roadviewMarker, setRoadviewMarker,
    // 이력 패널
    isHistoryPanelOpen, setIsHistoryPanelOpen,
    isHistoryMode, setIsHistoryMode,
    historyTrafficMap, setHistoryTrafficMap,
    // 날씨·맵스타일
    isRainy, isNight, mapStyleUrl,
    // 시간 필터
    timeFilterConfig, setStartDate, setEndDate,
    toggleOngoingOnly, filteredConstruction,
    visibleCount, totalCount, resetFilters,
    // 통계
    stats, statsLoading,
    // 카테고리·카루젤
    filteredTourismData, filteredConstructionByCategory, carousels,
    // 교통 맵·클러스터
    trafficMap, bitClusters, constructionClusters, themeTravelClusters, cctvClusters, parkingClusters,
    shouldFilterLinks, filteredLinks,
    // FPV & Heatmap
    isFpvMode, toggleFpvMode,
    isHeatmapVisible, setIsHeatmapVisible, heatmapData,
    // 쿠폰
    couponBoxes, setCouponBoxes, collectedCoupon, couponAudioRef,
    handleCouponClick, spawnCoupons, updateCouponVisibility,
  };
}
