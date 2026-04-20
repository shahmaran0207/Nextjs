import { getBusanLink, getBusanBit, getBusanBoundary, getBusanConstruction, getBusanThemeTravel } from '../../lib/busanData';
import TwinMap from '@/component/TwinMap';

// 소통정보는 내부 API(/api/GIS/Busan/Traffic)에서 담당하므로 페이지는 force-dynamic 유지
export const dynamic = 'force-dynamic';

export default async function DigitalTwinPage() {

  // 소통정보는 내부 API 호출 (서버 메모리 캐시 5분 적용 → rate limit 방지)
  const trafficRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/GIS/Busan/Traffic`, {
    cache: 'no-store',
  });
  const trafficData = trafficRes.ok ? await trafficRes.json() : [];

  const [linkData, bitData, boundaryData, constructionData, themeTravelData] = await Promise.all([
    getBusanLink(),
    getBusanBit(),
    getBusanBoundary(),
    getBusanConstruction(),
    getBusanThemeTravel(),
  ]);

  return (
    <TwinMap
      linkData={linkData}
      trafficData={trafficData}
      bitData={bitData}
      boundaryData={boundaryData}
      constructionData={constructionData}
      themeTravelData={themeTravelData}
    />
  );
}