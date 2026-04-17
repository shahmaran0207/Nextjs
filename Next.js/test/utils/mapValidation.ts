/**
 * 지도 관련 유효성 검증 유틸리티 함수
 */

/**
 * 좌표가 유효한지 검증합니다.
 * 
 * @param lng - 경도 (longitude)
 * @param lat - 위도 (latitude)
 * @returns 좌표가 유효하면 true, 그렇지 않으면 false
 * 
 * @example
 * isValidCoordinate(129.0756, 35.1796) // true (부산)
 * isValidCoordinate(NaN, 35.1796) // false
 * isValidCoordinate(200, 35.1796) // false (경도 범위 초과)
 */
export function isValidCoordinate(lng: number, lat: number): boolean {
  return (
    !isNaN(lng) &&
    !isNaN(lat) &&
    isFinite(lng) &&
    isFinite(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
}

/**
 * 줌 레벨이 유효한지 검증합니다.
 * 
 * @param zoom - 줌 레벨
 * @param minZoom - 최소 줌 레벨 (기본값: 10)
 * @param maxZoom - 최대 줌 레벨 (기본값: 18)
 * @returns 줌 레벨이 유효하면 true, 그렇지 않으면 false
 * 
 * @example
 * isValidZoomLevel(12) // true
 * isValidZoomLevel(5) // false (최소값 미만)
 * isValidZoomLevel(20) // false (최대값 초과)
 */
export function isValidZoomLevel(
  zoom: number,
  minZoom: number = 10,
  maxZoom: number = 18
): boolean {
  return !isNaN(zoom) && isFinite(zoom) && zoom >= minZoom && zoom <= maxZoom;
}

/**
 * District 중심 좌표를 계산하거나 기본 좌표를 반환합니다.
 * 
 * @param district - District 경계 데이터
 * @returns [경도, 위도] 좌표
 * 
 * @example
 * getDistrictCenter({ center: [129.0756, 35.1796] }) // [129.0756, 35.1796]
 * getDistrictCenter({ contour: [[129.0, 35.0], [129.1, 35.1]] }) // 중심 계산
 * getDistrictCenter(undefined) // [129.0756, 35.1796] (기본 부산 좌표)
 */
export function getDistrictCenter(
  district?: { center?: [number, number]; contour?: [number, number][] }
): [number, number] {
  if (!district) {
    // 기본 부산 중심 좌표
    return [129.0756, 35.1796];
  }
  
  // center가 있으면 사용
  if (district.center) {
    const [lng, lat] = district.center;
    
    // 좌표 유효성 검증
    if (isValidCoordinate(lng, lat)) {
      return district.center;
    }
  }
  
  // contour에서 중심 계산
  if (district.contour && district.contour.length > 0) {
    let sumLng = 0;
    let sumLat = 0;
    let count = 0;
    
    for (const [lng, lat] of district.contour) {
      if (isValidCoordinate(lng, lat)) {
        sumLng += lng;
        sumLat += lat;
        count++;
      }
    }
    
    if (count > 0) {
      return [sumLng / count, sumLat / count];
    }
  }
  
  // 기본 부산 중심 좌표
  return [129.0756, 35.1796];
}

/**
 * 적절한 줌 레벨을 계산합니다.
 * 
 * @param bounds - 경계 박스 [[minLng, minLat], [maxLng, maxLat]]
 * @param defaultZoom - 기본 줌 레벨 (기본값: 13)
 * @returns 계산된 줌 레벨
 * 
 * @example
 * calculateZoomLevel([[129.0, 35.0], [129.2, 35.2]]) // 12 (예시)
 * calculateZoomLevel(undefined) // 13 (기본값)
 */
export function calculateZoomLevel(
  bounds?: [[number, number], [number, number]],
  defaultZoom: number = 13
): number {
  if (!bounds) {
    return defaultZoom;
  }
  
  const [[minLng, minLat], [maxLng, maxLat]] = bounds;
  
  // 경계 박스의 크기 계산
  const lngDiff = Math.abs(maxLng - minLng);
  const latDiff = Math.abs(maxLat - minLat);
  const maxDiff = Math.max(lngDiff, latDiff);
  
  // 크기에 따라 줌 레벨 계산 (간단한 휴리스틱)
  let zoom: number;
  if (maxDiff > 0.5) {
    zoom = 10;
  } else if (maxDiff > 0.2) {
    zoom = 11;
  } else if (maxDiff > 0.1) {
    zoom = 12;
  } else if (maxDiff > 0.05) {
    zoom = 13;
  } else if (maxDiff > 0.02) {
    zoom = 14;
  } else {
    zoom = 15;
  }
  
  // 유효한 범위 내로 제한
  return Math.max(10, Math.min(18, zoom));
}
