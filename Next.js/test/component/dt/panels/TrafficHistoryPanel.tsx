"use client";

import React, { useEffect, useCallback, useMemo } from "react";
import TimeSlider from "./TimeSlider";
import PlaybackController from "./PlaybackController";
import { useTrafficHistory } from "@/app/hook/useTrafficHistory";
import { usePlayback, PlaybackSpeed } from "@/app/hook/usePlayback";
import { useHistoryCache } from "@/app/hook/useHistoryCache";

interface TrafficHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onTrafficDataChange: (trafficMap: Map<string, number>) => void;
}

/**
 * 교통 상황 재생 패널 컴포넌트
 * 
 * TimeSlider와 PlaybackController를 통합하고,
 * useTrafficHistory, usePlayback, useHistoryCache Hook을 연동합니다.
 * 
 * 요구사항: 1.2, 1.3, 1.5, 6.1, 6.2, 6.3, 6.4
 */
export default function TrafficHistoryPanel({
  isOpen,
  onClose,
  onTrafficDataChange,
}: TrafficHistoryPanelProps) {
  const now = new Date();
  const defaultStartTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24시간 전

  // 재생 설정 상태
  const [playbackSpeed, setPlaybackSpeed] = React.useState<PlaybackSpeed>(1);

  // useTrafficHistory Hook
  const {
    currentTime,
    startTime,
    endTime,
    trafficData,
    availability,
    isLoading,
    error,
    setCurrentTime,
    setTimeRange,
    fetchTrafficData,
    returnToNow,
  } = useTrafficHistory({
    initialStartTime: defaultStartTime,
    initialEndTime: now,
    onError: (err) => {
      console.error("[TrafficHistoryPanel] 에러:", err.message);
    },
  });

  // useHistoryCache Hook
  const cache = useHistoryCache();

  // 캐시를 활용한 데이터 조회 함수
  const fetchWithCache = useCallback(
    async (time: Date) => {
      // Invalid Date 체크
      if (!time || isNaN(time.getTime())) {
        console.error("[TrafficHistoryPanel] Invalid time:", time);
        return;
      }

      try {
        // 캐시 확인 (요구사항 7.3)
        const cachedData = cache.get(time);
        if (cachedData) {
          console.log("[TrafficHistoryPanel] 캐시에서 데이터 로드:", time.toISOString());
          onTrafficDataChange(cachedData);
          setCurrentTime(time);
          return;
        }

        // 캐시 미스: API 조회
        await fetchTrafficData(time);
      } catch (err) {
        console.error("[TrafficHistoryPanel] fetchWithCache 오류:", err);
      }
    },
    [cache, fetchTrafficData, onTrafficDataChange, setCurrentTime]
  );

  // 재생 가능한 시간 목록 상태
  const [availableTimes, setAvailableTimes] = React.useState<Date[]>([]);

  // 시간 범위가 변경되면 가용한 시간 목록 조회
  React.useEffect(() => {
    const fetchAvailableTimes = async () => {
      try {
        const response = await fetch(
          `/api/traffic/history/times?startTime=${startTime.toISOString()}&endTime=${endTime.toISOString()}`
        );
        
        if (!response.ok) {
          console.error("[TrafficHistoryPanel] 시간 목록 조회 실패");
          return;
        }

        const result = await response.json();
        const times = result.times.map((t: string) => new Date(t));
        setAvailableTimes(times);
        console.log("[TrafficHistoryPanel] 재생 가능한 시간:", times.length, "개");
      } catch (err) {
        console.error("[TrafficHistoryPanel] 시간 목록 조회 에러:", err);
      }
    };

    fetchAvailableTimes();
  }, [startTime, endTime]);

  // usePlayback Hook
  const playback = usePlayback({
    startTime,
    endTime,
    currentTime,
    playbackSpeed,
    availableTimes,
    onTimeChange: (time) => {
      fetchWithCache(time);
    },
    onComplete: () => {
      console.log("[TrafficHistoryPanel] 재생 완료");
    },
  });

  // trafficData 변경 시 부모 컴포넌트에 전달 및 캐시 저장 (요구사항 1.2)
  useEffect(() => {
    if (trafficData.size > 0) {
      onTrafficDataChange(trafficData);
      
      // 캐시에 저장 (요구사항 7.2)
      cache.set(currentTime, trafficData);
    }
  }, [trafficData, currentTime, onTrafficDataChange, cache]);

  // 재생 중 프리페칭 (요구사항 7.1)
  useEffect(() => {
    if (playback.isPlaying && availableTimes.length > 0) {
      // 현재 인덱스 찾기
      const currentIdx = availableTimes.findIndex(
        t => t.getTime() >= currentTime.getTime()
      );
      
      if (currentIdx >= 0) {
        // 다음 3개 시점 미리 조회
        const nextTimes = availableTimes.slice(currentIdx + 1, currentIdx + 4);
        if (nextTimes.length > 0) {
          cache.prefetch(nextTimes);
        }
      }
    }
  }, [playback.isPlaying, currentTime, availableTimes, cache]);

  // TimeSlider onChange 핸들러 (useCallback으로 최적화 - Task 9.2)
  const handleTimeChange = useCallback(
    (time: Date) => {
      fetchWithCache(time);
    },
    [fetchWithCache]
  );

  // TimeSlider onRangeChange 핸들러 (useCallback으로 최적화 - Task 9.2)
  const handleRangeChange = useCallback(
    (start: Date, end: Date) => {
      setTimeRange(start, end);
    },
    [setTimeRange]
  );

  // 현재 시간으로 복귀 핸들러 (요구사항 6.2, 6.3, 6.4)
  const handleReturnToNow = useCallback(() => {
    // 재생 중이면 정지 (요구사항 6.4)
    if (playback.isPlaying) {
      playback.stop();
    }

    // 현재 시간으로 복귀 (요구사항 6.2, 6.3)
    returnToNow();
    
    // 실시간 데이터로 전환 (빈 Map 전달)
    onTrafficDataChange(new Map());
  }, [playback, returnToNow, onTrafficDataChange]);

  // 패널이 닫히지 않았을 때만 렌더링
  if (!isOpen) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "24px",
        width: "420px",
        maxHeight: "calc(100vh - 200px)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "20px",
        background: "rgba(10, 14, 26, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 60px rgba(56, 189, 248, 0.15)",
        zIndex: 1000,
        overflow: "auto",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <h3
          style={{
            margin: 0,
            color: "#38bdf8",
            fontSize: "18px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>⏱️</span>
          교통 상황 재생
        </h3>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#8b90a7",
            fontSize: "24px",
            cursor: "pointer",
            padding: "4px",
            lineHeight: 1,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#8b90a7";
          }}
          aria-label="패널 닫기"
        >
          ✕
        </button>
      </div>

      {/* 로딩 상태 표시 (요구사항 1.5) */}
      {isLoading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            padding: "16px",
            background: "rgba(56, 189, 248, 0.1)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            borderRadius: "12px",
            color: "#38bdf8",
            fontSize: "14px",
          }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              border: "3px solid rgba(56, 189, 248, 0.3)",
              borderTop: "3px solid #38bdf8",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <span>데이터 로딩 중...</span>
        </div>
      )}

      {/* 에러 메시지 표시 (요구사항 1.3, 1.5) */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "12px",
            color: "#ef4444",
            fontSize: "14px",
          }}
          role="alert"
        >
          <span style={{ fontSize: "20px" }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: "4px" }}>
              오류 발생
            </div>
            <div style={{ fontSize: "12px", opacity: 0.9 }}>
              {error.message}
            </div>
          </div>
        </div>
      )}

      {/* TimeSlider 컴포넌트 */}
      <TimeSlider
        startTime={startTime}
        endTime={endTime}
        currentTime={currentTime}
        availability={availability}
        onChange={handleTimeChange}
        onRangeChange={handleRangeChange}
        disabled={isLoading || playback.isPlaying}
      />

      {/* PlaybackController 컴포넌트 */}
      <PlaybackController
        isPlaying={playback.isPlaying}
        playbackSpeed={playbackSpeed}
        onPlay={playback.play}
        onPause={playback.pause}
        onStop={playback.stop}
        onSpeedChange={(speed) => {
          setPlaybackSpeed(speed);
          playback.setSpeed(speed);
        }}
        disabled={isLoading}
      />

      {/* 현재 시간으로 복귀 버튼 (요구사항 6.1) */}
      <button
        onClick={handleReturnToNow}
        disabled={isLoading}
        style={{
          width: "100%",
          padding: "14px",
          background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
          border: "1px solid rgba(16, 185, 129, 0.4)",
          borderRadius: "12px",
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: 600,
          cursor: isLoading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "all 0.2s",
          opacity: isLoading ? 0.6 : 1,
          outline: "none",
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.background =
              "linear-gradient(135deg, #059669 0%, #10b981 100%)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(16, 185, 129, 0.4)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.currentTarget.style.background =
              "linear-gradient(135deg, #10b981 0%, #34d399 100%)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }
        }}
        aria-label="현재 시간으로 복귀"
      >
        <span style={{ fontSize: "18px" }}>🔄</span>
        <span>현재 시간으로</span>
      </button>

      {/* 캐시 정보 (디버깅용, 선택 사항) */}
      {cache.size > 0 && (
        <div
          style={{
            padding: "10px 12px",
            background: "rgba(139, 144, 167, 0.1)",
            border: "1px solid rgba(139, 144, 167, 0.2)",
            borderRadius: "8px",
            color: "#8b90a7",
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>💾 캐시된 데이터: {cache.size}개</span>
          <button
            onClick={cache.clear}
            style={{
              background: "transparent",
              border: "1px solid rgba(139, 144, 167, 0.3)",
              borderRadius: "6px",
              color: "#8b90a7",
              fontSize: "10px",
              padding: "4px 8px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(139, 144, 167, 0.2)";
              e.currentTarget.style.color = "#e8eaf0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#8b90a7";
            }}
          >
            초기화
          </button>
        </div>
      )}

      {/* 스피너 애니메이션 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
