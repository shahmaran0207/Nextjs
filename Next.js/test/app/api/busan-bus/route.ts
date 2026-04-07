export async function GET() {
  try {
    const url = `http://apis.data.go.kr/6260000/BusanTblBusinfoeqStusService/getTblBusinfoeqStusInfo?serviceKey=${process.env.DATA_API_KEY}&numOfRows=9999`;

    const res = await fetch(url);
    const text = await res.text();

    // XML 파싱
    const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => {
      const item = match[1];
      const get = (tag: string) => item.match(new RegExp(`<${tag}>(.*?)<\/${tag}>`))?.[1]?.trim() ?? "";
      return {
        stationNum: get("stationNum"),
        stationLoc: get("stationLoc"),
        lat: parseFloat(get("lat")),
        lng: parseFloat(get("lng")),
        addr: get("addr"),
        dataDay: get("dataDay"),
      };
    });

    return Response.json(items);
  } catch (err: any) {
    console.error("에러:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}