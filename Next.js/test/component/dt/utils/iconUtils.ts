import { FIELD_CONFIG, THEME_CONFIG } from "../constants/iconConfigs";

// field_code → 캐시된 핀 URL 반환
const _pinUrlCache: Record<string, string> = {};

export function getConstructionPinUrl(fieldCode: string | null): string {
  const code = fieldCode && FIELD_CONFIG[fieldCode] ? fieldCode : "F08";
  if (_pinUrlCache[code]) return _pinUrlCache[code];
  const { fill, stroke, icon } = FIELD_CONFIG[code];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 62" width="48" height="62">
    <path d="M24 0C13 0 4 9 4 20c0 16 20 42 20 42S44 36 44 20C44 9 35 0 24 0z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    ${icon}
  </svg>`;
  _pinUrlCache[code] = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return _pinUrlCache[code];
}

// category_name → 캐시된 테마 핀 URL 반환
const _themePinUrlCache: Record<string, string> = {};

export function getThemePinUrl(categoryName: string | null): string {
  const cat = categoryName && THEME_CONFIG[categoryName] ? categoryName : "기타";
  if (_themePinUrlCache[cat]) return _themePinUrlCache[cat];
  const { fill, stroke, icon } = THEME_CONFIG[cat];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 62" width="48" height="62">
    <path d="M24 0C13 0 4 9 4 20c0 16 20 42 20 42S44 36 44 20C44 9 35 0 24 0z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    ${icon}
  </svg>`;
  _themePinUrlCache[cat] = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return _themePinUrlCache[cat];
}

export function getSpeedRgba(spd: number | undefined): [number, number, number, number] {
  // 2D 지도(map/page.tsx)의 getSpeedColor 조건과 동일하게 맞춤
  if (spd === undefined || spd === null) return [221, 221, 221, 180]; // #dddddd
  if (spd >= 60) return [0, 204, 68, 255];       // #00cc44
  if (spd >= 40) return [136, 204, 0, 255];      // #88cc00
  if (spd >= 20) return [255, 170, 0, 255];      // #ffaa00
  if (spd >= 10) return [255, 85, 0, 255];       // #ff5500
  return [255, 0, 0, 255];                        // #ff0000
}

export function getBoundaryColor(id: number): [number, number, number] {
  const hue = (id * 137.508) % 360;
  const clampedHue = 160 + (hue % 140);
  const s = 0.75, l = 0.55;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((clampedHue / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  const sector = Math.floor(clampedHue / 60);
  if (sector === 0) { r = c; g = x; }
  else if (sector === 1) { r = x; g = c; }
  else if (sector === 2) { g = c; b = x; }
  else if (sector === 3) { g = x; b = c; }
  else if (sector === 4) { r = x; b = c; }
  else { r = c; b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

/**
 * Get field configuration by field code
 * @param fieldCode - Field code (F01-F08)
 * @returns Field configuration object or default (F08)
 * 
 * Property 10: Configuration Lookup Correctness
 * For any configuration key (field_code), the returned value SHALL match 
 * the configured value for that key, or the default value if the key is not found.
 */
export function getFieldConfig(fieldCode: string | null | undefined) {
  const code = fieldCode && FIELD_CONFIG[fieldCode] ? fieldCode : "F08";
  return FIELD_CONFIG[code];
}

/**
 * Get field label by field code
 * @param fieldCode - Field code (F01-F08)
 * @returns Field label string
 */
export function getFieldLabel(fieldCode: string | null | undefined): string {
  const config = getFieldConfig(fieldCode);
  return config.label;
}

/**
 * Get theme configuration by category name
 * @param categoryName - Category name
 * @returns Theme configuration object or default ("기타")
 * 
 * Property 10: Configuration Lookup Correctness
 * For any configuration key (category_name), the returned value SHALL match 
 * the configured value for that key, or the default value if the key is not found.
 */
export function getThemeConfig(categoryName: string | null | undefined) {
  const cat = categoryName && THEME_CONFIG[categoryName] ? categoryName : "기타";
  return THEME_CONFIG[cat];
}

/**
 * Get theme label by category name
 * @param categoryName - Category name
 * @returns Theme label string
 */
export function getThemeLabel(categoryName: string | null | undefined): string {
  const config = getThemeConfig(categoryName);
  return config.label;
}

/**
 * Get theme emoji by category name
 * @param categoryName - Category name
 * @returns Theme emoji string
 */
export function getThemeEmoji(categoryName: string | null | undefined): string {
  const config = getThemeConfig(categoryName);
  return config.emoji;
}

/**
 * Get all available field codes
 * @returns Array of field codes
 */
export function getAllFieldCodes(): string[] {
  return Object.keys(FIELD_CONFIG);
}

/**
 * Get all available theme categories
 * @returns Array of category names
 */
export function getAllThemeCategories(): string[] {
  return Object.keys(THEME_CONFIG);
}
