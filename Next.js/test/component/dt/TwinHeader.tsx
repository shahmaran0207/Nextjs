"use client";

import { useEffect, useState } from "react";

export default function TwinHeader() {
  const [weather, setWeather] = useState<any>(null);
  const [airQuality, setAirQuality] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weatherRes, airRes] = await Promise.all([
          fetch("/api/weather/busan"),
          fetch("/api/airquality/busan"),
        ]);

        if (weatherRes.ok) {
          const data = await weatherRes.json();
          setWeather(data);
        }

        if (airRes.ok) {
          const data = await airRes.json();
          setAirQuality(data);
        }
      } catch (err) {
        console.error("날씨/대기질 로드 실패:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 600000); // 10분마다
    return () => clearInterval(interval);
  }, []);

  const getPM10Grade = (value: number | null) => {
    if (value === null) return { text: "-", color: "#8b90a7" };
    if (value <= 30) return { text: "좋음", color: "#10b981" };
    if (value <= 80) return { text: "보통", color: "#f59e0b" };
    if (value <= 150) return { text: "나쁨", color: "#ef4444" };
    return { text: "매우나쁨", color: "#991b1b" };
  };

  const pm10Grade = getPM10Grade(airQuality?.pm10 || null);

  return (
    <header style={{
      background: "rgba(10, 14, 26, 0.95)",
      borderBottom: "1px solid rgba(56,189,248,0.15)",
      padding: "0.75rem 1.5rem",
      position: "sticky",
      top: 0,
      zIndex: 200,
      backdropFilter: "blur(12px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <style>{`
        @keyframes livePulse {
          0%,100% { opacity:1; box-shadow: 0 0 8px #4ade80; }
          50% { opacity:0.6; box-shadow: 0 0 16px #4ade80; }
        }
        .dt-nav-link {
          font-size: 13px;
          color: #8b90a7;
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.08);
          transition: color 0.15s, border-color 0.15s;
        }
        .dt-nav-link:hover {
          color: #e8eaf0;
          border-color: rgba(56,189,248,0.3);
        }
      `}</style>

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
          🗺
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#e8eaf0", lineHeight: 1 }}>
            부산 디지털트윈
          </h1>
          <p style={{ margin: 0, fontSize: "11px", color: "#38bdf8", lineHeight: 1.4, marginTop: "2px" }}>
            실시간 교통 모니터링 시스템
          </p>
        </div>
      </div>

      {/* 중앙: 날씨 및 대기질 정보 */}
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        {weather && weather.temperature !== null && (
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "16px" }}>🌡️</span>
              <span style={{ color: "#38bdf8", fontSize: "14px", fontWeight: 600 }}>
                {weather.temperature}°C
              </span>
            </div>
            {weather.humidity !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ fontSize: "14px" }}>💧</span>
                <span style={{ color: "#8b90a7", fontSize: "12px" }}>
                  {weather.humidity}%
                </span>
              </div>
            )}
          </div>
        )}

        {airQuality && airQuality.pm10 !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "14px" }}>🌫️</span>
            <span style={{ color: "#8b90a7", fontSize: "11px" }}>PM10</span>
            <span style={{ color: pm10Grade.color, fontSize: "12px", fontWeight: 600 }}>
              {airQuality.pm10}
            </span>
            <span style={{
              color: pm10Grade.color,
              fontSize: "10px",
              padding: "2px 6px",
              background: `${pm10Grade.color}20`,
              borderRadius: "4px",
            }}>
              {pm10Grade.text}
            </span>
          </div>
        )}
      </div>

      <nav style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginRight: "16px" }}>
          <span style={{
            display: "inline-block",
            width: "8px",
            height: "8px",
            background: "#4ade80",
            borderRadius: "50%",
            boxShadow: "0 0 8px #4ade80",
            animation: "livePulse 2s infinite",
          }} />
          <span style={{ fontSize: "12px", color: "#4ade80", fontWeight: 600 }}>LIVE</span>
        </div>
        <a href="/" className="dt-nav-link">홈으로</a>
        <a href="/map" className="dt-nav-link">2D 지도</a>
      </nav>
    </header>
  );
}
