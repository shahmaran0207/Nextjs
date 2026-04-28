"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface CctvPlayerProps {
  url: string;
}

export default function CctvPlayer({ url }: CctvPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!videoRef.current) return;

    setIsLoading(true);
    setError(null);

    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Video play error:", err);
            setError("영상 재생에 실패했습니다");
          }
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (!data.fatal) return;

        console.error("HLS fatal error:", {
          type: data.type,
          details: data.details,
          url: (data as { url?: string }).url,
        });
        setIsLoading(false);

        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            setError("네트워크 오류가 발생했습니다");
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            setError("영상을 불러올 수 없습니다");
            hls.recoverMediaError();
            break;
          default:
            setError("알 수 없는 오류가 발생했습니다");
            break;
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        video.play().catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Video play error:", err);
            setError("영상 재생에 실패했습니다");
          }
        });
      });
    } else {
      setError("지원하지 않는 영상 형식입니다");
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "240px",
        background: "#000",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isLoading && (
        <div style={{ position: "absolute", color: "#38bdf8", fontSize: "14px", zIndex: 10 }}>
          로딩 중...
        </div>
      )}

      {error && (
        <div style={{ position: "absolute", color: "#ef4444", fontSize: "14px", textAlign: "center", zIndex: 10 }}>
          {error}
        </div>
      )}

      <video
        ref={videoRef}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: error ? "none" : "block",
        }}
        controls
        muted
        playsInline
      />
    </div>
  );
}
