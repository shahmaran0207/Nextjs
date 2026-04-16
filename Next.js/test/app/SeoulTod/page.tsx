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

  const dark = {
    bg: "#0a0e1a",
    surface: "#1a1d27",
    surface2: "#22263a",
    border: "rgba(56,189,248,0.15)",
    textPrimary: "#e8eaf0",
    textSecondary: "#8b90a7",
    textMuted: "#545874",
    accent: "#38bdf8",
    accentDim: "rgba(56,189,248,0.1)",
  };

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

    fetch('/api/GIS/Seoul/Signal/SignalBatch')
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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: dark.bg }}>
      {/* Digital Twin Header */}
      <header style={{
        background: "rgba(10, 14, 26, 0.95)",
        borderBottom: `1px solid ${dark.border}`,
        padding: "0.75rem 1.5rem",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 16px rgba(56,189,248,0.4)",
            fontSize: "16px",
          }}>
            🚇
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#e8eaf0", lineHeight: 1 }}>
              서울 TOD
            </h1>
            <p style={{ margin: 0, fontSize: "11px", color: "#38bdf8", lineHeight: 1.4, marginTop: "2px" }}>
              실시간 교통 신호 정보
            </p>
          </div>
        </div>

        <nav style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <a
            href="/"
            style={{
              fontSize: "13px",
              color: "#8b90a7",
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.08)",
              transition: "color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = "#e8eaf0";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(56,189,248,0.3)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = "#8b90a7";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            홈으로
          </a>
        </nav>
      </header>

      <div style={{ position: "relative", width: "100%", flex: 1, minHeight: 0 }}>
      <div ref={mapRef} style={{ width: "100%", height: "100vh" }} />

      {signal && (
        <div style={{
          position: "absolute", top: "1rem", right: "1rem",
          background: dark.surface, 
          border: `1px solid ${dark.border}`,
          borderRadius: "14px", padding: "1rem", width: "280px",
          zIndex: 10, overflowY: "auto", maxHeight: "80vh",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontWeight: 600, fontSize: "13px", color: dark.textPrimary }}>{signal.itstId}</span>
            <span style={{ fontSize: "11px", color: dark.textMuted }}>{formatTime(signal.trsmTm)}</span>
          </div>

          {DIRECTIONS.map(({ label, key }) => {
            const sigs = getDirectionSignals(signal, key);
            const hasData = Object.values(sigs).some(v => v && v !== '');
            if (!hasData) return null;

            return (
              <div key={key} style={{ marginBottom: "0.625rem", borderBottom: `1px solid ${dark.border}`, paddingBottom: "0.625rem" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: dark.textSecondary, marginBottom: "6px" }}>{label}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {Object.entries(sigs).map(([name, val]) =>
                    val ? (
                      <span key={name} style={{
                        fontSize: "11px", padding: "2px 8px", borderRadius: "20px",
                        background: val === '녹색' ? "#0d2e20" : val === '적색' ? "#2e1212" : dark.surface2,
                        color: val === '녹색' ? "#3ecf8e" : val === '적색' ? "#f87171" : dark.textSecondary,
                        border: `1px solid ${val === '녹색' ? "#14532d" : val === '적색' ? "#7f1d1d" : dark.border}`,
                      }}>
                        {name} {val}
                      </span>
                    ) : null
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}