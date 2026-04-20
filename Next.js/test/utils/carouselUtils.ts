/**
 * 순환(Carousel) 관련 유틸리티 함수
 */

/**
 * 다음 인덱스를 계산합니다 (순환).
 * 
 * @param currentIndex - 현재 인덱스
 * @param length - 배열 길이
 * @returns 다음 인덱스 (마지막 인덱스 다음은 0)
 * 
 * @example
 * getNextIndex(0, 5) // 1
 * getNextIndex(4, 5) // 0 (순환)
 * getNextIndex(2, 5) // 3
 * 
 * @throws {Error} length가 0 이하인 경우
 */
export function getNextIndex(currentIndex: number, length: number): number {
  if (length <= 0) {
    throw new Error('Length must be greater than 0');
  }
  
  return (currentIndex + 1) % length;
}

/**
 * 이전 인덱스를 계산합니다 (순환).
 * 
 * @param currentIndex - 현재 인덱스
 * @param length - 배열 길이
 * @returns 이전 인덱스 (0 이전은 마지막 인덱스)
 * 
 * @example
 * getPreviousIndex(1, 5) // 0
 * getPreviousIndex(0, 5) // 4 (순환)
 * getPreviousIndex(3, 5) // 2
 * 
 * @throws {Error} length가 0 이하인 경우
 */
export function getPreviousIndex(currentIndex: number, length: number): number {
  if (length <= 0) {
    throw new Error('Length must be greater than 0');
  }
  
  return (currentIndex - 1 + length) % length;
}

/**
 * 순환 UI 표시 텍스트를 생성합니다.
 * 
 * @param currentIndex - 현재 인덱스 (0-based)
 * @param totalCount - 전체 항목 수
 * @returns "{현재 번호} / {전체 수}" 형식의 문자열
 * 
 * @example
 * getCarouselDisplayText(0, 5) // "1 / 5"
 * getCarouselDisplayText(2, 12) // "3 / 12"
 * getCarouselDisplayText(4, 5) // "5 / 5"
 */
export function getCarouselDisplayText(
  currentIndex: number,
  totalCount: number
): string {
  return `${currentIndex + 1} / ${totalCount}`;
}

/**
 * 인덱스가 유효한 범위 내에 있는지 확인합니다.
 * 
 * @param index - 확인할 인덱스
 * @param length - 배열 길이
 * @returns 인덱스가 유효하면 true
 * 
 * @example
 * isValidIndex(0, 5) // true
 * isValidIndex(4, 5) // true
 * isValidIndex(5, 5) // false
 * isValidIndex(-1, 5) // false
 */
export function isValidIndex(index: number, length: number): boolean {
  return index >= 0 && index < length && Number.isInteger(index);
}

/**
 * 안전하게 인덱스를 유효한 범위로 제한합니다.
 * 
 * @param index - 제한할 인덱스
 * @param length - 배열 길이
 * @returns 유효한 범위 내의 인덱스
 * 
 * @example
 * clampIndex(5, 5) // 4 (최대값으로 제한)
 * clampIndex(-1, 5) // 0 (최소값으로 제한)
 * clampIndex(2, 5) // 2 (변경 없음)
 */
export function clampIndex(index: number, length: number): number {
  if (length <= 0) {
    return 0;
  }
  
  return Math.max(0, Math.min(length - 1, Math.floor(index)));
}

/**
 * 순환 간격(interval)이 유효한지 확인합니다.
 * 
 * @param interval - 확인할 간격 (밀리초)
 * @param minInterval - 최소 간격 (기본값: 1000ms)
 * @param maxInterval - 최대 간격 (기본값: 10000ms)
 * @returns 간격이 유효하면 true
 * 
 * @example
 * isValidInterval(3000) // true
 * isValidInterval(500) // false (최소값 미만)
 * isValidInterval(15000) // false (최대값 초과)
 */
export function isValidInterval(
  interval: number,
  minInterval: number = 1000,
  maxInterval: number = 10000
): boolean {
  return (
    !isNaN(interval) &&
    isFinite(interval) &&
    interval >= minInterval &&
    interval <= maxInterval
  );
}
