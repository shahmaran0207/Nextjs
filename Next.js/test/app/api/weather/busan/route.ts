import { NextResponse } from "next/server";

/**
 * 부산 날씨 정보 조회 (기상청 초단기실황)
 * 부산시청 좌표: nx=98, ny=76
 */
export async function GET() {
  try {
    const now = new Date();

    // KST(UTC+9) 기준으로 날짜/시간 계산
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstNow = new Date(now.getTime() + kstOffset);

    // 기상청 초단기실황은 매시 40분 이후 해당 시각 데이터가 발표됨
    // 40분 이전이면 1시간 전 데이터를 요청
    const minutes = kstNow.getUTCMinutes();
    if (minutes < 40) {
      kstNow.setUTCHours(kstNow.getUTCHours() - 1);
    }

    const year = kstNow.getUTCFullYear();
    const month = String(kstNow.getUTCMonth() + 1).padStart(2, "0");
    const day = String(kstNow.getUTCDate()).padStart(2, "0");
    const baseDate = `${year}${month}${day}`;
    const hours = String(kstNow.getUTCHours()).padStart(2, "0");
    const baseTime = `${hours}00`;

    // 부산시청 좌표
    const nx = 98;
    const ny = 76;

    const url = `https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0/getUltraSrtNcst?pageNo=1&numOfRows=10&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}&authKey=${process.env.KMA_API_KEY}`;

    const response = await fetch(url, {
      next: { revalidate: 600 }, // 10분 캐시
    });

    if (!response.ok) {
      throw new Error(`KMA API error: ${response.status}`);
    }

    const data = await response.json();
    const items = data.response?.body?.items?.item || [];

    // 데이터 파싱
    const weatherData: any = {
      temperature: null, // T1H: 기온
      humidity: null, // REH: 습도
      rainfall: null, // RN1: 1시간 강수량
      windSpeed: null, // WSD: 풍속
      baseDate,
      baseTime,
    };

    items.forEach((item: any) => {
      switch (item.category) {
        case "T1H":
          weatherData.temperature = parseFloat(item.obsrValue);
          break;
        case "REH":
          weatherData.humidity = parseFloat(item.obsrValue);
          break;
        case "RN1":
          weatherData.rainfall = parseFloat(item.obsrValue);
          break;
        case "WSD":
          weatherData.windSpeed = parseFloat(item.obsrValue);
          break;
      }
    });

    return NextResponse.json(weatherData);
  } catch (err: any) {
    console.error("날씨 API 에러:", err.message);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
