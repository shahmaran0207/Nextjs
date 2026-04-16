"use client";

export default function DigitalTwinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* 다크 상단 헤더 */}
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
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* 글로우 로고 */}
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
              실시간 교통 모니터링
            </p>
          </div>
        </div>

        <nav style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {/* 실시간 상태 표시 */}
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
          <style>{`
            @keyframes livePulse {
              0%,100% { opacity:1; box-shadow: 0 0 8px #4ade80; }
              50% { opacity:0.6; box-shadow: 0 0 16px #4ade80; }
            }
          `}</style>

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
          <a
            href="/map"
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
            2D 지도
          </a>
        </nav>
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {children}
      </main>
    </div>
  );
}