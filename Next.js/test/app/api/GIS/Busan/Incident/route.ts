/**
 * @swagger
 * /api/GIS/Busan/Incident:
 *   get:
 *     summary: 부산 돌발 현황 목록 조회
 *     tags: [GIS - Busan]
 *     responses:
 *       200:
 *         description: 성공
 */
export const revalidate = 600; // 10분 캐시

export async function GET() {
  try {
    const key = process.env.BUSAN_INCIDENT_KEY;
    if (!key) {
      console.error("BUSAN_INCIDENT_KEY 환경변수가 없습니다");
      return Response.json([], { status: 200 });
    }

    const url = `https://apis.data.go.kr/6260000/BusanITSINC/INCList?serviceKey=${key}&pageNo=1&numOfRows=100`;
    const res = await fetch(url);
    const text = await res.text();

    let data: any;
    try { data = JSON.parse(text); } catch {
      console.error("Incident JSON 파싱 실패 전체 응답:", text.slice(0, 500));
      return Response.json([], { status: 200 });
    }

    const items = data.content?.items;
    if (!items) return Response.json([]);

    return Response.json(Array.isArray(items) ? items : [items]);
  } catch (err: any) {
    console.error("Incident API 에러:", err.message);
    return Response.json([], { status: 200 });
  }
}