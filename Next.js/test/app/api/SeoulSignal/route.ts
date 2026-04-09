import { NextResponse } from "next/server";
 
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const itstId = searchParams.get("itstId");

    if(!itstId) {
        return NextResponse.json({error: "itstId is required"}, { status: 400});
    };

    const url = new URL(
        "http://t-data.seoul.go.kr/apig/apiman-gateway/tapi/v2xSignalPhaseInformation/1.0"
    );

    url.searchParams.set("apiKey", process.env.TDATA_API_KEY!);
    url.searchParams.set("type", "json");
    url.searchParams.set("pageNo", "1");
    url.searchParams.set("numOfRows", "1");
    url.searchParams.set("itstId", itstId);

    try {
        const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
        const data = await res.json();

        const item = data?.body?.items?.[0] ?? null;
        console.log('signal API response for', itstId, ':', res.status, JSON.stringify(data).slice(0, 300));

        return Response.json({ item });
    } catch (err) {
        console.error("TOD Signal API error::::::", err);
        return NextResponse.json(
            {error: "Failed to Ftech TOD signal data"},
            { status: 500}
        );
    }
    
}