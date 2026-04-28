"use client"

import Link from "next/link";
import { useState, useEffect } from "react";
import { PageHeader } from "@/component/PageHeader";

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

const baseNavItems = [
  { href: "/list", label: "게시글 목록", icon: "📋", desc: "전체 게시글을 확인하세요" },
  { href: "/map", label: "지도", icon: "🗺️", desc: "지도 기반 정보를 탐색하세요" },
  { href: "/digitalTwin", label: "디지털트윈", icon: "🏙️", desc: "디지털 트윈 시뮬레이션" },
  { href: "/FCM", label: "FCM", icon: "🔔", desc: "푸시 알림 설정" },
  { href: "/chat", label: "웹소켓 채팅", icon: "💬", desc: "실시간 채팅에 참여하세요" },
  { href: "/QnA", label: "QnA", icon: "❓", desc: "질문과 답변을 확인하세요" },
  { href: "/SeoulTod", label: "서울 TOD", icon: "🚇", desc: "서울 대중교통 정보" },
  { href: "/api-docs", label: "API 문서", icon: "📃", desc: "Swagger 파일" },
  { href: "/ADMIN", label: "ADMIN PAGE", icon: "🔒", desc: "ADMIN PAGE" },
  { href: "/admin-dashboard", label: "ADMIN DASHBOARD", icon: "🔒", desc: "ADMIN DASHBOARD" },
  { href: "/Shopping", label: "상품", icon: "🎁", desc: "상품 페이지" },
  { href: "/mypage", label: "마이페이지", icon: "👤", desc: "나의 쇼핑 활동" },
  { href: "/todo", label: "TODO", icon: "📋", desc: "todo list" },
  {
    href: "/crypto-payment", label: "Crypto 결제", icon: "💎",
    desc: "Web3 블록체인 결제 학습"
  },
  {
    href: "/multi-payment", label: "멀티코인 결제", icon: "🪙",
    desc: "멀티코인 블록체인 결제 학습"
  },
];

const naverLinkItem = { href: "/settings", label: "네이버 계정 연동", icon: "🍀", desc: "NAVER" };

export default function Page() {
  const [navItems, setNavItems] = useState(baseNavItems);
  const [weather, setWeather] = useState<any>(null);
  const [airQuality, setAirQuality] = useState<any>(null);
  const [moodTitle, setMoodTitle] = useState("");
  const [moodItems, setMoodItems] = useState<{ name: string, icon: string, link: string }[]>([]);

  useEffect(() => {
    // URL 파라미터에서 토큰 확인 및 저장 (네이버 로그인 콜백 처리)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    if (urlToken) {
      localStorage.setItem("token", urlToken);
      // URL 파라미터 정리
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 사용자 정보 확인하여 네이버 연동 여부 체크
    const checkUserInfo = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch("/api/auth/Me", {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            // 네이버 ID가 없으면 네이버 계정 연동 메뉴 추가
            if (!data.naver_id) {
              setNavItems([...baseNavItems, naverLinkItem]);
            }
          }
        } catch (error) {
          console.error("사용자 정보 확인 실패:", error);
        }
      }
    };

    const fetchEnvironmentData = async () => {
      try {
        const [weatherRes, airRes] = await Promise.all([
          fetch("/api/weather/busan"),
          fetch("/api/airquality/busan"),
        ]);

        let wData = null;
        let aData = null;

        if (weatherRes.ok) {
          wData = await weatherRes.json();
          setWeather(wData);
        }
        if (airRes.ok) {
          aData = await airRes.json();
          setAirQuality(aData);
        }

        // 상황(Mood) 추천 로직
        if (wData && wData.rainfall > 0) {
          setMoodTitle("☔ 비 오는 날, 쾌적한 실내를 위한 추천");
          setMoodItems([
            { name: "제습기", icon: "🌬️", link: "/Shopping?search=제습기" },
            { name: "암막커튼", icon: "🪟", link: "/Shopping?search=커튼" },
            { name: "홈카페 세트", icon: "☕", link: "/Shopping?search=커피" },
          ]);
        } else if (aData && (aData.pm10 > 80 || aData.pm25 > 35)) {
          setMoodTitle("😷 미세먼지 나쁨! 기관지 건강을 챙기세요");
          setMoodItems([
            { name: "공기청정기", icon: "🌀", link: "/Shopping?search=공기청정기" },
            { name: "KF94 마스크", icon: "😷", link: "/Shopping?search=마스크" },
            { name: "도라지 배즙", icon: "🍐", link: "/Shopping?search=도라지" },
          ]);
        } else if (wData && wData.temperature < 5) {
          setMoodTitle("❄️ 너무 추운 오늘, 따뜻한 외출 준비");
          setMoodItems([
            { name: "구스다운 패딩", icon: "🧥", link: "/Shopping?search=패딩" },
            { name: "발열 내의", icon: "👕", link: "/Shopping?search=내의" },
            { name: "휴대용 핫팩", icon: "🔥", link: "/Shopping?search=핫팩" },
          ]);
        } else if (wData && wData.temperature > 28) {
          setMoodTitle("☀️ 무더운 날씨, 시원하게 이겨내기");
          setMoodItems([
            { name: "휴대용 선풍기", icon: "🎐", link: "/Shopping?search=선풍기" },
            { name: "쿨링 넥밴드", icon: "🧊", link: "/Shopping?search=쿨링" },
            { name: "선크림", icon: "🧴", link: "/Shopping?search=선크림" },
          ]);
        } else {
          setMoodTitle("🌿 날씨가 너무 좋네요! 나들이 어떠세요?");
          setMoodItems([
            { name: "피크닉 매트", icon: "🧺", link: "/Shopping?search=매트" },
            { name: "선글라스", icon: "🕶️", link: "/Shopping?search=선글라스" },
            { name: "블루투스 스피커", icon: "🎵", link: "/Shopping?search=스피커" },
          ]);
        }
      } catch (err) {
        console.error("날씨/미세먼지 로드 실패:", err);
      }
    };

    checkUserInfo();
    fetchEnvironmentData();
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: dark.bg,
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Main Header (PageHeader Component) */}
      <PageHeader
        title="메인 페이지"
        subtitle="원하는 기능을 선택하세요"
        icon="🏠"
        navLinks={[]}
      />

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

          {/* 상황 기반 무드 큐레이션 */}
          {moodTitle && (
            <div style={{
              background: dark.surface,
              borderRadius: "16px",
              border: `1px solid ${dark.border}`,
              padding: "1.5rem",
              marginBottom: "2rem",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, width: "4px", height: "100%", background: "linear-gradient(180deg, #38bdf8, #0ea5e9)",
              }} />
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: dark.textPrimary, margin: "0 0 1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>✨</span> AI 라이프스타일 큐레이션
              </h2>
              <p style={{ fontSize: "14px", color: dark.textSecondary, marginBottom: "1rem" }}>
                {moodTitle}
              </p>
              <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
                {moodItems.map((item, idx) => (
                  <Link key={idx} href={item.link} style={{
                    minWidth: "120px", background: dark.surface2, border: `1px solid ${dark.border}`,
                    borderRadius: "12px", padding: "1rem", textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                    transition: "all 0.2s"
                  }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = dark.accent;
                      (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = dark.border;
                      (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                    }}
                  >
                    <span style={{ fontSize: "28px" }}>{item.icon}</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: dark.textPrimary }}>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 메뉴 그리드 */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1rem",
          }}>
            {navItems.map((item) => (
              <Link
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
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
