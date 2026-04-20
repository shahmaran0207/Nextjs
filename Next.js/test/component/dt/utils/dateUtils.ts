import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

// dayjs 플러그인 활성화
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

/**
 * Parse a date string into a Dayjs object
 * @param dateStr - ISO 8601 date string or null
 * @returns Dayjs object or null if input is null/invalid
 */
export function parseDate(dateStr: string | null | undefined): Dayjs | null {
  if (!dateStr) return null;
  const parsed = dayjs(dateStr);
  return parsed.isValid() ? parsed : null;
}

/**
 * Check if two date ranges overlap
 * @param start1 - Start date of first range
 * @param end1 - End date of first range
 * @param start2 - Start date of second range
 * @param end2 - End date of second range
 * @returns true if ranges overlap, false otherwise
 * 
 * Property 12: Date Range Overlap Detection
 * For any two date ranges [start1, end1] and [start2, end2], 
 * the ranges overlap if and only if (start1 <= end2) AND (end1 >= start2)
 */
export function dateRangesOverlap(
  start1: Dayjs | null,
  end1: Dayjs | null,
  start2: Dayjs | null,
  end2: Dayjs | null
): boolean {
  // If any date is null, cannot determine overlap
  if (!start1 || !end1 || !start2 || !end2) return false;
  
  // Ranges overlap if (start1 <= end2) AND (end1 >= start2)
  return start1.isSameOrBefore(end2) && end1.isSameOrAfter(start2);
}

/**
 * Check if a point date is contained within a date interval
 * @param point - The point date to check
 * @param start - Start of the interval
 * @param end - End of the interval
 * @returns true if point is within [start, end], false otherwise
 * 
 * Property 13: Point-in-Interval Detection
 * For any date interval [start, end] and point date D,
 * the point is contained in the interval if and only if (D >= start) AND (D <= end)
 */
export function isDateInInterval(
  point: Dayjs | null,
  start: Dayjs | null,
  end: Dayjs | null
): boolean {
  // If any date is null, cannot determine containment
  if (!point || !start || !end) return false;
  
  // Point is in interval if (point >= start) AND (point <= end)
  return point.isSameOrAfter(start) && point.isSameOrBefore(end);
}

/**
 * Check if a project is currently ongoing
 * @param startDate - Project start date string
 * @param endDate - Project end date string
 * @param referenceDate - Reference date (defaults to current date)
 * @returns true if project is ongoing at reference date, false otherwise
 */
export function isProjectOngoing(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  referenceDate?: Dayjs
): boolean {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const ref = referenceDate || dayjs();
  
  return isDateInInterval(ref, start, end);
}

/**
 * Check if a project period overlaps with a filter date range
 * @param projectStart - Project start date string
 * @param projectEnd - Project end date string
 * @param filterStart - Filter start date string
 * @param filterEnd - Filter end date string
 * @returns true if project period overlaps filter range, false otherwise
 */
export function projectOverlapsFilterRange(
  projectStart: string | null | undefined,
  projectEnd: string | null | undefined,
  filterStart: string | null | undefined,
  filterEnd: string | null | undefined
): boolean {
  const pStart = parseDate(projectStart);
  const pEnd = parseDate(projectEnd);
  const fStart = parseDate(filterStart);
  const fEnd = parseDate(filterEnd);
  
  return dateRangesOverlap(pStart, pEnd, fStart, fEnd);
}

/**
 * Format a date for display
 * @param dateStr - ISO 8601 date string
 * @param format - dayjs format string (default: 'YYYY-MM-DD')
 * @returns Formatted date string or empty string if invalid
 */
export function formatDate(dateStr: string | null | undefined, format: string = 'YYYY-MM-DD'): string {
  const date = parseDate(dateStr);
  return date ? date.format(format) : '';
}

/**
 * Get current date as ISO string
 * @returns Current date in ISO 8601 format
 */
export function getCurrentDateISO(): string {
  return dayjs().format('YYYY-MM-DD');
}
