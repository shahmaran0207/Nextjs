# 설계 문서: 교통 상황 재생 기능

## 개요

교통 상황 재생 기능은 디지털 트윈 지도 애플리케이션에서 과거 특정 시점의 교통 데이터를 시각화하고, 시간 흐름에 따른 교통 패턴 변화를 재생하는 기능입니다. 사용자는 타임 슬라이더를 통해 원하는 시점으로 이동하거나, 플레이백 컨트롤러를 통해 자동 재생을 수행할 수 있습니다.

### 핵심 기능
- 과거 교통 데이터 조회 및 시각화
- 타임 슬라이더를 통한 시점 선택
- 플레이백 기능 (재생/일시정지/정지)
- 재생 속도 및 시간 간격 조정
- 데이터 가용성 시각화
- 성능 최적화 (캐싱 및 프리페칭)

## 아키텍처

### 시스템 구성도

```mermaid
graph TB
    subgraph "UI Layer"
        A[TrafficHistoryPanel]
        B[TimeSlider]
        C[PlaybackController]
        D[SpeedSelector]
    end
    
    subgraph "Hook Layer"
        E[useTrafficHistory]
        F[usePlayback]
        G[useHistoryCache]
    end
    
    subgraph "API Layer"
        H[/api/traffic/history]
        I[/api/traffic/availability]
    end
    
    subgraph "Data Layer"
        J[(link_speed_history)]
        K[Memory Cache]
    end
    
    A --> E
    B --> E
    C --> F
    F --> E
    E --> G
    E --> H
    E --> I
    H --> J
    I --> J
    G --> K
    
    style A fill:#e1f5ff
    style E fill:#fff4e1
    style H fill:#ffe1e1
    style J fill:#e1ffe1
```

### 데이터 흐름

1. **사용자 입력** → TimeSlider 또는 PlaybackController
2. **시점 선택** → useTrafficHistory Hook
3. **캐시 확인** → useHistoryCache Hook
4. **데이터 조회** → API Route → Database
5. **데이터 변환** → trafficMap 생성
6. **지도 업데이트** → PathLayer 색상 변경

### 레이어 구조

```
┌─────────────────────────────────────┐
│  UI Components                      │
│  - TrafficHistoryPanel              │
│  - TimeSlider                       │
│  - PlaybackController               │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Custom Hooks                       │
│  - useTrafficHistory                │
│  - usePlayback                      │
│  - useHistoryCache                  │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  API Routes                         │
│  - GET /api/traffic/history         │
│  - GET /api/traffic/availability    │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Database (PostgreSQL)              │
│  - link_speed_history               │
└─────────────────────────────────────┘
```

## 컴포넌트 및 인터페이스

### 1. TrafficHistoryPanel 컴포넌트

교통 상황 재생 기능의 메인 UI 패널입니다.

```typescript
interface TrafficHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onTrafficDataChange: (trafficMap: Map<string, number>) => void;
}

interface TrafficHistoryState {
  currentTime: Date;
  startTime: Date;
  endTime: Date;
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  timeInterval: TimeInterval;
  isHistoryMode: boolean;
}

type PlaybackSpeed = 1 | 2 | 4 | 8;
type TimeInterval = 1 | 5 | 10 | 30 | 60; // 분 단위
```

**주요 기능:**
- 타임 슬라이더 표시
- 플레이백 컨트롤 버튼 (재생/일시정지/정지)
- 재생 속도 선택
- 시간 간격 선택
- 현재 시간으로 복귀 버튼
- 시작/종료 시간 입력 필드

### 2. TimeSlider 컴포넌트

시간 범위를 시각화하고 사용자가 특정 시점을 선택할 수 있는 슬라이더입니다.

```typescript
interface TimeSliderProps {
  startTime: Date;
  endTime: Date;
  currentTime: Date;
  availability: TimeAvailability[];
  onChange: (time: Date) => void;
  onRangeChange: (start: Date, end: Date) => void;
  disabled: boolean;
}

interface TimeAvailability {
  start: Date;
  end: Date;
  hasData: boolean;
}
```

**주요 기능:**
- 드래그 가능한 시간 슬라이더
- 데이터 가용성 시각화 (진한 색상/연한 색상)
- 현재 선택된 시점 표시 (YYYY-MM-DD HH:mm)
- 시작/종료 시간 범위 조정

### 3. PlaybackController 컴포넌트

재생 제어 버튼을 제공하는 컴포넌트입니다.

```typescript
interface PlaybackControllerProps {
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
}
```

