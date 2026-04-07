export async function GET() {
  try {
    const geomFilter = "BOX(129.0858,35.1502,129.2153,35.2376)";
    const baseUrl = `https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LT_L_MOCTLINK&key=${process.env.VWORLD_API_KEY}&domain=${process.env.BASE_URL}&geomFilter=${encodeURIComponent(geomFilter)}&geometry=true&format=json&size=1000&crs=EPSG:4326`;

    const firstRes = await fetch(`${baseUrl}&page=1`);
    const firstData = await firstRes.json();
    const totalPages = parseInt(firstData.response.page.total);

    let allFeatures = [...firstData.response.result.featureCollection.features];

    for (let page = 2; page <= totalPages; page++) {
      const res = await fetch(`${baseUrl}&page=${page}`);
      const data = await res.json();
      allFeatures = [...allFeatures, ...data.response.result.featureCollection.features];
    }

    return Response.json({ features: allFeatures });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}