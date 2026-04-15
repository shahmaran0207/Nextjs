/**
 * @swagger
 * /api/GIS/Busan/Link/AllLink:
 *   get:
 *     summary: 부산 링크 목록 조회
 *     tags: [GIS - Busan]
 *     responses:
 *       200:
 *         description: 성공
 */
export async function GET() {
  try {
    const geomFilter = "BOX(129.0858,35.1502,129.2153,35.2376)";
    const baseUrl = `https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LT_L_MOCTLINK&key=${process.env.VWORLD_API_KEY}&domain=${process.env.BASE_URL}&geomFilter=${encodeURIComponent(geomFilter)}&geometry=true&format=json&size=1000&crs=EPSG:4326`;

    const firstRes = await fetch(`${baseUrl}&page=1`);
    const firstData = await firstRes.json();
    const totalPages = parseInt(firstData.response?.page?.total ?? "1");

    let allFeatures = [...(firstData.response?.result?.featureCollection?.features ?? [])];

    const pagePromises = [];
    for (let page = 2; page <= totalPages; page++) {
      pagePromises.push(fetch(`${baseUrl}&page=${page}`).then(r => r.json()));
    }

    const results = await Promise.all(pagePromises);
    for (const data of results) {
      const features = data.response?.result?.featureCollection?.features ?? [];
      allFeatures = [...allFeatures, ...features];
    }

    return Response.json({ features: allFeatures });
  } catch (err: any) {
    console.error("vworld API 에러:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}