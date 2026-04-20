# 구현 계획: UI/UX 개선

## 개요

이 구현 계획은 디지털 트윈 지도 애플리케이션의 UI/UX 개선을 위한 작업 목록입니다. 주요 개선 사항은 탭 기반 패널 공유 시스템, 지도 네비게이션 개선, 카테고리 필터링, 자동 순환 기능입니다. 모든 구현은 TypeScript와 React를 사용하며, 기존 deck.gl 기반 지도 시스템과 통합됩니다.

## 작업 목록

- [x] 1. 프로젝트 설정 및 의존성 추가
  - fast-check, jest-axe, @testing-library/user-event 패키지 설치
  - 테스트 환경 설정 확인
  - _요구사항: 7.1, 7.2_

- [x] 2. 유틸리티 함수 및 타입 정의
  - [x] 2.1 공통 타입 인터페이스 작성
    - ViewState, TabConfig, CategoryItem, CarouselItem 등 타입 정의
    - 파일 위치: `types/ui-ux.ts` 또는 기존 타입 파일에 추가
    - _요구사항: 1.1, 3.1, 4.1_
  
  - [x] 2.2 좌표 및 줌 레벨 유효성 검증 함수 작성
    - `isValidCoordinate(lng, lat)` 함수 구현
    - `isValidZoomLevel(zoom)` 함수 구현
    - 파일 위치: `utils/mapValidation.ts`
    - _요구사항: 2.5_
  
  - [ ]* 2.3 좌표 및 줌 레벨 유효성 검증 속성 테스트 작성
    - **Property 8: 줌 레벨 유효성**
    - **검증: 요구사항 2.3, 4.10**
  
  - [x] 2.4 필터링 유틸리티 함수 작성
    - `filterByCategories<T>(data, selectedCategories, getCategoryKey)` 함수 구현
    - 파일 위치: `utils/filterUtils.ts`
    - _요구사항: 3.1, 3.2_
  
  - [ ]* 2.5 필터링 유틸리티 속성 테스트 작성
    - **Property 1: 카테고리 필터링 정확성**
    - **검증: 요구사항 3.1, 3.2**
  
  - [x] 2.6 순환 인덱스 계산 함수 작성
    - `getNextIndex(currentIndex, length)` 함수 구현
    - `getPreviousIndex(currentIndex, length)` 함수 구현
    - 파일 위치: `utils/carouselUtils.ts`
    - _요구사항: 4.4_
  
  - [ ]* 2.7 순환 인덱스 계산 속성 테스트 작성
    - **Property 9: 순환 인덱스 계산**
    - **검증: 요구사항 4.4**

- [ ] 3. Checkpoint - 기본 유틸리티 검증
  - 모든 테스트가 통과하는지 확인
  - 질문이 있으면 사용자에게 문의

- [x] 4. useCategoryFilter Hook 구현
  - [x] 4.1 useCategoryFilter Hook 작성
    - 선택된 카테고리 상태 관리 (useState with Set)
    - 필터링된 데이터 메모이제이션 (useMemo)
    - toggleCategory, selectCategories, clearFilters 함수 구현
    - 카테고리별 항목 수 계산
    - 파일 위치: `hooks/useCategoryFilter.ts`
    - _요구사항: 3.1, 3.2, 3.3, 3.5, 7.2_
  
  - [ ]* 4.2 다중 카테고리 선택 속성 테스트 작성
    - **Property 2: 다중 카테고리 선택 합집합**
    - **검증: 요구사항 3.5**
  
  - [ ]* 4.3 카테고리 토글 동작 속성 테스트 작성
    - **Property 5: 카테고리 토글 동작**
    - **검증: 요구사항 3.3**
  
  - [ ]* 4.4 useCategoryFilter Hook 단위 테스트 작성
    - 초기 상태 검증
    - toggleCategory 동작 테스트
    - clearFilters 동작 테스트
    - _요구사항: 3.1, 3.2, 3.3_

