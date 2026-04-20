import { useMemo, useState, useEffect } from 'react';
import {
  calculateStats,
  DashboardStats,
  ConstructionPoint,
  ThemeTravelPoint,
  BoundaryFeature,
} from '../modules/DashboardStatsModule';

export interface UseDashboardStatsReturn {
  stats: DashboardStats;
  isLoading: boolean;
  refreshStats: () => void;
}

/**
 * Hook for calculating and managing dashboard statistics
 * @param construction - Array of construction projects
 * @param tourism - Array of tourism points
 * @param boundaries - Array of boundary features
 * @param cctvData - Array of CCTV points
 * @param viewportBbox - Optional viewport bounding box for filtering
 * @returns Dashboard statistics and control functions
 */
export function useDashboardStats(
  construction: ConstructionPoint[],
  tourism: ThemeTravelPoint[],
  boundaries: BoundaryFeature[],
  cctvData?: any[],
  viewportBbox?: [number, number, number, number]
): UseDashboardStatsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Calculate stats with useMemo to avoid recalculation on every render
  const stats = useMemo(() => {
    // If viewport bbox is provided, filter construction data
    let filteredConstruction = construction;
    if (viewportBbox) {
      const [minLng, minLat, maxLng, maxLat] = viewportBbox;
      filteredConstruction = construction.filter((c) => {
        return (
          c.lng >= minLng &&
          c.lng <= maxLng &&
          c.lat >= minLat &&
          c.lat <= maxLat
        );
      });
    }

    return calculateStats(filteredConstruction, tourism, boundaries);
  }, [construction, tourism, boundaries, viewportBbox, refreshTrigger]);

  // Add CCTV count to stats
  const statsWithCctv = useMemo(() => {
    return {
      ...stats,
      totalCctv: cctvData?.length || 0,
    };
  }, [stats, cctvData]);

  // Refresh function to force recalculation
  const refreshStats = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return {
    stats: statsWithCctv,
    isLoading,
    refreshStats,
  };
}

/**
 * Hook for debounced viewport updates
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
