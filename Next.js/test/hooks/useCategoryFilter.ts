import { useState, useMemo, useCallback } from 'react';
import { CategoryFilterConfig, CategoryFilter } from '@/types/ui-ux';
import { filterByCategories, getCategoryCounts } from '@/utils/filterUtils';

/**
 * 카테고리 필터링을 관리하는 커스텀 Hook
 * 
 * @template T - 데이터 항목 타입
 * @param config - 필터 설정
 * @returns 필터 상태 및 제어 함수
 * 
 * @example
 * const { filteredData, toggleCategory, clearFilters } = useCategoryFilter({
 *   data: tourismData,
 *   getCategoryKey: (item) => item.category_name || '',
 * });
 */
export function useCategoryFilter<T>(
  config: CategoryFilterConfig<T>
): CategoryFilter<T> {
  const { data, getCategoryKey } = config;
  
  // 선택된 카테고리 상태
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  
  // 필터링된 데이터 (메모이제이션)
  const filteredData = useMemo(() => {
    return filterByCategories(data, selectedCategories, getCategoryKey);
  }, [data, selectedCategories, getCategoryKey]);
  
  // 카테고리별 항목 수 (메모이제이션)
  const categories = useMemo(() => {
    return getCategoryCounts(data, getCategoryKey);
  }, [data, getCategoryKey]);
  
  // 필터가 활성화되어 있는지 여부
  const isFiltered = selectedCategories.size > 0;
  
  // 단일 카테고리 토글
  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);
  
  // 여러 카테고리 선택
  const selectCategories = useCallback((categories: string[]) => {
    setSelectedCategories(new Set(categories));
  }, []);
  
  // 필터 초기화
  const clearFilters = useCallback(() => {
    setSelectedCategories(new Set());
  }, []);
  
  return {
    selectedCategories,
    filteredData,
    categories,
    toggleCategory,
    selectCategories,
    clearFilters,
    isFiltered,
  };
}
