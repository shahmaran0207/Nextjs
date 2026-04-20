# Requirements Document

## Introduction

이 문서는 디지털 트윈 지도(TwinMap)에 국토교통부 ITS(Intelligent Transport Systems) 도로 CCTV 통합 기능을 추가하기 위한 요구사항을 정의합니다. 이 기능은 부산 지역의 실시간 도로 CCTV 데이터를 가져와 지도에 표시하고, 사용자가 CCTV 마커를 클릭하여 실시간 HLS 영상을 볼 수 있도록 합니다. 기존의 공사현장, 관광지, 버스정류장 마커와 동일한 패턴을 따르며, 사이버펑크 디자인 스타일을 유지합니다.

## Glossary

- **ITS_API**: 국토교통부 ITS(Intelligent Transport Systems) OpenAPI 서비스
- **CCTV_Data_Fetcher**: ITS API로부터 CCTV 데이터를 가져오는 서버 측 컴포넌트
- **TwinMap**: 디지털 트윈 지도를 표시하는 메인 React 컴포넌트
- **CCTV_Marker**: 지도에 표시되는 CCTV 위치 마커
- **CCTV_Cluster**: Supercluster를 사용하여 그룹화된 CCTV 마커들
- **HLS_Player**: HTTP Live Streaming 비디오를 재생하는 플레이어 컴포넌트
- **CCTV_Popup**: CCTV 마커 클릭 시 나타나는 영상 플레이어 팝업
- **Dashboard_Panel**: 통계 정보를 표시하는 대시보드 UI 컴포넌트
- **Environment_Variable**: 환경 변수 파일(.env)에 저장된 설정 값
- **Busan_Coordinates**: 부산 지역의 지리적 좌표 범위 (minX=128.8, maxX=129.3, minY=34.9, maxY=35.4)

## Requirements

### Requirement 1: ITS API 데이터 가져오기

**User Story:** 개발자로서, ITS API로부터 부산 지역의 CCTV 데이터를 가져올 수 있어야 하므로, 지도에 CCTV 위치를 표시할 수 있습니다.

#### Acceptance Criteria

1. THE CCTV_Data_Fetcher SHALL fetch CCTV data from the ITS_API endpoint `https://openapi.its.go.kr:9443/cctvInfo`
2. WHEN fetching CCTV data, THE CCTV_Data_Fetcher SHALL include the API key from Environment_Variable `ITS_CCTV_KEY`
3. WHEN fetching CCTV data, THE CCTV_Data_Fetcher SHALL filter by CCTV type 4 (HLS HTTPS streaming)
4. WHEN fetching CCTV data, THE CCTV_Data_Fetcher SHALL filter by Busan_Coordinates (minX=128.8, maxX=129.3, minY=34.9, maxY=35.4)
5. THE CCTV_Data_Fetcher SHALL parse the JSON response containing fields: cctvname, coordx, coordy, cctvurl, cctvtype, cctvformat
6. WHEN the API request fails, THE CCTV_Data_Fetcher SHALL return an error response with status code and error message
7. THE CCTV_Data_Fetcher SHALL transform the API response into a normalized data structure with fields: gid, lng, lat, name, url, type, format

### Requirement 2: API 라우트 생성

**User Story:** 개발자로서, Next.js API 라우트를 통해 CCTV 데이터를 제공받을 수 있어야 하므로, 클라이언트에서 데이터를 사용할 수 있습니다.

#### Acceptance Criteria

1. THE CCTV_Data_Fetcher SHALL expose an API route at `/api/GIS/Busan/CCTV/getCCTVList`
2. WHEN the API route is called, THE CCTV_Data_Fetcher SHALL return CCTV data in JSON format
3. WHEN the API route is called, THE CCTV_Data_Fetcher SHALL set appropriate HTTP headers (Content-Type: application/json)
4. IF the ITS_API request fails, THEN THE CCTV_Data_Fetcher SHALL return HTTP status 500 with error details
5. IF the Environment_Variable `ITS_CCTV_KEY` is missing, THEN THE CCTV_Data_Fetcher SHALL return HTTP status 500 with configuration error message

### Requirement 3: TwinMap에 CCTV 데이터 통합

**User Story:** 사용자로서, 디지털 트윈 지도에서 CCTV 위치를 볼 수 있어야 하므로, 도로 상황을 모니터링할 수 있습니다.

#### Acceptance Criteria

1. WHEN TwinMap loads, THE TwinMap SHALL fetch CCTV data from `/api/GIS/Busan/CCTV/getCCTVList`
2. THE TwinMap SHALL store CCTV data in component state
3. THE TwinMap SHALL create a Supercluster index for CCTV data with radius 80 and maxZoom 18
4. THE TwinMap SHALL generate CCTV clusters based on current viewport bounds and zoom level
5. THE TwinMap SHALL pass CCTV clusters to layer creation functions
6. WHEN CCTV data fetch fails, THE TwinMap SHALL log the error and continue rendering without CCTV markers

### Requirement 4: CCTV 마커 레이어 생성

**User Story:** 사용자로서, 지도에 CCTV 마커가 사이버펑크 스타일로 표시되어야 하므로, 기존 디자인과 일관성을 유지할 수 있습니다.

#### Acceptance Criteria

