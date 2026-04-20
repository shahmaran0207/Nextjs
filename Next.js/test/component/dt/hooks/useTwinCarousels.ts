import { useState, useMemo, useCallback } from 'react';
import { useCarouselController } from '@/hooks/useCarouselController';
import { CarouselItem } from '@/types/ui-ux';
import { ConstructionPoint, ThemeTravelPoint } from '@/component/dt/modules/DashboardStatsModule';

interface UseTwinCarouselsProps {
  filteredTourismData: ThemeTravelPoint[];
  filteredConstructionByCategory: ConstructionPoint[];
  flyTo: (coordinates: [number, number], zoom?: number) => void;
}

/**
 * 관광/공사 카테고리별 마커 자동 순환(Carousel)을 관리하는 Hook
 * - 카테고리 클릭 시 해당 마커들을 순서대로 flyTo
 * - 같은 카테고리 재클릭 시 순환 중지
 * - 두 카루젤은 서로 배타적(하나 활성화 시 나머지 중지)
 *
 * @param filteredTourismData - 카테고리 필터링된 테마여행 데이터
 * @param filteredConstructionByCategory - 카테고리 필터링된 공사 데이터
 * @param flyTo - 지도 이동 함수
 */
export function useTwinCarousels({
  filteredTourismData,
  filteredConstructionByCategory,
  flyTo,
}: UseTwinCarouselsProps) {
  // ─── 관광 카루젤 ───────────────────────────────────────────────

  const [selectedTourismCategoryForCarousel, setSelectedTourismCategoryForCarousel] =
    useState<string | null>(null);

  /** 선택된 카테고리의 관광 항목을 CarouselItem으로 변환 */
  const tourismCarouselItems = useMemo(() => {
    if (!selectedTourismCategoryForCarousel) return [];
    return filteredTourismData
      .filter((item) => (item.category_name || '기타') === selectedTourismCategoryForCarousel)
      .map((item) => ({
        id: `tourism-${item.gid}`,
        coordinates: [item.lng, item.lat] as [number, number],
        data: item,
      }));
  }, [selectedTourismCategoryForCarousel, filteredTourismData]);

  const tourismCarousel = useCarouselController({
    items: tourismCarouselItems,
    interval: 7000, // 7초마다 순환
    animationDuration: 500,
    onItemChange: useCallback((item: CarouselItem) => {
      // 지도를 해당 항목 위치로 이동
      flyTo(item.coordinates, 16);
    }, [flyTo]),
  });

  // ─── 공사 카루젤 ───────────────────────────────────────────────

  const [selectedConstructionCategoryForCarousel, setSelectedConstructionCategoryForCarousel] =
    useState<string | null>(null);

  /** 선택된 분야의 공사 항목을 CarouselItem으로 변환 */
  const constructionCarouselItems = useMemo(() => {
    if (!selectedConstructionCategoryForCarousel) return [];
    return filteredConstructionByCategory
      .filter((item) => (item.field_code || 'F08') === selectedConstructionCategoryForCarousel)
      .map((item) => ({
        id: `construction-${item.gid}`,
        coordinates: [item.lng, item.lat] as [number, number],
        data: item,
      }));
  }, [selectedConstructionCategoryForCarousel, filteredConstructionByCategory]);

  const constructionCarousel = useCarouselController({
    items: constructionCarouselItems,
    interval: 7000, // 7초마다 순환
    animationDuration: 500,
    onItemChange: useCallback((item: CarouselItem) => {
      // 지도를 해당 항목 위치로 이동 (마커가 중앙에 오도록)
      flyTo(item.coordinates, 17);
    }, [flyTo]),
  });

  // ─── 핸들러 ───────────────────────────────────────────────────

  /** 관광 카테고리 클릭: 같은 카테고리 재클릭 시 중지, 다른 카테고리 클릭 시 시작 */
  const handleTourismCategoryPress = (categoryId: string) => {
    if (selectedTourismCategoryForCarousel === categoryId && tourismCarousel.isActive) {
      tourismCarousel.stop();
      setSelectedTourismCategoryForCarousel(null);
    } else {
      // 공사 순환이 활성화되어 있으면 먼저 중지
      if (constructionCarousel.isActive) {
        constructionCarousel.stop();
        setSelectedConstructionCategoryForCarousel(null);
      }
      setSelectedTourismCategoryForCarousel(categoryId);
      tourismCarousel.start();
    }
  };

  /** 공사 분야 클릭: 같은 분야 재클릭 시 중지, 다른 분야 클릭 시 시작 */
  const handleConstructionCategoryPress = (categoryId: string) => {
    if (selectedConstructionCategoryForCarousel === categoryId && constructionCarousel.isActive) {
      constructionCarousel.stop();
      setSelectedConstructionCategoryForCarousel(null);
    } else {
      // 관광 순환이 활성화되어 있으면 먼저 중지
      if (tourismCarousel.isActive) {
        tourismCarousel.stop();
        setSelectedTourismCategoryForCarousel(null);
      }
      setSelectedConstructionCategoryForCarousel(categoryId);
      constructionCarousel.start();
    }
  };

  // ─── DashboardPanel에 전달할 활성 상태 ──────────────────────────

  const activeCarouselCategory = tourismCarousel.isActive
    ? selectedTourismCategoryForCarousel
    : constructionCarousel.isActive
      ? selectedConstructionCategoryForCarousel
      : null;

  const activeCarouselType: 'tourism' | 'construction' | null = tourismCarousel.isActive
    ? 'tourism'
    : constructionCarousel.isActive
      ? 'construction'
      : null;

  return {
    // 관광 카루젤
    selectedTourismCategoryForCarousel,
    tourismCarousel,
    tourismCarouselItems,
    handleTourismCategoryPress,
    // 공사 카루젤
    selectedConstructionCategoryForCarousel,
    constructionCarousel,
    constructionCarouselItems,
    handleConstructionCategoryPress,
    // DashboardPanel prop용 활성 상태
    activeCarouselCategory,
    activeCarouselType,
  };
}
