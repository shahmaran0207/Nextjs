# 구현 계획: 교통 상황 재생 기능

## 개요

이 구현 계획은 디지털 트윈 지도 애플리케이션에 과거 교통 데이터를 조회하고 시각화하는 기능을 추가합니다. 사용자는 타임 슬라이더를 통해 특정 시점을 선택하거나, 플레이백 컨트롤러를 통해 시간 흐름에 따른 교통 상황 변화를 자동으로 관찰할 수 있습니다.

## 작업 목록

- [ ] 1. API 엔드포인트 구현
  - [x] 1.1 교통 이력 조회 API 생성
    - `/app/api/traffic/history/route.ts` 파일 생성
    - 특정 시점(±5분 범위)의 링크별 평균 속도 조회 쿼리 구현
    - ISO 8601 형식의 시간 파라미터 검증
    - 응답 형식: `{ time: string, data: Array<{ linkId: string, speed: number }>, count: number }`
    - _요구사항: 1.1, 1.4_
  
  - [x] 1.2 데이터 가용성 조회 API 생성
    - `/app/api/traffic/availability/route.ts` 파일 생성
    - 시간 범위 내 데이터 존재 여부를 시간별/일별로 집계
    - 쿼리 파라미터: startTime, endTime, granularity (hour | day)
    - 응답 형식: `{ ranges: Array<{ start: string, end: string, hasData: boolean, recordCount: number }> }`
    - _요구사항: 8.1, 8.4, 8.5_
  
  - [ ]* 1.3 API 엔드포인트 단위 테스트 작성
    - 정상 응답 테스트
    - 데이터 없음 처리 테스트
    - 잘못된 시간 형식 에러 처리 테스트
    - 데이터베이스 오류 처리 테스트
    - _요구사항: 1.3, 1.5_

- [x] 2. Checkpoint - API 테스트 확인
  - 모든 API 엔드포인트가 정상 동작하는지 확인하고, 문제가 있으면 사용자에게 질문하세요.

- [ ] 3. 커스텀 Hook 구현
  - [x] 3.1 useTrafficHistory Hook 구현
    - `/app/hook/useTrafficHistory.ts` 파일 생성
    - 상태 관리: currentTime, startTime, endTime, trafficData, availability, isLoading, error
    - fetchTrafficData 함수: API 호출 및 Map<string, number> 형식으로 변환
    - setTimeRange 함수: 시간 범위 검증 및 업데이트
    - returnToNow 함수: 현재 시간으로 복귀
    - _요구사항: 1.1, 1.2, 1.3, 1.5, 6.2, 6.3_
  
  - [x] 3.2 useHistoryCache Hook 구현
    - `/app/hook/useHistoryCache.ts` 파일 생성
    - LRU 캐시 구현 (최대 10개 항목)
    - get/set 함수: 캐시 조회 및 저장
    - prefetch 함수: 다음 시점 데이터 미리 조회
    - clear 함수: 캐시 초기화
    - 메모리 사용량 모니터링 (100MB 임계값)
    - _요구사항: 7.1, 7.2, 7.3, 7.4_
  
  - [x] 3.3 usePlayback Hook 구현
    - `/app/hook/usePlayback.ts` 파일 생성
    - 상태 관리: isPlaying, intervalId
    - play 함수: setInterval로 자동 재생 시작
    - pause 함수: 재생 일시정지
    - stop 함수: 재생 정지 및 시작 시간으로 복귀
    - setSpeed 함수: 재생 속도 변경 (1x, 2x, 4x, 8x)
    - setInterval 함수: 시간 간격 변경 (1분, 5분, 10분, 30분, 1시간)
    - 종료 시점 도달 시 자동 정지 로직
    - _요구사항: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 3.4 Hook 단위 테스트 작성
    - useTrafficHistory: 데이터 조회, 시간 범위 검증, 에러 처리 테스트
    - useHistoryCache: 캐시 저장/조회, LRU 정책, 메모리 임계값 테스트
    - usePlayback: 재생/일시정지/정지, 속도 변경, 자동 정지 테스트
    - _요구사항: 1.5, 3.5, 7.4_

- [x] 4. Checkpoint - Hook 테스트 확인
  - 모든 Hook이 정상 동작하는지 확인하고, 문제가 있으면 사용자에게 질문하세요.

- [ ] 5. UI 컴포넌트 구현
  - [x] 5.1 TimeSlider 컴포넌트 구현
    - `/component/dt/panels/TimeSlider.tsx` 파일 생성
    - 드래그 가능한 슬라이더 UI (HTML5 range input 또는 커스텀 구현)
    - 현재 시점 표시 (YYYY-MM-DD HH:mm 형식)
    - 시작/종료 시간 입력 필드 (datetime-local input)
    - 데이터 가용성 시각화 (진한 색상/연한 색상 배경)
    - onChange 이벤트: 슬라이더 드래그 완료 시 시점 변경
    - onRangeChange 이벤트: 시작/종료 시간 변경
    - 시간 범위 검증 (시작 < 종료)
    - _요구사항: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 8.1, 8.2, 8.3, 8.4_
  
  - [x] 5.2 PlaybackController 컴포넌트 구현
    - `/component/dt/panels/PlaybackController.tsx` 파일 생성
    - 재생 버튼 (▶️), 일시정지 버튼 (⏸️), 정지 버튼 (⏹️)
    - 재생 속도 선택 드롭다운 (1x, 2x, 4x, 8x)
    - 시간 간격 선택 드롭다운 (1분, 5분, 10분, 30분, 1시간)
    - 버튼 클릭 이벤트 핸들러 (onPlay, onPause, onStop, onSpeedChange, onIntervalChange)
    - _요구사항: 3.1, 3.2, 3.3, 3.6, 3.7, 5.1, 5.2, 5.3, 5.4_
  
  - [x] 5.3 TrafficHistoryPanel 컴포넌트 구현
    - `/component/dt/panels/TrafficHistoryPanel.tsx` 파일 생성
    - TimeSlider와 PlaybackController 통합
    - useTrafficHistory, usePlayback, useHistoryCache Hook 연동
    - "현재 시간으로" 버튼 추가
    - 로딩 상태 표시 (스피너 또는 스켈레톤)
    - 에러 메시지 표시 (토스트 또는 인라인 메시지)
    - onTrafficDataChange 콜백: 부모 컴포넌트(TwinMap)에 trafficMap 전달
    - _요구사항: 1.2, 1.3, 1.5, 6.1, 6.2, 6.3, 6.4_
  
  - [ ]* 5.4 컴포넌트 통합 테스트 작성
    - TimeSlider 드래그 시 데이터 조회 테스트
    - PlaybackController 버튼 클릭 시 재생 동작 테스트
    - TrafficHistoryPanel과 Hook 간 상호작용 테스트
    - 에러 처리 및 사용자 피드백 테스트
    - _요구사항: 2.3, 3.2, 3.3, 6.2_

