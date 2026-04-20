# UI/UX 개선 기능 문서

## 개요

디지털 트윈 지도 애플리케이션의 사용자 경험을 향상시키기 위한 UI/UX 개선 기능입니다. 주요 기능으로는 조건부 패널 렌더링, 지도 네비게이션, 카테고리 필터링, 자동 순환 기능이 포함됩니다.

## 주요 기능

### 1. 조건부 패널 렌더링 시스템

도로 선택 여부에 따라 패널이 자동으로 전환됩니다.

**레이아웃:**
- **왼쪽 상단**: 도로 테이블 (항상 표시)
- **오른쪽 상단**: 
  - 도로 선택 시 → 구역 관리 패널
  - 도로 미선택 시 → 시간 필터 패널
- **오른쪽 하단**:
  - 도로 선택 시 → 링크 테이블
  - 도로 미선택 시 → 통계 대시보드

**접근성:**
- 키보드 네비게이션 지원 (Tab, Enter, Space)
- ARIA 속성 완전 지원
- 최소 터치 타겟 크기 44x44px

### 2. 지도 네비게이션

**기능:**
- District 클릭 시 해당 지역으로 자동 이동
- 부드러운 애니메이션 전환 (500ms)
- 적절한 줌 레벨 자동 계산

**사용 예시:**
```typescript
const { flyTo } = useMapNavigation({
  viewState,
  setViewState,
  animationDuration: 500,
});

// 특정 좌표로 이동
flyTo([129.0756, 35.1796], 13);
```

**접근성:**
- `prefers-reduced-motion` 지원 (애니메이션 비활성화)

### 3. 카테고리 필터링

**지원 카테고리:**
- **관광**: 이색여행, 맛집, 문화시설 등
- **공사**: 영조물 건립, 하수/폐수 처리장, 도로 등

**기능:**
- 다중 카테고리 선택 가능
- 실시간 필터링 및 클러스터링 재계산
- 필터링된 항목 수 표시

**사용 예시:**
```typescript
const {
  selectedCategories,
  filteredData,
  toggleCategory,
  clearFilters,
} = useCategoryFilter({
  data: themeTravelData,
  getCategoryKey: (item) => item.category_name || '기타',
});
```

### 4. 자동 순환 기능

**사용 방법:**
1. 대시보드에서 카테고리 클릭
2. 해당 카테고리의 모든 항목을 3초 간격으로 자동 순환
3. 지도가 각 항목 위치로 자동 이동
4. 같은 카테고리 재클릭 시 순환 중지

**기능:**
- 관광 카테고리 순환 (5초 간격)
- 공사 분야 순환 (3초 간격)
- 순환 UI 표시 (현재 항목 번호 / 전체 개수)
- 카테고리 전환 시 인덱스 자동 초기화
- 교차 순환 중지 (한 카테고리 시작 시 다른 카테고리 자동 중지)

**사용 예시:**
```typescript
const carousel = useCarouselController({
  items: carouselItems,
  interval: 3000,
  animationDuration: 500,
  onItemChange: (item, index) => {
    flyTo(item.coordinates, 16);
  },
});

// 순환 시작
carousel.start();

// 순환 중지
carousel.stop();
```

## 구현된 Hook

### useCategoryFilter

카테고리 기반 데이터 필터링을 관리합니다.

**반환값:**
- `selectedCategories`: 선택된 카테고리 Set
- `filteredData`: 필터링된 데이터 배열
- `categories`: 카테고리별 항목 수 Map
- `toggleCategory`: 카테고리 선택/해제 함수
- `clearFilters`: 모든 필터 초기화 함수
- `isFiltered`: 필터 활성화 여부

### useMapNavigation

지도 viewport 이동을 관리합니다.

**반환값:**
- `flyTo`: 특정 좌표로 이동
- `fitBounds`: 경계 박스에 맞춰 이동
- `animateTo`: 부분 viewState로 이동

**특징:**
- 좌표 및 줌 레벨 유효성 검증
- 애니메이션 지속 시간 제한 (200-800ms)
- `prefers-reduced-motion` 지원

### useCarouselController

자동 순환 기능을 관리합니다.

**반환값:**
- `isActive`: 순환 활성화 상태
- `currentIndex`: 현재 항목 인덱스
- `currentItem`: 현재 항목 데이터
- `start`: 순환 시작
- `stop`: 순환 중지
- `next`: 다음 항목으로 이동
- `previous`: 이전 항목으로 이동
- `goTo`: 특정 인덱스로 이동

**특징:**
- 자동 타이머 관리 및 정리
- 항목 변경 시 콜백 호출
- 항목 배열 변경 시 인덱스 자동 초기화

## 구현된 컴포넌트

### TabPanelContainer

탭 기반 패널 전환을 제공합니다.

**Props:**
- `position`: 패널 위치 ('top-left' | 'top-right' | 'bottom-left' | 'bottom-right')
- `tabs`: 탭 설정 배열
- `defaultActiveIndex`: 기본 활성 탭 인덱스
- `onTabChange`: 탭 변경 콜백

**접근성:**
- ARIA 속성 완전 지원 (role, aria-selected, aria-controls)
- 키보드 네비게이션 (Arrow Left/Right, Home/End)
- 포커스 관리

### CategoryFilterPanel

카테고리 필터링 UI를 제공합니다.

