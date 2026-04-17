/**
 * Get color for construction progress rate
 * @param rate - Progress rate (0-100)
 * @returns RGBA color array [r, g, b, a]
 * 
 * Property 9: Threshold-Based Classification (Progress Colors)
 * For any progress rate value, the assigned color SHALL match the threshold range:
 * - 0-25%: Red
 * - 26-50%: Orange
 * - 51-75%: Yellow
 * - 76-99%: Green
 * - 100%: Blue
 */
export function getProgressColor(rate: number | null | undefined): [number, number, number, number] {
  // Handle null/undefined as 0%
  const actualRate = rate ?? 0;
  
  // Clamp to [0, 100] range
  const clampedRate = Math.max(0, Math.min(100, actualRate));
  
  // Apply threshold-based classification
  if (clampedRate <= 25) {
    return [255, 0, 0, 255]; // Red (0-25%)
  } else if (clampedRate <= 50) {
    return [255, 165, 0, 255]; // Orange (26-50%)
  } else if (clampedRate <= 75) {
    return [255, 255, 0, 255]; // Yellow (51-75%)
  } else if (clampedRate < 100) {
    return [0, 255, 0, 255]; // Green (76-99%)
  } else {
    return [0, 0, 255, 255]; // Blue (100%)
  }
}

/**
 * Get hex color string for construction progress rate
 * @param rate - Progress rate (0-100)
 * @returns Hex color string (e.g., "#ff0000")
 */
export function getProgressColorHex(rate: number | null | undefined): string {
  const [r, g, b] = getProgressColor(rate);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Get color label for construction progress rate
 * @param rate - Progress rate (0-100)
 * @returns Color label string
 */
export function getProgressColorLabel(rate: number | null | undefined): string {
  const actualRate = rate ?? 0;
  const clampedRate = Math.max(0, Math.min(100, actualRate));
  
  if (clampedRate <= 25) {
    return '초기 단계';
  } else if (clampedRate <= 50) {
    return '진행 중';
  } else if (clampedRate <= 75) {
    return '중반 이상';
  } else if (clampedRate < 100) {
    return '거의 완료';
  } else {
    return '완료';
  }
}

/**
 * Get CSS color string with opacity
 * @param rate - Progress rate (0-100)
 * @param opacity - Opacity (0-1)
 * @returns CSS rgba color string
 */
export function getProgressColorRGBA(rate: number | null | undefined, opacity: number = 1): string {
  const [r, g, b] = getProgressColor(rate);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
