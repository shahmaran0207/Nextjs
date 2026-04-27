import { getBusanLink, getBusanBit, getBusanBoundary, getBusanConstruction, getBusanThemeTravel } from '../../lib/busanData';
import TwinMap from '@/component/TwinMap';

// 소통정보는 내부 API(/api/GIS/Busan/Traffic)에서 담당하므로 페이지는 force-dynamic 유지
export const dynamic = 'force-dynamic';

export default async function DigitalTwinPage({ searchParams }: { searchParams: Promise<{ tracking_number?: string, address?: string }> }) {
  const resolvedParams = await searchParams;
  const trackingNumber = resolvedParams.tracking_number;
  const address = resolvedParams.address;

  // 소통정보는 내부 API 호출 (서버 메모리 캐시 5분 적용 → rate limit 방지)
  const trafficRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/GIS/Busan/Traffic`, {
    cache: 'no-store',
  });
  const trafficData = trafficRes.ok ? await trafficRes.json() : [];

  // 링크 데이터는 클라이언트에서 뷰포트 기반으로 동적 로딩
  // const [linkData, bitData, boundaryData, constructionData, themeTravelData] = await Promise.all([
  //   getBusanLink(),
  //   getBusanBit(),
  //   getBusanBoundary(),
  //   getBusanConstruction(),
  //   getBusanThemeTravel(),
  // ]);

  const [bitData, boundaryData, constructionData, themeTravelData] = await Promise.all([
    getBusanBit(),
    getBusanBoundary(),
    getBusanConstruction(),
    getBusanThemeTravel(),
  ]);

  // 초기 링크 데이터는 빈 GeoJSON (클라이언트에서 동적 로딩)
  const linkData = {
    type: "FeatureCollection",
    features: [],
  };

  return (
    <TwinMap
      linkData={linkData}
      trafficData={trafficData}
      bitData={bitData}
      boundaryData={boundaryData}
      constructionData={constructionData}
      themeTravelData={themeTravelData}
      trackingNumber={trackingNumber}
      shippingAddress={address}
    />
  );
}
