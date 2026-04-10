import { NextResponse } from "next/server";

let cachedItems: any[] = [];
let cacheTime = 0;
const CACHE_TTL_MS = 60*60*1000;

function getDistanceMeters(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const R = 6371000;
    const dLat = ((lat2-lat1)*Math.PI)/180;
    const dLng = ((lng2-lng1)*Math.PI)/180;
    const a = 
        Math.sin(dLat / 2) **2 +
        Math.cos((lat1 * Math.PI)/180)*
        Math.cos((lat2 * Math.PI)/180)*
        Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") ?? "0");
    const lng = parseFloat(searchParams.get("lng") ?? "0");
    const radius = parseFloat(searchParams.get("radius") ?? "1000");

    const now = Date.now();

    if(cachedItems.length === 0 || now - cacheTime > CACHE_TTL_MS) {
        const url = new URL(
            "http://t-data.seoul.go.kr/apig/apiman-gateway/tapi/v2xCrossroadMapInformation/1.0"
        );

        url.searchParams.set("apiKey", process.env.TDATA_API_KEY!)
        url.searchParams.set("type", "json");
        url.searchParams.set("pageNo", "1");
        url.searchParams.set("numOfRows", "1000");

        const res = await fetch(url.toString());
        const data = await res.json();

        cachedItems = Array.isArray(data) ? data : (data?.body?.items ?? data?.items ?? []);
        cacheTime = now;
    }

    const filtered = cachedItems.filter((item: any) => {
        const dist = getDistanceMeters(
            lat, lng,
            parseFloat(item.mapCtptIntLat),
            parseFloat(item.mapCtptIntLot)
        );

        return dist <=radius;
    });

    return NextResponse.json({ items: filtered})
}