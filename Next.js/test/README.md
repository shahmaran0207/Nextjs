# Next.js 이커머스 & 디지털 트윈 관제 플랫폼 완벽 백서 (Wiki)

이 문서는 프로젝트에 새로 투입된 개발자나 관리자가 **단 하나의 문서만 읽고도 전체 프로젝트의 비즈니스 로직, 사용자 경험(UX) 흐름, 폴더 구조, API 명세, 코드 작성 철학을 완벽하게 파악할 수 있도록** 작성된 궁극의 가이드라인입니다.

---

## 1. 🚀 프로젝트 개요 (Overview)

본 프로젝트는 평범한 온라인 쇼핑몰(이커머스)에 머물지 않고, **3D 공간 정보 시스템(Digital Twin)과 메타버스 게이미피케이션(Gamification) 요소를 결합**한 차세대 웹 어플리케이션입니다.

* **쇼핑의 물리적 한계 극복**: 상품 구매 후 내 배송 트럭이 지도 위에서 움직이는 것을 관제할 수 있습니다.
* **게이미피케이션 보상**: 트럭이 이동하는 과정에서 지도 상에 떨어진 쿠폰 박스를 주워, 실제 다음 상품 결제 시 현금처럼 사용할 수 있는 파이프라인을 구축했습니다.
* **실시간 도시 관제**: 일반 유저는 물론 관리자도 부산시 전체의 교통, 공사, 주차장, CCTV 라이브 상황을 실시간으로 통제하고 과거 시간대의 교통 체증을 타임랩스로 분석할 수 있습니다.

---

## 2. 🛠️ 기술 스택 (Tech Stack)

* **Frontend**: Next.js 14+ (App Router), React 18+, Vanilla CSS (CSS Modules 병행)
* **Backend**: Next.js API Routes, Prisma ORM
* **Database**: PostgreSQL / MySQL
* **GIS & 3D Mapping**: Deck.gl, MapLibre GL JS, MapTiler, Supercluster
* **Payment**: PortOne (Iamport) V1/V2
* **Push Notification**: Web Notification API, Firebase Cloud Messaging (FCM)

---

## 3. 📁 디렉토리 구조 (Directory Structure)

거대한 두 도메인(쇼핑, 디지털 트윈)의 코드가 섞이지 않도록 철저히 분리했습니다.

```text
📦 /
┣ 📂 app/                      # Next.js App Router (View & API 엔드포인트)
┃ ┣ 📂 (auth) / login / signup # 사용자 인증 및 회원가입 페이지
┃ ┣ 📂 Shopping/               # 쇼핑몰 상품 카탈로그 및 상세 정보 (다크 테마 적용)
┃ ┣ 📂 cart/                   # 장바구니 페이지
┃ ┃ ┗ 📂 shared/[roomId]       # [실시간 공유 장바구니] URL 공유 시 같은 방 사람들과 동기화
┃ ┣ 📂 checkout/               # [결제 준비] 총 결제 금액 계산 및 맵 획득 쿠폰 적용 화면
┃ ┣ 📂 payment/                # [결제 실행] 포트원(Iamport) PG 모달 호출 및 검증 처리
┃ ┣ 📂 FCM/                    # Firebase Cloud Messaging 연동 및 테스트
┃ ┣ 📂 dt/                     # 디지털 트윈 (TwinMap) 3D 대시보드 메인 화면
┃ ┗ 📂 api/                    # 백엔드 API (Prisma / Next.js API Routes)
┃   ┣ 📂 GIS/Busan/            # 교통(Traffic), CCTV, 주차장(Parking), 공사(Construction) 등 공공데이터 연동
┃   ┣ 📂 coupons/              # DB 기반 쿠폰 발급/사용 로직
┃   ┗ 📂 notifications/        # 푸시 알림 이력 조회(GET) 및 알림 생성(POST) API
┣ 📂 component/                # React UI 컴포넌트 모음
┃ ┣ 📂 Shopping/               # 쇼핑몰 전용 UI 컴포넌트 (ProductRow 등)
┃ ┣ 📂 dt/                     # 디지털 트윈 전용 비즈니스 로직 및 컴포넌트
┃ ┃ ┣ 📂 hooks/                # 💡 핵심 로직 훅 (맵 상태, 마커 클러스터링, 시뮬레이션 분리)
┃ ┃ ┣ 📂 layers/               # 💡 Deck.gl 커스텀 레이어 팩토리 (Base, Cluster, Heatmap 분리)
┃ ┃ ┣ 📂 panels/               # 좌우측 정보 오버레이 패널 (TrafficHistory, Roadview, Dashboard)
┃ ┃ ┗ 📂 popups/               # CCTV 스트리밍, 로드뷰 팝업 모달
┃ ┣ 📜 TwinMap.tsx             # 3D 맵 렌더링 및 레이어/패널을 조립하는 최상위 컨테이너
┃ ┗ 📜 MapLegend.tsx           # 지도 범례(Legend) UI
┣ 📂 lib/                      # 공통 라이브러리 (Prisma Client 싱글톤 등)
┣ 📂 types/                    # 전역 TypeScript 타입 정의 (쇼핑, 결제, GIS 등)
┗ 📜 shopping.css              # 쇼핑몰 전역 중앙화 CSS 파일 (인라인 스타일 배제)
```

---

## 4. 🛍️ 쇼핑몰 & 커머스 도메인 상세 워크플로우

### 4.1 실시간 공유 장바구니 (`app/cart/shared/[roomId]`)

* **동작 원리**: 친구나 가족과 `roomId`가 포함된 URL을 공유합니다.
* **동기화 로직**: 화면에 들어온 유저들은 Polling(주기적 API 호출) 또는 WebSocket을 통해 누군가 상품을 담거나 빼면 즉시 내 화면의 장바구니 리스트에도 똑같이 반영됩니다.

### 4.2 결제 준비 및 맵 쿠폰 연동 (`app/checkout/page.tsx`)

* **할인 계산식**: 상품 총액 - 기본 쿠폰 할인 - **지도 획득 쿠폰 할인** = 최종 결제 금액.
* **지도 쿠폰 파이프라인**:
  1. 유저가 디지털 트윈(TwinMap)에서 트럭 배송을 보며 쿠폰 상자를 줍습니다.
  2. 쿠폰은 `localStorage.setItem('mapCoupons', ...)` 형태로 브라우저에 저장됩니다.
  3. `checkout` 페이지 접속 시 이 로컬 스토리지를 읽어 `<select>` 옵션 리스트의 `<optgroup label="지도 획득 쿠폰">` 영역에 바인딩합니다.
  4. 사용자가 결제에 해당 쿠폰을 사용하면 결제 성공 직후 로컬 스토리지에서 삭제합니다.

### 4.3 포트원 결제 실행 (`app/payment/page.tsx`)

* **결제 호출**: `checkout`에서 넘어온 데이터를 바탕으로 `window.IMP.init()`을 거쳐 `IMP.request_pay()`를 호출합니다.
* **콜백 검증**: PG사(카카오페이 등) 팝업에서 사용자가 결제를 완료하면 성공 콜백이 실행되고, 백엔드로 `imp_uid`를 보내 위변조 검증을 마친 후 `orders` 테이블 상태를 `PAID`로 변경합니다.

---

## 5. 🗺️ 디지털 트윈 관제 도메인 (TwinMap) 상세 워크플로우

메인 컴포넌트인 `TwinMap.tsx`는 Deck.gl 기반으로 작동하며, **하단 중앙의 4개 버튼**과 **우측 패널**을 통해 지도를 조작합니다.

### 5.1 하단 중앙 컨트롤 버튼 매뉴얼

1. **🔥 교통 혼잡 히트맵 버튼**
   * **상태 변화**: `isHeatmapVisible` 토글.
   * **로직**: `/api/GIS/Busan/Traffic`에서 받아온 수만 개의 도로(Link) 중앙점 좌표에 `1 - (속도/100)` 공식을 적용해 가중치를 구합니다.
   * **시각 효과**: 속도가 0에 가까울수록(극심한 정체) 화면에 짙고 넓은 붉은색 연기(HeatmapLayer)가 렌더링되어 병목 구간을 거시적으로 파악할 수 있습니다.
2. **👁️ 로드뷰 패널 버튼**
   * **상태 변화**: `roadviewState.isOpen` 토글.
   * **로직**: 클릭 시 화면 우측 하단에 미니맵 형태의 로드뷰 패널이 나타납니다.
   * **인터랙션**: 로드뷰 전용 마커를 맵 위에서 드래그하여 원하는 도로 위에 놓으면 해당 위치의 실제 360도 거리 뷰가 열립니다.
3. **⏱️ 교통 이력 타임랩스 버튼**
   * **상태 변화**: `isHistoryPanelOpen` 토글.
   * **로직**: 좌측 하단에 `TrafficHistoryPanel`이 생성됩니다.
4. **📍 내 위치 버튼**
   * **로직**: 브라우저의 Geolocation API를 호출해 사용자의 현재 위도/경도를 가져온 뒤, `setViewState`를 통해 지도 카메라를 해당 위치로 `FlyTo`(부드럽게 비행) 애니메이션 시킵니다.

### 5.2 줌 레벨 마커 클러스터링 (`useTwinClusters.ts`)

초기 로딩 시 렌더링 부하를 막기 위해 `Supercluster` 라이브러리를 사용합니다. 줌 아웃 시 숫자가 적힌 큰 구슬로 합쳐지고, 줌 인 시 파편화되어 마커로 변합니다.

