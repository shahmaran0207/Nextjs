export async function getBusanLink() {
  try {
    const geomFilter = "BOX(129.0858,35.1502,129.2153,35.2376)";
    const baseUrl = `https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LT_L_MOCTLINK&key=${process.env.VWORLD_API_KEY}&domain=http://localhost:3000&geomFilter=${encodeURIComponent(geomFilter)}&geometry=true&format=json&size=1000&crs=EPSG:4326`;

    const firstRes = await fetch(`${baseUrl}&page=1`);
    const text = await firstRes.text();
    console.log("vworld 응답:", text.slice(0, 200)); // 뭐가 오는지 확인
    const firstData = JSON.parse(text);
    const totalPages = parseInt(firstData.response.page.total);

    let allFeatures = [...firstData.response.result.featureCollection.features];

    for (let page = 2; page <= totalPages; page++) {
      const res = await fetch(`${baseUrl}&page=${page}`);
      const data = await res.json();
      allFeatures = [...allFeatures, ...data.response.result.featureCollection.features];
    }

    return { features: allFeatures };
  } catch (err) {
    console.error("getBusanLink 에러:", err);
    return { features: [] };
  }
}

export async function getBusanTraffic() {
  try {
    const allItems: any[] = [];
    let pageNo = 1;
    const numOfRows = 100;
    const maxItems = 500;

    while (allItems.length < maxItems) {
      const url = `https://apis.data.go.kr/6260000/BusanITSLINKTraffic/LINKTrafficList?serviceKey=${process.env.BUSAN_TRAFFIC_KEY}&pageNo=${pageNo}&numOfRows=${numOfRows}`;
      const res = await fetch(url);
      const text = await res.text();
      console.log("traffic 응답:", text.slice(0, 200));
      const data = JSON.parse(text);

      const items = data.content?.items;
      if (!items || items.length === 0) break;

      allItems.push(...(Array.isArray(items) ? items : [items]));
      pageNo++;
    }

    return allItems.slice(0, maxItems);
  } catch (err) {
    console.error("getBusanTraffic 에러:", err);
    return [];
  }
}

export async function getBusanBit() {
  try {
    const url = `http://apis.data.go.kr/6260000/BusanTblBusinfoeqStusService/getTblBusinfoeqStusInfo?serviceKey=${process.env.DATA_API_KEY}&numOfRows=9999`;
    const res = await fetch(url);
    const text = await res.text();
    console.log("bit 응답:", text.slice(0, 200));

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

    return items;
  } catch (err) {
    console.error("getBusanBit 에러:", err);
    return [];
  }
}