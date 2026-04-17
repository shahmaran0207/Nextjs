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
  summary: string | null;
  contact: string | null;
  field_code: string | null;
}

export interface ThemeTravelPoint {
  gid: number;
  lng: number;
  lat: number;
  content_name: string | null;
  district_name: string | null;
  category_name: string | null;
  place_name: string | null;
  title: string | null;
  subtitle: string | null;
  address: string | null;
  phone: string | null;
  operating_hours: string | null;
  fee_info: string | null;
  closed_days: string | null;
}

export interface BoundaryFeature {
  id: number;
  code: string;
  name: string;
  contour: number[][];
}

export interface DashboardStats {
  ongoingProjects: number;
  projectsByField: Record<string, number>;
  projectsByDistrict: Record<string, number>;
  avgProgressRate: number;
  behindScheduleCount: number;
  tourismByCategory: Record<string, number>;
  totalCctv?: number;
}

/**
 * Map dong (동) names to gu (구) names for Busan
 * @param locationText - Location text that may contain dong name
 * @returns Gu name or 'unknown' if not found
 */
function mapDongToGu(locationText: string): string {
  if (!locationText) return 'unknown';

  // 부산 구별 동 매핑
  const dongToGuMap: Record<string, string> = {
    // 중구
    '중앙동': '중구',
    '동광동': '중구',
    '대청동': '중구',
    '보수동': '중구',
    '부평동': '중구',
    '광복동': '중구',
    '남포동': '중구',
    '영주동': '중구',

    // 서구
    '동대신동': '서구',
    '서대신동': '서구',
    '부민동': '서구',
    '아미동': '서구',
    '초장동': '서구',
    '충무동': '서구',
    '남부민동': '서구',
    '암남동': '서구',

    // 동구
    '초량동': '동구',
    '수정동': '동구',
    '좌천동': '동구',
    '범일동': '동구',
    '범천동': '동구',
    '수정': '동구',

    // 영도구
    '남항동': '영도구',
    '영선동': '영도구',
    '신선동': '영도구',
    '봉래동': '영도구',
    '청학동': '영도구',
    '동삼동': '영도구',

    // 부산진구
    '부전동': '부산진구',
    '연지동': '부산진구',
    '초읍동': '부산진구',
    '양정동': '부산진구',
    '전포동': '부산진구',
    '부암동': '부산진구',
    '당감동': '부산진구',
    '가야동': '부산진구',
    '개금동': '부산진구',

    // 동래구
    '수민동': '동래구',
    '복천동': '동래구',
    '명륜동': '동래구',
    '온천동': '동래구',
    '사직동': '동래구',
    '안락동': '동래구',
    '명장동': '동래구',

    // 남구
    '대연동': '남구',
    '용호동': '남구',
    '용당동': '남구',
    '감만동': '남구',
    '우암동': '남구',
    '문현동': '남구',

    // 북구
    '구포동': '북구',
    '금곡동': '북구',
    '화명동': '북구',
    '덕천동': '북구',
    '만덕동': '북구',

    // 해운대구
    '우동': '해운대구',
    '중동': '해운대구',
    '좌동': '해운대구',
    '송정동': '해운대구',
    '재송동': '해운대구',
    '반여동': '해운대구',
    '반송동': '해운대구',

    // 사하구
    '괴정동': '사하구',
    '당리동': '사하구',
    '하단동': '사하구',
    '신평동': '사하구',
    '장림동': '사하구',
    '다대동': '사하구',

    // 금정구
    '금사동': '금정구',
    '부곡동': '금정구',
    '장전동': '금정구',
    '구서동': '금정구',
    '남산동': '금정구',
    '청룡동': '금정구',
    '회동동': '금정구',
    '서동': '금정구',

    // 강서구
    '대저동': '강서구',
    '강동동': '강서구',
    '명지동': '강서구',
    '녹산동': '강서구',
    '가락동': '강서구',
    '생곡동': '강서구',

    // 연제구
    '거제동': '연제구',
    '연산동': '연제구',

    // 수영구
    '남천동': '수영구',
    '수영동': '수영구',
    '망미동': '수영구',
    '광안동': '수영구',
    '민락동': '수영구',

    // 사상구
    '삼락동': '사상구',
    '모라동': '사상구',
    '덕포동': '사상구',
    '괘법동': '사상구',
    '감전동': '사상구',
    '주례동': '사상구',
    '학장동': '사상구',
    '엄궁동': '사상구',

    // 기장군
    '기장읍': '기장군',
    '장안읍': '기장군',
    '정관읍': '기장군',
    '일광읍': '기장군',
    '철마면': '기장군',
  };

  // location_text에서 동 이름 찾기
  for (const [dong, gu] of Object.entries(dongToGuMap)) {
    if (locationText.includes(dong)) {
      return gu;
    }
  }

  // 구 이름이 직접 포함되어 있는 경우
  const guNames = [
    '중구', '서구', '동구', '영도구', '부산진구', '동래구', '남구', '북구',
    '해운대구', '사하구', '금정구', '강서구', '연제구', '수영구', '사상구', '기장군'
  ];
  
  for (const gu of guNames) {
    if (locationText.includes(gu)) {
      return gu;
    }
  }

  return 'unknown';
}

