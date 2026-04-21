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
    const now = Date.now();
    if (_cache && now - _cache.timestamp < CACHE_TTL_MS) {
      console.log(`[Traffic API] 캐시 반환 (${_cache.data.length}개)`);
      return Response.json(_cache.data);
    }

    const serviceKey = process.env.BUSAN_TRAFFIC_KEY;
    if (!serviceKey) {
      console.error("[Traffic API] BUSAN_TRAFFIC_KEY 환경변수가 없습니다");
      return Response.json([], { status: 200 });
    }

    const allItems: any[] = [];
    let pageNo = 1;
    const numOfRows = 50; // 부산ITS API 최대 허용값
    const maxItems = 5000; // 최대 5000개 수집 (약 100페이지)
    const maxPages = 100;
    let totalCount: number | null = null;

    while (allItems.length < maxItems && pageNo <= maxPages) {
      const url = `https://apis.data.go.kr/6260000/BusanITSLINKTraffic/LINKTrafficList?serviceKey=${serviceKey}&pageNo=${pageNo}&numOfRows=${numOfRows}&resultType=json`;

      if (pageNo === 1) console.log(`[Traffic API] 요청 URL 앞부분: ${url.slice(0, 100)}...`);

      // Referer 헤더 추가 (일부 공공데이터포털 API는 Referer 체크)
      const res = await fetch(url, {
        cache: "no-store",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; NextJS/1.0)",
          "Referer": process.env.NEXTAUTH_URL ?? "http://localhost:3000",
          "Accept": "application/json",
        },
      });
      const text = await res.text();

      if (pageNo === 1) console.log(`[Traffic API] 응답 앞부분: ${text.slice(0, 150)}`);

      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("[Traffic API] JSON 파싱 실패, 응답:", text.slice(0, 300));
        break;
      }

      if (data.resultCode && data.resultCode !== "00") {
        console.error(`[Traffic API] 에러: [${data.resultCode}] ${data.resultMsg}`);
        // 캐시 데이터 있으면 반환
        if (_cache) {
          console.log(`[Traffic API] 에러 - 만료된 캐시 반환 (${_cache.data.length}개)`);
          return Response.json(_cache.data);
        }
        // 서비스키 오류 - 클라이언트가 직접 호출하도록 serviceKey 공개 URL 반환
        return Response.json({
          error: data.resultMsg,
          code: data.resultCode,
          clientFallbackUrl: `https://apis.data.go.kr/6260000/BusanITSLINKTraffic/LINKTrafficList?serviceKey=${serviceKey}&pageNo=1&numOfRows=1000&resultType=json`,
        }, { status: 503 });
      }

      if (pageNo === 1 && data.content?.totalCount) {
        totalCount = parseInt(data.content.totalCount);
        console.log(`[Traffic API] 전체: ${totalCount}개`);
      }

      const items = data.content?.items;
      if (!items || items.length === 0) break;

      allItems.push(...(Array.isArray(items) ? items : [items]));

      if (totalCount !== null && allItems.length >= totalCount) break;
      pageNo++;
    }

    const result = allItems.slice(0, maxItems);
    console.log(`[Traffic API] 수집: ${result.length}개`);

    if (result.length > 0) {
      _cache = { data: result, timestamp: now };
      console.log(`[Traffic API] 캐시 저장 완료`);
    } else {
      console.warn("[Traffic API] 데이터 없음 - 캐시 저장 안 함");
    }

    return Response.json(result);
  } catch (err: any) {
    console.error("[Traffic API] 에러:", err.message);
    if (_cache) {
      return Response.json(_cache.data);
    }
    return Response.json([], { status: 200 });
  }
}