**Props:**
- `title`: 패널 제목
- `categories`: 카테고리 목록
- `selectedCategories`: 선택된 카테고리 Set
- `onCategoryToggle`: 카테고리 토글 콜백
- `onCategoryPress`: 길게 누르기 콜백 (자동 순환)
- `onCategoryRelease`: 누르기 해제 콜백
- `visibleCount`: 필터링된 항목 수
- `totalCount`: 전체 항목 수

**특징:**
- 길게 누르기 감지 (300ms)
- 모바일 터치 지원
- 선택된 카테고리 시각적 강조

### DashboardPanel

통계 대시보드를 제공합니다.

**Props:**
- `stats`: 대시보드 통계 데이터
- `isLoading`: 로딩 상태
- `onStatClick`: 통계 항목 클릭 콜백
- `onDistrictClick`: 지역 클릭 콜백 (지도 이동)
- `onTourismCategoryClick`: 관광 카테고리 클릭 콜백 (자동 순환)
- `onConstructionFieldClick`: 공사 분야 클릭 콜백 (자동 순환)
- `boundaryData`: 경계 데이터 (지도 이동용)

**표시 정보:**
- 진행 중 공사 수
- 평균 진행률
- 지연 프로젝트 수
- 분야별 공사 통계 (전체)
- 지역별 공사 통계 (전체, 부산광역시 제외)
- 관광 카테고리 통계 (전체)

**접근성:**
- 모든 클릭 가능 항목에 ARIA 레이블
- 키보드 네비게이션 지원
- role="button" 및 tabIndex 설정

## 유틸리티 함수

### mapValidation.ts

좌표 및 줌 레벨 유효성 검증 함수를 제공합니다.

**함수:**
- `isValidCoordinate(lng, lat)`: 좌표 유효성 검증
- `isValidZoomLevel(zoom)`: 줌 레벨 유효성 검증 (0-20)
- `getDistrictCenter(district)`: District 중심 좌표 계산
- `calculateZoomLevel(bounds)`: 경계 박스에 맞는 줌 레벨 계산

### filterUtils.ts

데이터 필터링 유틸리티 함수를 제공합니다.

**함수:**
- `filterByCategories<T>(data, selectedCategories, getCategoryKey)`: 카테고리 기반 필터링

### carouselUtils.ts

순환 인덱스 계산 함수를 제공합니다.

**함수:**
- `getNextIndex(currentIndex, length)`: 다음 인덱스 계산 (순환)
- `getPreviousIndex(currentIndex, length)`: 이전 인덱스 계산 (순환)
- `clampIndex(index, length)`: 인덱스 범위 제한

### DashboardStatsModule.ts

대시보드 통계 계산 함수를 제공합니다.

**함수:**
- `calculateStats(construction, tourism, boundaries)`: 전체 통계 계산
- `getProjectsInViewport(construction, bbox)`: viewport 내 프로젝트 필터링
- `getTopN(grouped, n)`: 상위 N개 항목 추출
- `mapDongToGu(locationText)`: 동 이름을 구 이름으로 변환 (부산 전체 동 매핑)

## 접근성 기능

### WCAG 2.1 AA 준수

- **색상 대비**: 모든 텍스트가 배경과 충분한 대비 제공
- **키보드 네비게이션**: 모든 상호작용 요소 키보드로 접근 가능
- **ARIA 속성**: 스크린 리더 지원을 위한 완전한 ARIA 마크업
- **터치 타겟**: 최소 44x44px 크기 보장
- **애니메이션 감소**: `prefers-reduced-motion` 설정 지원

### 키보드 단축키

**TabPanelContainer:**
- `Arrow Left/Right`: 탭 전환
- `Home`: 첫 번째 탭으로 이동
- `End`: 마지막 탭으로 이동
- `Enter/Space`: 탭 활성화

**DashboardPanel:**
- `Tab`: 항목 간 이동
- `Enter/Space`: 항목 클릭 (지도 이동 또는 자동 순환)

**CategoryFilterPanel:**
- `Tab`: 카테고리 간 이동
- `Enter/Space`: 카테고리 선택/해제

## 성능 최적화

### 메모이제이션

- `useMemo`: 필터링된 데이터, 클러스터 계산 결과
- `useCallback`: 이벤트 핸들러, 지도 이동 함수

### 디바운싱

- viewport 변경 시 100ms 디바운싱 적용
- 불필요한 재렌더링 방지

### 클러스터링

- Supercluster를 사용한 효율적인 마커 클러스터링
- 필터링된 데이터만 클러스터링하여 성능 향상

## 브라우저 지원

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 알려진 제한사항

1. **모바일 길게 누르기**: 일부 모바일 브라우저에서 길게 누르기 감지가 지연될 수 있습니다.
2. **대량 데이터**: 1000개 이상의 항목 순환 시 성능 저하 가능성이 있습니다.
3. **애니메이션**: 저사양 기기에서 애니메이션이 끊길 수 있습니다.

## 향후 개선 사항

1. 가상화를 통한 대량 데이터 처리 최적화
2. 순환 속도 사용자 설정 기능
3. 즐겨찾기 카테고리 저장 기능
4. 순환 히스토리 및 되돌리기 기능

## 문의

기능 관련 문의사항이나 버그 리포트는 프로젝트 이슈 트래커를 이용해주세요.
