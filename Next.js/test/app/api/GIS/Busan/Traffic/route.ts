/**
 * @swagger
 * /api/GIS/Busan/Traffic:
 *   get:
 *     summary: 부산 연계소통정보 조회
 *     tags: [GIS - Busan]
 *     responses:
 *       200:
 *         description: 성공
 */

// ─── 서버 메모리 캐시 (5분) ─────────────────────────────────────
// rate limit 방지: 외부 API는 5분에 한 번만 호출
let _cache: { data: any[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5분

export async function GET() {
  try {
    // 캐시 유효성 확인
    const now = Date.now();
    if (_cache && now - _cache.timestamp < CACHE_TTL_MS) {
      console.log(`[Traffic API] 캐시 히트: ${_cache.data.length}개 (남은 TTL: ${Math.floor((CACHE_TTL_MS - (now - _cache.timestamp)) / 1000)}초)`);
      return Response.json(_cache.data);
    }

    console.log("[Traffic API] 캐시 미스 - 외부 API 호출 시작");
    const allItems: any[] = [];
    let pageNo = 1;
    const numOfRows = 1000; // 페이지당 최대로 올려 API 호출 횟수 최소화
    const maxItems = 10000;
    const maxPages = 20;
    let totalCount: number | null = null;

    while (allItems.length < maxItems && pageNo <= maxPages) {
      const url = `https://apis.data.go.kr/6260000/BusanITSLINKTraffic/LINKTrafficList?serviceKey=${process.env.BUSAN_TRAFFIC_KEY}&pageNo=${pageNo}&numOfRows=${numOfRows}&resultType=json`;
      const res = await fetch(url, { cache: "no-store" });
      const text = await res.text();

      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("[Traffic API] JSON 파싱 실패:", text.slice(0, 200));
        break;
      }

      // resultCode 체크
      if (data.resultCode && data.resultCode !== "00") {
        console.error(`[Traffic API] 에러 (페이지 ${pageNo}): [${data.resultCode}] ${data.resultMsg}`);
        break;
      }

      // 첫 페이지에서 totalCount 파악
      if (pageNo === 1 && data.content?.totalCount) {
        totalCount = parseInt(data.content.totalCount);
        console.log(`[Traffic API] totalCount: ${totalCount}`);
      }

      const items = data.content?.items;
      if (!items || items.length === 0) break;

      allItems.push(...(Array.isArray(items) ? items : [items]));
      console.log(`[Traffic API] 페이지 ${pageNo}: ${items.length}개 수집 (누계: ${allItems.length})`);

      // 전체 수집 완료 시 조기 종료
      if (totalCount !== null && allItems.length >= totalCount) break;

      pageNo++;
    }

    const result = allItems.slice(0, maxItems);
    console.log(`[Traffic API] 완료: ${result.length}개 / totalCount: ${totalCount ?? '알 수 없음'}개 → 캐시 저장`);

    // 캐시 저장 (데이터가 있을 때만)
    if (result.length > 0) {
      _cache = { data: result, timestamp: now };
    }

    return Response.json(result);
  } catch (err: any) {
    console.error("[Traffic API] 에러:", err.message);
    // 캐시가 있으면 만료됐더라도 반환 (graceful degradation)
    if (_cache) {
      console.error(`[Traffic API] 에러 발생 - 만료된 캐시 반환 (${_cache.data.length}개)`);
      return Response.json(_cache.data);
    }
    return Response.json({ error: err.message }, { status: 500 });
  }
}