"use client";

import { useEffect, useRef, useState } from "react";
import { SignalData } from "@/types/signal";
import { useCrossRoad } from "@/hooks/useCrossRoad";
import { useSignalPolling } from "@/hooks/useSignalPooling";

const DIRECTIONS = [
  { label: '북', key: 'nt' },
  { label: '남', key: 'st' },
  { label: '동', key: 'et' },
  { label: '서', key: 'wt' },
  { label: '북동', key: 'ne' },
  { label: '북서', key: 'nw' },
  { label: '남동', key: 'se' },
  { label: '남서', key: 'sw' },
] as const

type DirectionKey = typeof DIRECTIONS[number]['key'];

function getDirectionSignals(signal: SignalData, key: DirectionKey ) {
  return {
    직진: signal[`${key}StsgStatNm`],
    좌회전: signal[`${key}LtsgStatNm`],
    보행: signal[`${key}PdsgStatNm`],
    버스: signal[`${key}BssgStatNm`],
    자전거: signal[`${key}BcsgStatNm`],
    유턴: signal[`${key}UtsgStatNm`]
  }
};

function formatTime(trsmTm: string) {
  const h = trsmTm.slice(0,2);
  const m = trsmTm.slice(2,4);
  const s = trsmTm.slice(4,6);
  return `${h}:${m}:${s}`
};

export default function KakaoMap() {
  const [ mapReady, setMapReady ] = useState(false);
  const [ selectedItstId, setSelectedItstId ] = useState<string | null>(null);
  const { crossRoads, fetchIfMoved } = useCrossRoad();
  const signal = useSignalPolling(selectedItstId);
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);

  function getMarkerColor(signal: any) : string {
    if(!signal) return "gray";
     const val = signal.ntStsgStatNm || signal.stStsgStatNm || signal.etStsgStatNm;
    if (val === '녹색') return 'green';
    if (val === "적색") return 'red';
    if (val === '황색') return 'yellow'
    return 'gray';
  };

  function makeColorMarker(color: string) {
    const colors: Record<string, string> = {
      green: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      red: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      yellow: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
      gray: 'https://maps.google.com/mapfiles/ms/icons/grey.png',
    };

    const size = new window.kakao.maps.Size(32, 32);
    return new window.kakao.maps.MarkerImage(colors[color] ?? colors.gray, size);
  };
  
  const kakaoMapRef = useRef<any>(null);

  useEffect(() => {
    if (!kakaoMapRef.current || crossRoads.length === 0) return;
    
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    crossRoads.forEach(async (road) => {
      const res = await fetch(`/api/SeoulSignal?itstId=${road.itstId}`);
      const data = await res.json();
      const signal = data.item;

      const color = getMarkerColor(signal);

      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(road.mapCtptIntLat, road.mapCtptIntLot),
        map: kakaoMapRef.current,
        image: makeColorMarker(color),
      });

      markersRef.current.push(marker);
    });
  }, [crossRoads, mapReady]);

  useEffect(() => {
    const init = async () => {
      if (!window.kakao) return;

      window.kakao.maps.load(() => {
        if (!mapRef.current) return;

        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(37.4979, 127.0276),
          level: 6,
        });
        kakaoMapRef.current = map;

        setTimeout(() => fetchIfMoved(37.4979, 127.0276), 100);

        setMapReady(true);
        window.kakao.maps.event.addListener(map, 'idle', () => {
          const center = map.getCenter();
          fetchIfMoved(center.getLat(), center.getLng())
        })
      });
    };

    
    init();
  }, []);

  return (
    <div className="relative w-full h-screen">
      <div ref={mapRef} className="w-full h-screen" />

      {signal && (
        <div className="absolute top-4 right-4 bg-white rounded-xl shadow-lg p-4 w-72 z-10 overflow-y-auto max-h-[80vh]">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-sm">{signal.itstId}</span>
            <span className="text-xs text-gray-400">{formatTime(signal.trsmTm)}</span>
          </div>

          {DIRECTIONS.map(({label, key})  => {
            const sigs = getDirectionSignals(signal, key);
            const hasData = Object.values(sigs).some(v => v && v !== '');
            if (!hasData) return null;
            
            return (
              <div key={key} className="mb-2 border-b pb-2">
                <p className="text-xs font-semibold text-gray-600 mb-1">{label}</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(sigs).map(([name, val]) =>
                    val? (
                      <span key={name} className={`text-xs px-2 py-0.5 rounded-full ${val==='녹색'? 'bg-green-100 text-green-700': val==='적색'? 'bg-red-100 text-red-700': 'bg-gray-100 text-gray-600'}`}>
                        {name} {val}
                      </span>
                    ): null)}
                </div>
              </div>
            )
          })}

        </div>
      )}
    </div>
  );
}