* 🟢 **CCTV 레이어**: 초록색 링. 클릭 시 모달창에서 실시간 HLS 라이브 캠 스트리밍.
* 🟠 **공사구간 레이어**: 주황색 빛망울. 현재 진행 중인 굴착/도로 통제 정보 제공.
* 🟣 **테마여행 레이어**: 분홍/보라색 코어. 부산의 주요 관광 명소 매핑.
* 🔵 **주차장 레이어**: 파란색 바탕에 흰색 'P' 글씨. 모의 데이터를 기반으로 실시간 주차 가용 대수 제공.

---

## 6. 🚚 배송 시뮬레이션 및 메타버스 게이미피케이션

이 프로젝트의 핵심인 `useDeliverySimulation.ts` 훅에서 담당하는 기능입니다.
유저가 송장 번호를 입력하고 조회를 누르면 다음 스텝이 일어납니다.

1. **도착지 난수 생성**: 송장 번호 문자열을 해시(Hash) 함수로 변환하여 부산 내 임의의 위경도를 목적지로 설정합니다.
2. **OSRM 라우팅 요청**: BIFC(출발지)에서 랜덤 도착지까지 `router.project-osrm.org` API를 호출해 곡선 형태의 실제 도로 경로(GeoJSON)를 받아옵니다.
3. **애니메이션 주행**: 총 90초(Duration)로 타이머를 설정합니다. `requestAnimationFrame`을 통해 프레임마다 진행도(Progress: 0~1)를 갱신하며 트럭 좌표(`truckPos`)와 방향(`truckAngle`)을 부드럽게 갱신합니다.
4. **🎮 1인칭 FPV 모드 변환**: 트럭 주행 중 우측의 '1인칭 뷰' 버튼을 누르면 맵의 기울기(Pitch)가 85도로 눕고 트럭 뒤를 졸졸 쫓아가는 몰입형 드론 뷰로 전환됩니다.
5. **이벤트 자동 팝업**: 트럭이 주행하다 반경 5m 이내에 CCTV나 공사 마커를 지나치면 `nearbyEvent`가 트리거되어 화면 우측에 해당 이벤트 정보 팝업이 자동으로 열립니다. 멀어지면 닫힙니다.
6. **🎁 쿠폰 스폰 & 획득**: OSRM 경로 위 5군데에 무작위 할인율(5~30%)의 쿠폰 상자가 숨겨집니다. 트럭이 근처에 가야만 화면에 드러나고, 사용자가 상자를 클릭하면 `AudioContext`로 띠링- 소리가 나며 로컬 스토리지에 적재됩니다.
7. **🔔 도착 푸시 알림 (OS Push)**: 진행도(Progress)가 100%에 도달하면 다음 두 가지가 동시에 실행됩니다.
   * 브라우저에 권한을 받아둔 `new Notification()` API를 통해 시스템 트레이(윈도우 우측 하단)에 배송 완료 OS 팝업 알림 송출.
   * `POST /api/notifications`를 호출해 DB에 알림 기록 저장 (이후 상단 종 모양 아이콘에서 이력 확인 가능).

---

## 7. ⏱️ 과거 교통 이력 타임랩스 (TrafficHistoryPanel)

하단 ⏱️ 버튼으로 패널을 연 후 재생(▶) 버튼을 누르면 벌어지는 일들입니다.

1. **시간 슬라이더 이동**: 과거 24시간 범위 내에서 1시간 간격으로 설정된 타임라인을 슬라이더가 자동으로 지나갑니다.
2. **데이터 캐싱 (`useHistoryCache`)**: 슬라이더가 가리키는 시각의 교통 데이터를 `/api/traffic/history`에서 불러옵니다. 이때 프레임 끊김을 막기 위해 1~3단계 미래의 데이터를 백그라운드에서 `Prefetch`하고 메모리에 Map 형태로 저장해 둡니다.
3. **시각적 애니메이션**: 캐싱된 교통 데이터가 `trafficMap` 상태를 덮어씁니다. 이때 도로의 선 색상(PathLayer)뿐만 아니라, **교통 히트맵(HeatmapLayer)의 붉은 연기 강도까지 실시간으로 커졌다 작아졌다를 반복하며** 아름다운 타임랩스 애니메이션을 만들어냅니다.

## 8. 🏆 마이페이지 및 게이미피케이션 지갑 (`/mypage/wallet`)

단순한 주문 내역을 넘어, 쇼핑과 메타버스의 융합 경험을 제공하는 개인화 공간입니다.

1. **홀로그램 맵 쿠폰 지갑**: 트럭 시뮬레이션을 통해 획득한 지도 쿠폰을 NFT 형태의 화려한 홀로그램 카드로 시각화하여 수집욕을 자극합니다.
2. **나의 업적 (Achievements)**: "트윈맵 입문자", "쿠폰 헌터 마스터" 등 조건부 업적 달성 시스템을 통해 지속적인 서비스 이용을 유도합니다.

---

## 9. 📊 최고 관리자 대시보드 (`/admin-dashboard`)

비즈니스 현황을 한눈에 볼 수 있는 Recharts 기반의 실시간 데이터 시각화 페이지입니다.

* **매출 추이**: 7일간의 누적 수익 및 주문수를 꺾은선 차트로 렌더링.
* **쿠폰 전환율 통계**: 다운로드 쿠폰 vs 맵 획득 쿠폰의 사용량 파이 차트 제공.
* **인기 상품**: 판매량 기준 Top 5 상품을 바 차트로 시각화.

---

## 10. 🔌 핵심 백엔드 API 명세서

모든 백엔드 기능은 `app/api/.../route.ts`에 위치하며 Prisma를 통해 DB와 통신합니다.

| API 엔드포인트 | Method | 역할 및 반환값 |
|---|---|---|
| `/api/GIS/Busan/Traffic` | GET | 부산 시내 전체 링크(도로망)의 실시간 소통 정보(속도 `spd`) 반환. |
| `/api/GIS/Busan/CCTV/getCCTVList` | GET | 도로에 설치된 CCTV 위치, 이름, 라이브 스트림 비디오 URL 반환. |
| `/api/GIS/Busan/Parking` | GET | 부산 시내 공영/민영 주차장 목록과 가용 대수 반환. (Mock 데이터) |
| `/api/traffic/history/times` | GET | 재생 가능한 과거 시간대 리스트를 배열로 반환. |
| `/api/traffic/history` | GET | Query로 넘긴 `time`에 해당하는 과거 도로 속도 데이터 반환. |
| `/api/notifications` | GET | 인증된 유저(Token 기반)의 전체 푸시 알림 이력 반환. |
| `/api/notifications` | POST | 트럭 배송 완료 시 시스템 알림 레코드 생성 (`title`, `message`, `link`). |
| `/api/notifications` | PATCH | 알림함에서 단일 혹은 전체 알림을 읽음(`is_read: true`) 처리. |
| `/api/coupons` | GET/POST | DB 상에 등록된 쇼핑 쿠폰 조회 및 발급 처리. |

---

## 9. 🧠 소스코드 아키텍처 및 최적화 철학

본 프로젝트는 거대한 복잡성을 감당하기 위해 철저한 성능 최적화와 패턴 설계를 적용했습니다.

### 9.1 관심사 분리 (Custom Hooks Pattern)

1,500줄이 넘을 수 있는 `TwinMap.tsx` 파일을 500줄 이하로 유지하기 위해 로직을 완전히 뜯어냈습니다.

* **`TwinMap.tsx`**: DeckGL 카메라 뷰(ViewState) 조작 및 레이어/UI 패널 껍데기를 배치하는 렌더링 컨테이너 역할만 담당.
* **`useTwinMapState.ts`**: API 통신, 상태 저장, 통계 계산, 쿠폰 획득 로직 몰빵.
* **`useTwinMapHandlers.ts`**: 클릭, 마우스 호버, 패널 토글 등 모든 이벤트 핸들러 분리.
* **`useDeliverySimulation.ts`**: 트럭 경로 획득 및 60fps 애니메이션 프레임 계산 전담.

### 9.2 레이어 팩토리 패턴 (Layer Factory)

지도 위에 올라가는 데이터 레이어를 생성하는 순수 함수(Pure Function) 파일들입니다.

* `createBaseLayers.ts` (폴리곤 경계선, 교통 Path 선)
* `createHeatmapLayer.ts` (붉은색 혼잡 안개)
* `createClusterLayers.ts` (CCTV, 공사, 테마, 주차장)
* 💡 **확장성**: 새로운 종류의 데이터(예: 따릉이 위치, 미세먼지 농도)를 지도에 띄워야 한다면, 기존 코드를 건드리지 않고 팩토리 함수만 하나 더 만들어서 `layers` 배열에 추가하면 끝납니다.

### 9.3 렌더링 프레임 드랍 방지 최적화 (Memoization)

10,000개가 넘는 부산 도로망 좌표 배열과 히트맵 배열 객체를 매 렌더링마다 쌩으로 반복문 돌리면 브라우저 GPU가 뻗어버립니다.

* `useTwinMapState` 내부에서 `heatmapData` 등을 생성할 때 **`useMemo`를 통한 철저한 참조값(Reference) 캐싱**을 적용했습니다.
* 유저가 화면을 확대하거나 이동(패닝)할 때 Deck.gl은 이 데이터 배열의 참조값이 바뀌지 않았음을 인식하고 무거운 GPU 재연산을 건너뛰어, 모바일 기기에서도 부드러운 60fps 지도를 조작할 수 있게 만들었습니다.

---

## 11. 🛡️ 보안 및 전역 아키텍처 (Security & Global Config)