**주요 기능:**
- 재생 버튼 (▶️)
- 일시정지 버튼 (⏸️)
- 정지 버튼 (⏹️)
- 재생 속도 선택 드롭다운 (1x, 2x, 4x, 8x)

### 4. useTrafficHistory Hook

교통 이력 데이터를 관리하는 커스텀 Hook입니다.

```typescript
interface UseTrafficHistoryOptions {
  initialStartTime?: Date;
  initialEndTime?: Date;
  onError?: (error: Error) => void;
}

interface UseTrafficHistoryReturn {
  currentTime: Date;
  startTime: Date;
  endTime: Date;
  trafficData: Map<string, number>;
  availability: TimeAvailability[];
  isLoading: boolean;
  error: Error | null;
  
  setCurrentTime: (time: Date) => void;
  setTimeRange: (start: Date, end: Date) => void;
  fetchTrafficData: (time: Date) => Promise<void>;
  returnToNow: () => void;
}
```

**주요 기능:**
- 특정 시점의 교통 데이터 조회
- 시간 범위 관리
- 데이터 가용성 조회
- 에러 처리

### 5. usePlayback Hook

플레이백 기능을 관리하는 커스텀 Hook입니다.

```typescript
interface UsePlaybackOptions {
  startTime: Date;
  endTime: Date;
  currentTime: Date;
  playbackSpeed: PlaybackSpeed;
  timeInterval: TimeInterval;
  onTimeChange: (time: Date) => void;
  onComplete: () => void;
}

interface UsePlaybackReturn {
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  setInterval: (interval: TimeInterval) => void;
}
```

**주요 기능:**
- 자동 재생 제어
- 재생 속도 조정
- 시간 간격 조정
- 종료 시점 도달 시 자동 정지

### 6. useHistoryCache Hook

교통 데이터 캐싱을 관리하는 커스텀 Hook입니다.

```typescript
interface CacheEntry {
  time: Date;
  data: Map<string, number>;
  timestamp: number;
}

interface UseHistoryCacheReturn {
  get: (time: Date) => Map<string, number> | null;
  set: (time: Date, data: Map<string, number>) => void;
  prefetch: (times: Date[]) => Promise<void>;
  clear: () => void;
  size: number;
}
```

**주요 기능:**
- LRU 캐시 구현 (최대 10개 항목)
- 메모리 사용량 모니터링 (100MB 임계값)
- 다음 시점 프리페칭
- 캐시 무효화

## 데이터 모델

### Database Schema

```sql
-- 이미 존재하는 테이블
CREATE TABLE link_speed_history (
  id SERIAL PRIMARY KEY,
  link_id VARCHAR(20) NOT NULL,
  speed FLOAT NOT NULL,
  recorded_at TIMESTAMP(6) DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_link_speed_history_link_time 
  ON link_speed_history(link_id, recorded_at);
```

### API 응답 형식

#### GET /api/traffic/history

**Query Parameters:**
- `time`: ISO 8601 형식의 시점 (예: 2024-01-15T14:30:00Z)

**Response:**
```typescript
interface TrafficHistoryResponse {
  time: string; // ISO 8601
  data: Array<{
    linkId: string;
    speed: number;
  }>;
  count: number;
}
```

#### GET /api/traffic/availability

**Query Parameters:**
- `startTime`: ISO 8601 형식의 시작 시간
- `endTime`: ISO 8601 형식의 종료 시간
- `granularity`: 시간 단위 (hour | day)

**Response:**
```typescript
interface AvailabilityResponse {
  ranges: Array<{
    start: string; // ISO 8601
    end: string; // ISO 8601
    hasData: boolean;
    recordCount: number;
  }>;
}
```

### 클라이언트 데이터 구조

```typescript
// 교통 데이터 맵 (링크 ID → 속도)
type TrafficMap = Map<string, number>;

// 캐시 저장소
interface CacheStore {
  entries: Map<string, CacheEntry>; // ISO 시간 문자열 → 캐시 항목
  accessOrder: string[]; // LRU 순서
  totalSize: number; // 바이트 단위
}

// 플레이백 상태
interface PlaybackState {
  intervalId: NodeJS.Timeout | null;
  nextFetchTime: Date | null;
  isPrefetching: boolean;
}
```

## 에러 처리

### 에러 타입

```typescript
enum TrafficHistoryErrorCode {
  DATABASE_ERROR = 'DATABASE_ERROR',
  NO_DATA_AVAILABLE = 'NO_DATA_AVAILABLE',
  INVALID_TIME_RANGE = 'INVALID_TIME_RANGE',
  CACHE_OVERFLOW = 'CACHE_OVERFLOW',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

interface TrafficHistoryError extends Error {
  code: TrafficHistoryErrorCode;
  details?: any;
}
```

