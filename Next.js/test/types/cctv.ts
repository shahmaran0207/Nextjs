/**
 * CCTV 데이터 타입 정의
 * ITS (Intelligent Transport Systems) API 통합을 위한 타입
 */

/**
 * 정규화된 CCTV 포인트 데이터
 * 클라이언트에서 사용하는 표준 형식
 */
export interface CCTVPoint {
  gid: number;           // 고유 ID (클라이언트 측 생성)
  lng: number;           // 경도 (ITS API: coordx)
  lat: number;           // 위도 (ITS API: coordy)
  name: string;          // CCTV 이름 (ITS API: cctvname)
  url: string;           // HLS 스트림 URL (ITS API: cctvurl)
  type: string;          // CCTV 타입 (ITS API: cctvtype)
  format: string;        // 영상 포맷 (ITS API: cctvformat)
}

/**
 * ITS API 원본 응답 구조
 */
export interface ITSCctvResponse {
  response: {
    comMsgHeader: {
      responseTime: string;
      requestMsgID: string;
      responseMsgID: string;
      returnCode: string;
    };
    msgHeader: {
      queryTime: string;
      resultCode: string;
      resultMessage: string;
    };
    body: {
      items: ITSCctvItem[];
    };
  };
}

/**
 * ITS API 개별 CCTV 아이템
 */
export interface ITSCctvItem {
  cctvname: string;      // CCTV 이름
  cctvurl: string;       // HLS 스트림 URL
  coordx: string;        // 경도 (문자열)
  coordy: string;        // 위도 (문자열)
  cctvtype: string;      // CCTV 타입
  cctvformat: string;    // 영상 포맷
}

/**
 * Supercluster Feature 타입
 * GeoJSON Feature 형식
 */
export interface CCTVFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: CCTVPoint;
}

/**
 * Supercluster Cluster 타입
 * 클러스터링된 포인트 그룹
 */
export interface CCTVCluster {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    cluster: true;
    cluster_id: number;
    point_count: number;
    point_count_abbreviated: string;
  };
}

/**
 * API 응답 타입 (성공)
 */
export interface CCTVApiSuccessResponse {
  data: CCTVPoint[];
}

/**
 * API 응답 타입 (에러)
 */
export interface CCTVApiErrorResponse {
  error: string;
  details?: string;
}

/**
 * API 응답 타입 (통합)
 */
export type CCTVApiResponse = CCTVApiSuccessResponse | CCTVApiErrorResponse;
