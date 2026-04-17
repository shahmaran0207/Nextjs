# Implementation Plan: ITS CCTV 통합 기능

## Overview

이 구현 계획은 디지털 트윈 지도(TwinMap)에 국토교통부 ITS(Intelligent Transport Systems) 도로 CCTV 통합 기능을 추가하기 위한 작업 목록입니다. 부산 지역의 실시간 도로 CCTV 데이터를 ITS OpenAPI로부터 가져와 지도에 표시하고, 사용자가 CCTV 마커를 클릭하여 HLS 방식의 실시간 영상을 볼 수 있도록 구현합니다.

**기술 스택**: Next.js API Routes, React, TypeScript, deck.gl, Supercluster, hls.js

**구현 범위**:
1. ITS API 데이터 페칭 (서버 측)
2. Next.js API 라우트 생성
3. TwinMap에 CCTV 데이터 통합
4. CCTV 클러스터 레이어 생성 (7개 레이어)
5. CCTV 팝업 컴포넌트 (HLS Player)
6. Dashboard Panel CCTV 통계 추가
7. 환경 변수 설정
8. Property-based tests (9개 properties)
9. Integration tests
10. Component tests

## Tasks

- [x] 1. 프로젝트 설정 및 의존성 추가
  - package.json에 hls.js (^1.4.12) 추가
  - package.json에 fast-check (^3.15.0) devDependency 추가
  - package.json에 msw (^2.0.0) devDependency 추가
  - npm install 실행하여 의존성 설치
  - _Requirements: 8.1, 8.2_

- [x] 2. 환경 변수 설정
  - .env.local 파일에 ITS_CCTV_KEY 환경 변수 추가
  - 환경 변수가 서버 측에서만 접근 가능한지 확인
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 3. TypeScript 타입 정의 생성
  - [x] 3.1 CCTV 데이터 타입 정의
    - types/cctv.ts 파일 생성
    - CCTVPoint 인터페이스 정의 (gid, lng, lat, name, url, type, format)
    - ITSCctvResponse 인터페이스 정의 (ITS API 응답 구조)
    - CCTVFeature, CCTVCluster 인터페이스 정의 (Supercluster용)
    - _Requirements: 1.5, 1.7_

