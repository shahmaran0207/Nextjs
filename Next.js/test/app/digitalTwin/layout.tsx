"use client";

import { useEffect, useState } from "react";
import { DataProvider, useDataContext } from "./DataContext";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const { dataStats } = useDataContext();
  const [weather, setWeather] = useState<any>(null);
  const [airQuality, setAirQuality] = useState<any>(null);

  useEffect(() => {
    // 클라이언트에서만 시간 설정
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weatherRes, airRes] = await Promise.all([
          fetch("/api/weather/busan"),
          fetch("/api/airquality/busan"),
        ]);
        if (weatherRes.ok) setWeather(await weatherRes.json());
        if (airRes.ok) setAirQuality(await airRes.json());
      } catch (err) {
        console.error("날씨/대기질 로드 실패:", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 600000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div style={{ height: "100vh", width: "100vw", background: "#0a0e1a", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      {/* 그리드 오버레이 */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
        pointerEvents: "none",
        zIndex: 1,
        animation: "gridMove 20s linear infinite",
      }} />

      {/* 데이터 스트림 라인들 */}
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          position: "fixed",
          left: `${20 * i}%`,
          top: 0,
          width: "1px",
          height: "100%",
          background: "linear-gradient(180deg, transparent, rgba(56,189,248,0.2), transparent)",
          animation: `dataStream ${3 + i * 0.5}s ease-in-out infinite`,
          animationDelay: `${i * 0.8}s`,
          pointerEvents: "none",
          zIndex: 1,
        }} />
      ))}

      <style>{`
        @keyframes scanline {
          0% { transform: translateY(0); opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { transform: translateY(calc(100vh - 100px)); opacity: 0; }
        }
        @keyframes scanlineGlow {
          0% { transform: translateY(-100px); opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { transform: translateY(calc(100vh - 100px)); opacity: 0; }
        }
        @keyframes screenPulse {
          0% { opacity: 0.2; }
          25% { opacity: 0.8; }
          50% { opacity: 0.2; }
          75% { opacity: 0.8; }
          100% { opacity: 0.2; }
        }
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        @keyframes dataStream {
          0%, 100% { opacity: 0; transform: translateY(0) scaleY(0); }
          50% { opacity: 1; transform: translateY(50vh) scaleY(1); }
        }
        @keyframes logoPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(56,189,248,0.5); }
          50% { box-shadow: 0 0 30px rgba(56,189,248,0.8); }
        }
        @keyframes liveBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes dataFlow {
          0% { opacity: 0; transform: translateX(-10px); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translateX(10px); }
        }
      `}</style>

      {/* 동적 헤더 */}
      <header style={{
        background: "linear-gradient(180deg, rgba(10,14,26,0.98) 0%, rgba(10,14,26,0.95) 100%)",
        borderBottom: "1px solid rgba(56,189,248,0.2)",
        padding: "0.75rem 1.5rem",
        position: "sticky",
        top: 0,
        zIndex: 200,
        backdropFilter: "blur(20px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* 펄스 로고 */}
          <div style={{
            width: "40px",
            height: "40px",
            background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(56,189,248,0.5)",
            animation: "logoPulse 3s ease-in-out infinite",
            fontSize: "20px",
          }}>
            🏙️
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 700,
              background: "linear-gradient(90deg, #38bdf8, #0ea5e9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1,
            }}>
              부산 디지털트윈
            </h1>
            <p style={{
              margin: 0,
              fontSize: "11px",
              color: "#38bdf8",
              lineHeight: 1.4,
              marginTop: "4px",
              letterSpacing: "0.5px",
            }}>
              실시간 교통 모니터링 시스템
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          {/* LIVE 표시 */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              background: "#22c55e",
              borderRadius: "50%",
              boxShadow: "0 0 10px #22c55e",
              animation: "liveBlink 2s ease-in-out infinite",
            }} />
            <span style={{ fontSize: "13px", color: "#22c55e", fontWeight: 700, letterSpacing: "1px" }}>LIVE</span>
          </div>

          {/* 데이터 카드들 */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {[
              { label: "교통량", value: dataStats.totalTraffic, unit: "개", color: "#38bdf8", icon: "🚗" },
              { label: "평균속도", value: dataStats.avgSpeed, unit: "km/h", color: "#22c55e", icon: "⚡" },
              { label: "공사현장", value: dataStats.activeConstruction, unit: "개", color: "#f59e0b", icon: "🚧" },
            ].map((stat, i) => (
              <div key={i} style={{
                background: "rgba(56,189,248,0.05)",
                border: `1px solid ${stat.color}33`,
                borderRadius: "8px",
                padding: "6px 12px",
                minWidth: "90px",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`,
                  animation: `dataFlow 2s ease-in-out infinite ${i * 0.3}s`,
                }} />
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                  <span style={{ fontSize: "11px" }}>{stat.icon}</span>
                  <span style={{ fontSize: "9px", color: "#8b90a7", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {stat.label}
                  </span>
                </div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: stat.color, fontFamily: "monospace" }}>
                  {stat.value.toLocaleString()}
                  <span style={{ fontSize: "10px", marginLeft: "3px", opacity: 0.7 }}>{stat.unit}</span>
                </div>
              </div>
            ))}
            
            {/* 날씨 카드 */}
            {weather && weather.temperature !== null && (
              <div style={{
                background: "rgba(56,189,248,0.05)",
                border: "1px solid #38bdf833",
                borderRadius: "8px",
                padding: "6px 12px",
                minWidth: "90px",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: "linear-gradient(90deg, transparent, #38bdf8, transparent)",
                  animation: "dataFlow 2s ease-in-out infinite 0.9s",
                }} />
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                  <span style={{ fontSize: "11px" }}>🌡️</span>
                  <span style={{ fontSize: "9px", color: "#8b90a7", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    날씨
                  </span>
                </div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#38bdf8", fontFamily: "monospace" }}>
                  {weather.temperature}
                  <span style={{ fontSize: "10px", marginLeft: "3px", opacity: 0.7 }}>°C</span>
                </div>
              </div>
            )}
            
            {/* 미세먼지 PM10 카드 */}
            {airQuality && airQuality.pm10 !== null && (() => {
              const pm10Grade = getPM10Grade(airQuality.pm10);
              return (
                <div style={{
                  background: "rgba(56,189,248,0.05)",
                  border: `1px solid ${pm10Grade.color}33`,
                  borderRadius: "8px",
                  padding: "6px 12px",
                  minWidth: "100px",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: `linear-gradient(90deg, transparent, ${pm10Grade.color}, transparent)`,
                    animation: "dataFlow 2s ease-in-out infinite 1.2s",
                  }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                    <span style={{ fontSize: "11px" }}>🌫️</span>
                    <span style={{ fontSize: "9px", color: "#8b90a7", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      미세먼지
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: pm10Grade.color, fontFamily: "monospace" }}>
                      {airQuality.pm10}
                    </div>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: pm10Grade.color,
                      padding: "2px 6px",
                      background: `${pm10Grade.color}30`,
                      borderRadius: "4px",
                      border: `1px solid ${pm10Grade.color}50`,
                    }}>
                      {pm10Grade.text}
                    </span>
                  </div>
                </div>
              );
            })()}
            
            {/* 초미세먼지 PM2.5 카드 */}
            {airQuality && airQuality.pm25 !== null && (() => {
              const pm25Grade = getPM25Grade(airQuality.pm25);
              return (
                <div style={{
                  background: "rgba(56,189,248,0.05)",
                  border: `1px solid ${pm25Grade.color}33`,
                  borderRadius: "8px",
                  padding: "6px 12px",
                  minWidth: "100px",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: `linear-gradient(90deg, transparent, ${pm25Grade.color}, transparent)`,
                    animation: "dataFlow 2s ease-in-out infinite 1.5s",
                  }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                    <span style={{ fontSize: "11px" }}>💨</span>
                    <span style={{ fontSize: "9px", color: "#8b90a7", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      초미세먼지
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: pm25Grade.color, fontFamily: "monospace" }}>
                      {airQuality.pm25}
                    </div>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: pm25Grade.color,
                      padding: "2px 6px",
                      background: `${pm25Grade.color}30`,
                      borderRadius: "4px",
                      border: `1px solid ${pm25Grade.color}50`,
                    }}>
                      {pm25Grade.text}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 시계 */}
          <div style={{
            background: "rgba(56,189,248,0.08)",
            border: "1px solid rgba(56,189,248,0.2)",
            borderRadius: "8px",
            padding: "6px 14px",
          }}>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#38bdf8", fontFamily: "monospace" }}>
              {currentTime ? currentTime.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--"}
            </div>
          </div>

          {/* 네비게이션 */}
          <nav style={{ display: "flex", gap: "0.5rem" }}>
            <a
              href="/"
              style={{
                fontSize: "13px",
                color: "#8b90a7",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.08)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "#e8eaf0";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(56,189,248,0.3)";
                (e.currentTarget as HTMLElement).style.background = "rgba(56,189,248,0.05)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "#8b90a7";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              홈으로
            </a>
            <a
              href="/map"
              style={{
                fontSize: "13px",
                color: "#8b90a7",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.08)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "#e8eaf0";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(56,189,248,0.3)";
                (e.currentTarget as HTMLElement).style.background = "rgba(56,189,248,0.05)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "#8b90a7";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              2D 지도
            </a>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 10 }}>
        {/* 스캔라인 효과 - 헤더 아래에서만 */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, transparent, rgba(56,189,248,1), transparent)",
          animation: "scanline 4s linear infinite",
          zIndex: 9999,
          pointerEvents: "none",
          boxShadow: "0 0 30px rgba(56,189,248,1), 0 0 60px rgba(56,189,248,0.8), 0 0 100px rgba(56,189,248,0.5)",
        }} />
        
        {/* 스캔라인 글로우 효과 */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "200px",
          background: "radial-gradient(ellipse at center, rgba(56,189,248,0.4) 0%, rgba(56,189,248,0.2) 40%, transparent 70%)",
          animation: "scanlineGlow 4s linear infinite",
          zIndex: 9998,
          pointerEvents: "none",
          filter: "blur(30px)",
        }} />
        
        {/* 전체 화면 펄스 효과 */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(56,189,248,0.05)",
          animation: "screenPulse 4s ease-in-out infinite",
          zIndex: 9997,
          pointerEvents: "none",
        }} />
        
        {children}
      </main>
    </div>
  );
}

export default function DigitalTwinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DataProvider>
      <LayoutContent>{children}</LayoutContent>
    </DataProvider>
  );
}