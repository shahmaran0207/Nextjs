// 네이버 지도 API 전역 타입 선언
interface NaverMapsEvent {
  addListener: (target: any, eventName: string, listener: (...args: any[]) => void) => any;
  removeListener: (listener: any) => void;
}

interface NaverMapsLatLng {
  lat: () => number;
  lng: () => number;
}

interface NaverMapsService {
  [key: string]: any;
}

interface NaverMaps {
  Panorama: new (container: HTMLElement, options?: any) => any;
  LatLng: new (lat: number, lng: number) => NaverMapsLatLng;
  Event: NaverMapsEvent;
  Service: NaverMapsService;
  [key: string]: any;
}

interface NaverNamespace {
  maps: NaverMaps;
}

declare global {
  interface Window {
    naver?: NaverNamespace;
  }
}

export {};
