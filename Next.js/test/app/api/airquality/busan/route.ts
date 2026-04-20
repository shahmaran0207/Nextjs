import { NextResponse } from "next/server";

/**
 * 부산 대기질 정보 조회
 */
export async function GET() {
  try {
    const serviceKey = process.env.BUSAN_AIR_QUALITY_KEY;
    const url = `https://apis.data.go.kr/6260000/AirQualityInfoService/getAirQualityInfoClassifiedByStation?serviceKey=${serviceKey}&pageNo=1&numOfRows=100&resultType=json`;

    console.log("대기질 API 호출:", url.replace(serviceKey!, "***"));

    const response = await fetch(url, {
      next: { revalidate: 1800 }, // 30분 캐시
    });

    const text = await response.text();
    console.log("대기질 API 응답:", text.substring(0, 500));

    if (!response.ok) {
      console.error("대기질 API 에러:", response.status, text);
      // 에러여도 기본값 반환
      return NextResponse.json({
        pm10: null,
        pm25: null,
        station: "데이터 없음",
        error: `API 에러: ${response.status}`,
      });
    }

    const data = JSON.parse(text);
    const items = data.response?.body?.items?.item || [];

    if (items.length === 0) {
      return NextResponse.json({
        pm10: null,
        pm25: null,
        station: "데이터 없음",
      });
    }

    // 부산시청 또는 중구 측정소 우선, 없으면 첫 번째 측정소
    const targetStation = items.find(
      (item: any) =>
        item.site?.includes("중구") ||
        item.site?.includes("시청") ||
        item.site?.includes("부산진")
    ) || items[0];

    // pm10, pm25 값을 숫자로 변환 (문자열 "35.0" -> 35)
    const pm10Value = targetStation.pm10 ? Math.round(parseFloat(targetStation.pm10)) : null;
    const pm25Value = targetStation.pm25 ? Math.round(parseFloat(targetStation.pm25)) : null;

    console.log(`대기질 데이터 파싱: ${targetStation.site} - PM10: ${pm10Value}, PM2.5: ${pm25Value}`);

    return NextResponse.json({
      pm10: pm10Value,
      pm25: pm25Value,
      station: targetStation.site || "알 수 없음",
      dataTime: targetStation.controlnumber || null,
    });
  } catch (err: any) {
    console.error("대기질 API 에러:", err.message);
    // 에러여도 기본값 반환
    return NextResponse.json({
      pm10: null,
      pm25: null,
      station: "데이터 없음",
      error: err.message,
    });
  }
}