- [~] 6. Checkpoint - UI 컴포넌트 테스트 확인
  - 모든 UI 컴포넌트가 정상 동작하는지 확인하고, 문제가 있으면 사용자에게 질문하세요.

- [x] 7. TwinMap 통합 및 지도 업데이트
  - [x] 7.1 TwinMap에 TrafficHistoryPanel 추가
    - `component/TwinMap.tsx` 파일 수정
    - TrafficHistoryPanel 컴포넌트 import 및 렌더링
    - 패널 토글 버튼 추가 (우측 하단, 로드뷰 버튼 옆)
    - isHistoryMode 상태 추가 (교통 이력 모드 활성화 여부)
    - _요구사항: 1.1, 6.1_
  
  - [x] 7.2 교통 데이터 소스 전환 로직 구현
    - isHistoryMode가 true일 때: TrafficHistoryPanel에서 전달받은 trafficMap 사용
    - isHistoryMode가 false일 때: 실시간 trafficData 사용
    - trafficMap 상태 관리 (useState)
    - onTrafficDataChange 핸들러: TrafficHistoryPanel에서 전달받은 데이터로 trafficMap 업데이트
    - _요구사항: 4.1, 6.2, 6.3_
  
  - [x] 7.3 PathLayer 색상 업데이트 로직 수정
    - createPathLayer 함수에 transition 효과 추가 (0.3초)
    - 속도별 색상 매핑 유지: 40km/h 이상 (초록), 20-40km/h (노랑), 20km/h 미만 (빨강), 데이터 없음 (회색)
    - updateTriggers 설정: trafficMap 변경 시에만 레이어 업데이트
    - _요구사항: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  
  - [ ]* 7.4 통합 테스트 작성
    - 교통 이력 모드 활성화 시 지도 색상 변경 테스트
    - 실시간 모드 복귀 시 지도 색상 변경 테스트
    - 재생 중 지도 업데이트 테스트
    - _요구사항: 4.1, 6.2, 6.3_

- [x] 8. Checkpoint - 통합 테스트 확인
  - 교통 이력 기능이 지도와 정상적으로 통합되었는지 확인하고, 문제가 있으면 사용자에게 질문하세요.

- [x] 9. 성능 최적화 및 마무리
  - [x] 9.1 프리페칭 로직 구현
    - usePlayback Hook에서 다음 시점 데이터 미리 조회
    - useHistoryCache의 prefetch 함수 활용
    - 백그라운드 비동기 로드 (사용자 경험 방해 안 함)
    - _요구사항: 7.1_
  
  - [x] 9.2 렌더링 최적화
    - React.memo로 TimeSlider, PlaybackController 컴포넌트 메모이제이션
    - useMemo로 trafficMap 메모이제이션
    - useCallback으로 이벤트 핸들러 메모이제이션
    - _요구사항: 7.5_
  
  - [x] 9.3 에러 처리 개선
    - 데이터베이스 조회 실패 시 재시도 로직 (최대 3회, 지수 백오프)
    - 사용자 친화적 에러 메시지 추가
    - Graceful degradation: 캐시된 데이터 사용
    - _요구사항: 1.3, 1.5_
  
  - [x] 9.4 접근성 개선
    - ARIA 레이블 추가 (버튼, 슬라이더)
    - 키보드 네비게이션 지원 (Tab, Enter, Space, Arrow keys)
    - 색상 대비 검증 (WCAG AA 기준)
    - _요구사항: 2.2, 3.1_
  
  - [ ]* 9.5 성능 테스트 작성
    - 데이터 조회 시간 측정 (목표: 2초 이내)
    - 데이터 가용성 조회 시간 측정 (목표: 3초 이내)
    - 캐시 히트율 측정 (목표: 80% 이상)
    - 지도 렌더링 프레임률 측정 (목표: 30fps 이상)
    - _요구사항: 1.4, 7.5, 8.5_

- [x] 10. 최종 Checkpoint - 전체 기능 검증
  - 모든 테스트가 통과하는지 확인하고, 사용자에게 최종 검토를 요청하세요.

## 참고 사항

- `*` 표시가 있는 작업은 선택 사항이며, 빠른 MVP를 위해 건너뛸 수 있습니다.
- 각 작업은 요구사항 문서의 특정 인수 기준을 참조합니다.
- Checkpoint 작업에서는 구현된 기능을 검증하고 사용자 피드백을 받습니다.
- 설계 문서에 Correctness Properties가 없으므로 Property-Based Testing은 포함하지 않습니다.
- 단위 테스트와 통합 테스트는 Jest와 React Testing Library를 사용합니다.
