"use client";

export default function TwinHeader() {
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
            실시간 교통 모니터링
          </p>
        </div>
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
