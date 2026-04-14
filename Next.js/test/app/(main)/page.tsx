"use client"

const dark = {
  bg: "#0f1117",
  surface: "#1a1d27",
  surface2: "#22263a",
  border: "#2e3247",
  textPrimary: "#e8eaf0",
  textSecondary: "#8b90a7",
  textMuted: "#545874",
  accent: "#7c6af7",
  accentDim: "#2d2850",
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
];

export default function Page() {
  return (
    <div style={{
      minHeight: "100vh",
      background: dark.bg,
      padding: "2rem 1rem",
      margin: "-1rem calc(-50vw + 50%)",
    }}>
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
              background: dark.accentDim, color: "#a78bfa", fontWeight: 500,
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
  );
}
