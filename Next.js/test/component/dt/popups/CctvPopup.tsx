"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import type { CCTVPoint } from "@/types/cctv";

interface CctvPopupProps {
  cctv: CCTVPoint;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * CCTV 영상 플레이어 팝업
 * HLS.js를 사용하여 실시간 CCTV 스트림을 재생합니다.
 */
export default function CctvPopup({ cctv, isOpen, onClose }: CctvPopupProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !videoRef.current) return;

    setIsLoading(true);
    setError(null);

    const video = videoRef.current;

    // HLS 지원 확인
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;

      hls.loadSource(cctv.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch((err) => {
          console.error("Video play error:", err);
          setError("영상 재생에 실패했습니다");
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
        setIsLoading(false);

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError("네트워크 오류가 발생했습니다");
              // Try to recover
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError("영상을 불러올 수 없습니다");
              // Try to recover
              hls.recoverMediaError();
              break;
            default:
              setError("알 수 없는 오류가 발생했습니다");
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native HLS support
      video.src = cctv.url;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        video.play().catch((err) => {
          console.error("Video play error:", err);
          setError("영상 재생에 실패했습니다");
        });
      });
    } else {
      setError("지원하지 않는 영상 형식입니다");
      setIsLoading(false);
    }

    // Cleanup
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [isOpen, cctv.url]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "rgba(10, 14, 26, 0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(56, 189, 248, 0.2)",
        borderRadius: "12px",
        padding: "20px",
        zIndex: 1000,
        width: "640px",
        maxWidth: "90vw",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.3)",
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
            fontSize: "16px",
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
            fontSize: "18px",
            padding: "4px 12px",
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
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#38bdf8",
              fontSize: "14px",
            }}
          >
            로딩 중...
          </div>
        )}

        {error && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#ef4444",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <video
          ref={videoRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: error ? "none" : "block",
          }}
          controls
          muted
          playsInline
        />
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
