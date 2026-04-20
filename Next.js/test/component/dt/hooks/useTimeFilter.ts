import { useState, useEffect, useMemo } from 'react';
import { filterConstructionByDate, getFilteredCount, TimeFilterConfig, ConstructionPoint } from '../modules/TimeFilterModule';

const SESSION_STORAGE_KEY = 'dt-time-filter-config';

/**
 * Load time filter configuration from sessionStorage
 */
function loadConfigFromStorage(): TimeFilterConfig {
  if (typeof window === 'undefined') {
    return { startDate: null, endDate: null, ongoingOnly: false };
  }
  
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) {
      return { startDate: null, endDate: null, ongoingOnly: false };
    }
    
    const parsed = JSON.parse(stored);
    return {
      startDate: parsed.startDate ? new Date(parsed.startDate) : null,
      endDate: parsed.endDate ? new Date(parsed.endDate) : null,
      ongoingOnly: parsed.ongoingOnly || false,
    };
  } catch (error) {
    console.error('Failed to load time filter config from sessionStorage:', error);
    return { startDate: null, endDate: null, ongoingOnly: false };
  }
}

/**
 * Save time filter configuration to sessionStorage
 */
function saveConfigToStorage(config: TimeFilterConfig): void {
  if (typeof window === 'undefined') return;
  
  try {
    const toStore = {
      startDate: config.startDate ? config.startDate.toISOString() : null,
      endDate: config.endDate ? config.endDate.toISOString() : null,
      ongoingOnly: config.ongoingOnly,
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(toStore));
  } catch (error) {
    console.error('Failed to save time filter config to sessionStorage:', error);
  }
}

export interface UseTimeFilterReturn {
  config: TimeFilterConfig;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  toggleOngoingOnly: () => void;
  setOngoingOnly: (value: boolean) => void;
  filteredConstruction: ConstructionPoint[];
  visibleCount: number;
  totalCount: number;
  resetFilters: () => void;
}

/**
 * Hook for managing time filter state with sessionStorage persistence
 * @param constructionData - Array of construction projects to filter
 * @returns Time filter state and control functions
 */
export function useTimeFilter(constructionData: ConstructionPoint[]): UseTimeFilterReturn {
  // Load initial config from sessionStorage
  const [config, setConfig] = useState<TimeFilterConfig>(() => loadConfigFromStorage());
  
  // Persist config to sessionStorage whenever it changes
  useEffect(() => {
    saveConfigToStorage(config);
  }, [config]);
  
  // Filter construction data based on current config
  const filteredConstruction = useMemo(() => {
    return filterConstructionByDate(constructionData, config);
  }, [constructionData, config]);
  
  // Calculate visible count
  const visibleCount = filteredConstruction.length;
  const totalCount = constructionData.length;
  
  // Control functions
  const setStartDate = (date: Date | null) => {
    setConfig(prev => ({ ...prev, startDate: date }));
  };
  
  const setEndDate = (date: Date | null) => {
    setConfig(prev => ({ ...prev, endDate: date }));
  };
  
  const toggleOngoingOnly = () => {
    setConfig(prev => ({ ...prev, ongoingOnly: !prev.ongoingOnly }));
  };
  
  const setOngoingOnly = (value: boolean) => {
    setConfig(prev => ({ ...prev, ongoingOnly: value }));
  };
  
  const resetFilters = () => {
    setConfig({ startDate: null, endDate: null, ongoingOnly: false });
  };
  
  return {
    config,
    setStartDate,
    setEndDate,
    toggleOngoingOnly,
    setOngoingOnly,
    filteredConstruction,
    visibleCount,
    totalCount,
    resetFilters,
  };
}
