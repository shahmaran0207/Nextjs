/**
 * 카테고리 필터링 유틸리티 함수
 */

/**
 * 선택된 카테고리에 따라 데이터를 필터링합니다.
 * 
 * @template T - 데이터 항목 타입
 * @param data - 필터링할 데이터 배열
 * @param selectedCategories - 선택된 카테고리 Set
 * @param getCategoryKey - 항목에서 카테고리 키를 추출하는 함수
 * @returns 필터링된 데이터 배열
 * 
 * @example
 * const data = [
 *   { id: 1, category: 'A', name: 'Item 1' },
 *   { id: 2, category: 'B', name: 'Item 2' },
 *   { id: 3, category: 'A', name: 'Item 3' },
 * ];
 * const selected = new Set(['A']);
 * const filtered = filterByCategories(data, selected, (item) => item.category);
 * // 결과: [{ id: 1, category: 'A', name: 'Item 1' }, { id: 3, category: 'A', name: 'Item 3' }]
 * 
 * @remarks
 * - 선택된 카테고리가 없으면 모든 데이터를 반환합니다
 * - 선택된 카테고리 중 하나라도 일치하면 항목이 포함됩니다 (OR 조건)
 */
export function filterByCategories<T>(
  data: T[],
  selectedCategories: Set<string>,
  getCategoryKey: (item: T) => string
): T[] {
  // 선택된 카테고리가 없으면 모든 데이터 반환
  if (selectedCategories.size === 0) {
    return data;
  }
  
  // 선택된 카테고리에 속하는 항목만 필터링
  return data.filter((item) => {
    const categoryKey = getCategoryKey(item);
    return selectedCategories.has(categoryKey);
  });
}

/**
 * 데이터에서 카테고리별 항목 수를 계산합니다.
 * 
 * @template T - 데이터 항목 타입
 * @param data - 데이터 배열
 * @param getCategoryKey - 항목에서 카테고리 키를 추출하는 함수
 * @returns 카테고리별 항목 수 Map
 * 
 * @example
 * const data = [
 *   { id: 1, category: 'A' },
 *   { id: 2, category: 'B' },
 *   { id: 3, category: 'A' },
 * ];
 * const counts = getCategoryCounts(data, (item) => item.category);
 * // 결과: Map { 'A' => 2, 'B' => 1 }
 */
export function getCategoryCounts<T>(
  data: T[],
  getCategoryKey: (item: T) => string
): Map<string, number> {
  const counts = new Map<string, number>();
  
  data.forEach((item) => {
    const categoryKey = getCategoryKey(item);
    const currentCount = counts.get(categoryKey) || 0;
    counts.set(categoryKey, currentCount + 1);
  });
  
  return counts;
}

/**
 * 여러 카테고리를 선택/해제합니다.
 * 
 * @param currentSelection - 현재 선택된 카테고리 Set
 * @param categoriesToToggle - 토글할 카테고리 배열
 * @returns 새로운 선택 Set
 * 
 * @example
 * const current = new Set(['A', 'B']);
 * const toggled = toggleCategories(current, ['B', 'C']);
 * // 결과: Set { 'A', 'C' } (B는 제거되고 C는 추가됨)
 */
export function toggleCategories(
  currentSelection: Set<string>,
  categoriesToToggle: string[]
): Set<string> {
  const newSelection = new Set(currentSelection);
  
  categoriesToToggle.forEach((category) => {
    if (newSelection.has(category)) {
      newSelection.delete(category);
    } else {
      newSelection.add(category);
    }
  });
  
  return newSelection;
}

/**
 * 단일 카테고리를 토글합니다.
 * 
 * @param currentSelection - 현재 선택된 카테고리 Set
 * @param category - 토글할 카테고리
 * @returns 새로운 선택 Set
 * 
 * @example
 * const current = new Set(['A', 'B']);
 * const toggled = toggleCategory(current, 'B');
 * // 결과: Set { 'A' } (B가 제거됨)
 */
export function toggleCategory(
  currentSelection: Set<string>,
  category: string
): Set<string> {
  return toggleCategories(currentSelection, [category]);
}

/**
 * 필터링된 데이터가 클러스터 포인트에 포함되는지 확인합니다.
 * 
 * @template T - 데이터 항목 타입
 * @param clusterPoints - 클러스터 포인트 배열
 * @param filteredData - 필터링된 데이터 배열
 * @param getPointId - 포인트에서 ID를 추출하는 함수
 * @param getDataId - 데이터에서 ID를 추출하는 함수
 * @returns 모든 클러스터 포인트가 필터링된 데이터에 포함되면 true
 * 
 * @example
 * const clusterPoints = [{ id: 1 }, { id: 3 }];
 * const filteredData = [{ id: 1 }, { id: 2 }, { id: 3 }];
 * const isConsistent = isClusterConsistentWithFilter(
 *   clusterPoints,
 *   filteredData,
 *   (p) => p.id,
 *   (d) => d.id
 * );
 * // 결과: true (모든 클러스터 포인트가 필터링된 데이터에 포함됨)
 */
export function isClusterConsistentWithFilter<T, P>(
  clusterPoints: P[],
  filteredData: T[],
  getPointId: (point: P) => any,
  getDataId: (data: T) => any
): boolean {
  const filteredIds = new Set(filteredData.map(getDataId));
  
  return clusterPoints.every((point) => {
    const pointId = getPointId(point);
    return filteredIds.has(pointId);
  });
}