- [x] 5. useMapNavigation Hook 구현
  - [x] 5.1 useMapNavigation Hook 작성
    - flyTo, fitBounds, animateTo 함수 구현
    - transitionDuration 및 transitionInterpolator 설정
    - 디바운싱 적용
    - 파일 위치: `hooks/useMapNavigation.ts`
    - _요구사항: 2.1, 2.2, 2.3, 7.4_
  
  - [ ]* 5.2 지도 이동 애니메이션 속성 테스트 작성
    - **Property 7: 지도 이동 애니메이션 지속 시간**
    - **검증: 요구사항 2.2, 4.6**
  
  - [ ]* 5.3 useMapNavigation Hook 단위 테스트 작성
    - flyTo 함수 호출 검증
    - 좌표 유효성 검증
    - 디바운싱 동작 테스트
    - _요구사항: 2.1, 2.2_

- [x] 6. useCarouselController Hook 구현
  - [x] 6.1 useCarouselController Hook 작성
    - 자동 순환 상태 관리 (useState, useRef)
    - start, stop, next, previous, goTo 함수 구현
    - setInterval을 사용한 자동 순환 로직
    - useEffect cleanup에서 타이머 정리
    - 파일 위치: `hooks/useCarouselController.ts`
    - _요구사항: 4.1, 4.2, 4.3, 4.4, 4.5, 7.3_
  
  - [ ]* 6.2 순환 UI 표시 형식 속성 테스트 작성
    - **Property 10: 순환 UI 표시 형식**
    - **검증: 요구사항 4.7**
  
  - [ ]* 6.3 useCarouselController Hook 단위 테스트 작성
    - start/stop 동작 테스트
    - 순환 로직 테스트
    - 타이머 정리 테스트
    - _요구사항: 4.2, 4.3, 4.4, 4.5_

- [ ] 7. Checkpoint - Hooks 검증
  - 모든 Hook 테스트가 통과하는지 확인
  - 질문이 있으면 사용자에게 문의

- [x] 8. TabPanelContainer 컴포넌트 구현
  - [x] 8.1 TabPanelContainer 컴포넌트 작성
    - 탭 목록 렌더링 (role="tablist")
    - 활성 탭 상태 관리 (useState)
    - 탭 클릭 핸들러 구현
    - 활성 패널 조건부 렌더링 (role="tabpanel")
    - ARIA 속성 설정 (aria-selected, aria-controls, aria-labelledby)
    - 파일 위치: `components/TabPanelContainer.tsx`
    - _요구사항: 1.1, 1.2, 1.3, 1.7, 1.8, 6.2, 6.3_
  
  - [x] 8.2 TabPanelContainer 키보드 네비게이션 추가
    - Arrow Left/Right 키로 탭 전환
    - Home/End 키로 첫/마지막 탭 이동
    - 탭 전환 시 포커스 관리
    - _요구사항: 6.1, 6.3_
  
  - [ ]* 8.3 TabPanelContainer 단위 테스트 작성
    - 초기 렌더링 테스트
    - 탭 클릭 시 패널 전환 테스트
    - 활성 탭 시각적 표시 테스트
    - _요구사항: 1.2, 1.3, 1.7_
  
  - [ ]* 8.4 TabPanelContainer 접근성 테스트 작성
    - jest-axe를 사용한 자동화된 접근성 검증
    - ARIA 속성 존재 여부 확인
    - 키보드 네비게이션 테스트
    - _요구사항: 6.1, 6.2, 6.3_

- [x] 9. CategoryFilterPanel 컴포넌트 구임
  - [x] 9.1 CategoryFilterPanel 컴포넌트 작성
    - 카테고리 목록 렌더링
    - 선택/해제 토글 핸들러
    - 선택된 카테고리 시각적 강조
    - 필터링된 항목 수 표시
    - 파일 위치: `components/CategoryFilterPanel.tsx`
    - _요구사항: 3.1, 3.2, 3.3, 3.4, 3.6_
  
  - [x] 9.2 CategoryFilterPanel 길게 누르기 감지 추가
    - onMouseDown/onMouseUp 이벤트 핸들러
    - onTouchStart/onTouchEnd 이벤트 핸들러 (모바일 지원)
    - 300ms 이상 누르면 자동 순환 모드 진입
    - _요구사항: 4.2, 4.5_
  
  - [ ]* 9.3 필터 카운트 정확성 속성 테스트 작성
    - **Property 3: 필터 카운트 정확성**
    - **검증: 요구사항 3.6**
  
  - [ ]* 9.4 CategoryFilterPanel 단위 테스트 작성
    - 카테고리 렌더링 테스트
    - 선택/해제 토글 테스트
    - 항목 수 표시 테스트
    - 길게 누르기 감지 테스트
    - _요구사항: 3.1, 3.3, 3.4, 3.6_

