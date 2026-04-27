import { useRef, useCallback } from "react";
import { DISTRICT_COORDINATES } from "@/component/dt/constants/districtCoordinates";
import { getDistrictCenter } from "@/utils/mapValidation";
import { DistrictBoundary } from "@/types/ui-ux";
import { RoadviewState } from "@/types/roadview";

interface UseTwinMapHandlersProps {
  boundaryData: DistrictBoundary[];
  flyTo: (coords: [number, number], zoom?: number) => void;
  isLinkSelectModeRef: React.MutableRefObject<boolean>;
  roadviewState: RoadviewState;
  setRoadviewState: React.Dispatch<React.SetStateAction<RoadviewState>>;
  setRoadviewMarker: React.Dispatch<React.SetStateAction<{ lat: number; lng: number } | null>>;
  setIsHistoryPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsHistoryMode: React.Dispatch<React.SetStateAction<boolean>>;
  setHistoryTrafficMap: React.Dispatch<React.SetStateAction<Map<string, number>>>;
  setViewState: React.Dispatch<React.SetStateAction<any>>;
}

export function useTwinMapHandlers({
  boundaryData,
  flyTo,
  isLinkSelectModeRef,
  roadviewState,
  setRoadviewState,
  setRoadviewMarker,
  setIsHistoryPanelOpen,
  setIsHistoryMode,
  setHistoryTrafficMap,
  setViewState,
}: UseTwinMapHandlersProps) {
  // MapLibre 인스턴스 ref
  const mapRef = useRef<any>(null);

  // 구 이름 클릭 → 지도 이동
  const handleDistrictClick = useCallback((districtName: string) => {
    if (DISTRICT_COORDINATES[districtName]) {
      flyTo(DISTRICT_COORDINATES[districtName], 13);
      return;
    }
    const district = boundaryData.find(
      (d) => d.name === districtName || d.name.includes(districtName)
    );
    if (district) {
      flyTo(getDistrictCenter(district), 13);
    } else {
      console.warn(`District not found: ${districtName}`);
      flyTo([129.0756, 35.1796], 12);
    }
  }, [boundaryData, flyTo]);

  // 지도 클릭 → 로드뷰 위치 변경
  const handleMapClick = useCallback((info: any) => {
    if (isLinkSelectModeRef.current || !roadviewState.isOpen) return;
    if (info.layer?.id && !info.layer.id.includes('boundary')) return;
    if (!info.coordinate) return;
    const [lng, lat] = info.coordinate;
    if (lat < 34.8 || lat > 35.4 || lng < 128.7 || lng > 129.3) return;
    setRoadviewState(prev => ({ ...prev, position: { lat, lng } }));
    setRoadviewMarker({ lat, lng });
  }, [roadviewState.isOpen, isLinkSelectModeRef, setRoadviewState, setRoadviewMarker]);

  // 로드뷰 패널 토글
  const toggleRoadviewPanel = useCallback(() => {
    setRoadviewState(prev => {
      const newIsOpen = !prev.isOpen;
      if (newIsOpen && !prev.position) {
        const defaultPosition = { lat: 35.1796, lng: 129.0756 };
        setRoadviewMarker(defaultPosition);
        return { ...prev, isOpen: true, position: defaultPosition };
      }
      return { ...prev, isOpen: newIsOpen };
    });
  }, [setRoadviewState, setRoadviewMarker]);

  // 로드뷰 위치/방향 동기화
  const handleRoadviewPositionChange = useCallback(
    (newPosition: { lat: number; lng: number }, direction: number) => {
      setRoadviewState(prev => ({ ...prev, position: newPosition, direction }));
      setRoadviewMarker(newPosition);
    },
    [setRoadviewState, setRoadviewMarker]
  );

  // 로드뷰 가용성 변경
  const handleRoadviewAvailabilityChange = useCallback((isAvailable: boolean) => {
    setRoadviewState(prev => ({ ...prev, isAvailable }));
  }, [setRoadviewState]);

  // 교통 이력 패널 토글
  const toggleHistoryPanel = useCallback(() => {
    setIsHistoryPanelOpen(prev => !prev);
  }, [setIsHistoryPanelOpen]);

  // 교통 이력 데이터 변경
  const handleTrafficDataChange = useCallback((newTrafficMap: Map<string, number>) => {
    if (newTrafficMap.size === 0) {
      setIsHistoryMode(false);
      setHistoryTrafficMap(new Map());
    } else {
      setIsHistoryMode(true);
      setHistoryTrafficMap(newTrafficMap);
    }
  }, [setIsHistoryMode, setHistoryTrafficMap]);

  // 내 위치로 이동
  const goToMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('이 브라우저는 위치 정보를 지원하지 않습니다.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setViewState((prev: any) => ({ ...prev, longitude, latitude, zoom: 15, transitionDuration: 600 }));
      },
      () => alert('위치 정보를 가져올 수 없습니다. 브라우저 설정을 확인해주세요.')
    );
  }, [setViewState]);

  // MapLibre 맵 로드 핸들러
  const handleMapLoad = useCallback((event: any) => {
    const map = event.target;
    mapRef.current = map;

    // 존재하지 않는 아이콘 이미지 → 투명 이미지로 대체
    map.on('styleimagemissing', (e: any) => {
      if (!map.hasImage(e.id)) {
        try {
          const size = 64;
          const data = new Uint8Array(size * size * 4); // 완전 투명
          map.addImage(e.id, { width: size, height: size, data });
        } catch (_) {}
      }
    });

    // 스타일 로드 후 3D 건물 레이어 활성화
    map.once('styledata', () => {
      try {
        if (map.getLayer('building-3d')) {
          map.setLayoutProperty('building-3d', 'visibility', 'visible');
        }
      } catch (err) {
        console.warn('지도 레이어 설정 실패:', err);
      }
    });
  }, []);

  return {
    mapRef,
    handleDistrictClick,
    handleMapClick,
    toggleRoadviewPanel,
    handleRoadviewPositionChange,
    handleRoadviewAvailabilityChange,
    toggleHistoryPanel,
    handleTrafficDataChange,
    goToMyLocation,
    handleMapLoad,
  };
}
