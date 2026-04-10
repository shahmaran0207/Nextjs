import { NextResponse } from "next/server";

export async function GET() {
    const url = new URL("http://t-data.seoul.go.kr/apig/apiman-gateway/tapi/v2xSignalPhaseInformation/1.0");
    url.searchParams.set("apiKey", process.env.TDATA_API_KEY!);
    url.searchParams.set("type", "json");
    url.searchParams.set("pageNo", "1");
    url.searchParams.set("numOfRows", "1000");

    try {
        const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
        const data = await res.json();
        const items = Array.isArray(data) ? data : [];
        return NextResponse.json({ items });
    } catch {
        return NextResponse.json({ items: [] });
    }
}