- [ ] 10. Checkpoint - 기본 컴포넌트 검증
  - 모든 컴포넌트 테스트가 통과하는지 확인
  - 질문이 있으면 사용자에게 문의

- [x] 11. TwinMap에 TabPanelContainer 통합
  - [x] 11.1 TwinMap에 첫 번째 TabPanelContainer 추가
    - "도로명" 탭 → TwinRoadPanel
    - "소통정보" 탭 → TimeFilterPanel
    - 위치: top-left 또는 적절한 위치
    - 기본 활성 탭 설정
    - _요구사항: 1.1, 1.2, 1.3, 1.8_
  
  - [x] 11.2 TwinMap에 두 번째 TabPanelContainer 추가
    - "통계" 탭 → DashboardPanel
    - "링크" 탭 → TwinLinkPanel
    - 위치: top-right 또는 적절한 위치
    - 기본 활성 탭 설정
    - _요구사항: 1.4, 1.5, 1.6, 1.8_
  
  - [ ]* 11.3 탭 전환 통합 테스트 작성
    - 탭 클릭 시 패널 전환 검증
    - 포커스 이동 검증
    - 여러 TabPanelContainer 독립 동작 검증
    - _요구사항: 1.2, 1.3, 1.5, 1.6_

- [x] 12. DashboardPanel에 District 클릭 이벤트 추가
  - [x] 12.1 DashboardPanel에 클릭 핸들러 추가
    - District 항목에 onClick 이벤트 추가
    - useMapNavigation Hook 사용하여 viewport 이동
    - 호버 효과 스타일 추가
    - _요구사항: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 12.2 District 경계 데이터 처리
    - District 중심 좌표 계산 함수 작성
    - 경계 데이터 부재 시 기본 좌표 사용
    - 적절한 줌 레벨 계산
    - _요구사항: 2.3, 2.5_
  
  - [ ]* 12.3 District 클릭 속성 테스트 작성
    - **Property 6: District 클릭 시 좌표 이동**
    - **검증: 요구사항 2.1**
  
  - [ ]* 12.4 DashboardPanel 통합 테스트 작성
    - District 클릭 시 viewport 이동 검증
    - 애니메이션 지속 시간 검증
    - 줌 레벨 검증
    - _요구사항: 2.1, 2.2, 2.3_

- [ ] 13. Checkpoint - 지도 네비게이션 검증
  - District 클릭 시 지도 이동이 정상 동작하는지 확인
  - 질문이 있으면 사용자에게 문의

- [x] 14. TwinMap에 관광 카테고리 필터링 통합
  - [x] 14.1 관광 카테고리 데이터 준비
    - 카테고리 목록 정의 (CategoryItem[])
    - 각 카테고리의 색상, 아이콘 설정
    - _요구사항: 3.1_
  
  - [x] 14.2 TwinMap에 useCategoryFilter Hook 연결
    - 관광 데이터에 useCategoryFilter 적용
    - 필터링된 데이터를 deck.gl 레이어에 전달
    - _요구사항: 3.1, 3.2, 7.2_
  
  - [x] 14.3 TwinMap에 관광 CategoryFilterPanel 추가
    - CategoryFilterPanel 렌더링
    - 필터 토글 핸들러 연결
    - 위치: 적절한 패널 영역
    - _요구사항: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 14.4 클러스터링 재계산 로직 추가
    - 필터링된 데이터로 Supercluster 재계산
    - 클러스터 레이어 업데이트
    - _요구사항: 3.7_
  
  - [ ]* 14.5 클러스터링 필터 일관성 속성 테스트 작성
    - **Property 4: 클러스터링 필터 일관성**
    - **검증: 요구사항 3.7**
  
  - [ ]* 14.6 관광 필터링 통합 테스트 작성
    - 카테고리 선택 시 지도 업데이트 검증
    - 다중 선택 동작 검증
    - 클러스터링 재계산 검증
    - _요구사항: 3.1, 3.2, 3.5, 3.7_