/**
 * Calculate all dashboard statistics
 * @param construction - Array of construction projects
 * @param tourism - Array of tourism points
 * @param boundaries - Array of boundary features
 * @returns Dashboard statistics object
 * 
 * Property 5: Counting with Filter Conditions
 * Property 6: Grouping Invariants
 * Property 7: Average Calculation Bounds
 */
export function calculateStats(
  construction: ConstructionPoint[],
  tourism: ThemeTravelPoint[],
  boundaries: BoundaryFeature[]
): DashboardStats {
  // Count ongoing projects (progress_rate < 100)
  const ongoingProjects = construction.filter(
    (c) => (c.progress_rate ?? 0) < 100
  ).length;

  // Group by field_code
  const projectsByField: Record<string, number> = {};
  construction.forEach((c) => {
    const field = c.field_code ?? 'unknown';
    projectsByField[field] = (projectsByField[field] || 0) + 1;
  });

  // Group by district (from location_text - map dong to gu)
  const projectsByDistrict: Record<string, number> = {};
  construction.forEach((c) => {
    // Extract district from location_text and map to gu
    const locationText = c.location_text ?? '';
    const district = mapDongToGu(locationText);
    if (district !== 'unknown') {
      projectsByDistrict[district] = (projectsByDistrict[district] || 0) + 1;
    }
  });

  // Calculate average progress rate
  const progressRates = construction
    .map((c) => c.progress_rate ?? 0)
    .filter((rate) => rate > 0);
  const avgProgressRate =
    progressRates.length > 0
      ? Math.round(
          progressRates.reduce((sum, rate) => sum + rate, 0) / progressRates.length
        )
      : 0;

  // Count projects behind schedule (progress_rate < plan_rate)
  const behindScheduleCount = construction.filter(
    (c) => (c.progress_rate ?? 0) < (c.plan_rate ?? 0)
  ).length;

  // Group tourism by category
  const tourismByCategory: Record<string, number> = {};
  tourism.forEach((t) => {
    const category = t.category_name ?? 'unknown';
    tourismByCategory[category] = (tourismByCategory[category] || 0) + 1;
  });

  return {
    ongoingProjects,
    projectsByField,
    projectsByDistrict,
    avgProgressRate,
    behindScheduleCount,
    tourismByCategory,
  };
}

/**
 * Get projects within viewport bounding box
 * @param construction - Array of construction projects
 * @param bbox - Bounding box [minLng, minLat, maxLng, maxLat]
 * @returns Filtered array of construction projects
 */
export function getProjectsInViewport(
  construction: ConstructionPoint[],
  bbox: [number, number, number, number]
): ConstructionPoint[] {
  const [minLng, minLat, maxLng, maxLat] = bbox;

  return construction.filter((c) => {
    return (
      c.lng >= minLng &&
      c.lng <= maxLng &&
      c.lat >= minLat &&
      c.lat <= maxLat
    );
  });
}

/**
 * Get top N items from a grouped record
 * @param grouped - Grouped record (e.g., projectsByField)
 * @param n - Number of top items to return
 * @returns Array of [key, count] tuples sorted by count descending
 */
export function getTopN(
  grouped: Record<string, number>,
  n: number
): [string, number][] {
  return Object.entries(grouped)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n);
}
