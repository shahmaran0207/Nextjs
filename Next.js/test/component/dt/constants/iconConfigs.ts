// ─── 버스 정류장 SVG 핀 아이콘 ─────────────────────────────────
export const BUS_PIN_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 62" width="48" height="62">
    <path d="M24 0C13 0 4 9 4 20c0 16 20 42 20 42S44 36 44 20C44 9 35 0 24 0z" fill="#0ea5e9" stroke="#bae6fd" stroke-width="1.5"/>
    <rect x="11" y="10" width="26" height="18" rx="3" fill="white"/>
    <circle cx="16.5" cy="28" r="3" fill="#7dd3fc"/>
    <circle cx="31.5" cy="28" r="3" fill="#7dd3fc"/>
    <rect x="12" y="12" width="9" height="6" rx="1.5" fill="#38bdf8"/>
    <rect x="27" y="12" width="9" height="6" rx="1.5" fill="#38bdf8"/>
    <rect x="22" y="13" width="4" height="10" rx="0.5" fill="#e0f2fe"/>
  </svg>`
)}`;

// ─── 공사 분야코드별 스타일 정의 ─────────────────────────────────
export const FIELD_CONFIG: Record<string, { fill: string; stroke: string; label: string; icon: string }> = {
  F01: {
    fill: "#f97316", stroke: "#fbbf24", label: "도로/교량 건설",
    icon: `<rect x="10" y="22" width="28" height="5" rx="1" fill="white" opacity="0.9"/><rect x="10" y="14" width="28" height="5" rx="1" fill="white" opacity="0.6"/><circle cx="16" cy="30" r="3.5" fill="white" opacity="0.9"/><circle cx="32" cy="30" r="3.5" fill="white" opacity="0.9"/>`,
  },
  F02: {
    fill: "#22c55e", stroke: "#86efac", label: "택지/산단 조성",
    icon: `<rect x="12" y="12" width="24" height="18" rx="2" fill="white" opacity="0.15"/><rect x="15" y="15" width="8" height="8" rx="1" fill="white" opacity="0.8"/><rect x="26" y="15" width="8" height="8" rx="1" fill="white" opacity="0.8"/><rect x="15" y="26" width="18" height="3" rx="1" fill="white" opacity="0.6"/>`,
  },
  F03: {
    fill: "#0ea5e9", stroke: "#7dd3fc", label: "하수/폐수처리장",
    icon: `<circle cx="24" cy="18" r="8" fill="white" opacity="0.2"/><path d="M18 18 Q24 10 30 18 Q24 26 18 18Z" fill="white" opacity="0.85"/><rect x="22" y="26" width="4" height="5" rx="1" fill="white" opacity="0.7"/>`,
  },
  F04: {
    fill: "#84cc16", stroke: "#d9f99d", label: "쓰레기처리 사업",
    icon: `<rect x="17" y="12" width="14" height="17" rx="2" fill="white" opacity="0.85"/><rect x="14" y="10" width="20" height="4" rx="1" fill="white" opacity="0.7"/><rect x="19" y="16" width="2" height="9" rx="1" fill="#84cc16"/><rect x="23" y="16" width="2" height="9" rx="1" fill="#84cc16"/><rect x="27" y="16" width="2" height="9" rx="1" fill="#84cc16"/>`,
  },
  F05: {
    fill: "#a855f7", stroke: "#d8b4fe", label: "영조물 건립",
    icon: `<rect x="14" y="22" width="20" height="10" rx="1" fill="white" opacity="0.85"/><polygon points="24,10 13,23 35,23" fill="white" opacity="0.75"/><rect x="20" y="25" width="8" height="7" rx="1" fill="#a855f7"/>`,
  },
  F06: {
    fill: "#10b981", stroke: "#6ee7b7", label: "친수공간/공원",
    icon: `<circle cx="20" cy="16" r="5" fill="white" opacity="0.8"/><circle cx="28" cy="14" r="6" fill="white" opacity="0.8"/><circle cx="24" cy="19" r="5" fill="white" opacity="0.8"/><rect x="22" y="24" width="4" height="7" rx="1" fill="white" opacity="0.7"/>`,
  },
  F07: {
    fill: "#3b82f6", stroke: "#93c5fd", label: "하수관로",
    icon: `<rect x="10" y="18" width="28" height="7" rx="3.5" fill="white" opacity="0.85"/><circle cx="18" cy="21.5" r="3" fill="#3b82f6"/><circle cx="30" cy="21.5" r="3" fill="#3b82f6"/><path d="M20 14 Q24 10 28 14" stroke="white" stroke-width="2" fill="none" opacity="0.7"/>`,
  },
  F08: {
    fill: "#6b7280", stroke: "#d1d5db", label: "기타",
    icon: `<circle cx="24" cy="18" r="9" fill="white" opacity="0.25"/><text x="24" y="23" text-anchor="middle" font-size="12" font-weight="bold" fill="white" opacity="0.9">?</text>`,
  },
};

