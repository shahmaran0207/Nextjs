/**
 * UI/UX 개선 기능을 위한 공통 타입 정의
 */

/**
 * 지도 Viewport 상태
 */
export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch?: number;
  bearing?: number;
  transitionDuration?: number;
  transitionInterpolator?: any;
}

/**
 * 탭 설정
 */
export interface TabConfig {
  id: string;
  label: string;
  icon?: string;
  content: React.ReactNode;
  ariaLabel?: string;
}

/**
 * 카테고리 항목
 */
export interface CategoryItem {
  id: string;
  label: string;
  icon?: string;
  color: string;
  count: number;
}

/**
 * 순환 항목
 */
export interface CarouselItem {
  id: string;
  coordinates: [number, number]; // [lng, lat]
  zoom?: number;
  data: any;
}

/**
 * 카테고리 필터 설정
 */
export interface CategoryFilterConfig<T> {
  data: T[];
  getCategoryKey: (item: T) => string;
}

/**
 * 카테고리 필터 반환 타입
 */
export interface CategoryFilter<T> {
  selectedCategories: Set<string>;
  filteredData: T[];
  categories: Map<string, number>; // category -> count
  toggleCategory: (category: string) => void;
  selectCategories: (categories: string[]) => void;
  clearFilters: () => void;
  isFiltered: boolean;
}

/**
 * 순환 컨트롤러 설정
 */
export interface CarouselConfig {
  items: CarouselItem[];
  interval: number; // milliseconds
  animationDuration: number; // milliseconds
  onItemChange: (item: CarouselItem, index: number) => void;
}

/**
 * 순환 컨트롤러 반환 타입
 */
export interface CarouselController {
  isActive: boolean;
  currentIndex: number;
  currentItem: CarouselItem | null;
  start: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  goTo: (index: number) => void;
}

/**
 * 지도 네비게이션 설정
 */
export interface MapNavigationConfig {
  viewState: ViewState;
  setViewState: (viewState: any) => void; // TwinViewState와 호환성을 위해 any 사용
  animationDuration?: number;
}

/**
 * 지도 네비게이션 반환 타입
 */
export interface MapNavigation {
  flyTo: (coordinates: [number, number], zoom?: number) => void;
  fitBounds: (bounds: [[number, number], [number, number]]) => void;
  animateTo: (viewState: Partial<ViewState>) => void;
}

/**
 * District 경계 데이터
 */
export interface DistrictBoundary {
  id: number;
  code: string;
  name: string;
  contour: [number, number][]; // polygon coordinates
  center?: [number, number]; // [lng, lat]
  bounds?: [[number, number], [number, number]]; // [[minLng, minLat], [maxLng, maxLat]]
}

/**
 * 관광 카테고리
 */
export interface TourismCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

/**
 * 공사 카테고리
 */
export interface ConstructionCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}
