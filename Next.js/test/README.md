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

---

## 8. 🔌 핵심 백엔드 API 명세서

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
