import { getBusanLink, getBusanTraffic, getBusanBit, getBusanBoundary, getBusanConstruction, getBusanThemeTravel } from '../../lib/busanData';
import TwinMap from '@/component/TwinMap';

export default async function DigitalTwinPage() {
  
  const [linkData, trafficData, bitData, boundaryData, constructionData, themeTravelData] = await Promise.all([
    getBusanLink(),
    getBusanTraffic(),
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