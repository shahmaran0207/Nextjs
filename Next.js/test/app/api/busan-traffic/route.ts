export async function GET() {
  try {
    const allItems: any[] = [];
    let pageNo = 1;
    const numOfRows = 100;
    const maxItems = 400;

    while (allItems.length < maxItems) {
      const url = `https://apis.data.go.kr/6260000/BusanITSLINKTraffic/LINKTrafficList?serviceKey=${process.env.BUSAN_TRAFFIC_KEY}&pageNo=${pageNo}&numOfRows=${numOfRows}`;
      const res = await fetch(url);
      const data = await res.json();
      console.log(`페이지 ${pageNo} 응답:`, data.resultCode, data.content?.items?.length);

      const items = data.content?.items;
      if (!items || items.length === 0) break;

      allItems.push(...(Array.isArray(items) ? items : [items]));
      pageNo++;
    }

    // console.log("최종 allItems 길이:", allItems.length);
    return Response.json(allItems.slice(0, maxItems));
  } catch (err: any) {
    console.error("에러:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}