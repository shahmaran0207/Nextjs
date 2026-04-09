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

  function getMarkerColor(signal: any): string {
    if (!signal) return 'gray';
    
    const vals = [
      signal.ntStsgStatNm, signal.stStsgStatNm,
      signal.etStsgStatNm, signal.wtStsgStatNm,
      signal.neStsgStatNm, signal.nwStsgStatNm,
      signal.seStsgStatNm, signal.swStsgStatNm,
    ].filter(Boolean);

    if (vals.length === 0) return 'gray';

    if (vals.some(v => v === 'protected-Movement-Allowed' || v === 'permissive-Movement-Allowed')) return 'green';
    if (vals.some(v => v === 'protected-clearance')) return 'yellow';
    if (vals.some(v => v === 'stop-And-Remain')) return 'red';
    return 'gray';
  }

  function makeColorMarker(color: string) {
    const hex: Record<string, string> = {
      green: '#22c55e',
      red: '#ef4444',
      yellow: '#eab308',
      gray: '#9ca3af',
    };
    const fill = hex[color] ?? hex.gray;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="${fill}" stroke="white" stroke-width="2"/></svg>`;
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    const size = new window.kakao.maps.Size(24, 24);
    return new window.kakao.maps.MarkerImage(url, size);
  };

  
  const kakaoMapRef = useRef<any>(null);

  useEffect(() => {
    if (!kakaoMapRef.current) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    fetch('/api/SignalBatch')
      .then(res => res.json())
      .then(data => {
        const signalMap = Object.fromEntries(
          data.items.map((i: any) => [i.itstId, i])
        );

        // crossRoads에서 신호 데이터 있는 것만 마커 표시
        crossRoads.forEach((road) => {
          const signal = signalMap[road.itstId];
          if (!signal) return; // 신호 없는 교차로는 스킵
          const color = getMarkerColor(signal);

          const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(road.mapCtptIntLat, road.mapCtptIntLot),
            map: kakaoMapRef.current,
            image: makeColorMarker(color),
          });

          markersRef.current.push(marker);
        });
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