프로젝트 전체의 라우팅 통제, 인증/인가 로직, 그리고 배포 파이프라인은 다음 핵심 파일들에 의해 중앙에서 제어됩니다.

### 11.1 전역 라우트 프록시 (`proxy.ts`)

Next.js의 라우트를 가로채어 페이지 렌더링 전, 혹은 API 접근 전에 **접근 권한을 검증하는 문지기(Middleware)** 역할입니다.

* **기능**: `adminPages` (예: `/ADMIN`, `/admin-dashboard`) 배열이나 `protectedPaths` 배열에 등록된 경로에 접근할 때, 쿠키에 있는 `accessToken`을 가로채어 `verifyAccessToken`으로 복호화합니다.
* **보안 로직**: 토큰이 없거나, 유효하지 않거나, 요구되는 Role(예: `ADMIN`)을 충족하지 못하면 브라우저를 `/Login`이나 `/forbidden` 페이지로 강제 리다이렉트 시킵니다. API 요청의 경우 `401/403 HTTP Status`를 즉시 반환합니다.

### 11.2 서버 기반 OAuth 통합 인증 (`auth.ts`)

NextAuth.js 프레임워크를 기반으로 구축된 소셜 로그인 및 세션 매니저입니다.

* **기능**: Naver OAuth (`Naver Provider`)를 통해 유저 프로필 정보를 가져옵니다.
* **DB 연동 (`linkAccountByEmail`)**: 네이버 로그인 성공 시 JWT 콜백 안에서 Prisma DB를 조회해, 기존 회원인지 판별하고 네이버 ID와 로컬 DB 계정을 연동(Link)하는 핵심 로직이 들어있습니다.

### 11.3 클라이언트 사이드 인증 가드 (`app/hooks/useAuthGuard.ts`)

프록시가 서버단에서 막아준다면, 이 훅은 **클라이언트(React) 단에서 유저 세션을 검증**합니다.

* **기능**: 페이지가 로딩되자마자 백엔드 `/api/auth/Me` 엔드포인트를 찔러 유저 정보를 가져옵니다.
* **토큰 자동 갱신(Refresh)**: 엑세스 토큰이 만료되어 401 에러가 반환되면, 즉각적으로 `/api/auth/refresh` API를 백그라운드에서 호출해 토큰을 재발급받은 뒤 원래 요청을 재시도합니다. 실패 시 로그인 창으로 보냅니다.

### 11.4 실시간 동기화 웹소켓 서버 (`ws-server.js`)

쇼핑몰의 "공유 장바구니" 기능이나 "플래시몹(Flash Mob)" 등 실시간 양방향 통신이 필요한 곳에 쓰이는 독립적인 Node.js + WebSocket 서버입니다.

* **Redis 연동**: `redis://localhost:6379`에 연결되어 여러 인스턴스 간에도 유저 상태를 동기화하고 캐싱합니다.

### 11.5 무중단 배포 및 인프라 (Blue-Green Deployment)

서비스 장애 없이 코드를 업데이트하기 위한 데브옵스 인프라 설정 파일들입니다.

* **`nginx.conf` & `nginx-blue/green.conf`**: Nginx 리버스 프록시를 통해 로드밸런싱 및 블루-그린 스위칭 라우팅을 수행합니다.
* **`deploy.sh` & `deploy.ps1`**: 배포 스크립트로, 새 버전을 컨테이너에 올린 뒤 Nginx 포트를 스왑(Swap)하여 무중단 배포를 실현합니다.
* **`ecosystem.config.js`**: PM2 프로세스 매니저를 통해 Next.js 서버의 메모리 누수 방지, 프로세스 데몬화 및 로깅을 담당합니다.

---

## 12. 💎 Web3 블록체인 결제 시스템 개념 정리 (`/crypto-payment`)

> 이 섹션은 블록체인 기반 결제 구조를 학습하기 위해 추가된 개념 가이드입니다.
> 실제 구현 페이지: `app/crypto-payment/page.tsx` (ethers.js + MetaMask 연동)

### 12.1 ⛽ 가스비(Gas Fee)란?

블록체인은 '탈중앙화된 컴퓨터'입니다. 이 컴퓨터를 유지하는 수천 명의 검증자(Validator)들에게 **연산 작업의 대가**로 지급하는 수수료가 바로 **가스비(Gas Fee)**입니다.

```
[비유: 택배 발송]
- 물건 가격(내가 송금하는 ETH)  →  수신자에게 전달
- 배송비(Gas Fee)               →  블록체인 검증자들에게 자동 지급
```

> ⚠️ 가스비는 항상 해당 블록체인의 **네이티브 코인**으로 지불됩니다.
> (이더리움 → ETH, BNB 체인 → BNB, Polygon → MATIC)

---

### 12.2 💰 "한 코인으로 퉁 친다" — Native ETH 전송 구조 (현재 구현)

이더리움 기본 코인(ETH)을 직접 전송할 때, 결제 금액과 가스비가 **동일한 ETH 잔액에서 차감**됩니다.

```
내 지갑: 1.0 ETH

트랜잭션 실행 결과:
  └─ 0.1 ETH    →  수신자에게 전달 (내가 지정한 금액)
  └─ 0.0021 ETH →  검증자에게 전달 (가스비, ethers.js가 자동 계산)
─────────────────────────────────────
  잔액: 0.8979 ETH
```

코드에서는 `value`(보낼 금액)만 지정하면 가스비는 `ethers.js`가 알아서 견적 내어 추가합니다.

```typescript
// [현재 구현] Native ETH 직접 전송
const tx = {
  to: recipient,
  value: ethers.parseEther(amount) // 보낼 ETH만 지정, 가스비는 자동
};
await signer.sendTransaction(tx);
```

---

### 12.3 🪙 "코인은 코인대로, 가스비는 따로" — ERC-20 토큰 결제

실제 서비스(예: USDT 결제, 자체 토큰 결제)에서는 이더리움 네이티브 코인이 아닌 **별도의 토큰(ERC-20)**으로 금액을 지불합니다.
이때 **가스비(ETH)와 결제 금액(토큰)은 각각 별도로 차감**됩니다.

```
내 지갑:
  ├─ 0.05 ETH        ← 가스비 전용 (반드시 있어야 함)
  └─ 1000 USDT       ← 결제에 사용할 토큰

트랜잭션 실행 결과:
  ├─ 0.002 ETH   →  가스비로 검증자에게 (ETH 차감)
  └─ 100 USDT    →  수신자에게 전달 (USDT 차감)
```

ERC-20 토큰은 이더리움 네트워크 위에 배포된 **스마트 컨트랙트**입니다.
전송을 위해 해당 컨트랙트의 `transfer` 함수를 직접 호출합니다.

```typescript
// [다음 단계] ERC-20 토큰 전송
const ERC20_ABI = ["function transfer(address to, uint256 amount) returns (bool)"];
const contract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, ERC20_ABI, signer);

// 가스비(ETH)는 자동 차감, 실제 전달은 토큰으로
await contract.transfer(recipient, ethers.parseUnits(amount, 18));
```

---

### 12.4 🔮 고급 결제 방식 비교 요약

| 방식 | 가스비 | 결제 수단 | 난이도 | 설명 |
|------|--------|----------|--------|------|
| **Native ETH 전송** | ETH | ETH | ⭐ | 가장 기본. 가스비+금액 모두 ETH |
| **ERC-20 토큰 전송** | ETH | USDT 등 토큰 | ⭐⭐ | 가스비는 ETH, 금액은 토큰으로 분리 |
| **Meta Transaction** | 없음(릴레이어 대납) | 토큰 | ⭐⭐⭐ | 사용자는 서명만, 가스비는 서버가 대납 |
| **EIP-4337 (Account Abstraction)** | 토큰으로 대납 가능 | 토큰 | ⭐⭐⭐⭐ | 스마트 컨트랙트 지갑이 ETH 없이 모든 결제 처리 |

---

### 12.5 🌐 로컬 서버(localhost)에서 MetaMask 연동이 가능한 이유

```
[Web2 결제 흐름]
브라우저 → 서버(PG사 API) → 은행/카드사

[Web3 결제 흐름]
브라우저(Next.js) → MetaMask(중간 다리/Provider) → 이더리움 네트워크
```

Next.js 서버는 직접 블록체인과 통신하지 않습니다.
브라우저에 설치된 MetaMask가 `window.ethereum` 객체를 **전역으로 주입(Inject)**하고,
`ethers.js`는 이 객체를 통해 블록체인 네트워크와 통신합니다.
따라서 `localhost`든 실제 도메인이든 브라우저에서 JS가 실행되는 환경이면 어디서나 동작합니다.

---

### 12.6 🧪 테스트 환경 설정 (Sepolia 테스트넷)

실제 ETH를 사용하지 않고도 완전히 동일한 구조로 테스트할 수 있습니다.

1. MetaMask → 네트워크 선택 → **[Sepolia 테스트 네트워크]** 선택
   *(설정 → 고급 → '테스트 네트워크 표시' 활성화 필요)*