### 에러 처리 전략

1. **데이터베이스 조회 실패**
   - 에러 메시지 표시: "데이터를 불러오는 중 오류가 발생했습니다"
   - 이전 상태 유지
   - 재시도 버튼 제공

2. **데이터 없음**
   - 사용자 친화적 메시지: "해당 시점의 데이터가 없습니다"
   - 가장 가까운 데이터 시점 제안

3. **잘못된 시간 범위**
   - 입력 검증 메시지: "시작 시간은 종료 시간보다 이전이어야 합니다"
   - 입력 필드 하이라이트

4. **캐시 오버플로우**
   - 자동으로 가장 오래된 항목 제거
   - 로그 기록 (사용자에게 표시 안 함)

5. **네트워크 오류**
   - 재시도 로직 (최대 3회, 지수 백오프)
   - 실패 시 에러 메시지 표시

### Graceful Degradation

- API 실패 시 캐시된 데이터 사용
- 부분 데이터 로드 시에도 사용 가능한 데이터 표시
- 재생 중 오류 발생 시 일시정지 상태로 전환

## 테스트 전략

이 기능은 주로 UI 컴포넌트, 데이터 조회, 캐싱 로직으로 구성되어 있어 **Property-Based Testing이 적합하지 않습니다**. 대신 다음과 같은 테스트 전략을 사용합니다:

### 1. 단위 테스트 (Unit Tests)

**useTrafficHistory Hook 테스트:**
- 특정 시점 데이터 조회 성공
- 데이터 없음 처리
- 시간 범위 검증
- 에러 처리

**usePlayback Hook 테스트:**
- 재생/일시정지/정지 동작
- 재생 속도 변경
- 시간 간격 변경
- 종료 시점 도달 시 자동 정지

**useHistoryCache Hook 테스트:**
- 캐시 저장 및 조회
- LRU 정책 동작
- 메모리 임계값 초과 시 항목 제거
- 프리페칭 동작

**유틸리티 함수 테스트:**
- 시간 형식 변환
- 데이터 가용성 계산
- trafficMap 생성

### 2. 통합 테스트 (Integration Tests)

**API 엔드포인트 테스트:**
- `/api/traffic/history` 정상 응답
- `/api/traffic/availability` 정상 응답
- 데이터베이스 연결 및 쿼리 성능
- 에러 응답 처리

**컴포넌트 통합 테스트:**
- TrafficHistoryPanel과 Hook 간 상호작용
- TimeSlider 드래그 시 데이터 조회
- PlaybackController 버튼 클릭 시 재생 동작
- 지도 업데이트 (trafficMap 변경 시 PathLayer 색상 변경)

### 3. E2E 테스트 (End-to-End Tests)

**사용자 시나리오 테스트:**
- 타임 슬라이더로 과거 시점 선택 → 지도 색상 변경 확인
- 재생 버튼 클릭 → 자동 재생 확인
- 재생 속도 변경 → 재생 속도 변화 확인
- 현재 시간으로 복귀 → 실시간 데이터 표시 확인

### 4. 성능 테스트

**목표:**
- 데이터 조회 시간: 2초 이내
- 데이터 가용성 조회: 3초 이내
- 지도 렌더링 프레임률: 30fps 이상
- 캐시 히트율: 80% 이상 (재생 중)

**테스트 방법:**
- 대량 데이터 (10,000+ 레코드) 조회 성능 측정
- 연속 재생 시 프레임률 모니터링
- 캐시 효율성 측정

### 5. 접근성 테스트

- 키보드 네비게이션 (Tab, Enter, Space)
- 스크린 리더 호환성 (ARIA 레이블)
- 색상 대비 (WCAG AA 기준)

### 테스트 도구

- **단위/통합 테스트**: Jest, React Testing Library
- **E2E 테스트**: Playwright 또는 Cypress
- **성능 테스트**: Chrome DevTools Performance, Lighthouse
- **접근성 테스트**: axe-core, WAVE

## 성능 최적화

### 1. 데이터 캐싱 전략

**메모리 캐시 (클라이언트):**
- LRU 캐시 구현 (최대 10개 항목)
- 각 캐시 항목 크기 추정: ~100KB (1,000개 링크 × 100바이트)
- 총 메모리 사용량: ~1MB (10개 항목)
- 메모리 임계값: 100MB (안전 마진)

**프리페칭:**
- 재생 중 다음 시점 데이터 미리 조회
- 백그라운드에서 비동기 로드
- 사용자 경험 향상 (끊김 없는 재생)

