"use client";

import type { CCTVPoint } from "@/types/cctv";
import CctvPlayer from "@/component/dt/modules/CctvPlayer";

interface CctvPopupProps {
  cctv: CCTVPoint;
  isOpen: boolean;
  onClose: () => void;
  variant?: 'default' | 'mini';
}

/**
 * CCTV 영상 플레이어 팝업
 */
export default function CctvPopup({ cctv, isOpen, onClose, variant = 'default' }: CctvPopupProps) {
  if (!isOpen) return null;

  const isMini = variant === 'mini';

  return (
    <div
      style={{
        position: "fixed",
        top: isMini ? "80px" : "50%",
        left: isMini ? "auto" : "50%",
        right: isMini ? "24px" : "auto",
        transform: isMini ? "none" : "translate(-50%, -50%)",
        background: "rgba(10, 14, 26, 0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(56, 189, 248, 0.2)",
        borderRadius: "12px",
        padding: isMini ? "12px" : "20px",
        zIndex: 10000, // 시뮬레이션 UI 위로 올라오도록
        width: isMini ? "300px" : "640px",
        maxWidth: "90vw",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.3)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h3
          style={{
            color: "#38bdf8",
            fontSize: isMini ? "14px" : "16px",
            fontWeight: 700,
            margin: 0,
          }}
        >
          📹 {cctv.name}
        </h3>
        <button
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClose();
            }
          }}
          style={{
            background: "transparent",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            borderRadius: "6px",
            color: "#38bdf8",
            cursor: "pointer",
            fontSize: isMini ? "14px" : "18px",
            padding: isMini ? "2px 8px" : "4px 12px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(56, 189, 248, 0.1)";
            e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.3)";
          }}
          aria-label="팝업 닫기"
        >
          ✕
        </button>
      </div>

      {/* Video Player */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "56.25%", // 16:9 aspect ratio
          background: "#000",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
          <CctvPlayer url={cctv.url} />
        </div>
      </div>


      {/* Info */}
      <div
        style={{
          marginTop: "12px",
          color: "#8b90a7",
          fontSize: "12px",
        }}
      >
        <p style={{ margin: "4px 0" }}>
          📍 위치: {cctv.lat.toFixed(4)}, {cctv.lng.toFixed(4)}
        </p>
      </div>
    </div>
  );
}