- [x] 4. ITS API 데이터 페칭 구현
  - [x] 4.1 Next.js API 라우트 생성
    - app/api/GIS/Busan/CCTV/getCCTVList/route.ts 파일 생성
    - GET 핸들러 함수 구현
    - ITS_CCTV_KEY 환경 변수 읽기
    - 환경 변수 누락 시 500 에러 반환
    - _Requirements: 2.1, 2.5, 8.3_

  - [x] 4.2 ITS API 호출 로직 구현
    - ITS API URL 설정 (https://openapi.its.go.kr:9443/cctvInfo)
    - 쿼리 파라미터 설정 (apiKey, type=4, cctvType=4, minX=128.8, maxX=129.3, minY=34.9, maxY=35.4, getType=json)
    - fetch 요청 실행
    - HTTP 에러 처리 (4xx, 5xx)
    - 네트워크 에러 처리
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_

  - [x] 4.3 API 응답 파싱 및 변환
    - ITS API JSON 응답 파싱 (cctvname, coordx, coordy, cctvurl, cctvtype, cctvformat)
    - CCTVPoint 구조로 데이터 변환 (coordx → lng, coordy → lat, cctvname → name, cctvurl → url)
    - gid 필드 생성 (index + 1)
    - 변환된 데이터를 JSON 응답으로 반환
    - _Requirements: 1.5, 1.7_

  - [x] 4.4 에러 응답 처리
    - API 실패 시 500 상태 코드와 에러 메시지 반환
    - Content-Type: application/json 헤더 설정
    - _Requirements: 2.2, 2.3, 2.4_

  - [ ]* 4.5 Property test: API 응답 파싱 및 변환
    - **Property 1: API 응답 파싱 및 변환**
    - **Validates: Requirements 1.5, 1.7**
    - fast-check를 사용하여 임의의 ITS API 응답 구조 생성
    - 모든 필드가 올바르게 매핑되는지 검증 (coordx → lng, coordy → lat 등)
    - 최소 100회 반복 실행

- [x] 5. TwinMap 컴포넌트에 CCTV 데이터 통합
  - [x] 5.1 CCTV 상태 추가
    - component/TwinMap.tsx에 cctvData 상태 추가 (CCTVPoint[])
    - selectedCctv 상태 추가 (CCTVPoint | null)
    - isCctvPopupOpen 상태 추가 (boolean)
    - _Requirements: 3.2_

  - [x] 5.2 CCTV 데이터 페칭
    - useEffect 훅에서 /api/GIS/Busan/CCTV/getCCTVList 호출
    - 성공 시 cctvData 상태 업데이트
    - 실패 시 콘솔 에러 로깅 및 빈 배열로 초기화
    - _Requirements: 3.1, 3.6, 9.2, 9.3_

  - [x] 5.3 Supercluster 인덱스 생성
    - useMemo 훅으로 cctvIndex 생성 (radius: 80, maxZoom: 18)
    - cctvData를 Supercluster Feature 형식으로 변환
    - 잘못된 좌표 데이터 필터링 (lat, lng 존재 여부 확인)
    - _Requirements: 3.3, 10.1_

  - [x] 5.4 뷰포트 기반 클러스터 생성
    - useMemo 훅으로 cctvClusters 계산
    - 현재 bbox와 zoomInt를 사용하여 getClusters 호출
    - viewport 변경 시에만 재계산되도록 의존성 설정
    - _Requirements: 3.4, 10.2_

  - [ ]* 5.5 Property test: Supercluster 인덱스 생성
    - **Property 2: Supercluster 인덱스 생성**
    - **Validates: Requirement 3.3**
    - fast-check로 임의의 CCTVPoint 배열 생성
    - Supercluster 인덱스가 성공적으로 생성되는지 검증
    - 임의의 bbox 쿼리에 대해 클러스터 반환 가능 여부 검증

  - [ ]* 5.6 Property test: 뷰포트 기반 클러스터 생성
    - **Property 3: 뷰포트 기반 클러스터 생성**
    - **Validates: Requirement 3.4**
    - fast-check로 임의의 bbox와 zoom level 생성
    - 생성된 클러스터가 bbox 내의 포인트만 포함하는지 검증

- [x] 6. Checkpoint - 데이터 페칭 및 클러스터링 검증
  - API 라우트가 정상적으로 CCTV 데이터를 반환하는지 확인
  - TwinMap이 데이터를 페칭하고 클러스터를 생성하는지 확인
  - 콘솔에서 에러가 없는지 확인
  - 사용자에게 질문이 있으면 물어보기

- [x] 7. CCTV 클러스터 레이어 생성
  - [x] 7.1 createCctvClusterLayers 함수 구현
    - component/dt/layers/createClusterLayers.ts에 함수 추가
    - 파라미터: cctvClusters, options (onMarkerClick 콜백)
    - 7개 레이어 반환 (Cluster Glow, Cluster Layer, Cluster Text, Point Glow, Point Ring, Point Core, Point Dot)
    - _Requirements: 4.1, 4.2, 4.3, 4.7_

  - [x] 7.2 클러스터 레이어 구현 (Glow, Layer, Text)
    - ScatterplotLayer로 Cluster Glow 생성 (cyan glow, radius: 12 + log2(count) * 3)
    - ScatterplotLayer로 Cluster Layer 생성 (cyan stroke, radius: 10 + log2(count) * 3)
    - TextLayer로 Cluster Text 생성 (point_count 표시, size: 11, color: #bae6fd)
    - _Requirements: 4.5, 4.6, 4.8_

  - [x] 7.3 개별 마커 레이어 구현 (Glow, Ring, Core, Dot)
    - ScatterplotLayer로 Point Glow 생성 (cyan glow, radius: 20)
    - ScatterplotLayer로 Point Ring 생성 (cyan stroke, radius: 12)
    - ScatterplotLayer로 Point Core 생성 (cyan fill, radius: 8, pickable: true, onClick 핸들러)
    - ScatterplotLayer로 Point Dot 생성 (white fill, radius: 3)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.7_

  - [ ]* 7.4 Property test: 줌 레벨 기반 렌더링 모드
    - **Property 4: 줌 레벨 기반 렌더링 모드**
    - **Validates: Requirements 4.4, 4.5**
    - fast-check로 임의의 zoom level (0-22) 생성
    - zoom >= 14일 때 개별 마커 렌더링 확인
    - zoom < 14일 때 클러스터 마커 렌더링 확인

  - [ ]* 7.5 Property test: 클러스터 카운트 정확성
    - **Property 5: 클러스터 카운트 정확성**
    - **Validates: Requirement 4.6**
    - fast-check로 임의의 클러스터 생성
    - 표시된 point_count가 실제 포인트 개수와 일치하는지 검증

  - [ ]* 7.6 Property test: 클러스터 크기 계산
    - **Property 6: 클러스터 크기 계산**
    - **Validates: Requirement 4.8**
    - fast-check로 임의의 point count (2-1000) 생성
    - 계산된 크기가 공식 (10 + log2(count) * 3)과 일치하는지 검증

- [x] 8. TwinMap에 CCTV 레이어 통합
  - [x] 8.1 레이어 생성 및 추가
    - createCctvClusterLayers 함수 호출 (cctvClusters, onMarkerClick 콜백 전달)
    - DeckGL layers prop에 cctvLayers 추가 (bitLayers와 constructionLayers 사이)
    - _Requirements: 3.5_

  - [x] 8.2 마커 클릭 핸들러 구현
    - onMarkerClick 콜백에서 selectedCctv 상태 업데이트
    - isCctvPopupOpen을 true로 설정
    - _Requirements: 6.1_

  - [x] 8.3 Tooltip 핸들러 추가
    - onHover 핸들러에 cctv-point-core 레이어 처리 추가
    - Tooltip 내용: "📹 [CCTV name]\n📍 [lat], [lng]" (좌표는 소수점 4자리)
    - onHover 핸들러에 cctv-cluster-layer 레이어 처리 추가
    - Tooltip 내용: "📹 CCTV [count]개"
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 8.4 Property test: 마커 툴팁 포맷팅
    - **Property 7: 마커 툴팁 포맷팅**
    - **Validates: Requirement 5.2**
    - fast-check로 임의의 CCTVPoint 생성
    - Tooltip 내용이 올바른 형식인지 검증 (이모지, 이름, 좌표 포함)
    - 좌표가 소수점 4자리로 포맷되는지 검증

  - [ ]* 8.5 Property test: 클러스터 툴팁 포맷팅
    - **Property 8: 클러스터 툴팁 포맷팅**
    - **Validates: Requirement 5.4**
    - fast-check로 임의의 cluster point count 생성
    - Tooltip 내용이 "📹 CCTV [count]개" 형식인지 검증

- [x] 9. CCTV 팝업 컴포넌트 구현
  - [x] 9.1 CctvPopup 컴포넌트 생성
    - component/dt/popups/CctvPopup.tsx 파일 생성
    - Props 인터페이스 정의 (cctv: CCTVPoint, isOpen: boolean, onClose: () => void)
    - 사이버펑크 스타일 적용 (dark background, cyan border, backdrop blur)
    - _Requirements: 6.2, 6.8, 6.9_

  - [x] 9.2 팝업 헤더 및 닫기 버튼 구현
    - 헤더에 CCTV 이름 표시 (📹 아이콘 포함)
    - 닫기 버튼 (X) 구현 (top-right corner)
    - 닫기 버튼 클릭 시 onClose 콜백 호출
    - 키보드 접근성 추가 (Enter, Space 키 지원)
    - _Requirements: 6.2, 6.6, 6.7_

  - [x] 9.3 HLS Player 구현
    - video 엘리먼트 생성 (ref 사용)
    - hls.js 라이브러리 초기화 (enableWorker: true, lowLatencyMode: true)
    - HLS 스트림 로드 (cctv.url)
    - MANIFEST_PARSED 이벤트 처리 (자동 재생)
    - Safari native HLS 지원 처리 (canPlayType 확인)
    - _Requirements: 6.3, 6.4, 6.5_

  - [x] 9.4 HLS 에러 처리
    - ERROR 이벤트 리스너 추가
    - NETWORK_ERROR: "네트워크 오류가 발생했습니다" 표시
    - MEDIA_ERROR: "영상을 불러올 수 없습니다" 표시
    - 기타 에러: "알 수 없는 오류가 발생했습니다" 표시
    - _Requirements: 6.10, 9.4, 9.5_

  - [x] 9.5 로딩 상태 및 정리
    - isLoading 상태 추가 (로딩 중 메시지 표시)
    - useEffect cleanup에서 hls.destroy() 호출
    - _Requirements: 9.1_

  - [x] 9.6 TwinMap에 CctvPopup 통합
    - TwinMap에 CctvPopup 컴포넌트 추가
    - selectedCctv, isCctvPopupOpen 상태 전달
    - onClose 핸들러 구현 (isCctvPopupOpen을 false로 설정)
    - _Requirements: 6.1, 6.7_

  - [ ]* 9.7 Component test: CctvPopup 렌더링 및 상호작용
    - React Testing Library로 CctvPopup 렌더링
    - 헤더에 CCTV 이름이 표시되는지 확인
    - 닫기 버튼 클릭 시 onClose 호출 확인
    - 키보드로 닫기 버튼 작동 확인

- [x] 10. Checkpoint - CCTV 레이어 및 팝업 검증
  - 지도에 CCTV 마커가 표시되는지 확인
  - 줌 인/아웃 시 클러스터링이 올바르게 동작하는지 확인
  - 마커 hover 시 tooltip이 표시되는지 확인
  - 마커 클릭 시 팝업이 열리는지 확인
  - HLS 영상이 재생되는지 확인
  - 사용자에게 질문이 있으면 물어보기

- [x] 11. Dashboard Panel에 CCTV 통계 추가
  - [x] 11.1 useDashboardStats 훅 확장
    - component/dt/hooks/useDashboardStats.ts에 cctvData 파라미터 추가
    - DashboardStats 인터페이스에 totalCctv 필드 추가
    - totalCctv 계산 로직 추가 (cctvData.length)
    - _Requirements: 7.1_

  - [x] 11.2 DashboardPanel에 CCTV 통계 카드 추가
    - component/dt/panels/DashboardPanel.tsx에 CCTV 카드 추가
    - 카드 위치: "지연 프로젝트" 카드 다음
    - 아이콘: 📹, 레이블: "도로 CCTV", 색상: cyan (#38bdf8)
    - onClick 핸들러 추가 (onStatClick 콜백 호출)
    - hover 효과 추가 (background: rgba(56,189,248,0.08))
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 11.3 TwinMap에서 Dashboard 통합
    - useDashboardStats 훅에 cctvData 전달
    - DashboardPanel에 stats 전달
    - _Requirements: 7.1_

  - [ ]* 11.4 Property test: 대시보드 CCTV 카운트
    - **Property 9: 대시보드 CCTV 카운트**
    - **Validates: Requirement 7.1**
    - fast-check로 임의의 CCTV 데이터셋 생성
    - Dashboard에 표시된 카운트가 배열 길이와 일치하는지 검증

- [ ] 12. Integration tests 작성
  - [ ]* 12.1 ITS API 라우트 통합 테스트
    - MSW로 ITS API 모킹
    - 성공 응답 시나리오 테스트 (200 상태 코드, 정규화된 데이터 반환)
    - 에러 응답 시나리오 테스트 (500 상태 코드, 에러 메시지 반환)
    - 네트워크 에러 시나리오 테스트
    - API 키 누락 시나리오 테스트
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 12.2 TwinMap CCTV 통합 테스트
    - React Testing Library로 TwinMap 렌더링
    - CCTV 데이터 페칭 및 상태 업데이트 확인
    - CCTV 마커가 렌더링되는지 확인
    - CCTV 데이터 페칭 실패 시 graceful degradation 확인 (다른 레이어는 정상 렌더링)
    - _Requirements: 3.1, 3.2, 3.6, 9.2, 9.3_

- [ ] 13. 성능 최적화 검증
  - [ ] 13.1 메모이제이션 확인
    - cctvIndex가 useMemo로 메모이제이션되어 있는지 확인
    - cctvClusters가 useMemo로 메모이제이션되어 있는지 확인
    - 의존성 배열이 올바르게 설정되어 있는지 확인
    - _Requirements: 10.1, 10.2_

  - [ ] 13.2 데이터 페칭 최적화 확인
    - CCTV 데이터 페칭이 컴포넌트 마운트 시 한 번만 실행되는지 확인
    - useEffect 의존성 배열이 빈 배열인지 확인
    - _Requirements: 10.3_

  - [ ] 13.3 레이어 렌더링 확인
    - CCTV 레이어가 IconLayer 대신 ScatterplotLayer를 사용하는지 확인 (design 문서와 일치)
    - 레이어 z-index가 다른 포인트 레이어와 동일한지 확인
    - _Requirements: 10.4, 10.5_

- [ ] 14. 접근성 및 보안 검증
  - [ ] 14.1 접근성 확인
    - 팝업 닫기 버튼에 키보드 이벤트가 추가되어 있는지 확인
    - Dashboard CCTV 카드에 aria-label이 추가되어 있는지 확인
    - 색상 대비가 WCAG AA 기준을 충족하는지 확인
    - _Requirements: 6.7, 7.2_

  - [ ] 14.2 보안 확인
    - ITS_CCTV_KEY가 서버 측에서만 사용되는지 확인
    - 클라이언트 코드에 API 키가 노출되지 않는지 확인
    - API 응답 데이터가 검증되는지 확인
    - _Requirements: 8.3, 8.4_

- [ ] 15. Final checkpoint - 전체 기능 검증
  - 모든 테스트가 통과하는지 확인 (npm test)
  - 지도에서 CCTV 마커가 정상적으로 표시되는지 확인
  - 클러스터링이 줌 레벨에 따라 올바르게 동작하는지 확인
  - 마커 클릭 시 HLS 영상이 재생되는지 확인
  - Dashboard에 CCTV 통계가 표시되는지 확인
  - 에러 시나리오에서 graceful degradation이 동작하는지 확인
  - 성능 이슈가 없는지 확인 (프레임 드롭, 메모리 누수 등)
  - 사용자에게 최종 확인 및 피드백 요청

## Notes

- **Optional Tasks**: `*` 표시된 작업은 선택 사항이며, 빠른 MVP를 위해 건너뛸 수 있습니다.
- **Requirements Traceability**: 각 작업은 requirements.md의 특정 요구사항을 참조합니다.
- **Checkpoints**: 주요 단계마다 checkpoint를 두어 점진적 검증을 수행합니다.
- **Property Tests**: 9개의 correctness properties를 property-based testing으로 검증합니다.
- **Integration Tests**: ITS API 통합 및 TwinMap 통합을 integration testing으로 검증합니다.
- **Component Tests**: CctvPopup 컴포넌트를 React Testing Library로 검증합니다.
- **Cyberpunk Style**: 모든 UI 요소는 기존 디자인과 일관된 사이버펑크 스타일을 유지합니다.
- **Graceful Degradation**: CCTV 데이터 페칭 실패 시에도 다른 지도 기능은 정상 동작합니다.
