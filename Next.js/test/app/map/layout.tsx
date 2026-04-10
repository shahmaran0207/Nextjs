export const metadata = {
  title: "지도",
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", display: "flex", flexDirection: "column" }}>
      <header style={{
        background: "#1a1d27",
        borderBottom: "1px solid #2e3247",
        padding: "0.875rem 1.5rem",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "15px", fontWeight: 600, color: "#e8eaf0" }}>지도</span>
          <nav style={{ display: "flex", gap: "1.25rem" }}>
            <a href="/" style={{ fontSize: "13px", color: "#8b90a7", textDecoration: "none" }}>홈으로</a>
            <a href="/write" style={{ fontSize: "13px", color: "#8b90a7", textDecoration: "none" }}>글쓰기</a>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </main>
    </div>
  );
}