- [x] 15. TwinMap에 공사 카테고리 필터링 통합
  - [x] 15.1 공사 카테고리 데이터 준비
    - 카테고리 목록 정의 (CategoryItem[])
    - 각 카테고리의 색상, 아이콘 설정
    - _요구사항: 4.1_
  
  - [x] 15.2 TwinMap에 useCategoryFilter Hook 연결
    - 공사 데이터에 useCategoryFilter 적용
    - 필터링된 데이터를 deck.gl 레이어에 전달
    - _요구사항: 4.1, 7.2_
  
  - [x] 15.3 TwinMap에 공사 CategoryFilterPanel 추가
    - CategoryFilterPanel 렌더링
    - 필터 토글 핸들러 연결
    - 위치: 적절한 패널 영역
    - _요구사항: 4.1_
  
  - [ ]* 15.4 공사 필터링 통합 테스트 작성
    - 카테고리 선택 시 지도 업데이트 검증
    - 클러스터링 재계산 검증
    - _요구사항: 4.1_

- [x] 16. Checkpoint - 필터링 기능 검증
  - 관광 및 공사 필터링이 정상 동작하는지 확인
  - 질문이 있으면 사용자에게 문의

- [x] 17. 관광 카테고리 자동 순환 기능 구현
  - [x] 17.1 관광 CategoryFilterPanel에 useCarouselController 연결
    - 카테고리별 항목 목록을 CarouselItem[]로 변환
    - useCarouselController Hook 초기화
    - 길게 누르기 시 순환 시작
    - 손을 떼면 순환 중지
    - _요구사항: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 17.2 순환 중 지도 viewport 이동
    - onItemChange 콜백에서 useMapNavigation 호출
    - 각 항목의 좌표로 flyTo 실행
    - 적절한 줌 레벨 설정
    - _요구사항: 5.1, 5.2, 5.6_
  
  - [x] 17.3 순환 UI 표시 추가
    - 현재 항목 번호 / 전체 항목 수 표시
    - 항목 상세 정보 툴팁 또는 패널 표시
    - 순환 중 시각적 피드백
    - _요구사항: 5.7, 5.8_
  
  - [x] 17.4 단일 항목 처리
    - 항목이 1개만 있을 때 순환하지 않음
    - 적절한 UI 메시지 표시
    - _요구사항: 5.9_
  
  - [ ]* 17.5 관광 순환 통합 테스트 작성
    - 길게 누르기 시 순환 시작 검증
    - 항목 이동 검증
    - 순환 중지 검증
    - UI 표시 검증
    - _요구사항: 5.1, 5.2, 5.5, 5.7_

- [x] 18. 공사 카테고리 자동 순환 기능 구현
  - [x] 18.1 공사 CategoryFilterPanel에 useCarouselController 연결
    - 카테고리별 항목 목록을 CarouselItem[]로 변환
    - useCarouselController Hook 초기화
    - 길게 누르기 시 순환 시작
    - 손을 떼면 순환 중지
    - _요구사항: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 18.2 순환 중 지도 viewport 이동
    - onItemChange 콜백에서 useMapNavigation 호출
    - 각 항목의 좌표로 flyTo 실행
    - 적절한 줌 레벨 설정
    - _요구사항: 4.1, 4.2, 4.6, 4.10_
  
  - [x] 18.3 순환 UI 표시 추가
    - 현재 항목 번호 / 전체 항목 수 표시
    - 항목 상세 정보 툴팁 또는 패널 표시
    - 순환 중 시각적 피드백
    - _요구사항: 4.7, 4.8_
  
  - [x] 18.4 단일 항목 처리
    - 항목이 1개만 있을 때 순환하지 않음
    - 적절한 UI 메시지 표시
    - _요구사항: 4.9_
  
  - [ ]* 18.5 공사 순환 통합 테스트 작성
    - 길게 누르기 시 순환 시작 검증
    - 항목 이동 검증
    - 순환 중지 검증
    - UI 표시 검증
    - _요구사항: 4.1, 4.2, 4.5, 4.7_

- [x] 19. Checkpoint - 자동 순환 기능 검증
  - 관광 및 공사 자동 순환이 정상 동작하는지 확인
  - 질문이 있으면 사용자에게 문의

