"use client";

import { useEffect, useState } from "react";

interface WeatherData {
  temperature: number | null;
  humidity: number | null;
  rainfall: number | null;
  windSpeed: number | null;
}

interface AirQualityData {
  pm10: number | null;
  pm25: number | null;
  station: string;
}

export default function WeatherHeader() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weatherRes, airRes] = await Promise.all([
          fetch("/api/weather/busan"),
          fetch("/api/airquality/busan"),
        ]);

        if (weatherRes.ok) {
          const weatherData = await weatherRes.json();
          setWeather(weatherData);
        }

        if (airRes.ok) {
          const airData = await airRes.json();
          setAirQuality(airData);
        }
      } catch (err) {
        console.error("날씨/대기질 데이터 로드 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // 10분마다 갱신
    const interval = setInterval(fetchData, 600000);
    return () => clearInterval(interval);
  }, []);

  // 미세먼지 등급 계산
  const getPM10Grade = (value: number | null) => {
    if (value === null) return { text: "-", color: "#8b90a7" };
    if (value <= 30) return { text: "좋음", color: "#10b981" };
    if (value <= 80) return { text: "보통", color: "#f59e0b" };
    if (value <= 150) return { text: "나쁨", color: "#ef4444" };
    return { text: "매우나쁨", color: "#991b1b" };
  };

  const getPM25Grade = (value: number | null) => {
    if (value === null) return { text: "-", color: "#8b90a7" };
    if (value <= 15) return { text: "좋음", color: "#10b981" };
    if (value <= 35) return { text: "보통", color: "#f59e0b" };
    if (value <= 75) return { text: "나쁨", color: "#ef4444" };
    return { text: "매우나쁨", color: "#991b1b" };
  };

  const pm10Grade = getPM10Grade(airQuality?.pm10 || null);
  const pm25Grade = getPM25Grade(airQuality?.pm25 || null);

  if (isLoading) {
    return (
      <div
        style={{
          position: "fixed",
          top: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(10, 14, 26, 0.95)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          borderRadius: "12px",
          padding: "12px 20px",
          zIndex: 9999,
          color: "#8b90a7",
          fontSize: "13px",
        }}
      >
        날씨 정보 로딩 중...
      </div>
    );
  }

  // 데이터가 없어도 기본 메시지 표시
  if (!weather && !airQuality) {
    return (
      <div
        style={{
          position: "fixed",
          top: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(10, 14, 26, 0.95)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          borderRadius: "12px",
          padding: "12px 20px",
          zIndex: 9999,
          color: "#ef4444",
          fontSize: "13px",
        }}
      >
        날씨 정보를 불러올 수 없습니다
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(10, 14, 26, 0.95)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        borderRadius: "12px",
        padding: "12px 20px",
        zIndex: 9999,
        display: "flex",
        gap: "24px",
        alignItems: "center",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.2)",
        pointerEvents: "auto",
      }}
    >
      {/* 날씨 정보 */}
      {weather && weather.temperature !== null && (
        <>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "20px" }}>🌡️</span>
              <span style={{ color: "#38bdf8", fontSize: "16px", fontWeight: 600 }}>
                {weather.temperature}°C
              </span>
            </div>

            {weather.humidity !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "16px" }}>💧</span>
                <span style={{ color: "#8b90a7", fontSize: "13px" }}>
                  {weather.humidity}%
                </span>
              </div>
            )}

            {weather.windSpeed !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "16px" }}>💨</span>
                <span style={{ color: "#8b90a7", fontSize: "13px" }}>
                  {weather.windSpeed}m/s
                </span>
              </div>
            )}
          </div>

          {/* 구분선 (대기질 데이터가 있을 때만) */}
          {airQuality && airQuality.pm10 !== null && (
            <div
              style={{
                width: "1px",
                height: "24px",
                background: "rgba(56, 189, 248, 0.2)",
              }}
            />
          )}
        </>
      )}

      {/* 미세먼지 정보 */}
      {airQuality && airQuality.pm10 !== null && (
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>🌫️</span>
            <span style={{ color: "#8b90a7", fontSize: "12px" }}>PM10</span>
            <span
              style={{
                color: pm10Grade.color,
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {airQuality.pm10}
            </span>
            <span
              style={{
                color: pm10Grade.color,
                fontSize: "12px",
                fontWeight: 600,
                padding: "3px 8px",
                background: `${pm10Grade.color}20`,
                borderRadius: "6px",
                border: `1px solid ${pm10Grade.color}40`,
              }}
            >
              {pm10Grade.text}
            </span>
          </div>

          {airQuality.pm25 !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#8b90a7", fontSize: "12px" }}>PM2.5</span>
              <span
                style={{
                  color: pm25Grade.color,
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {airQuality.pm25}
              </span>
              <span
                style={{
                  color: pm25Grade.color,
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "3px 8px",
                  background: `${pm25Grade.color}20`,
                  borderRadius: "6px",
                  border: `1px solid ${pm25Grade.color}40`,
                }}
              >
                {pm25Grade.text}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
