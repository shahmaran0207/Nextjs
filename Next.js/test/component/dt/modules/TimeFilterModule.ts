import { parseDate, dateRangesOverlap, isDateInInterval, getCurrentDateISO } from '../utils/dateUtils';
import dayjs from 'dayjs';

export interface TimeFilterConfig {
  startDate: Date | null;
  endDate: Date | null;
  ongoingOnly: boolean;
}

export interface ConstructionPoint {
  gid: number;
  lng: number;
  lat: number;
  project_name: string | null;
  progress_rate: number | null;
  plan_rate: number | null;
  achievement_rate: number | null;
  start_date: string | null;
  end_date: string | null;
  location_text: string | null;
  budget_text: string | null;
  d_day: number | null;
  contact: string | null;
  field_code: string | null;
}

/**
 * Check if a project matches the time filter criteria
 * @param project - Construction project to check
 * @param config - Time filter configuration
 * @returns true if project matches filter, false otherwise
 * 
 * Property 12: Date Range Overlap Detection
 * Property 13: Point-in-Interval Detection
 */
export function isProjectInRange(
  project: ConstructionPoint,
  config: TimeFilterConfig
): boolean {
  const { startDate, endDate, ongoingOnly } = config;
  
  // Parse project dates
  const projectStart = parseDate(project.start_date);
  const projectEnd = parseDate(project.end_date);
  
  // If project has no valid dates, exclude it
  if (!projectStart || !projectEnd) return false;
  
  // If ongoing only mode is enabled
  if (ongoingOnly) {
    const currentDate = dayjs();
    const isOngoing = isDateInInterval(currentDate, projectStart, projectEnd);
    
    // If not ongoing, exclude
    if (!isOngoing) return false;
    
    // If ongoing and no date range filter, include
    if (!startDate && !endDate) return true;
  }
  
  // If date range filter is specified
  if (startDate || endDate) {
    // Convert Date objects to dayjs
    const filterStart = startDate ? dayjs(startDate) : null;
    const filterEnd = endDate ? dayjs(endDate) : null;
    
    // Handle case where only start date is specified
    if (filterStart && !filterEnd) {
      // Project must end on or after filter start
      return projectEnd.isSameOrAfter(filterStart);
    }
    
    // Handle case where only end date is specified
    if (!filterStart && filterEnd) {
      // Project must start on or before filter end
      return projectStart.isSameOrBefore(filterEnd);
    }
    
    // Both dates specified - check overlap
    if (filterStart && filterEnd) {
      // Swap if start > end
      const actualStart = filterStart.isAfter(filterEnd) ? filterEnd : filterStart;
      const actualEnd = filterStart.isAfter(filterEnd) ? filterStart : filterEnd;
      
      return dateRangesOverlap(projectStart, projectEnd, actualStart, actualEnd);
    }
  }
  
  // No filters applied, include all projects
  return true;
}

/**
 * Filter construction projects by date range and ongoing status
 * @param data - Array of construction projects
 * @param config - Time filter configuration
 * @returns Filtered array of construction projects
 * 
 * Property 5: Counting with Filter Conditions
 * Property 14: Filter-Cluster Data Flow
 * 
 * The count of filtered items SHALL equal the length of the array after applying the filter predicate.
 * The filtered dataset passed to clustering SHALL be identical to the filter output.
 */
export function filterConstructionByDate(
  data: ConstructionPoint[],
  config: TimeFilterConfig
): ConstructionPoint[] {
  // If no filters applied, return original data
  if (!config.startDate && !config.endDate && !config.ongoingOnly) {
    return data;
  }
  
  // Apply filter predicate
  return data.filter(project => isProjectInRange(project, config));
}

/**
 * Get count of projects matching filter
 * @param data - Array of construction projects
 * @param config - Time filter configuration
 * @returns Count of filtered projects
 */
export function getFilteredCount(
  data: ConstructionPoint[],
  config: TimeFilterConfig
): number {
  return filterConstructionByDate(data, config).length;
}