- [x] 20. 접근성 개선
  - [x] 20.1 모든 상호작용 요소에 ARIA 레이블 추가
    - 탭, 버튼, 필터 항목에 aria-label 설정
    - 동적 콘텐츠에 aria-live 설정
    - _요구사항: 6.2, 6.4_
  
  - [x] 20.2 터치 타겟 크기 조정
    - 모든 클릭 가능한 요소를 최소 44x44px로 설정
    - 모바일 반응형 스타일 추가
    - _요구사항: 6.5_
  
  - [x] 20.3 색상 대비 검증 및 조정
    - WCAG 2.1 AA 기준 충족하도록 색상 조정
    - 색상 대비 검증 도구 사용
    - _요구사항: 6.6_
  
  - [x] 20.4 prefers-reduced-motion 지원 추가
    - 애니메이션 감소 설정 감지
    - 설정 활성화 시 애니메이션 지속 시간 단축 또는 비활성화
    - _요구사항: 6.7_
  
  - [ ]* 20.5 전체 접근성 테스트 작성
    - jest-axe를 사용한 자동화된 접근성 검증
    - 키보드 네비게이션 전체 플로우 테스트
    - 스크린 리더 지원 검증
    - _요구사항: 6.1, 6.2, 6.3, 6.4_

- [ ] 21. 성능 최적화
  - [ ] 21.1 메모이제이션 적용
    - 필터링된 데이터에 useMemo 적용
    - 이벤트 핸들러에 useCallback 적용
    - 클러스터 계산 결과 메모이제이션
    - _요구사항: 7.2_
  
  - [ ] 21.2 디바운싱 추가
    - viewport 변경 시 디바운싱 적용
    - 필터 변경 시 디바운싱 적용 (필요 시)
    - _요구사항: 7.4_
  
  - [ ] 21.3 대량 데이터 처리 최적화
    - 1000개 이상 항목 처리 시 가상화 또는 페이지네이션 적용
    - 성능 프로파일링 수행
    - _요구사항: 7.5_
  
  - [ ]* 21.4 성능 테스트 작성
    - 필터링 성능 테스트 (100ms 이내)
    - 대량 데이터 렌더링 테스트
    - 메모이제이션 효과 검증
    - _요구사항: 7.2, 7.5, 7.6_

- [ ] 22. 수동 지도 조작 시 순환 일시 중지
  - [ ] 22.1 사용자 지도 조작 감지
    - onViewStateChange 이벤트에서 수동 조작 감지
    - 수동 조작 시 useCarouselController.stop() 호출
    - _요구사항: 7.7_
  
  - [ ]* 22.2 수동 조작 통합 테스트 작성
    - 순환 중 수동 조작 시 순환 중지 검증
    - 순환 재시작 동작 검증
    - _요구사항: 7.7_

- [ ] 23. 최종 Checkpoint - 전체 기능 검증
  - 모든 테스트가 통과하는지 확인
  - 브라우저에서 수동 테스트 수행
  - 질문이 있으면 사용자에게 문의

- [-] 24. 문서화 및 정리
  - [x] 24.1 코드 주석 추가
    - 복잡한 로직에 주석 추가
    - 각 컴포넌트 및 Hook에 JSDoc 주석 추가
  
  - [x] 24.2 README 업데이트
    - 새로운 기능 설명 추가
    - 사용 방법 문서화
  
  - [ ] 24.3 타이머 및 이벤트 리스너 정리 검증
    - 모든 useEffect cleanup 함수 확인
    - 메모리 누수 검증
    - _요구사항: 7.3_

## 참고 사항

- `*` 표시가 있는 작업은 선택 사항이며, 빠른 MVP를 위해 건너뛸 수 있습니다
- 각 작업은 특정 요구사항을 참조하여 추적 가능성을 보장합니다
- Checkpoint 작업은 점진적 검증을 위해 포함되었습니다
- 속성 테스트는 설계 문서의 Correctness Properties를 검증합니다
- 단위 테스트는 특정 예제 및 엣지 케이스를 검증합니다

## 예상 일정

- **Phase 1 (작업 1-7)**: 기반 유틸리티 및 Hooks - 1-2일
- **Phase 2 (작업 8-13)**: 기본 컴포넌트 및 지도 네비게이션 - 2-3일
- **Phase 3 (작업 14-19)**: 필터링 및 자동 순환 - 2-3일
- **Phase 4 (작업 20-22)**: 접근성 및 성능 최적화 - 1-2일
- **Phase 5 (작업 23-24)**: 최종 검증 및 문서화 - 1일

**총 예상 기간**: 7-11일