1. THE CCTV_Marker SHALL use a camera icon (📹) as the marker symbol
2. THE CCTV_Marker SHALL use cyan color (#38bdf8) for the marker fill
3. THE CCTV_Marker SHALL use a glow effect with rgba(56,189,248,0.4) shadow
4. WHEN zoom level is greater than or equal to 14, THE CCTV_Marker SHALL render individual markers
5. WHEN zoom level is less than 14, THE CCTV_Cluster SHALL render cluster markers with point count
6. THE CCTV_Cluster SHALL display the number of CCTVs in the cluster
7. THE CCTV_Marker SHALL have a size of 32 pixels for individual markers
8. THE CCTV_Cluster SHALL have a size proportional to the cluster point count (minimum 40, maximum 80 pixels)

### Requirement 5: CCTV 마커 상호작용

**User Story:** 사용자로서, CCTV 마커에 마우스를 올리면 정보를 볼 수 있어야 하므로, CCTV 위치와 이름을 확인할 수 있습니다.

#### Acceptance Criteria

1. WHEN the user hovers over a CCTV_Marker, THE TwinMap SHALL display a tooltip with CCTV name and location
2. THE TwinMap SHALL format the tooltip content as "📹 [CCTV name]"
3. WHEN the user hovers over a CCTV_Cluster, THE TwinMap SHALL display a tooltip showing the cluster count
4. THE TwinMap SHALL format the cluster tooltip as "📹 CCTV [count]개"
5. WHEN the user moves the mouse away, THE TwinMap SHALL hide the tooltip

### Requirement 6: CCTV 영상 플레이어 팝업

**User Story:** 사용자로서, CCTV 마커를 클릭하면 실시간 영상을 볼 수 있어야 하므로, 도로 상황을 실시간으로 확인할 수 있습니다.

#### Acceptance Criteria

1. WHEN the user clicks a CCTV_Marker, THE TwinMap SHALL open a CCTV_Popup
2. THE CCTV_Popup SHALL display the CCTV name as a header
3. THE CCTV_Popup SHALL contain an HLS_Player component
4. THE HLS_Player SHALL load the HLS stream from the CCTV URL
5. THE HLS_Player SHALL use hls.js library for HLS playback
6. THE CCTV_Popup SHALL have a close button (X) in the top-right corner
7. WHEN the user clicks the close button, THE TwinMap SHALL close the CCTV_Popup
8. THE CCTV_Popup SHALL use cyberpunk design style with dark background (rgba(10,14,26,0.92)) and cyan border (rgba(56,189,248,0.2))
9. THE CCTV_Popup SHALL have backdrop blur effect (blur(16px))
10. IF the HLS stream fails to load, THEN THE HLS_Player SHALL display an error message "영상을 불러올 수 없습니다"

### Requirement 7: 대시보드 CCTV 통계

**User Story:** 사용자로서, 대시보드에서 CCTV 개수를 볼 수 있어야 하므로, 전체 CCTV 현황을 파악할 수 있습니다.

#### Acceptance Criteria

1. THE Dashboard_Panel SHALL display total CCTV count
2. THE Dashboard_Panel SHALL format the CCTV stat card with camera icon (📹) and label "도로 CCTV"
3. THE Dashboard_Panel SHALL display the CCTV count in cyan color (#38bdf8)
4. THE Dashboard_Panel SHALL position the CCTV stat card after the "지연 프로젝트" card
5. WHEN the user clicks the CCTV stat card, THE Dashboard_Panel SHALL trigger a callback to show all CCTV markers
6. THE Dashboard_Panel SHALL apply hover effect (background: rgba(56,189,248,0.08)) on the CCTV stat card

### Requirement 8: 환경 변수 설정

**User Story:** 개발자로서, ITS API 키를 안전하게 관리할 수 있어야 하므로, 보안을 유지할 수 있습니다.

#### Acceptance Criteria

1. THE Environment_Variable SHALL store the ITS API key with name `ITS_CCTV_KEY`
2. THE Environment_Variable SHALL be defined in the `.env.local` file
3. THE CCTV_Data_Fetcher SHALL access the API key using `process.env.ITS_CCTV_KEY`
4. THE Environment_Variable SHALL NOT be exposed to the client-side code
5. THE Environment_Variable SHALL be documented in the project README or environment setup guide

### Requirement 9: 에러 처리 및 로딩 상태

**User Story:** 사용자로서, 데이터 로딩 중이거나 에러가 발생했을 때 적절한 피드백을 받아야 하므로, 시스템 상태를 이해할 수 있습니다.

#### Acceptance Criteria

1. WHILE CCTV data is loading, THE TwinMap SHALL display a loading indicator or skip rendering CCTV markers
2. IF CCTV data fetch fails, THEN THE TwinMap SHALL log the error to console
3. IF CCTV data fetch fails, THEN THE TwinMap SHALL continue rendering other map features (construction, tourism, bus stops)
4. WHEN the HLS_Player encounters a network error, THE HLS_Player SHALL display error message "네트워크 오류가 발생했습니다"
5. WHEN the HLS_Player encounters an unsupported format error, THE HLS_Player SHALL display error message "지원하지 않는 영상 형식입니다"

### Requirement 10: 성능 최적화

**User Story:** 개발자로서, CCTV 데이터가 지도 성능에 영향을 주지 않아야 하므로, 사용자 경험을 유지할 수 있습니다.

#### Acceptance Criteria

1. THE TwinMap SHALL use useMemo hook to memoize CCTV Supercluster index
2. THE TwinMap SHALL recompute CCTV clusters only when viewport bounds or zoom level changes
3. THE TwinMap SHALL limit CCTV data fetch to once per component mount
4. THE CCTV_Marker SHALL use IconLayer from deck.gl for efficient rendering
5. THE TwinMap SHALL render CCTV layers with the same z-index priority as other point layers (construction, tourism)