### 2. 데이터베이스 최적화

**인덱스 활용:**
```sql
-- 이미 존재하는 복합 인덱스
CREATE INDEX idx_link_speed_history_link_time 
  ON link_speed_history(link_id, recorded_at);
```

**쿼리 최적화:**
```sql
-- 특정 시점의 데이터 조회 (±5분 범위)
SELECT link_id, AVG(speed) as speed
FROM link_speed_history
WHERE recorded_at BETWEEN $1 - INTERVAL '5 minutes' 
                      AND $1 + INTERVAL '5 minutes'
GROUP BY link_id;

-- 데이터 가용성 조회 (시간별 집계)
SELECT 
  DATE_TRUNC('hour', recorded_at) as time_bucket,
  COUNT(DISTINCT link_id) as record_count
FROM link_speed_history
WHERE recorded_at BETWEEN $1 AND $2
GROUP BY time_bucket
ORDER BY time_bucket;
```

### 3. 렌더링 최적화

**React 최적화:**
- `useMemo`로 trafficMap 메모이제이션
- `useCallback`로 이벤트 핸들러 메모이제이션
- `React.memo`로 컴포넌트 리렌더링 방지

**DeckGL 최적화:**
- `updateTriggers`로 필요한 경우에만 레이어 업데이트
- 색상 전환 애니메이션 (0.3초 transition)
- 불필요한 레이어 업데이트 방지

### 4. 네트워크 최적화

**요청 최소화:**
- 배치 요청 (여러 시점 데이터 한 번에 조회)
- 압축 (gzip)
- HTTP/2 멀티플렉싱

**응답 크기 최적화:**
- 필요한 필드만 반환 (link_id, speed)
- 페이지네이션 (필요 시)

## 구현 우선순위

### Phase 1: 기본 기능 (MVP)
1. 데이터베이스 쿼리 API 구현 (`/api/traffic/history`)
2. `useTrafficHistory` Hook 구현
3. `TrafficHistoryPanel` 기본 UI
4. `TimeSlider` 컴포넌트
5. 지도 업데이트 연동 (trafficMap → PathLayer)

### Phase 2: 플레이백 기능
1. `usePlayback` Hook 구현
2. `PlaybackController` 컴포넌트
3. 자동 재생 로직
4. 재생 속도 조정

### Phase 3: 최적화
1. `useHistoryCache` Hook 구현
2. 프리페칭 로직
3. 데이터 가용성 API (`/api/traffic/availability`)
4. TimeSlider 데이터 가용성 시각화

### Phase 4: 사용자 경험 개선
1. 시간 간격 조정 기능
2. 현재 시간으로 복귀 버튼
3. 에러 처리 및 사용자 피드백
4. 로딩 상태 표시

### Phase 5: 테스트 및 최적화
1. 단위 테스트 작성
2. 통합 테스트 작성
3. 성능 테스트 및 최적화
4. 접근성 개선

## 기술 스택

- **Frontend**: React, TypeScript, Next.js
- **지도 라이브러리**: DeckGL, MapLibre GL
- **상태 관리**: React Hooks (useState, useEffect, useCallback, useMemo)
- **API**: Next.js API Routes
- **데이터베이스**: PostgreSQL (Prisma ORM)
- **테스트**: Jest, React Testing Library, Playwright
- **스타일링**: CSS Modules

## 보안 고려사항

1. **SQL Injection 방지**: Prisma ORM의 파라미터화된 쿼리 사용
2. **입력 검증**: 시간 범위 검증, 날짜 형식 검증
3. **Rate Limiting**: API 엔드포인트에 요청 제한 적용
4. **에러 정보 노출 방지**: 클라이언트에 민감한 에러 정보 노출 안 함

## 향후 개선 사항

1. **실시간 업데이트**: WebSocket을 통한 실시간 데이터 스트리밍
2. **데이터 내보내기**: CSV/JSON 형식으로 교통 데이터 다운로드
3. **비교 모드**: 두 시점의 교통 상황 비교
4. **통계 분석**: 시간대별 평균 속도, 혼잡도 통계
5. **알림 기능**: 특정 링크의 속도가 임계값 이하로 떨어질 때 알림
6. **모바일 최적화**: 터치 제스처 지원, 반응형 UI

## 참고 자료

- [DeckGL PathLayer Documentation](https://deck.gl/docs/api-reference/layers/path-layer)
- [React Hooks Best Practices](https://react.dev/reference/react)
- [PostgreSQL Time-Series Data](https://www.postgresql.org/docs/current/functions-datetime.html)
- [Web Performance Optimization](https://web.dev/performance/)