2. 아래 Faucet(수도꼭지)에서 내 지갑 주소를 입력하여 **무료 테스트 ETH 수령**
   * [Google Cloud Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
   * [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
3. 페이지에서 지갑 연결 후 결제 전송 → MetaMask 승인 팝업 → TxHash 수령

---

## 13. 🏗️ 이중 토큰 결제 시스템 구현 단계별 개념 정리

> 실제 구현 위치: `blockchain-study/contracts/`
> 구현 목표: GAS 토큰(수수료 전용) + PAY 토큰(결제 전용)이 자동으로 역할을 나눠 처리하는 결제 시스템

---

### 13.1 ✅ 1단계 개념 — 로컬 블록체인 환경 (Ganache)

#### 왜 로컬 환경이 필요한가?

스마트 컨트랙트는 실제 블록체인에 한 번 올리면 수정이 불가능하고, 올릴 때마다 실제 가스비가 발생합니다.
그래서 개발자들은 **내 PC 안에 가짜 블록체인을 만들어** 자유롭게 배포하고 테스트합니다.

```
[비유]
실제 이더리움 네트워크  →  진짜 은행 (돈이 오고 감)
Ganache 로컬 네트워크  →  집 안에 만든 연습용 모형 은행 (가짜 돈, 무한 리셋)
```

#### 구성 요소

| 도구 | 하는 일 | 비유 |
|---|---|---|
| **Ganache** | 내 PC에서 이더리움 흉내내는 가짜 서버 실행 (포트 8545) | 모형 은행 서버 |
| **solc** | `.sol` 파일(계약서)을 블록체인이 읽을 수 있는 코드로 변환 | 번역기 |
| **ethers.js** | Next.js에서 이 서버에 명령을 보내는 클라이언트 | 창구 직원 |

#### 실행 구조

```
터미널 1: npm run dev       → Next.js 서버 (포트 3000)
터미널 2: npx ganache       → 가짜 블록체인 서버 (포트 8545)

브라우저가 둘 다 동시에 사용함:
  - localhost:3000 → 화면(UI)
  - localhost:8545 → 블록체인 데이터
```

---

### 13.2 ✅ 2단계 개념 — 스마트 컨트랙트와 ERC-20 토큰

#### 스마트 컨트랙트란?

```
[일반 계약서]
"A가 B에게 100만원을 주면, B는 집을 넘긴다"
→ 사람이 지켜야 하고, 안 지키면 소송해야 함

[스마트 컨트랙트]
같은 내용을 코드로 작성해 블록체인에 배포
→ 조건이 충족되면 코드가 자동으로 실행, 아무도 막을 수 없음
→ 배포 후 수정 불가 (한 번 올리면 영구적)
```

#### ERC-20이란?

이더리움에서 "토큰을 만드는 표준 규격"입니다.
이 규격을 따르면 MetaMask, 거래소 등 모든 곳에서 자동으로 인식됩니다.

```
ERC-20 토큰이 반드시 가져야 하는 기능:

balanceOf(주소)          → 해당 주소의 잔액 조회
transfer(받는사람, 금액) → 내 지갑에서 직접 전송
approve(컨트랙트, 금액)  → 컨트랙트가 내 토큰을 쓸 수 있도록 허가
transferFrom(보낸사람, 받는사람, 금액) → 허가받은 컨트랙트가 대신 전송
```

#### 우리가 만든 토큰 구조

```
ERC20.sol (공통 뼈대)
  ├─ GasToken.sol (GAS) → 수수료 전용 토큰
  └─ PayToken.sol (PAY) → 결제 전용 토큰

DualPayment.sol → 두 토큰을 조합한 결제 컨트랙트
```

#### 이중 토큰 결제의 핵심: approve()

컨트랙트가 내 토큰을 자동으로 가져가려면 반드시 먼저 **허가(approve)**가 필요합니다.

```
[결제 전 준비 (2번의 approve)]
1. gasToken.approve(DualPayment주소, 수수료량)
   → "DualPayment야, 내 GAS 토큰 이만큼 가져가도 돼"

2. payToken.approve(DualPayment주소, 결제금액)
   → "DualPayment야, 내 PAY 토큰 이만큼 가져가도 돼"

[실제 결제 (1번의 pay)]
3. DualPayment.pay(수신자주소, 결제금액)
   → 컨트랙트가 자동으로:
      A. GAS 토큰에서 수수료 차감 (feeCollector에게)
      B. PAY 토큰으로 결제금 전달 (recipient에게)
```

#### 원자성(Atomicity) 보장

```
pay() 함수 안에서 A와 B는 하나의 트랜잭션으로 묶임.
A만 되고 B가 실패하는 상황은 절대 발생하지 않음.

→ 수수료만 빠지고 결제는 안 되는 상황: 불가능
→ 둘 다 성공하거나, 둘 다 실패해서 원상복구됨

이것이 require() 구문이 하는 역할:
require(paySent, "...") 이 실패하면
그 이전에 실행된 gasSent도 자동으로 되돌아감 (Revert)
```

#### decimals = 18의 의미

```
사람이 보는 값: 1 PAY 토큰
블록체인 내부: 1,000,000,000,000,000,000 (1 * 10^18)

이유: 블록체인은 소수점을 모름. 정수만 다룸.
     그래서 18자리 정수로 소수점을 흉내냄.
     (0.001 PAY = 내부적으로 1,000,000,000,000,000)

ethers.js에서 변환:
  ethers.parseEther("1")    → 1000000000000000000 (입력용)
  ethers.formatEther(값)    → "1.0" (표시용)
```

---

### 13.3 ✅ 3단계 개념 — 컴파일 & 배포 스크립트

> 관련 파일: `blockchain-study/scripts/compile.js`, `blockchain-study/scripts/deploy.js`
> 배포 결과: `blockchain-study/deployed/deployed-addresses.json`

---

#### 🔨 컴파일이란? (.sol → ABI + 바이트코드)

사람이 읽는 Solidity 코드(`.sol`)를 블록체인이 실행할 수 있는 형태로 변환하는 과정입니다.

```
[컴파일 전]                     [컴파일 후]
GasToken.sol (사람이 읽는 코드)  →  ABI (함수 설명서, JSON)
                                 →  bytecode (기계어, 16진수 문자열)
```

**ABI (Application Binary Interface)**

컨트랙트의 "메뉴판"입니다. 어떤 함수가 있고, 파라미터가 뭔지 JSON으로 정의합니다.
프론트엔드(ethers.js)는 이 ABI가 반드시 있어야 컨트랙트의 함수를 호출할 수 있습니다.

```json
// ABI 예시 (pay() 함수 하나의 생김새)
{
  "name": "pay",
  "type": "function",
  "inputs": [
    { "name": "recipient", "type": "address" },
    { "name": "payAmount", "type": "uint256" }
  ],
  "outputs": [],
  "stateMutability": "nonpayable"
}
```

**바이트코드 (Bytecode)**

블록체인에 실제로 올라가는 기계어입니다. 한 번 배포된 바이트코드는 블록체인에 영구 저장되며 변경 불가합니다.

```
0x608060405234801561001057600080fd5b50...
(이 16진수 덩어리가 실제 EVM이 실행하는 코드)
```

---

#### 📦 배포(Deploy)란?

컴파일된 바이트코드를 블록체인에 올리는 행위입니다.
배포가 완료되면 그 컨트랙트만의 고유한 **주소(Address)** 가 생성됩니다.
이 주소가 곧 컨트랙트의 "영구 ID" 이며, 이후 모든 상호작용은 이 주소를 통해 이루어집니다.

```
[배포 트랜잭션의 흐름]

1. ContractFactory가 배포 트랜잭션 생성
   (bytecode + constructor 인자를 담은 특수 트랜잭션)

2. deployer(개인키)가 트랜잭션에 서명

3. 트랜잭션이 Ganache(또는 이더리움 네트워크)로 전송

4. 채굴자(Ganache)가 트랜잭션을 블록에 담음

5. 블록이 확정되면 컨트랙트 주소가 생성됨
   (주소 = 배포자 주소 + nonce 값으로 결정론적 계산)

6. waitForDeployment()가 이 완료를 감지하고 반환
```

---

#### 🔌 JsonRpcProvider vs BrowserProvider

배포 스크립트에서 `JsonRpcProvider`를 사용하는 이유가 궁금할 수 있습니다.

```
[프론트엔드(브라우저) 환경]
BrowserProvider(window.ethereum)
→ MetaMask가 중간에 있음
→ 사용자가 MetaMask 팝업에서 서명 승인
→ 일반 웹 사용자가 쓰는 방식

[서버/스크립트 환경 ← 지금 우리 배포 스크립트]
JsonRpcProvider("http://127.0.0.1:8545")
→ MetaMask 없이 노드에 직접 HTTP 연결
→ 개인키로 코드에서 자동 서명 (Wallet 객체 사용)
→ 자동화된 배포/테스트 스크립트에서 사용
```

---

#### 🔑 Wallet vs Signer 개념

```
[Signer (추상 개념)]
트랜잭션에 "서명"할 수 있는 객체.
ethers.js에서 서명이 필요한 모든 곳에 Signer가 필요함.

[Wallet (구현체 - 스크립트용)]
개인키 + Provider를 합친 Signer.
코드에서 직접 개인키를 넣어 자동 서명.
→ new ethers.Wallet(PRIVATE_KEY, provider)

[MetaMask Signer (구현체 - 브라우저용)]
BrowserProvider에서 꺼내 쓰는 Signer.
MetaMask 팝업으로 사용자가 직접 서명.
→ await provider.getSigner()
```

---

#### 🏭 ContractFactory 개념

```
[ContractFactory의 역할]
ABI + bytecode + Signer를 조합해 배포 준비를 하는 "공장"

const factory = new ethers.ContractFactory(abi, bytecode, signer);
const contract = await factory.deploy(...constructorArgs);

→ factory.deploy() 호출 시:
   1. bytecode + constructorArgs를 담은 트랜잭션 생성
   2. signer가 자동 서명
   3. 네트워크로 전송
   4. 트랜잭션 해시 반환 (아직 채굴 전)

await contract.waitForDeployment();
→ 트랜잭션이 블록에 담길 때까지 대기
→ 이후 contract.getAddress()로 배포된 주소 획득
```

---

#### 📋 배포 순서가 중요한 이유

```
[의존성 관계]

GasToken   (독립)  → 먼저 배포 가능
PayToken   (독립)  → 먼저 배포 가능
DualPayment (의존) → GasToken 주소 + PayToken 주소가 있어야 배포 가능

constructor(
  address _gasTokenAddress,  ← GasToken이 먼저 있어야 주소를 넘길 수 있음
  address _payTokenAddress,  ← PayToken이 먼저 있어야 주소를 넘길 수 있음
  ...
)

[올바른 순서]
1. GasToken 배포 → 주소 획득
2. PayToken 배포 → 주소 획득
3. DualPayment 배포 (두 주소를 인자로 전달)

[잘못된 순서 → 오류]
DualPayment를 먼저 배포하려고 하면 넘길 주소가 없으므로 불가
```

---

#### 📁 deployed-addresses.json 이 중요한 이유

배포가 완료된 후 생성되는 이 파일이 프론트엔드(Next.js)와 스마트 컨트랙트를 연결하는 다리입니다.

```json
{
  "network": "localhost",
  "deployedAt": "2026-04-28T00:49:...",
  "deployer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "contracts": {
    "GasToken": {
      "address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      "abi": [...]
    },
    "PayToken": {
      "address": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      "abi": [...]
    },
    "DualPayment": {
      "address": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
      "abi": [...]
    }
  }
}
```

Next.js 페이지에서 이 파일을 import해서 주소와 ABI를 꺼내 쓰면 됩니다.
Ganache를 재시작할 때마다 주소가 바뀌므로 배포를 다시 실행해야 합니다.

---

#### ⚠️ 실제 서비스에서 절대 하면 안 되는 것

```javascript
// ❌ 절대 금지: 개인키를 코드에 직접 하드코딩
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// ✅ 올바른 방법: .env 파일에 보관, .gitignore에 추가
// .env
DEPLOYER_PRIVATE_KEY=0xac0974bec...

// deploy.js
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
```

우리 프로젝트에서는 Ganache 기본 테스트 계정(가짜 돈)이므로 코드에 넣었지만,
실제 배포 시에는 반드시 `.env`로 관리해야 합니다.

---

#### 🔄 3단계 전체 흐름 요약

```
[compile.js 실행 시]
.sol 파일 읽기 → solc 컴파일러 실행 → ABI + bytecode 추출 → 메모리에 보관

[deploy.js 실행 시]
Ganache 연결 확인
→ Wallet(개인키) 생성
→ compile() 호출 (3개 컨트랙트)
→ ContractFactory로 GasToken 배포 → 주소 획득
→ ContractFactory로 PayToken 배포 → 주소 획득
→ ContractFactory로 DualPayment 배포 (두 주소 전달) → 주소 획득
→ deployed-addresses.json에 모든 주소 + ABI 저장
→ 배포 완료 출력
```

---

### 13.4 🖥️ 실제 실행 가이드 — 처음부터 끝까지

> 이 섹션은 `blockchain-study` 전체를 처음 실행하거나 재시작할 때 참고하는 실행 순서입니다.
> Ganache는 종료하면 모든 상태가 리셋되므로, 켤 때마다 배포를 다시 실행해야 합니다.

---

#### 📋 실행 전 구조 확인

```
blockchain-study/
  ├─ contracts/
  │    ├─ ERC20.sol          ← ERC-20 공통 뼈대
  │    ├─ GasToken.sol       ← 수수료 토큰
  │    ├─ PayToken.sol       ← 결제 토큰
  │    └─ DualPayment.sol    ← 이중 결제 컨트랙트
  ├─ scripts/
  │    ├─ compile.js         ← .sol → ABI + bytecode 변환
  │    └─ deploy.js          ← Ganache에 배포 + JSON 저장
  ├─ deployed/
  │    └─ deployed-addresses.json  ← 배포 후 자동 생성됨
  └─ package.json
```

---

#### 🚀 실행 순서 (터미널 3개 필요)

**터미널 1 — Next.js 서버 (이미 켜져 있으면 그대로)**

```powershell
cd c:\WorkSpace\study-Next\Next.js\test
npm run dev
```

→ `http://localhost:3000` 에서 웹 페이지 접근 가능

---

**터미널 2 — Ganache 로컬 블록체인 시작 (이 창은 계속 켜둬야 함)**

```powershell
cd c:\WorkSpace\study-Next\Next.js\test\blockchain-study
npx ganache --chain.chainId 31337 --wallet.accounts "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80,1000000000000000000000"
```

→ 성공 시 출력:

```
ganache v7.9.2
Available Accounts
==================
(0) 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (1000 ETH)

Listening on 127.0.0.1:8545
```

> 옵션 설명:
>
> * `--chain.chainId 31337` : MetaMask에 네트워크 등록 시 사용하는 ID
> * `--wallet.accounts "개인키,잔액(wei)"` : 개인키와 초기 잔액(wei 단위, 1000 ETH = 10^21 wei)을 가진 계정 생성
> * 이 개인키는 Hardhat/Ganache 공식 테스트 계정 #0 (실제 돈 아님, 공개된 키)

---

**터미널 3 — 컨트랙트 배포 (Ganache가 켜진 상태에서)**

```powershell
cd c:\WorkSpace\study-Next\Next.js\test\blockchain-study
node scripts/deploy.js
```

→ 성공 시 출력:

```
🚀 배포 스크립트 시작

✅ Ganache 연결 성공! (Chain ID: 31337)

👤 배포자 주소: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
💰 배포자 잔액: 1000.0 ETH

✅ GasToken  컴파일 성공! (ABI 함수 수: 14개)
✅ PayToken  컴파일 성공! (ABI 함수 수: 14개)
✅ DualPayment 컴파일 성공! (ABI 함수 수: 8개)

✅ GasToken  배포 완료! 주소: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✅ PayToken  배포 완료! 주소: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
✅ DualPayment 배포 완료! 주소: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

🎉 전체 배포 완료!
```

> **정상 배포 확인 기준**: 세 컨트랙트의 주소가 **모두 달라야** 합니다.
> 같은 주소가 두 개 이상 나오면 Ganache를 완전히 종료 후 재시작하고 다시 배포해야 합니다.

---

#### ⚠️ 자주 겪는 문제와 해결법

**문제 1: `EADDRINUSE: address already in use 127.0.0.1:8545`**

```
원인: 이전 Ganache가 아직 백그라운드에서 실행 중
해결:
  1. Ctrl+C 로 현재 Ganache 종료
  2. 아래 명령으로 포트 강제 종료 후 재시작:
     Get-NetTCPConnection -LocalPort 8545 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
  3. 다시 Ganache 실행
```

**문제 2: `insufficient funds for gas * price + value`**

```
원인: 배포자 계정에 ETH가 없음
     (Ganache 재시작 시 잔액도 리셋되므로, 반드시 --wallet.accounts 옵션 포함해서 실행해야 함)
해결: Ganache를 --wallet.accounts 옵션과 함께 다시 실행
```

**문제 3: GasToken과 PayToken 주소가 동일하게 출력됨**

```
원인: Ganache 상태가 이전 실행에서 남아 있어 nonce가 꼬인 것
해결:
  1. Ganache 터미널에서 Ctrl+C 로 종료
  2. 다시 Ganache 실행 (새 인스턴스)
  3. node scripts/deploy.js 다시 실행
```

---

#### 🔁 재시작 시 체크리스트

```
□ Ganache 터미널 Ctrl+C 로 종료
□ Ganache 다시 실행 (같은 명령어)
□ node scripts/deploy.js 실행
□ 세 주소가 모두 다른지 확인
□ deployed-addresses.json 생성됐는지 확인
□ (Next.js 연동 중이라면) 페이지 새로고침
```

---

#### 📌 배포된 컨트랙트 주소 (최신 배포 기준)

> Ganache를 재시작하면 아래 주소는 무효가 됩니다. 재배포 후 갱신 필요.

| 컨트랙트 | 주소 | 역할 |
|---|---|---|
| GasToken (GAS) | `0x5FbDB2315678afecb367f032d93F642f64180aa3` | 수수료 전용 토큰 |
| PayToken (PAY) | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` | 결제 전용 토큰 |
| DualPayment | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` | 이중 결제 처리 |
| 배포자/수수료 수취 | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | 관리자 계정 |

---

### 13.5 ✅ 4단계 개념 & 실행 가이드 — MetaMask 로컬 네트워크 연결

> 이 단계는 코드 없이 MetaMask 브라우저 확장 프로그램에서 직접 클릭하는 작업입니다.
> Ganache가 실행 중인 상태에서 진행해야 합니다.

---

#### 🔌 왜 MetaMask 설정이 필요한가?

```
[현재 상태]
Ganache: 로컬 블록체인 서버 실행 중 (포트 8545)
         → 3개의 컨트랙트 배포 완료

[문제]
MetaMask는 기본적으로 이더리움 메인넷 또는 공개 테스트넷에 연결되어 있음.
우리가 만든 로컬 Ganache 네트워크는 MetaMask가 모름.

[해결]
MetaMask에 Ganache 네트워크 정보를 수동으로 등록하면
브라우저에서 Next.js 페이지를 통해 로컬 블록체인과 직접 통신 가능.
```

---

#### Step 1 — MetaMask에 로컬 네트워크 추가

1. MetaMask 확장 프로그램 클릭
2. 상단 네트워크 드롭다운 클릭 (기본값: "이더리움 메인넷")
3. **"네트워크 추가"** 클릭
4. **"네트워크 수동 추가"** 클릭
5. 아래 정보 입력:

| 항목 | 입력값 | 설명 |
|---|---|---|
| 네트워크 이름 | `Localhost 8545` | 표시용 이름 (자유롭게 설정 가능) |
| 새 RPC URL | `http://127.0.0.1:8545` | Ganache가 열어놓은 HTTP 엔드포인트 |
| 체인 ID | `31337` | Ganache 실행 시 지정한 chainId |
| 통화 기호 | `ETH` | 가스비로 쓰이는 기본 통화 |
| 블록 탐색기 URL | (비워두기) | 로컬이라 탐색기 없음 |

1. **저장** 클릭 → MetaMask가 자동으로 Localhost 8545 네트워크로 전환됨

> **체인 ID란?**
> 서로 다른 이더리움 네트워크를 구분하는 고유 번호.
> 메인넷=1, Sepolia=11155111, Ganache 로컬=31337 (Hardhat 기본값과 동일)
> MetaMask는 이 ID로 "어느 블록체인에 연결할지" 판단함.

---

#### Step 2 — 테스트 계정 가져오기 (Import)

Ganache가 생성한 테스트 계정을 MetaMask로 불러옵니다.

1. MetaMask 상단 계정 아이콘 클릭
2. **"계정 또는 하드웨어 지갑 추가"** 클릭
3. **"계정 가져오기 (Import Account)"** 클릭
4. 아래 개인키 입력:

```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

1. **"가져오기"** 클릭

**확인:** 계정에 약 999.99 ETH가 표시되면 성공
(1000 ETH에서 컨트랙트 3개 배포 가스비로 약 0.006 ETH 소모됨)

> **왜 이 개인키인가?**
> Ganache를 실행할 때 `--wallet.accounts` 옵션으로 지정한 개인키입니다.
> Hardhat, Ganache에서 공식으로 사용하는 공개 테스트 키로, 실제 이더리움 메인넷에서는
> 사용하면 절대 안 됩니다. 로컬 개발/테스트 전용 키입니다.

---

#### Step 3 — GAS / PAY 토큰 추가

배포한 ERC-20 토큰을 MetaMask에 등록해야 잔액이 보입니다.

**MetaMask → "토큰 가져오기" 클릭**

**GAS 토큰:**

| 항목 | 입력값 |
|---|---|
| 토큰 계약 주소 | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| 토큰 심볼 | `GAS` (자동으로 안 채워지면 직접 입력) |
| 토큰 소수점 | `18` |

**PAY 토큰:**

| 항목 | 입력값 |
|---|---|
| 토큰 계약 주소 | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` |
| 토큰 심볼 | `PAY` (자동으로 안 채워지면 직접 입력) |
| 토큰 소수점 | `18` |

> **왜 심볼이 자동으로 안 채워지나?**
> MetaMask는 공개 네트워크(메인넷, Sepolia 등)의 토큰 정보는 자동 조회합니다.
> Ganache 같은 프라이빗 로컬 네트워크는 외부에 노출되지 않으므로
> MetaMask가 토큰 정보를 자동으로 가져오지 못합니다. 직접 입력 필요.

---

#### ✅ 4단계 완료 확인

MetaMask 토큰 탭에서 아래처럼 보이면 완료:

```
[Localhost 8545 네트워크]
Imported Account 1

이더리움    999.99 ETH
GAS        100.00만 GAS  (= 1,000,000 GAS)
PAY        100.00만 PAY  (= 1,000,000 PAY)
```

---

#### 🔄 Ganache 재시작 시 — 실제로 할 것

컴퓨터를 껐다 켜거나 Ganache를 종료하면 블록체인 상태가 초기화됩니다.
하지만 **컨트랙트 주소는 항상 동일**합니다.

```
이유: 이더리움 컨트랙트 주소는 결정론적(Deterministic)으로 계산됨
     주소 = keccak256(배포자주소 + nonce 순번)

배포자 주소: 항상 동일 (0xf39Fd6...)
Ganache 재시작 → nonce 0부터 다시 시작
→ nonce 0 → GasToken  → 0x5FbDB... (항상 동일)
→ nonce 1 → PayToken  → 0xe7f17... (항상 동일)
→ nonce 2 → DualPayment → 0x9fE46... (항상 동일)
```

따라서 재시작 시 해야 할 일은 딱 두 가지뿐입니다:

```
[재시작 후 해야 할 것 (전부)]
1. Ganache 다시 실행
2. node scripts/deploy.js 재실행

MetaMask 설정(네트워크, 계정, 토큰)은 처음 한 번만 → 이후 재시작해도 그대로 유지
```

단, 아래 경우에는 주소가 달라져서 토큰 재등록이 필요합니다:

```
[주소가 바뀌는 예외 상황]
대표적인 경우: Ganache를 재시작하지 않고 deploy.js를 두 번 이상 실행한 경우

예시:
  첫 번째 deploy.js 실행:
    nonce 0 → GasToken   → 0x5FbDB... (정상)
    nonce 1 → PayToken   → 0xe7f17... (정상)
    nonce 2 → DualPayment → 0x9fE46... (정상)

  Ganache 유지한 채로 두 번째 deploy.js 실행:
    nonce 3 → GasToken   → 전혀 다른 주소 ← MetaMask와 불일치!
    nonce 4 → PayToken   → 전혀 다른 주소 ← MetaMask와 불일치!
    nonce 5 → DualPayment → 전혀 다른 주소 ← MetaMask와 불일치!

해결: 항상 "Ganache 완전 종료 → 재시작 → deploy.js 1회 실행" 순서를 지킬 것
     Ganache가 재시작되면 nonce가 0으로 초기화되어 주소가 다시 동일해짐
```

---

### 13.6 💸 수수료율(feeRate) — 누가 어떻게 정하나?

#### 어디서 정해지나?

수수료율은 **배포자가 `deploy.js`를 실행할 때 딱 한 번** 결정됩니다.

`blockchain-study/scripts/deploy.js` 의 DualPayment 배포 부분:

```javascript
// DualPayment 배포: 앞서 배포한 두 토큰 주소와 수수료율(5%) 전달
const { address: dualPayAddr } = await deploy(
  "DualPayment",
  dualPayCompiled.abi,
  dualPayCompiled.bytecode,
  [
    gasTokenAddr,     // _gasTokenAddress
    payTokenAddr,     // _payTokenAddress
    deployer.address, // _feeCollector (수수료는 배포자에게)
    5,                // _feeRate (5%) ← 여기서 결정
  ]
);
```

이 숫자 `5`가 `DualPayment` 컨트랙트의 생성자로 전달되어 블록체인에 영구 저장됩니다.

---

#### 계산 공식

`DualPayment.sol` 내부 로직:

```solidity
uint256 feeAmount = (payAmount * feeRate) / 100;
// feeRate = 5일 때:
// 100 PAY 결제 → 100 * 5 / 100 = 5 GAS 수수료
```

| 결제 금액 | feeRate | 수수료 |
|---|---|---|
| 100 PAY | 5 | 5 GAS |
| 1,000 PAY | 5 | 50 GAS |
| 100 PAY | 10 | 10 GAS |

---

#### 요율을 바꾸려면?

```
[방법]
1. deploy.js에서 5 → 원하는 숫자로 변경
2. Ganache 재시작 → node scripts/deploy.js 재실행
3. 새로 배포된 DualPayment 컨트랙트에 새 요율이 적용됨

[중요]
이미 배포된 컨트랙트는 절대 수정 불가.
블록체인에 한번 올라간 코드는 변경할 수 없음 (불변성, Immutability).
→ 요율을 바꾸려면 새 컨트랙트를 배포해야 함.
```

> **실제 서비스에서는?**
> `setFeeRate(uint256 newRate)` 같은 관리자 전용 함수를 컨트랙트에 추가하면
> 재배포 없이 요율을 변경할 수 있습니다. 이때 `onlyOwner` 접근 제어로 배포자만 호출 가능하게 제한합니다.
> 우리 컨트랙트는 학습 목적이라 이 기능은 생략했습니다.

---

## 14. 🌐 크로스체인 멀티 결제 시스템 (`/multi-payment`)

### 14.1 왜 만드는가? (배경 및 목적)

앞서 구현한 `DualPayment`는 **하나의 체인** 위에서 두 종류의 토큰(GAS, PAY)으로 결제하는 구조였습니다.
그러나 실제 서비스에서는 사용자가 **"비트코인으로 결제", "이더리움으로 결제", "솔라나로 결제"** 처럼
서로 다른 블록체인에 존재하는 코인을 자유롭게 선택해 결제해야 합니다.

이 요구사항을 해결하려면 다음 문제를 마주하게 됩니다:

```
문제: 블록체인끼리는 직접 통신이 불가능하다.
      Ethereum 체인은 Solana에서 무슨 일이 벌어지는지 전혀 모른다.

→ 해결: 각 체인을 동시에 모니터링하는 "결제 서버(백엔드)"가 필요하다.
```

이 모듈은 **크로스체인 결제의 핵심 구조**를 로컬 환경에서 직접 체험하기 위한 학습용 구현입니다.
3개의 Ganache 인스턴스를 각각 독립 체인으로 사용해 실제 멀티체인 환경을 시뮬레이션합니다.

---

### 14.2 전체 아키텍처

```
[사용자 브라우저]
  └─ /multi-payment 페이지
       ├─ Chain A / B / C 코인 중 선택
       ├─ MetaMask 자동 네트워크 전환
       └─ 결제 트랜잭션 전송

[블록체인 레이어] (Ganache 3개)
  ├─ Chain A (port 8545, chainId 1337)
  │    └─ PaymentReceiver.sol 배포
  ├─ Chain B (port 8546, chainId 1338)
  │    └─ PaymentReceiver.sol 배포
  └─ Chain C (port 8547, chainId 1339)
       └─ PaymentReceiver.sol 배포

[결제 서버 백엔드] (Node.js)
  ├─ 3개 체인 동시 모니터링 (ethers.js WebSocket Provider)
  ├─ PaymentReceived 이벤트 감지
  └─ 주문 DB에 결제 완료 처리 → 프론트엔드에 응답
```

---

### 14.3 구현 단계 로드맵

#### 1단계: UI 구현 ✅ (완료)

* 파일: `app/multi-payment/page.tsx`

* 코인 선택 카드 UI (Chain A / B / C)
* MetaMask 자동 네트워크 전환 (`wallet_switchEthereumChain`)
* 결제 진행 상태 표시 (1/2 네트워크 전환 → 2/2 트랜잭션)
* 현재는 단순 ETH 전송으로 동작 확인 가능

#### 2단계: 컨트랙트 배포

* 파일: `blockchain-study/contracts/PaymentReceiver.sol`

* 각 3개 체인에 배포 (`deploy-multichain.js`)
* 역할: 입금을 받으면 `PaymentReceived(payer, amount, orderId)` 이벤트 발생

#### 3단계: 결제 서버 구축

* 파일: `server/index.js` (Node.js + Express)

* 3개 체인의 `PaymentReceiver` 이벤트를 동시 구독
* 이벤트 감지 시 주문 상태를 메모리 Map에 저장
* REST API 제공: `GET /order/:orderId` → `{ status: 'paid' | 'pending' }`

#### 4단계: 프론트 ↔ 서버 연동

* 결제 후 서버에 주문번호로 상태 폴링

* 서버가 `paid` 응답 시 완료 화면 표시

---

### 14.4 핵심 학습 포인트

| 개념 | 내용 |
|---|---|
| **크로스체인 불가** | 체인끼리는 직접 통신 불가 → 서버가 중간 역할 |
| **이벤트 구독** | `ethers.Contract.on("EventName", handler)` |
| **다중 체인 모니터링** | WebSocket Provider로 여러 노드에 동시 연결 |
| **MetaMask 네트워크 전환** | `wallet_switchEthereumChain` / `wallet_addEthereumChain` |
| **폴링 vs 웹소켓** | 프론트는 폴링, 서버는 웹소켓으로 체인 감시 |

---

### 14.5 로컬 실행 환경 (완성 후)

```bash
# 터미널 1: Chain A
npx ganache --chain.chainId 1337 --server.port 8545 ...

# 터미널 2: Chain B
npx ganache --chain.chainId 1338 --server.port 8546 ...

# 터미널 3: Chain C
npx ganache --chain.chainId 1339 --server.port 8547 ...

# 터미널 4: 각 체인에 컨트랙트 배포
node scripts/deploy-multichain.js

# 터미널 5: 결제 서버 실행
node server/index.js

# 터미널 6: Next.js 프론트엔드
npm run dev
```

---

### 14.6 2단계: 컨트랙트 설계 및 배포

#### PaymentReceiver.sol 핵심 설계

`blockchain-study/contracts/PaymentReceiver.sol`

```solidity
// 핵심 이벤트: 결제 서버가 이것을 감지해 주문 완료 처리
event PaymentReceived(
    address indexed payer,  // 결제자 주소
    uint256 amount,         // 결제 금액 (wei)
    string  orderId         // 주문 번호 (프론트-서버 매칭용)
);

// 핵심 함수: 사용자가 ETH와 함께 호출
function pay(string calldata orderId) external payable {
    require(msg.value > 0, "amount must be > 0");
    emit PaymentReceived(msg.sender, msg.value, orderId);
}
```

`pay(orderId)` 하나가 전부입니다. ETH를 보내면 이벤트가 블록체인에 기록되고, 결제 서버가 감지합니다.

#### orderId의 역할

```
프론트엔드가 결제 전 고유 주문번호 생성 (예: "ORDER-1234")
    ↓
pay("ORDER-1234") 호출 → 블록체인에 이벤트 기록
    ↓
결제 서버: PaymentReceived 이벤트에서 orderId 추출
    ↓
서버 DB에서 "ORDER-1234" 주문을 "paid" 상태로 변경
    ↓
프론트엔드: GET /api/order/ORDER-1234 폴링 → paid → 완료 화면
```

#### 배포 스크립트 실행 (완성 후)

```bash
# blockchain-study 디렉토리에서
node scripts/deploy-multichain.js
```

성공 시 `blockchain-study/deployed/multichain-addresses.json` 자동 생성:

```json
{
  "deployedAt": "2026-04-28T...",
  "abi": [...],
  "chains": {
    "Chain A": { "chainId": 1337, "rpcUrl": "http://127.0.0.1:8545", "address": "0x..." },
    "Chain B": { "chainId": 1338, "rpcUrl": "http://127.0.0.1:8546", "address": "0x..." },
    "Chain C": { "chainId": 1339, "rpcUrl": "http://127.0.0.1:8547", "address": "0x..." }
  }
}
```

프론트엔드와 결제 서버 모두 이 파일을 읽어 체인별 컨트랙트 주소를 참조합니다.

> **주의**: Ganache 재시작 시 컨트랙트 주소가 변경됩니다.
> 재시작 후에는 반드시 `deploy-multichain.js`를 다시 실행하세요.

#### 실제 배포 결과 (2026-04-28 기준)

```
Chain A (chainId: 1337, port: 8545): 0x5FbDB2315678afecb367f032d93F642f64180aa3
Chain B (chainId: 1338, port: 8546): 0x5FbDB2315678afecb367f032d93F642f64180aa3
Chain C (chainId: 1339, port: 8547): 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

3개 체인 모두 주소가 동일한 것은 정상입니다.
동일한 개인키(배포자)와 동일한 nonce(0)에서 배포하면 EVM은 항상 같은 주소를 결정론적으로 생성합니다.

---

### 14.7 현재 진행 상황

| 단계 | 상태 | 내용 |
|---|---|---|
| 1단계: UI | ✅ 완료 | `/multi-payment` 코인 선택 + MetaMask 네트워크 전환 |
| 2단계: 컨트랙트 | ✅ 완료 | `PaymentReceiver.sol` 3개 체인 배포 완료 |
| 3단계: 결제 서버 | ✅ 완료 | Node.js 서버, 3개 체인 이벤트 동시 모니터링 (PostgreSQL) |
| 4단계: 프론트 연동 | ✅ 완료 | orderId 생성, 컨트랙트 호출, 서버 폴링, 완료 화면 |
| 5단계: 판매자 지갑 연동 | ✅ 완료 | 컨트랙트 업그레이드 — pay() 시 ETH를 판매자 지갑으로 즉시 포워딩 |

---

### 14.8 3단계: 결제 서버 구축

#### 파일 위치

`blockchain-study/server/index.js`

#### 핵심 역할

```
역할 1: 이벤트 구독 (3개 체인 동시)
  Chain A Provider → contract.on("PaymentReceived") → 주문 DB 업데이트
  Chain B Provider → contract.on("PaymentReceived") → 주문 DB 업데이트
  Chain C Provider → contract.on("PaymentReceived") → 주문 DB 업데이트

역할 2: REST API 제공
  POST /api/order       → 주문번호 생성 (결제 시작 전 호출)
  GET  /api/order/:id   → 주문 상태 조회 (프론트가 폴링)
  GET  /api/health      → 서버 상태 확인
```

#### 핵심 코드: 이벤트 구독

```javascript
const contract = new ethers.Contract(address, abi, provider);

contract.on("PaymentReceived", (payer, amount, orderId, event) => {
  // 이벤트 발생 시 주문 DB를 "paid"로 업데이트
  orders.set(orderId, {
    status: "paid",
    chainName,
    payer,
    txHash: event.log.transactionHash,
    amount: ethers.formatEther(amount),
    paidAt: new Date().toISOString(),
  });
});
```

#### 사용 패키지

| 패키지 | 용도 |
|---|---|
| `express` | REST API 서버 |
| `cors` | Next.js(3000)에서 서버(3001) 요청 허용 |
| `ethers` | 블록체인 이벤트 구독 |
| `dotenv` | Next.js 프로젝트 루트의 `.env`에서 `DATABASE_URL` 로드 |
| `@prisma/client` | PostgreSQL 주문 DB 읽기/쓰기 (Next.js 공유 클라이언트 사용) |

#### 서버 실행 방법

```bash
# blockchain-study 디렉토리에서
node server/index.js
```

성공 시 출력:

```
✅ PostgreSQL 연결 성공
✅ Chain A 연결 성공 (chainId: 1337)
✅ Chain B 연결 성공 (chainId: 1338)
✅ Chain C 연결 성공 (chainId: 1339)
✅ 결제 서버 실행 중: http://localhost:3001
```

#### DB 구성: PostgreSQL (Prisma)

`schema.prisma`에 `crypto_payment_orders` 모델을 추가하고 `npx prisma db push`로 테이블을 생성했습니다.

```prisma
model crypto_payment_orders {
  id         Int       @id @default(autoincrement())
  order_id   String    @unique   // 주문 고유번호
  status     String    @default("pending")  // "pending" | "paid"
  amount     String?   // 결제 금액 (ETH)
  chain_name String?   // 결제된 체인 이름
  payer      String?   // 결제자 지갑 주소
  tx_hash    String?   // 트랜잭션 해시
  paid_at    DateTime? // 결제 완료 시각
  created_at DateTime  @default(now())
  updated_at DateTime  @updatedAt
}
```

이벤트 감지 시 `prisma.crypto_payment_orders.upsert()`를 사용해 주문을 생성하거나 업데이트합니다.
upsert를 쓰는 이유: 서버 재시작 전에 발생한 이벤트가 재처리될 경우에도 중복 없이 안전하게 처리됩니다.

| 특성 | 이전 (메모리 Map) | 현재 (PostgreSQL) |
|---|---|---|
| 서버 재시작 시 | 데이터 소멸 | ✅ 데이터 유지 |
| 조회 속도 | 매우 빠름 | 빠름 (인덱스 적용) |
| 중복 처리 | 수동 처리 필요 | ✅ upsert로 자동 처리 |
| 이관 시 변경 사항 | 코드 전체 수정 | orders.set/get → prisma 쿼리만 교체 |

---

### 14.9 4단계: 프론트엔드 ↔ 서버 연동

#### 파일 위치

`app/multi-payment/page.tsx`

#### 핵심 변경 사항

| 항목 | 이전 (3단계까지) | 현재 (4단계 완료) |
|---|---|---|
| 컨트랙트 주소 | 빈 문자열 `""` | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| 결제 방식 | 단순 ETH 전송 (`sendTransaction`) | `contract.pay(orderId)` 컨트랙트 함수 호출 |
| `PayStep` 단계 수 | 3단계 (0~3) | 5단계 (0~5) |
| "받는 주소" 입력 | 있음 | 제거 (컨트랙트가 수신자) |
| 주문번호 | 없음 | 서버에서 발급, UI에 표시 |
| 완료 확인 | TX Hash만 | TX Hash + 주문번호 + DB 확인 완료 메시지 |

#### 결제 흐름 (5단계)

```
[1/4] 주문 생성
  └─ POST http://localhost:3001/api/order
  └─ { orderId: "ORDER-1714284000000-ABCD" } 수신
  └─ 이 orderId가 블록체인 이벤트 ↔ DB를 이어주는 핵심 키

[2/4] MetaMask 네트워크 전환
  └─ wallet_switchEthereumChain (등록된 체인) 또는
  └─ wallet_addEthereumChain (미등록 체인) 자동 처리

[3/4] 컨트랙트 pay() 호출 (MetaMask 서명)
  └─ contract.pay(orderId, { value: ethers.parseEther(amount) })
  └─ 내부적으로 PaymentReceived(payer, amount, orderId) 이벤트 발생
  └─ tx.wait() 로 온체인 확인 대기

[4/4] 서버 폴링 (DB 반영 확인)
  └─ 1.5초 간격, 최대 20회 (30초) 재시도
  └─ GET http://localhost:3001/api/order/:orderId
  └─ { status: "paid" } 응답 시 완료
  └─ 왜 폴링이 필요한가?
       TX 확인 ≠ 서버 DB 업데이트
       서버가 이벤트를 감지→DB 저장하는 데 수십ms~수초 소요
```

#### 핵심 코드 구조

```typescript
// PaymentReceiver 컨트랙트 최소 ABI (pay 함수만 필요)
const RECEIVER_ABI = [
  {
    inputs: [{ internalType: "string", name: "orderId", type: "string" }],
    name: "pay",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

// 결제 흐름
const handlePay = async () => {
  // 1. 서버에 주문 생성
  const { orderId } = await fetch("/api/order", { method: "POST" }).then(r => r.json());

  // 2. 체인 전환
  await switchToChain(selectedCoin);

  // 3. 컨트랙트 호출 (이벤트 발생)
  const contract = new ethers.Contract(contractAddress, RECEIVER_ABI, signer);
  const tx = await contract.pay(orderId, { value: ethers.parseEther(amount) });
  await tx.wait();

  // 4. 서버 폴링 (DB 반영 확인)
  for (let i = 0; i < 20; i++) {
    await sleep(1500);
    const { status } = await fetch(`/api/order/${orderId}`).then(r => r.json());
    if (status === "paid") break;
  }
};
```

#### 왜 단순 ETH 전송이 아닌 컨트랙트를 쓰나?

| 방식 | 특성 | 문제점 |
|---|---|---|
| `sendTransaction(to, value)` | 단순 ETH 전송 | 이벤트 없음 → 서버가 감지 불가 |
| `contract.pay(orderId)` | 이벤트 발생 | 서버가 orderId로 주문 매칭 가능 |

컨트랙트 호출만이 `PaymentReceived` 이벤트를 발생시키고,
서버가 이를 감지해 DB를 `paid`로 업데이트할 수 있습니다.

#### UI 변경 사항

* **"받는 주소" 입력란 제거**: 이제 ETH가 개인 지갑이 아닌 PaymentReceiver 컨트랙트로 이동
* **결제 요약에 "수신 컨트랙트" 주소 표시**: 어떤 컨트랙트로 결제가 가는지 투명하게 표시
* **결제 요약에 "주문번호" 실시간 표시**: 서버에서 발급받는 즉시 UI에 표시
* **진행 상태 바 4단계로 확장**: [주문생성 → 네트워크전환 → 서명 → 서버확인]
* **완료 화면에 주문번호 + TX Hash 함께 표시**

---

### 14.10 5단계: 컨트랙트 업그레이드 — ETH 즉시 포워딩

#### 모티베이션

이전 컨트랙트(`owner` 출금 스타일)는 ETH를 컨트랙트에 철위전략으로 보관한 뒤 `withdraw()`로 꺼내는 2단계 구조였습니다.

업그레이드 동기:

* 실제 서비스에서는 판매자가 개인 지갑으로 바로 받고 싶어 함
* 컨트랙트에 ETH가 잠시 고여있는 동안 보안 리스크 최소화

#### 파일

`blockchain-study/contracts/PaymentReceiver.sol`

#### 컨트랙트 변경 사항

| 항목 | 이전 (owner 출금 방식) | 현재 (즉시 포워딩) |
|---|---|---|
| ETH 이동 시점 | `withdraw()` 호출 시 | `pay()` 호출 즉시 |
| 컨트랙트 잔액 | 쌓임 | 항상 0 |
| 수취인 설정 | 배포자 고정 | `recipient` 변수로 관리, `setRecipient()`으로 변경 가능 |
| 보안 | 컨트랙트 해킹 리스크 | 없음 (ETH를 보유하지 않음) |

#### constructor 변경

```solidity
// 이전: 인자 없음
constructor() {
    owner = msg.sender;
}

// 현재: recipient 주소를 받음
constructor(address payable _recipient) {
    owner     = msg.sender;     // 배포자 (설정 변경 권한)
    recipient = _recipient;     // 판매자 지갑 (ETH 수령)
}
```

#### pay() 동작 변경

```solidity
// 이전: 컨트랙트에 보관
function pay(string calldata orderId) external payable {
    emit PaymentReceived(msg.sender, msg.value, orderId);
    // ETH가 컨트랙트 잔액에 남음
}

// 현재: 즉시 포워딩
function pay(string calldata orderId) external payable {
    (bool sent, ) = recipient.call{value: msg.value}("");  // 즉시 전달
    require(sent, "forward failed");
    emit PaymentReceived(msg.sender, msg.value, orderId);
}
```

#### 배포 스크립트 변경

`deploy-multichain.js`에 `RECIPIENT_ADDRESS` 상수를 추가하고,
`factory.deploy(RECIPIENT_ADDRESS)`로 constructor에 판매자 지갑 주소를 주입합니다.

```javascript
const RECIPIENT_ADDRESS = "0x13F845A27b63EF4F693DBB4571C0104dFf232730";  // 판매자 지갑
const contract = await factory.deploy(RECIPIENT_ADDRESS);
```

#### Ganache 재시작 시 컨트랙트 주소 규칙

Ganache를 재시작하면 nonce가 0으로 초기화됩니다.
따라서 **재배포 후 컨트랙트 주소는 항상 동일합니다.**

| Ganache 재시작 | 위 | 결과 |
|---|---|---|
| 체인 데이터 | 소멸됨 | 트랜잭션 이력 모두 사라짐 |
| 컨트랙트 | 소멸됨 | 재배포 필요 |
| 재배포 후 주소 | 배포자 주소 + nonce | `0x5FbDB...` (항상 동일) |

> **팁**: Ganache 재시작 후 순서
>
> 1. `node scripts/deploy-multichain.js` (컨트랙트 재배포)
> 2. `node server/index.js` (결제 서버 재시작)

#### 현재 실행 중인 프로세스 (2026-04-28 기준)

| 프로세스 | 포트 | 역할 |
|---|---|---|
| `npm run dev` | 3000 | Next.js 프론트엔드 |
| Ganache Chain A | 8545 | 로컬 이더리움 체인 A (chainId: 1337) |
| Ganache Chain B | 8546 | 로컬 이더리움 체인 B (chainId: 1338) |
| Ganache Chain C | 8547 | 로컬 이더리움 체인 C (chainId: 1339) |
| `node server/index.js` | 3001 | 결제 모니터링 서버 (PostgreSQL) |

#### 현재 컨트랙트 주소

```text
0x5FbDB2315678afecb367f032d93F642f64180aa3 (Chain A / B / C 모두 동일)
```

#### ETH 수취 구조

```text
결제자 지갑 → pay(orderId) 호출 → PaymentReceiver 컨트랙트
                                        ↓ 즉시 포워딩
                           판매자 지갑: 0x13F845A27b63EF4F693DBB4571C0104dFf232730
```

