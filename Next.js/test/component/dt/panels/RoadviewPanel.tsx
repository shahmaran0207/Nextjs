"use client";

import { useEffect, useRef, useState } from "react";
import { useNaverRoadview } from "@/component/dt/hooks/useNaverRoadview";

interface RoadviewPanelProps {
  isOpen: boolean;
  position: { lat: number; lng: number } | null;
  onClose: () => void;
  onPositionChange: (position: { lat: number; lng: number }, direction: number) => void;
  onAvailabilityChange: (isAvailable: boolean) => void;
  mode?: 'overlay' | 'split';
}

export default function RoadviewPanel({
  isOpen,
  position,
  onClose,
  onPositionChange,
  onAvailabilityChange,
  mode = 'overlay',
}: RoadviewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [panelWidth, setPanelWidth] = useState(40); // 기본 40%
  const [isResizing, setIsResizing] = useState(false);
  
  const {
    roadviewInstance,
    isLoading,
    error,
    isAvailable,
    initializeRoadview,
    setRoadviewPosition,
  } = useNaverRoadview({
    onPositionChange,
    onAvailabilityChange,
  });

  // 로드뷰 초기화
  useEffect(() => {
    if (isOpen && containerRef.current && !roadviewInstance) {
      const roadviewContainer = containerRef.current.querySelector("#roadview-container") as HTMLElement;
      if (roadviewContainer) {
        initializeRoadview(roadviewContainer);
      }
    }
  }, [isOpen, roadviewInstance, initializeRoadview]);

  // 위치 변경 시 로드뷰 업데이트
  const prevPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  
  useEffect(() => {
    if (roadviewInstance && position && isOpen) {
      // 이전 위치와 비교하여 실제로 변경되었을 때만 업데이트
      const positionChanged = 
        !prevPositionRef.current ||
        prevPositionRef.current.lat !== position.lat ||
        prevPositionRef.current.lng !== position.lng;
      
      if (positionChanged) {
        prevPositionRef.current = position;
        setRoadviewPosition(position);
      }
    }
  }, [roadviewInstance, position, isOpen]); // setRoadviewPosition 제거

  // 패널 크기 조절 핸들러
  useEffect(() => {
    const handleResize = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = (e.clientX / window.innerWidth) * 100;
      const clampedWidth = Math.max(
        (300 / window.innerWidth) * 100, // 최소 300px
        Math.min(newWidth, 60) // 최대 60%
      );
      
      setPanelWidth(clampedWidth);
    };

    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener("mousemove", handleResize);
      window.addEventListener("mouseup", handleMouseUp);
      
      return () => {
        window.removeEventListener("mousemove", handleResize);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing]);

  // 키보드 접근성
  useEffect(() => {
    if (isOpen && containerRef.current) {
      containerRef.current.focus();
    }
  }, [isOpen]);

  // 패널을 DOM에 유지하되 visibility로 숨김 처리
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const isSplit = mode === 'split';

  return (
    <div
      ref={containerRef}
      style={{
        position: isSplit ? "relative" : "fixed",
        top: isSplit ? "auto" : 0,
        right: isSplit ? "auto" : 0,
        width: isSplit ? "100%" : (isMobile ? "100%" : `${panelWidth}%`),
        height: "100%",
        background: "rgba(10, 14, 26, 0.95)",
        backdropFilter: isSplit ? "none" : "blur(16px)",
        WebkitBackdropFilter: isSplit ? "none" : "blur(16px)",
        border: isSplit ? "none" : "1px solid rgba(56, 189, 248, 0.2)",
        borderRight: "none",
        zIndex: isSplit ? 1 : 1000,
        display: isOpen ? "flex" : "none", // display로 숨김 처리
        flexDirection: "column",
        boxShadow: isSplit ? "none" : "-4px 0 20px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.2)",
      }}
      role="dialog"
      aria-label="네이버 로드뷰"
      tabIndex={-1}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(56, 189, 248, 0.2)",
          position: "relative",
          zIndex: 10,
          background: "rgba(10, 14, 26, 0.95)",
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
          🗺️ 네이버 로드뷰
        </h3>
        {!isSplit && (
          <button
            onClick={onClose}
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
            aria-label="로드뷰 패널 닫기"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(56, 189, 248, 0.1)";
              e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.3)";
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Roadview Container */}
      <div
        style={{
          flex: 1,
          position: "relative",
          background: "#000",
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
              zIndex: 10,
            }}
          >
            로드뷰를 불러오는 중...
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
              zIndex: 10,
            }}
          >
            <p>{error}</p>
            <button
              onClick={() => position && setRoadviewPosition(position)}
              style={{
                marginTop: "12px",
                padding: "8px 16px",
                background: "rgba(56, 189, 248, 0.1)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                borderRadius: "6px",
                color: "#38bdf8",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              재시도
            </button>
          </div>
        )}

        {!isAvailable && !isLoading && !error && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#8b90a7",
              fontSize: "14px",
              textAlign: "center",
              zIndex: 10,
            }}
          >
            로드뷰를 사용할 수 없는 위치입니다
          </div>
        )}

        <div
          id="roadview-container"
          style={{
            width: "100%",
            height: "100%",
            display: isLoading || error || !isAvailable ? "none" : "block",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      </div>

      {/* Resize Handle (데스크톱만) */}
      {!isMobile && !isSplit && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "4px",
            cursor: "ew-resize",
            background: "rgba(56, 189, 248, 0.1)",
            transition: "background 0.2s",
          }}
          onMouseDown={() => setIsResizing(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(56, 189, 248, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(56, 189, 248, 0.1)";
          }}
        />
      )}
    </div>
  );
}
