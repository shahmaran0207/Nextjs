/**
 * 네이버 로드뷰 API 타입 정의
 * 
 * 이 파일은 네이버 지도 API의 로드뷰 기능에 대한 TypeScript 타입 정의를 포함합니다.
 */

/**
 * 로드뷰 상태 인터페이스
 */
export interface RoadviewState {
  /** 패널 열림/닫힘 상태 */
  isOpen: boolean;
  /** 현재 로드뷰 위치 */
  position: {
    lat: number;
    lng: number;
  } | null;
  /** 시야 방향 (0-360도, 북쪽 기준 시계방향) */
  direction: number;
  /** 줌 레벨 */
  zoom: number;
  /** 해당 위치에 로드뷰 존재 여부 */
  isAvailable: boolean;
}

/**
 * 로드뷰 캐시 인터페이스
 */
export interface RoadviewCache {
  /** "lat,lng" 형식의 키 */
  [positionKey: string]: {
    position: {
      lat: number;
      lng: number;
    };
    /** 파노라마 ID */
    panoId: string;
    /** 캐시 생성 시간 */
    timestamp: number;
  };
}

/**
 * 네이버 지도 API 전역 객체 (window.naver.maps)
 */
export interface NaverMaps {
  Panorama: new (container: HTMLElement, options: PanoramaOptions) => Panorama;
  LatLng: new (lat: number, lng: number) => LatLng;
  Event: {
    addListener: (instance: any, eventName: string, handler: Function) => void;
  };
  Service: {
    RoadviewService: new () => RoadviewService;
  };
}

/**
 * 파노라마 옵션 인터페이스
 */
export interface PanoramaOptions {
  /** 초기 위치 */
  position: LatLng;
  /** 시야 설정 */
  pov: {
    /** 방위각 (0-360) */
    pan: number;
    /** 기울기 (-90 ~ 90) */
    tilt: number;
    /** 시야각 (30-120) */
    fov: number;
  };
}

/**
 * 파노라마 인스턴스 인터페이스
 */
export interface Panorama {
  /** 위치 설정 */
  setPosition: (position: LatLng) => void;
  /** 현재 위치 가져오기 */
  getPosition: () => LatLng;
  /** 시야 설정 */
  setPov: (pov: { pan?: number; tilt?: number; fov?: number }) => void;
  /** 현재 시야 가져오기 */
  getPov: () => { pan: number; tilt: number; fov: number };
}

/**
 * 위도/경도 인터페이스
 */
export interface LatLng {
  /** 위도 값 반환 */
  lat: () => number;
  /** 경도 값 반환 */
  lng: () => number;
}

/**
 * 로드뷰 서비스 인터페이스
 */
export interface RoadviewService {
  /** 가장 가까운 파노라마 검색 */
  getNearestPanorama: (
    position: LatLng,
    radius: number,
    callback: (pano: PanoramaLocation | null) => void
  ) => void;
}

/**
 * 파노라마 위치 정보 인터페이스
 */
export interface PanoramaLocation {
  /** 파노라마 위치 */
  position: LatLng;
  /** 파노라마 ID */
  panoId: string;
}

/**
 * window 객체에 네이버 지도 API 타입 추가
 */
declare global {
  interface Window {
    naver?: {
      maps?: NaverMaps;
    };
  }
}