// ─── 테마여행 카테고리별 스타일 정의 ─────────────────────────────
export const THEME_CONFIG: Record<string, { fill: string; stroke: string; label: string; icon: string; emoji: string }> = {
  "문화관광": {
    fill: "#ec4899", stroke: "#fbcfe8", label: "문화관광", emoji: "🎭",
    icon: `<circle cx="24" cy="18" r="9" fill="white" opacity="0.2"/><path d="M18 15 Q24 12 30 15 M18 21 Q24 24 30 21" stroke="white" stroke-width="2" fill="none" opacity="0.85"/>`,
  },
  "자연관광": {
    fill: "#10b981", stroke: "#6ee7b7", label: "자연관광", emoji: "🌳",
    icon: `<circle cx="20" cy="16" r="5" fill="white" opacity="0.8"/><circle cx="28" cy="14" r="6" fill="white" opacity="0.8"/><circle cx="24" cy="19" r="5" fill="white" opacity="0.8"/><rect x="22" y="24" width="4" height="7" rx="1" fill="white" opacity="0.7"/>`,
  },
  "레저스포츠": {
    fill: "#f59e0b", stroke: "#fcd34d", label: "레저스포츠", emoji: "⚽",
    icon: `<circle cx="24" cy="18" r="8" fill="white" opacity="0.85"/><path d="M24 10 L24 26 M16 18 L32 18" stroke="#f59e0b" stroke-width="2"/>`,
  },
  "쇼핑": {
    fill: "#8b5cf6", stroke: "#ddd6fe", label: "쇼핑", emoji: "🛍️",
    icon: `<rect x="14" y="16" width="20" height="14" rx="2" fill="white" opacity="0.85"/><path d="M18 16 L18 14 Q18 11 24 11 Q30 11 30 14 L30 16" stroke="#8b5cf6" stroke-width="2" fill="none"/>`,
  },
  "음식": {
    fill: "#ef4444", stroke: "#fca5a5", label: "음식", emoji: "🍴",
    icon: `<circle cx="24" cy="18" r="9" fill="white" opacity="0.85"/><path d="M20 14 L20 22 M22 14 L22 18 M24 14 L24 22 M28 14 Q28 18 28 22" stroke="#ef4444" stroke-width="1.5" fill="none"/>`,
  },
  "숙박": {
    fill: "#06b6d4", stroke: "#a5f3fc", label: "숙박", emoji: "🏨",
    icon: `<rect x="14" y="14" width="20" height="16" rx="1" fill="white" opacity="0.85"/><rect x="18" y="18" width="4" height="4" rx="0.5" fill="#06b6d4"/><rect x="26" y="18" width="4" height="4" rx="0.5" fill="#06b6d4"/><rect x="18" y="24" width="4" height="4" rx="0.5" fill="#06b6d4"/><rect x="26" y="24" width="4" height="4" rx="0.5" fill="#06b6d4"/>`,
  },
  "기타": {
    fill: "#6b7280", stroke: "#d1d5db", label: "기타", emoji: "📍",
    icon: `<circle cx="24" cy="18" r="9" fill="white" opacity="0.25"/><text x="24" y="23" text-anchor="middle" font-size="12" font-weight="bold" fill="white" opacity="0.9">?</text>`,
  },
};
