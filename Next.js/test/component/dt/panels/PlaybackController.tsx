"use client";

import React from "react";

type PlaybackSpeed = 1 | 2 | 4 | 8;
type TimeInterval = 1 | 5 | 10 | 30 | 60;

interface PlaybackControllerProps {
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  timeInterval: TimeInterval;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  onIntervalChange: (interval: TimeInterval) => void;
  disabled?: boolean;
}

/**
 * 플레이백 컨트롤러 컴포넌트 (React.memo로 최적화)
 * 
 * 요구사항: 3.1, 3.2, 3.3, 3.6, 3.7, 5.1, 5.2, 5.3, 5.4
 * 최적화: Task 9.2 - React.memo 적용
 */
const PlaybackController = React.memo(function PlaybackController({
  isPlaying,
  playbackSpeed,
  timeInterval,
  onPlay,
  onPause,
  onStop,
  onSpeedChange,
  onIntervalChange,
  disabled = false,
}: PlaybackControllerProps) {
  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const speed = parseInt(e.target.value) as PlaybackSpeed;
    onSpeedChange(speed);
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const interval = parseInt(e.target.value) as TimeInterval;
    onIntervalChange(interval);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "16px",
        background: "rgba(10, 14, 26, 0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(56, 189, 248, 0.2)",
        borderRadius: "12px",
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      {/* Playback Control Buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
        }}
      >
        <button
          onClick={onPlay}
          disabled={disabled || isPlaying}
          style={{
            width: "48px",
            height: "48px",
            background: isPlaying
              ? "rgba(139, 144, 167, 0.2)"
              : "rgba(56, 189, 248, 0.15)",
            border: isPlaying
              ? "1px solid rgba(139, 144, 167, 0.3)"
              : "1px solid rgba(56, 189, 248, 0.4)",
            borderRadius: "50%",
            color: isPlaying ? "#8b90a7" : "#38bdf8",
            fontSize: "20px",
            cursor: disabled || isPlaying ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            if (!disabled && !isPlaying) {
              e.currentTarget.style.background = "rgba(56, 189, 248, 0.25)";
              e.currentTarget.style.transform = "scale(1.05)";
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && !isPlaying) {
              e.currentTarget.style.background = "rgba(56, 189, 248, 0.15)";
              e.currentTarget.style.transform = "scale(1)";
            }
          }}
          aria-label="재생"
        >
          ▶️
        </button>

        <button
          onClick={onPause}
          disabled={disabled || !isPlaying}
          style={{
            width: "48px",
            height: "48px",
            background: !isPlaying
              ? "rgba(139, 144, 167, 0.2)"
              : "rgba(251, 191, 36, 0.15)",
            border: !isPlaying
              ? "1px solid rgba(139, 144, 167, 0.3)"
              : "1px solid rgba(251, 191, 36, 0.4)",
            borderRadius: "50%",
            color: !isPlaying ? "#8b90a7" : "#fbbf24",
            fontSize: "20px",
            cursor: disabled || !isPlaying ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            if (!disabled && isPlaying) {
              e.currentTarget.style.background = "rgba(251, 191, 36, 0.25)";
              e.currentTarget.style.transform = "scale(1.05)";
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && isPlaying) {
              e.currentTarget.style.background = "rgba(251, 191, 36, 0.15)";
              e.currentTarget.style.transform = "scale(1)";
            }
          }}
          aria-label="일시정지"
        >
          ⏸️
        </button>

        <button
          onClick={onStop}
          disabled={disabled}
          style={{
            width: "48px",
            height: "48px",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            borderRadius: "50%",
            color: "#ef4444",
            fontSize: "20px",
            cursor: disabled ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
              e.currentTarget.style.transform = "scale(1.05)";
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled) {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
              e.currentTarget.style.transform = "scale(1)";
            }
          }}
          aria-label="정지"
        >
          ⏹️
        </button>
      </div>

      {/* Speed and Interval Controls */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
        }}
      >
        {/* Playback Speed Selector */}
        <div>
          <label
            style={{
              color: "#8b90a7",
              fontSize: "11px",
              fontWeight: 600,
              display: "block",
              marginBottom: "6px",
            }}
          >
            재생 속도
          </label>
          <select
            value={playbackSpeed}
            onChange={handleSpeedChange}
            disabled={disabled}
            style={{
              width: "100%",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "8px",
              color: "#e8eaf0",
              padding: "8px 10px",
              fontSize: "12px",
              outline: "none",
              cursor: disabled ? "not-allowed" : "pointer",
            }}
            aria-label="재생 속도"
          >
            <option value="1" style={{ background: "#1a1f36", color: "#e8eaf0" }}>1x</option>
            <option value="2" style={{ background: "#1a1f36", color: "#e8eaf0" }}>2x</option>
            <option value="4" style={{ background: "#1a1f36", color: "#e8eaf0" }}>4x</option>
            <option value="8" style={{ background: "#1a1f36", color: "#e8eaf0" }}>8x</option>
          </select>
        </div>

        {/* Time Interval Selector */}
        <div>
          <label
            style={{
              color: "#8b90a7",
              fontSize: "11px",
              fontWeight: 600,
              display: "block",
              marginBottom: "6px",
            }}
          >
            시간 간격
          </label>
          <select
            value={timeInterval}
            onChange={handleIntervalChange}
            disabled={disabled}
            style={{
              width: "100%",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "8px",
              color: "#e8eaf0",
              padding: "8px 10px",
              fontSize: "12px",
              outline: "none",
              cursor: disabled ? "not-allowed" : "pointer",
            }}
            aria-label="시간 간격"
          >
            <option value="1" style={{ background: "#1a1f36", color: "#e8eaf0" }}>1분</option>
            <option value="5" style={{ background: "#1a1f36", color: "#e8eaf0" }}>5분</option>
            <option value="10" style={{ background: "#1a1f36", color: "#e8eaf0" }}>10분</option>
            <option value="30" style={{ background: "#1a1f36", color: "#e8eaf0" }}>30분</option>
            <option value="60" style={{ background: "#1a1f36", color: "#e8eaf0" }}>1시간</option>
          </select>
        </div>
      </div>
    </div>
  );
});

export default PlaybackController;
