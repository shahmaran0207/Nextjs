"use client"

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

const navItems = [
  { href: "/list", label: "게시글 목록", icon: "📋", desc: "전체 게시글을 확인하세요" },
  { href: "/map", label: "지도", icon: "🗺️", desc: "지도 기반 정보를 탐색하세요" },
  { href: "/digitalTwin", label: "디지털트윈", icon: "🏙️", desc: "디지털 트윈 시뮬레이션" },
  { href: "/index", label: "Todo List", icon: "✅", desc: "할 일을 관리하세요" },
  { href: "/FCM", label: "FCM", icon: "🔔", desc: "푸시 알림 설정" },
  { href: "/chat", label: "웹소켓 채팅", icon: "💬", desc: "실시간 채팅에 참여하세요" },
  { href: "/QnA", label: "QnA", icon: "❓", desc: "질문과 답변을 확인하세요" },
  { href: "/SeoulTod", label: "서울 TOD", icon: "🚇", desc: "서울 대중교통 정보" },
  { href: "/email", label: "이메일 인증", icon: "📧", desc: "이메일 인증" },
  { href: "/NaverLogin", label: "네이버 로그인", icon: "🌐", desc: "네이버 로그인" },
  { href: "/api-docs", label: "API 문서", icon: "📃", desc: "Swagger 파일" },
  { href: "/ADMIN", label: "ADMIN PAGE", icon: "🔒", desc: "ADMIN PAGE" },
];

export default function Page() {

  return (
    <div style={{
      minHeight: "100vh",
      background: dark.bg,
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Digital Twin Header */}
      <header style={{
        background: "rgba(10, 14, 26, 0.95)",
        borderBottom: `1px solid ${dark.border}`,
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
            🏠
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#e8eaf0", lineHeight: 1 }}>
              메인 페이지
            </h1>
            <p style={{ margin: 0, fontSize: "11px", color: "#38bdf8", lineHeight: 1.4, marginTop: "2px" }}>
              원하는 기능을 선택하세요
            </p>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, padding: "2rem 1rem" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>

          {/* 헤더 */}
          <div style={{
            background: dark.surface,
            borderRadius: "16px",
            border: `1px solid ${dark.border}`,
            borderLeft: `4px solid ${dark.accent}`,
            padding: "2rem",
            marginBottom: "2rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
              <span style={{
                fontSize: "11px", padding: "2px 8px", borderRadius: "20px",
                background: dark.accentDim, color: dark.accent, fontWeight: 500,
              }}>
                My App
              </span>
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: dark.textPrimary, margin: "0 0 0.5rem" }}>
              안녕하세요 👋
            </h1>
            <p style={{ fontSize: "14px", color: dark.textSecondary, margin: 0, lineHeight: "1.7" }}>
              아래 메뉴에서 원하는 기능을 선택하세요.
            </p>
          </div>

          {/* 메뉴 그리드 */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1rem",
          }}>
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: "block",
                  background: dark.surface,
                  borderRadius: "14px",
                  border: `1px solid ${dark.border}`,
                  padding: "1.25rem 1.5rem",
                  textDecoration: "none",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = dark.accent;
                  (e.currentTarget as HTMLAnchorElement).style.background = dark.surface2;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = dark.border;
                  (e.currentTarget as HTMLAnchorElement).style.background = dark.surface;
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "0.5rem" }}>{item.icon}</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: dark.textPrimary, marginBottom: "4px" }}>
                  {item.label}
                </div>
                <div style={{ fontSize: "12px", color: dark.textMuted }}>
                  {item.desc}
                </div>
              </a>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
