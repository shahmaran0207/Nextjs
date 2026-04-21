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

import { prisma } from "@/lib/prisma";

// ─── 서버 메모리 캐시 (10분) ─────────────────────────────────────
// rate limit 방지: 외부 API는 10분에 한 번만 호출
let _cache: { data: any[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10분

// ─── 링크 속도 이력 DB 저장 (비동기, 응답 블로킹 안 함) ───────────
async function saveSpeedHistory(items: any[]): Promise<void> {
  try {
    const rows = items
      .filter((item) => item.lkId && !isNaN(Number(item.spd)))
      .map((item) => ({
        link_id: String(item.lkId).trim(),
        speed: Number(item.spd),
      }));

    if (rows.length === 0) return;

    await prisma.link_speed_history.createMany({ data: rows });
    console.log(`[Traffic API] 속도 이력 DB 저장: ${rows.length}개`);
  } catch (err) {
    console.error("[Traffic API] 속도 이력 저장 실패:", err);
  }
}

export async function GET() {
  const now = Date.now();

  // 캐시 유효성 확인
  if (_cache && now - _cache.timestamp < CACHE_TTL_MS) {
    return Response.json(_cache.data);
  }

  const serviceKey = process.env.BUSAN_TRAFFIC_KEY;
  if (!serviceKey) {
    console.error("[Traffic API] BUSAN_TRAFFIC_KEY 환경변수가 없습니다");
    return Response.json([], { status: 200 });
  }

  try {
    const allItems: any[] = [];
    let pageNo = 1;
    // 공공데이터포털 API는 numOfRows 최대값이 제한될 수 있음 (안전하게 100)
    const numOfRows = 100;
    const maxItems = 100;
    const maxPages = 100;
    let totalCount: number | null = null;

    while (allItems.length < maxItems && pageNo <= maxPages) {
      // serviceKey는 인코딩하지 않음 (공공데이터포털 plain key)
      // _type=json 으로 JSON 응답 명시 요청
      const url = `https://apis.data.go.kr/6260000/BusanITSLINKTraffic/LINKTrafficList?serviceKey=${serviceKey}&pageNo=${pageNo}&numOfRows=${numOfRows}&_type=json`;

      const res = await fetch(url, {
        cache: "no-store",
        method: "GET",
        headers: {
          "Accept": "application/json, text/plain, */*",
        },
      });

      const text = await res.text();

      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("[Traffic API] JSON 파싱 실패 - XML 응답일 가능성:", text.slice(0, 200));
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
      }

      const items = data.content?.items;
      if (!items || (Array.isArray(items) && items.length === 0)) {
        break;
      }

      const itemArr = Array.isArray(items) ? items : [items];
      allItems.push(...itemArr);

      // 전체 수집 완료 시 조기 종료
      if (totalCount !== null && allItems.length >= totalCount) break;

      pageNo++;
    }

    const result = allItems.slice(0, maxItems);

    // 캐시 저장 (데이터가 있을 때만)
    if (result.length > 0) {
      _cache = { data: result, timestamp: now };
      // ─── 속도 이력 비동기 DB 저장 ─────────────────────────────────
      saveSpeedHistory(result).catch(console.error);
    } else {
      console.warn("[Traffic API] 데이터 없음 - 캐시 저장 안 함");
      // 만료된 캐시라도 있으면 반환 (graceful degradation)
      if (_cache) {
        console.warn(`[Traffic API] 만료 캐시 반환 (${_cache.data.length}개)`);
        return Response.json(_cache.data);
      }
    }

    return Response.json(result);
  } catch (err: any) {
    console.error("[Traffic API] 예외 발생:", err.message);
    // 캐시가 있으면 만료됐더라도 반환 (graceful degradation)
    if (_cache) {
      console.warn(`[Traffic API] 예외 발생 - 만료 캐시 반환 (${_cache.data.length}개)`);
      return Response.json(_cache.data);
    }
    return Response.json([], { status: 200 });
  }
}