"use client"

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { useEffect, useState } from "react";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

export default function ApiDocs() {
  useAuthGuard();

  const [spec, setSpec] = useState(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    // 클라이언트에서만 시간 설정
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch("/api/swagger")
      .then(res => res.json())
      .then(data => setSpec(data));
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw", background: "#0a0e1a", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      {/* 그리드 오버레이 */}
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Swagger UI 다크 테마 오버라이드 ── */
        .swagger-ui { background: transparent !important; animation: fadeIn 0.5s ease; }
        .swagger-ui .wrapper { padding: 0 1.5rem 1.5rem !important; max-width: 100% !important; }
        .swagger-ui .scheme-container {
          background: rgba(10,14,26,0.9) !important;
          border-bottom: 1px solid rgba(56,189,248,0.2) !important;
          box-shadow: none !important;
          padding: 0.75rem 1.5rem !important;
        }
        .swagger-ui .information-container {
          background: transparent !important;
          padding: 1rem 0 0.5rem !important;
        }
        .swagger-ui .info .title {
          color: #38bdf8 !important;
          font-family: monospace !important;
          font-size: 1.4rem !important;
        }
        .swagger-ui .info p, .swagger-ui .info li, .swagger-ui .info table {
          color: #8b90a7 !important;
        }
        .swagger-ui .info .base-url { color: #38bdf8 !important; }
        .swagger-ui .opblock-tag {
          color: #e8eaf0 !important;
          border-bottom: 1px solid rgba(56,189,248,0.2) !important;
        }
        .swagger-ui .opblock-tag:hover { background: rgba(56,189,248,0.05) !important; }
        .swagger-ui .opblock {
          background: rgba(56,189,248,0.04) !important;
          border: 1px solid rgba(56,189,248,0.15) !important;
          border-radius: 8px !important;
          margin-bottom: 8px !important;
          box-shadow: none !important;
        }
        .swagger-ui .opblock.opblock-get { border-left: 3px solid #38bdf8 !important; }
        .swagger-ui .opblock.opblock-post { border-left: 3px solid #10b981 !important; }
        .swagger-ui .opblock.opblock-put { border-left: 3px solid #f59e0b !important; }
        .swagger-ui .opblock.opblock-delete { border-left: 3px solid #ef4444 !important; }
        .swagger-ui .opblock.opblock-patch { border-left: 3px solid #a855f7 !important; }
        .swagger-ui .opblock .opblock-summary {
          background: transparent !important;
        }
        .swagger-ui .opblock .opblock-summary-method {
          border-radius: 4px !important;
          font-family: monospace !important;
          font-size: 12px !important;
          min-width: 70px !important;
        }
        .swagger-ui .opblock .opblock-summary-path {
          color: #e8eaf0 !important;
          font-family: monospace !important;
        }
        .swagger-ui .opblock .opblock-summary-description {
          color: #8b90a7 !important;
        }
        .swagger-ui .opblock-body { background: transparent !important; }
        .swagger-ui .opblock-section-header {
          background: rgba(56,189,248,0.06) !important;
          border-bottom: 1px solid rgba(56,189,248,0.1) !important;
        }
        .swagger-ui .opblock-section-header h4 { color: #38bdf8 !important; }
        .swagger-ui .parameters-col_description p,
        .swagger-ui .parameter__name,
        .swagger-ui .parameter__type,
        .swagger-ui .parameter__deprecated,
        .swagger-ui label { color: #8b90a7 !important; }
        .swagger-ui .parameter__name.required { color: #e8eaf0 !important; }
        .swagger-ui .parameter__name.required::after { color: #ef4444 !important; }
        .swagger-ui table thead tr td, .swagger-ui table thead tr th {
          color: #38bdf8 !important;
          border-bottom: 1px solid rgba(56,189,248,0.2) !important;
        }
        .swagger-ui table tbody tr td { color: #8b90a7 !important; border-bottom: 1px solid rgba(56,189,248,0.08) !important; }
        .swagger-ui input[type=text], .swagger-ui textarea, .swagger-ui select {
          background: rgba(56,189,248,0.05) !important;
          border: 1px solid rgba(56,189,248,0.2) !important;
          color: #e8eaf0 !important;
          border-radius: 6px !important;
        }
        .swagger-ui input[type=text]:focus, .swagger-ui textarea:focus {
          border-color: #38bdf8 !important;
          outline: none !important;
          box-shadow: 0 0 0 2px rgba(56,189,248,0.15) !important;
        }
        .swagger-ui .btn {
          background: rgba(56,189,248,0.1) !important;
          border: 1px solid rgba(56,189,248,0.3) !important;
          color: #38bdf8 !important;
          border-radius: 6px !important;
          font-family: monospace !important;
          transition: all 0.2s !important;
        }
        .swagger-ui .btn:hover {
          background: rgba(56,189,248,0.2) !important;
          border-color: #38bdf8 !important;
        }
        .swagger-ui .btn.execute {
          background: rgba(56,189,248,0.15) !important;
          border-color: #38bdf8 !important;
          color: #38bdf8 !important;
        }
        .swagger-ui .btn.execute:hover { background: rgba(56,189,248,0.25) !important; }
        .swagger-ui .responses-inner h4, .swagger-ui .responses-inner h5 { color: #38bdf8 !important; }
        .swagger-ui .response-col_status { color: #22c55e !important; font-family: monospace !important; }
        .swagger-ui .response-col_description { color: #8b90a7 !important; }
        .swagger-ui .highlight-code, .swagger-ui .microlight {
          background: rgba(0,0,0,0.4) !important;
          border: 1px solid rgba(56,189,248,0.1) !important;
          border-radius: 6px !important;
          color: #a5f3fc !important;
          font-family: monospace !important;
        }
        .swagger-ui .curl-command { color: #a5f3fc !important; }
        .swagger-ui section.models {
          border: 1px solid rgba(56,189,248,0.15) !important;
          border-radius: 8px !important;
          background: rgba(56,189,248,0.03) !important;
        }
        .swagger-ui section.models h4 { color: #38bdf8 !important; }
        .swagger-ui .model-title { color: #e8eaf0 !important; }
        .swagger-ui .model { color: #8b90a7 !important; }
        .swagger-ui .prop-type { color: #38bdf8 !important; }
        .swagger-ui .prop-format { color: #f59e0b !important; }
        .swagger-ui .model-toggle:after { background: #38bdf8 !important; }
        .swagger-ui svg { fill: #38bdf8 !important; }
        .swagger-ui .arrow { fill: #38bdf8 !important; }
        .swagger-ui .servers > label select { 
          background: rgba(10,14,26,0.9) !important;
          border: 1px solid rgba(56,189,248,0.2) !important;
          color: #38bdf8 !important;
        }
        .swagger-ui .servers > label { color: #8b90a7 !important; }
        .swagger-ui .authorization__btn { fill: #38bdf8 !important; }
        .swagger-ui .unlocked { fill: #ef4444 !important; }
        .swagger-ui .locked { fill: #22c55e !important; }
        .swagger-ui .dialog-ux .modal-ux {
          background: #0d1117 !important;
          border: 1px solid rgba(56,189,248,0.3) !important;
          border-radius: 12px !important;
          box-shadow: 0 0 40px rgba(56,189,248,0.2) !important;
        }
        .swagger-ui .dialog-ux .modal-ux-header {
          background: rgba(56,189,248,0.08) !important;
          border-bottom: 1px solid rgba(56,189,248,0.2) !important;
        }
        .swagger-ui .dialog-ux .modal-ux-header h3 { color: #38bdf8 !important; }
        .swagger-ui .dialog-ux .modal-ux-content { color: #8b90a7 !important; }
        .swagger-ui .topbar { display: none !important; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(56,189,248,0.03); }
        ::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.2); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(56,189,248,0.4); }
      `}</style>

      {/* 헤더 */}
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
            width: "40px", height: "40px",
            background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(56,189,248,0.5)",
            animation: "logoPulse 3s ease-in-out infinite",
            fontSize: "20px",
          }}>
            📡
          </div>
          <div>
            <h1 style={{
              margin: 0, fontSize: "18px", fontWeight: 700,
              background: "linear-gradient(90deg, #38bdf8, #0ea5e9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1,
            }}>
              API Documentation
            </h1>
            <p style={{
              margin: 0, fontSize: "11px", color: "#38bdf8",
              lineHeight: 1.4, marginTop: "4px", letterSpacing: "0.5px",
            }}>
              REST API 명세 & 인터랙티브 테스트
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          {/* LIVE 표시 */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              display: "inline-block", width: "8px", height: "8px",
              background: "#22c55e", borderRadius: "50%",
              boxShadow: "0 0 10px #22c55e",
              animation: "liveBlink 2s ease-in-out infinite",
            }} />
            <span style={{ fontSize: "13px", color: "#22c55e", fontWeight: 700, letterSpacing: "1px" }}>LIVE</span>
          </div>

          {/* 상태 배지들 */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {[
              { label: "버전", value: "v1.0", color: "#38bdf8", icon: "🔖" },
              { label: "엔드포인트", value: spec ? "활성화" : "로딩중", color: spec ? "#22c55e" : "#f59e0b", icon: "🔗" },
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
                  position: "absolute", top: 0, left: 0, right: 0, height: "2px",
                  background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`,
                  animation: `dataFlow 2s ease-in-out infinite ${i * 0.3}s`,
                }} />
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                  <span style={{ fontSize: "11px" }}>{stat.icon}</span>
                  <span style={{ fontSize: "9px", color: "#8b90a7", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {stat.label}
                  </span>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: stat.color, fontFamily: "monospace" }}>
                  {stat.value}
                </div>
              </div>
            ))}
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
                fontSize: "13px", color: "#8b90a7", textDecoration: "none",
                padding: "6px 12px", borderRadius: "8px",
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
            <button
              onClick={() => {
                sessionStorage.removeItem("token");
                window.location.href = "/Login";
              }}
              style={{
                padding: "6px 14px",
                background: "rgba(56,189,248,0.08)",
                border: "1px solid rgba(56,189,248,0.3)",
                borderRadius: "8px", color: "#38bdf8",
                fontSize: "13px", fontWeight: 500, cursor: "pointer",
                transition: "background 0.15s, border-color 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(56,189,248,0.18)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#38bdf8";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(56,189,248,0.08)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(56,189,248,0.3)";
              }}
            >
              로그아웃
            </button>
          </nav>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 10 }}>


        {/* 로딩 상태 */}
        {!spec ? (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "16px",
          }}>
            <div style={{
              width: "60px", height: "60px",
              border: "2px solid rgba(56,189,248,0.2)",
              borderTop: "2px solid #38bdf8",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }} />
            <p style={{ color: "#38bdf8", fontFamily: "monospace", fontSize: "14px", letterSpacing: "2px" }}>
              API SPEC LOADING...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 10 }}>
            <SwaggerUI spec={spec} />
          </div>
        )}
      </main>
    </div>
  );
}