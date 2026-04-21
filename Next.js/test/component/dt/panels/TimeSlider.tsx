"use client";

import React, { useState, useEffect, useRef } from "react";

interface TimeSliderProps {
  startTime: Date;
  endTime: Date;
  currentTime: Date;
  availability: TimeAvailability[];
  onChange: (time: Date) => void;
  onRangeChange: (start: Date, end: Date) => void;
  disabled: boolean;
}

interface TimeAvailability {
  start: Date;
  end: Date;
  hasData: boolean;
}

/**
 * 타임 슬라이더 컴포넌트 (React.memo로 최적화)
 * 
 * 요구사항: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 8.1, 8.2, 8.3, 8.4
 * 최적화: Task 9.2 - React.memo 적용
 */
const TimeSlider = React.memo(function TimeSlider({
  startTime,
  endTime,
  currentTime,
  availability,
  onChange,
  onRangeChange,
  disabled,
}: TimeSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localStartTime, setLocalStartTime] = useState(startTime);
  const [localEndTime, setLocalEndTime] = useState(endTime);
  const [rangeError, setRangeError] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Update local state when props change
  useEffect(() => {
    setLocalStartTime(startTime);
  }, [startTime]);

  useEffect(() => {
    setLocalEndTime(endTime);
  }, [endTime]);

  // Format date to YYYY-MM-DD HH:mm
  const formatDateTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // Convert Date to datetime-local input format (YYYY-MM-DDTHH:mm)
  const dateToInputString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Convert datetime-local input string to Date
  const inputStringToDate = (str: string): Date | null => {
    if (!str) return null;
    const date = new Date(str);
    return isNaN(date.getTime()) ? null : date;
  };

  // Calculate slider position (0-100%)
  const getSliderPosition = (): number => {
    const totalRange = localEndTime.getTime() - localStartTime.getTime();
    const currentPosition = currentTime.getTime() - localStartTime.getTime();
    return Math.max(0, Math.min(100, (currentPosition / totalRange) * 100));
  };

  // Handle slider drag
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const totalRange = localEndTime.getTime() - localStartTime.getTime();
    const newTime = new Date(localStartTime.getTime() + (totalRange * value) / 100);
    onChange(newTime);
  };

  // Handle start time change
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = inputStringToDate(e.target.value);
    if (!newStartTime) return;

    setLocalStartTime(newStartTime);

    // Validate: start time must be before end time
    if (newStartTime >= localEndTime) {
      setRangeError("시작 시간은 종료 시간보다 이전이어야 합니다");
      return;
    }

    setRangeError(null);
    onRangeChange(newStartTime, localEndTime);
  };

  // Handle end time change
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndTime = inputStringToDate(e.target.value);
    if (!newEndTime) return;

    setLocalEndTime(newEndTime);

    // Validate: start time must be before end time
    if (localStartTime >= newEndTime) {
      setRangeError("시작 시간은 종료 시간보다 이전이어야 합니다");
      return;
    }

    setRangeError(null);
    onRangeChange(localStartTime, newEndTime);
  };

  // Render availability background
  const renderAvailabilityBackground = () => {
    const totalRange = localEndTime.getTime() - localStartTime.getTime();
    
    return availability.map((range, index) => {
      const rangeStart = Math.max(range.start.getTime(), localStartTime.getTime());
      const rangeEnd = Math.min(range.end.getTime(), localEndTime.getTime());
      
      if (rangeStart >= rangeEnd) return null;
      
      const left = ((rangeStart - localStartTime.getTime()) / totalRange) * 100;
      const width = ((rangeEnd - rangeStart) / totalRange) * 100;
      
      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left: `${left}%`,
            width: `${width}%`,
            height: "100%",
            background: range.hasData
              ? "rgba(56, 189, 248, 0.3)"
              : "rgba(139, 144, 167, 0.1)",
            pointerEvents: "none",
          }}
        />
      );
    });
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
      {/* Current Time Display */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "14px" }}>🕐</span>
        <span
          style={{
            color: "#38bdf8",
            fontSize: "16px",
            fontWeight: 700,
            fontFamily: "monospace",
          }}
        >
          {formatDateTime(currentTime)}
        </span>
      </div>

      {/* Slider Container */}
      <div
        ref={sliderRef}
        style={{
          position: "relative",
          width: "100%",
          height: "40px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Availability Background */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: "8px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          {renderAvailabilityBackground()}
        </div>

        {/* HTML5 Range Input */}
        <input
          type="range"
          min="0"
          max="100"
          step="0.01"
          value={getSliderPosition()}
          onChange={handleSliderChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          disabled={disabled}
          style={{
            width: "100%",
            height: "8px",
            appearance: "none",
            WebkitAppearance: "none",
            background: "transparent",
            outline: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            position: "relative",
            zIndex: 2,
          }}
          aria-label="시간 슬라이더"
        />

        <style>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            -webkit-appearance: none;
            width: 20px;
            height: 20px;
            background: #38bdf8;
            border: 2px solid rgba(10, 14, 26, 0.95);
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(56, 189, 248, 0.5);
            transition: transform 0.15s, box-shadow 0.15s;
          }

          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 4px 12px rgba(56, 189, 248, 0.7);
          }

          input[type="range"]::-webkit-slider-thumb:active {
            transform: scale(1.1);
          }

          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: #38bdf8;
            border: 2px solid rgba(10, 14, 26, 0.95);
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(56, 189, 248, 0.5);
            transition: transform 0.15s, box-shadow 0.15s;
          }

          input[type="range"]::-moz-range-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 4px 12px rgba(56, 189, 248, 0.7);
          }

          input[type="range"]::-moz-range-thumb:active {
            transform: scale(1.1);
          }

          input[type="range"]:disabled::-webkit-slider-thumb {
            background: #8b90a7;
            cursor: not-allowed;
          }

          input[type="range"]:disabled::-moz-range-thumb {
            background: #8b90a7;
            cursor: not-allowed;
          }
        `}</style>
      </div>

      {/* Time Range Inputs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
        }}
      >
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
            시작 시간
          </label>
          <input
            type="datetime-local"
            value={dateToInputString(localStartTime)}
            onChange={handleStartTimeChange}
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
              cursor: disabled ? "not-allowed" : "text",
            }}
            aria-label="시작 시간"
          />
        </div>

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
            종료 시간
          </label>
          <input
            type="datetime-local"
            value={dateToInputString(localEndTime)}
            onChange={handleEndTimeChange}
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
              cursor: disabled ? "not-allowed" : "text",
            }}
            aria-label="종료 시간"
          />
        </div>
      </div>

      {/* Error Message */}
      {rangeError && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "8px",
            padding: "10px 12px",
            color: "#ef4444",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          role="alert"
        >
          <span>⚠️</span>
          <span>{rangeError}</span>
        </div>
      )}
    </div>
  );
});

export default TimeSlider;
