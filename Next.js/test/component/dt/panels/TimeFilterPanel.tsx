"use client";

import { useState } from "react";

const panel: React.CSSProperties = {
  position: "absolute",
  top: "1rem",
  right: "1rem",
  background: "rgba(10, 14, 26, 0.92)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(56,189,248,0.2)",
  borderRadius: "12px",
  padding: "14px",
  zIndex: 100,
  width: "280px",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  animation: "dtFadeIn 0.25s ease-out",
};

const btnBase: React.CSSProperties = {
  width: "100%",
  padding: "7px 12px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  transition: "transform 0.15s, box-shadow 0.15s",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "8px",
  color: "#e8eaf0",
  padding: "7px 10px",
  fontSize: "13px",
  outline: "none",
  width: "100%",
};

interface TimeFilterPanelProps {
  startDate: Date | null;
  endDate: Date | null;
  ongoingOnly: boolean;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onOngoingToggle: () => void;
  onReset: () => void;
  visibleCount: number;
  totalCount: number;
}

export default function TimeFilterPanel({
  startDate,
  endDate,
  ongoingOnly,
  onStartDateChange,
  onEndDateChange,
  onOngoingToggle,
  onReset,
  visibleCount,
  totalCount,
}: TimeFilterPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Convert Date to YYYY-MM-DD string for input
  const dateToString = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Convert YYYY-MM-DD string to Date
  const stringToDate = (str: string): Date | null => {
    if (!str) return null;
    const date = new Date(str);
    return isNaN(date.getTime()) ? null : date;
  };

  const hasActiveFilters = startDate !== null || endDate !== null || ongoingOnly;

  return (
    <div style={panel}>
      <style>{`
        @keyframes dtFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: isCollapsed ? 0 : "12px",
          cursor: "pointer",
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>📅</span>
          <p style={{ color: "#8b90a7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", margin: 0, textTransform: "uppercase" }}>
            시간 필터
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {hasActiveFilters && (
            <span style={{
              background: "rgba(56,189,248,0.2)",
              color: "#38bdf8",
              fontSize: "10px",
              padding: "2px 6px",
              borderRadius: "4px",
              fontWeight: 600,
            }}>
              {visibleCount}/{totalCount}
            </span>
          )}
          <span style={{ color: "#8b90a7", fontSize: "14px" }}>
            {isCollapsed ? "▼" : "▲"}
          </span>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Ongoing Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              background: ongoingOnly ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${ongoingOnly ? "rgba(56,189,248,0.3)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: "8px",
              marginBottom: "12px",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onClick={onOngoingToggle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = ongoingOnly ? "rgba(56,189,248,0.18)" : "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = ongoingOnly ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.03)";
            }}
          >
            <span style={{ color: "#e8eaf0", fontSize: "13px", fontWeight: 500 }}>
              진행 중만 표시
            </span>
            <div
              style={{
                width: "40px",
                height: "20px",
                background: ongoingOnly ? "#38bdf8" : "rgba(255,255,255,0.15)",
                borderRadius: "10px",
                position: "relative",
                transition: "background 0.2s",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  background: "#fff",
                  borderRadius: "50%",
                  position: "absolute",
                  top: "2px",
                  left: ongoingOnly ? "22px" : "2px",
                  transition: "left 0.2s",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              />
            </div>
          </div>

          {/* Date Range Inputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
            <div>
              <label style={{ color: "#8b90a7", fontSize: "11px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                시작일
              </label>
              <input
                type="date"
                value={dateToString(startDate)}
                onChange={(e) => onStartDateChange(stringToDate(e.target.value))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ color: "#8b90a7", fontSize: "11px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                종료일
              </label>
              <input
                type="date"
                value={dateToString(endDate)}
                onChange={(e) => onEndDateChange(stringToDate(e.target.value))}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Filter Stats */}
          {hasActiveFilters && (
            <div
              style={{
                background: "rgba(56,189,248,0.08)",
                border: "1px solid rgba(56,189,248,0.2)",
                borderRadius: "8px",
                padding: "10px 12px",
                marginBottom: "12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#8b90a7", fontSize: "12px" }}>표시 중</span>
                <span style={{ color: "#38bdf8", fontSize: "14px", fontWeight: 700 }}>
                  {visibleCount} / {totalCount}
                </span>
              </div>
              <div style={{ marginTop: "4px" }}>
                <div
                  style={{
                    height: "4px",
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      background: "linear-gradient(90deg, #38bdf8, #0ea5e9)",
                      width: `${totalCount > 0 ? (visibleCount / totalCount) * 100 : 0}%`,
                      transition: "width 0.3s",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              style={{
                ...btnBase,
                background: "rgba(255,255,255,0.06)",
                color: "#8b90a7",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onClick={onReset}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 12px rgba(255,255,255,0.1)";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              🔄 필터 초기화
            </button>
          )}
        </>
      )}
    </div>
  );
}
