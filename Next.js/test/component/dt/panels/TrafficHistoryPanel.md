# TrafficHistoryPanel 컴포넌트

## 개요

`TrafficHistoryPanel`은 교통 상황 재생 기능의 메인 UI 패널입니다. 타임 슬라이더와 플레이백 컨트롤러를 통합하여 과거 교통 데이터를 조회하고 시각화합니다.

## 주요 기능

### 1. Hook 통합
- **useTrafficHistory**: 교통 이력 데이터 관리
- **usePlayback**: 자동 재생 제어
- **useHistoryCache**: 데이터 캐싱 및 프리페칭

### 2. UI 컴포넌트
- **TimeSlider**: 시간 범위 선택 및 시각화
- **PlaybackController**: 재생/일시정지/정지 제어
- **현재 시간으로 버튼**: 실시간 모드로 복귀

### 3. 상태 관리
- 로딩 상태 표시 (스피너)
- 에러 메시지 표시 (인라인 알림)
- 캐시 정보 표시 (디버깅용)

## Props

```typescript
interface TrafficHistoryPanelProps {
  isOpen: boolean;                                    // 패널 열림/닫힘 상태
  onClose: () => void;                                // 패널 닫기 핸들러
  onTrafficDataChange: (trafficMap: Map<string, number>) => void;  // 교통 데이터 변경 콜백
}
```

## 사용 예시

```tsx
import TrafficHistoryPanel from "@/component/dt/panels/TrafficHistoryPanel";

function TwinMap() {
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [trafficMap, setTrafficMap] = useState<Map<string, number>>(new Map());

  return (
    <>
      <button onClick={() => setIsHistoryPanelOpen(true)}>
        교통 이력 열기
      </button>

      <TrafficHistoryPanel
        isOpen={isHistoryPanelOpen}
        onClose={() => setIsHistoryPanelOpen(false)}
        onTrafficDataChange={setTrafficMap}
      />
    </>
  );
}
```

## 데이터 흐름

1. **사용자 입력** → TimeSlider 또는 PlaybackController
2. **시점 선택** → `fetchWithCache()` 호출
3. **캐시 확인** → useHistoryCache.get()
4. **캐시 히트**: 즉시 데이터 반환
5. **캐시 미스**: API 조회 → useTrafficHistory.fetchTrafficData()
6. **데이터 변환** → Map<string, number> 형식
7. **부모 컴포넌트 전달** → onTrafficDataChange()
8. **캐시 저장** → useHistoryCache.set()

## 캐싱 전략

### LRU 캐시
- 최대 10개 항목 저장
- 메모리 임계값: 100MB
- 가장 오래된 항목 자동 제거

### 프리페칭
- 재생 중 다음 3개 시점 미리 조회
- 백그라운드 비동기 로드
- 끊김 없는 재생 경험 제공

## 에러 처리

### 데이터 조회 실패
```
⚠️ 오류 발생
데이터를 불러오는 중 오류가 발생했습니다
```

### 데이터 없음
```
⚠️ 오류 발생
해당 시점의 데이터가 없습니다
```

### 시간 범위 검증 실패
```
⚠️ 시작 시간은 종료 시간보다 이전이어야 합니다
```

## 접근성

- **ARIA 레이블**: 모든 버튼에 aria-label 적용
- **키보드 네비게이션**: Tab, Enter, Space 지원
- **색상 대비**: WCAG AA 기준 준수
- **스크린 리더**: role="alert"로 에러 메시지 전달

## 성능 최적화

### React 최적화
- `useCallback`: 이벤트 핸들러 메모이제이션
- `useMemo`: 계산 비용이 높은 값 메모이제이션
- `useEffect`: 의존성 배열 최적화

### 렌더링 최적화
- 조건부 렌더링: isOpen이 false일 때 null 반환
- 불필요한 리렌더링 방지

## 요구사항 매핑

- **1.2**: 교통 데이터 조회 및 매핑
- **1.3**: 데이터 없음 처리
- **1.5**: 에러 처리 및 메시지 표시
- **6.1**: "현재 시간으로" 버튼 제공
- **6.2**: 타임 슬라이더를 현재 시간으로 설정
- **6.3**: 실시간 교통 데이터 표시
- **6.4**: 재생 중이면 재생 정지

## 테스트

### 단위 테스트
```bash
npm test -- TrafficHistoryPanel.test.tsx
```

### 테스트 커버리지
- ✅ 패널 열림/닫힘 상태
- ✅ 닫기 버튼 동작
- ✅ 현재 시간으로 버튼 렌더링
- ✅ TimeSlider 렌더링
- ✅ PlaybackController 렌더링

## 스타일링

### 디자인 시스템
- **배경**: 반투명 다크 모드 (rgba(10, 14, 26, 0.95))
- **테두리**: 시안 색상 (rgba(56, 189, 248, 0.3))
- **그림자**: 부드러운 박스 섀도우
- **블러**: 백드롭 필터 (20px)

### 색상 팔레트
- **주요 색상**: #38bdf8 (시안)
- **성공 색상**: #10b981 (초록)
- **에러 색상**: #ef4444 (빨강)
- **텍스트 색상**: #e8eaf0 (밝은 회색)
- **보조 텍스트**: #8b90a7 (어두운 회색)

## 향후 개선 사항

1. **애니메이션**: 패널 열림/닫힘 트랜지션
2. **드래그 앤 드롭**: 패널 위치 조정
3. **크기 조절**: 패널 크기 변경 가능
4. **키보드 단축키**: 재생/일시정지 단축키
5. **북마크**: 특정 시점 저장 기능
