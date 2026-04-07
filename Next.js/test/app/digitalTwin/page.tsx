import { getBusanLink, getBusanTraffic, getBusanBit } from '../../lib/busanData';
import TwinMap from '@/component/TwinMap';

export default async function digitalTwin() {
  
  const [linkData, trafficData, bitData ] = await Promise.all([
    getBusanLink(),
    getBusanTraffic(),
    getBusanBit(),
  ]);

  return(
    <TwinMap
      linkData={linkData}
      trafficData={trafficData}
      bitData={bitData}
    />
  );
}