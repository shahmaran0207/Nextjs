export async function getBusanLink() {
  try {
    const geomFilter = "BOX(129.0858,35.1502,129.2153,35.2376)";
    const baseUrl = `https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LT_L_MOCTLINK&key=${process.env.VWORLD_API_KEY}&domain=http://localhost:3000&geomFilter=${encodeURIComponent(geomFilter)}&geometry=true&format=json&size=1000&crs=EPSG:4326`;

    const firstRes = await fetch(`${baseUrl}&page=1`);
    const text = await firstRes.text();

    const firstData = JSON.parse(text);

    const totalPages = parseInt(firstData.response.page.total);
    let allFeatures = [...firstData.response.result.featureCollection.features];

    // 페이지가 많으면 최대 10페이지만 (성능 고려)
    const maxPages = Math.min(totalPages, 10);

    for (let page = 2; page <= maxPages; page++) {
      const res = await fetch(`${baseUrl}&page=${page}`);
      const data = await res.json();
      const pageFeatures = data.response.result.featureCollection.features;
      allFeatures = [...allFeatures, ...pageFeatures];
    }

    return { features: allFeatures };
  } catch (err) {
    console.error("❌ getBusanLink 에러:", err);
    return { features: [] };
  }
}

export async function getBusanBoundary() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.$queryRawUnsafe<
      { gid: number; emd_cd: string | null; emd_nm: string | null; geojson: string }[]
    >(
      // SRID=0으로 저장된 geometry를 한국 중부원점 2010(5186)으로 지정 후 WGS84(4326)로 변환
      `SELECT gid, emd_cd, emd_nm,
              ST_AsGeoJSON(ST_Transform(ST_SetSRID(geom, 5186), 4326))::text AS geojson
       FROM test.busanpolyline
       ORDER BY gid`
    );

    const features = rows.map((row) => {
      const geometry = JSON.parse(row.geojson);
      // geometry.type에 따라 외각환(exterior ring) 추출 방식이 다름
      // - Polygon:      coordinates = [ ring, ring, ... ]  → coordinates[0]
      // - MultiPolygon: coordinates = [ [ ring, ... ], [ ring, ... ] ] → coordinates[0][0]
      let contour: [number, number][];
      if (geometry.type === "MultiPolygon") {
        contour = geometry.coordinates[0][0] as [number, number][];
      } else {
        // Polygon
        contour = geometry.coordinates[0] as [number, number][];
      }
      return {
        id: row.gid,
        code: row.emd_cd ?? "",
        name: row.emd_nm ?? "",
        contour,
      };
    });

    return features;
  } catch (err) {
    console.error("getBusanBoundary 에러:", err);
    return [];
  }
}


export async function getBusanTraffic() {
  try {
    const allItems: any[] = [];
    let pageNo = 1;
    const numOfRows = 50;
    const maxItems = 3000;
    const maxPages = 100;
    let totalCount: number | null = null;

    while (allItems.length < maxItems && pageNo <= maxPages) {
      try {
        const url = `https://apis.data.go.kr/6260000/BusanITSLINKTraffic/LINKTrafficList?serviceKey=${process.env.BUSAN_TRAFFIC_KEY}&pageNo=${pageNo}&numOfRows=${numOfRows}&resultType=json`;
        // 5분 캐시: rate limit 방지 (no-store 시 접속마다 100회+ 호출로 429 발생)
        const res = await fetch(url, { next: { revalidate: 300 } });
        const text = await res.text();

        // JSON 파싱 시도
        let data;
        try {
          data = JSON.parse(text);

          // resultCode 체크: "00"이 아니면 에러 (rate limit, 키 오류 등)
          if (data.resultCode && data.resultCode !== "00") {
            console.error(`Traffic API 에러 (페이지 ${pageNo}): [${data.resultCode}] ${data.resultMsg}`);
            break;
          }

          // 첫 페이지에서 totalCount 읽기
          if (pageNo === 1 && data.content?.totalCount) {
            totalCount = parseInt(data.content.totalCount);
          }

          const items = data.content?.items;
          if (!items || items.length === 0) break;
          allItems.push(...(Array.isArray(items) ? items : [items]));

          // 전체 데이터를 다 받았으면 조기 종료
          if (totalCount !== null && allItems.length >= totalCount) break;
        } catch (jsonError) {
          // XML 파싱 시도 (API 키 오류 등 XML 응답)
          if (text.includes('SERVICE_KEY') || text.includes('ERROR') || text.includes('errMsg')) {
            console.error("Traffic API XML 에러 응답:", text.slice(0, 300));
            break;
          }
          const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => {
            const item = match[1];
            const get = (tag: string) => item.match(new RegExp(`<${tag}>(.*?)<\\/${tag}>`))?.[1]?.trim() ?? "";
            return {
              lkId: get("lkId"),
              spd: parseFloat(get("spd")) || 0,
            };
          });

          if (items.length === 0) break;
          allItems.push(...items);
        }

        pageNo++;
      } catch (pageError) {
        console.error(`Traffic API 페이지 ${pageNo} 에러:`, pageError);
        break;
      }
    }
    return allItems.slice(0, maxItems);
  } catch (err) {
    console.error("getBusanTraffic 전체 에러:", err);
    return [];
  }
}


export async function getBusanBit() {
  try {
    const url = `http://apis.data.go.kr/6260000/BusanTblBusinfoeqStusService/getTblBusinfoeqStusInfo?serviceKey=${process.env.DATA_API_KEY}&numOfRows=9999`;
    const res = await fetch(url);
    const text = await res.text();

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

export async function getBusanConstruction() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.$queryRawUnsafe<
      {
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
      }[]
    >(
      // test.busan_construction: Point(4326) 좌표 및 공사 상세 정보 조회
      `SELECT
         gid,
         ST_X(geom)       AS lng,
         ST_Y(geom)       AS lat,
         project_name,
         COALESCE(progress_rate::float, 0)    AS progress_rate,
         COALESCE(plan_rate::float, 0)        AS plan_rate,
         COALESCE(achievement_rate::float, 0) AS achievement_rate,
         TO_CHAR(start_date, 'YYYY-MM-DD')   AS start_date,
         TO_CHAR(end_date,   'YYYY-MM-DD')   AS end_date,
         location_text,
         budget_text,
         d_day,
         summary,
         contact,
         field_code
       FROM test.busan_construction
       WHERE geom IS NOT NULL`
    );
    return rows.filter((r) => r.lat >= -90 && r.lat <= 90 && r.lng >= -180 && r.lng <= 180);
  } catch (err) {
    console.error("getBusanConstruction 에러:", err);
    return [];
  }
}

export async function getBusanThemeTravel() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.$queryRawUnsafe<
      {
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
      }[]
    >(
      // test.busan_theme_travel: Point(4326) 좌표 및 테마여행 상세정보 조회
      `SELECT
         gid,
         ST_X(geom)    AS lng,
         ST_Y(geom)    AS lat,
         content_name,
         district_name,
         category_name,
         place_name,
         title,
         subtitle,
         address,
         phone,
         operating_hours,
         fee_info,
         closed_days
       FROM test.busan_theme_travel
       WHERE geom IS NOT NULL`
    );
    return rows.filter((r) => r.lat >= -90 && r.lat <= 90 && r.lng >= -180 && r.lng <= 180);
  } catch (err) {
    console.error("getBusanThemeTravel 에러:", err);
    return [];
  }
}