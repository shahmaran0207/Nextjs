"use client";

import { useState } from "react";
import { DashboardStats } from "../modules/DashboardStatsModule";
import { getTopN } from "../modules/DashboardStatsModule";
import { DistrictBoundary } from "@/types/ui-ux";
import { getDistrictCenter, calculateZoomLevel } from "@/utils/mapValidation";
import { FIELD_CONFIG } from "../constants/iconConfigs";

const panel: React.CSSProperties = {
  position: "absolute",
  bottom: "1rem",
  right: "1rem",
  background: "rgba(10, 14, 26, 0.92)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(56,189,248,0.2)",
  borderRadius: "12px",
  padding: "14px",
  zIndex: 100,
  width: "320px",
  display: "flex",
  flexDirection: "column",
  maxHeight: "calc(50vh - 2rem)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  animation: "dtFadeIn 0.25s ease-out",
};

const statCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  padding: "10px 12px",
  cursor: "pointer",
  transition: "all 0.15s",
};

interface DashboardPanelProps {
  stats: DashboardStats;
  isLoading: boolean;
  onStatClick?: (statType: string, value: string) => void;
  onDistrictClick?: (districtName: string) => void;
  onTourismCategoryClick?: (category: string) => void;
  onConstructionFieldClick?: (fieldCode: string) => void;
  boundaryData?: DistrictBoundary[];
  activeCarouselCategory?: string | null; // 순환 중인 카테고리
  activeCarouselType?: 'tourism' | 'construction' | null; // 순환 타입
  isCctvOnly?: boolean; // CCTV 단독 표시 모드 여부
}

export default function DashboardPanel({
  stats,
  isLoading,
  onStatClick,
  onDistrictClick,
  onTourismCategoryClick,
  onConstructionFieldClick,
  boundaryData = [],
  activeCarouselCategory = null,
  activeCarouselType = null,
  isCctvOnly = false,
}: DashboardPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const allFields = Object.entries(stats.projectsByField)
    .sort((a, b) => b[1] - a[1]);
  const allDistricts = Object.entries(stats.projectsByDistrict)
    .filter(([district]) => district !== '부산광역시')
    .sort((a, b) => b[1] - a[1]);
  const allCategories = Object.entries(stats.tourismByCategory)
    .sort((a, b) => b[1] - a[1]);

  // District 클릭 핸들러
  const handleDistrictClick = (districtName: string) => {
    // 기존 onStatClick 호출
    onStatClick?.('district', districtName);
    
    // 지도 이동 콜백 호출
    if (onDistrictClick) {
      onDistrictClick(districtName);
    }
  };

  return (
    <div style={panel}>
      <style>{`
        @keyframes dtFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dt-panel-scroll::-webkit-scrollbar { width: 4px; }
        .dt-panel-scroll::-webkit-scrollbar-track { background: transparent; }
        .dt-panel-scroll::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.3); border-radius: 4px; }
        .dt-panel-scroll::-webkit-scrollbar-thumb:hover { background: rgba(56,189,248,0.5); }
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
        role="button"
        tabIndex={0}
        aria-expanded={!isCollapsed}
        aria-label={`통계 대시보드 ${isCollapsed ? '펼치기' : '접기'}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsCollapsed(!isCollapsed);
          }
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>📊</span>
          <p style={{ color: "#8b90a7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", margin: 0, textTransform: "uppercase" }}>
            통계 대시보드
          </p>
        </div>
        <span style={{ color: "#8b90a7", fontSize: "14px" }}>
          {isCollapsed ? "▲" : "▼"}
        </span>
      </div>

      {!isCollapsed && (
        <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }} className="dt-panel-scroll">
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#8b90a7", fontSize: "13px" }}>
              계산 중...
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Ongoing Projects */}
              <div
                style={statCard}
                onClick={() => onStatClick?.('ongoing', 'all')}
                role="button"
                tabIndex={0}
                aria-label={`진행 중 공사 ${stats.ongoingProjects}개`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onStatClick?.('ongoing', 'all');
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(56,189,248,0.08)";
                  e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#8b90a7", fontSize: "12px" }}>🚧 진행 중 공사</span>
                  <span style={{ color: "#38bdf8", fontSize: "18px", fontWeight: 700 }}>
                    {stats.ongoingProjects}
                  </span>
                </div>
              </div>

              {/* Average Progress */}
              <div
                style={statCard}
                role="status"
                aria-label={`평균 진행률 ${stats.avgProgressRate}퍼센트`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#8b90a7", fontSize: "12px" }}>📈 평균 진행률</span>
                  <span style={{ color: "#4ade80", fontSize: "18px", fontWeight: 700 }}>
                    {stats.avgProgressRate}%
                  </span>
                </div>
              </div>

              {/* Behind Schedule */}
              <div
                style={statCard}
                onClick={() => onStatClick?.('behind', 'all')}
                role="button"
                tabIndex={0}
                aria-label={`지연 프로젝트 ${stats.behindScheduleCount}개`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onStatClick?.('behind', 'all');
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                  e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#8b90a7", fontSize: "12px" }}>⚠️ 지연 프로젝트</span>
                  <span style={{ color: "#ef4444", fontSize: "18px", fontWeight: 700 }}>
                    {stats.behindScheduleCount}
                  </span>
                </div>
              </div>

              {/* CCTV Count */}
              <div
                style={{
                  ...statCard,
                  background: isCctvOnly
                    ? "rgba(56,189,248,0.2)"
                    : "rgba(255,255,255,0.03)",
                  border: isCctvOnly
                    ? "2px solid rgba(56,189,248,0.8)"
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: isCctvOnly
                    ? "0 0 14px rgba(56,189,248,0.45)"
                    : "none",
                }}
                onClick={() => onStatClick?.('cctv', 'all')}
                role="button"
                tabIndex={0}
                aria-label={`도로 CCTV ${stats.totalCctv}개${isCctvOnly ? ', 활성: 다시 클릭하면 원래대로' : ', 클릭하면 CCTV만 표시'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onStatClick?.('cctv', 'all');
                  }
                }}
                onMouseEnter={(e) => {
                  if (!isCctvOnly) {
                    e.currentTarget.style.background = "rgba(56,189,248,0.08)";
                    e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCctvOnly) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  }
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: isCctvOnly ? "#7dd3fc" : "#8b90a7", fontSize: "12px", fontWeight: isCctvOnly ? 700 : 400 }}>
                    {isCctvOnly && "🔵 "}📹 도로 CCTV
                    {isCctvOnly && <span style={{ fontSize: "10px", color: "#38bdf8", marginLeft: "4px" }}>(단독모드)</span>}
                  </span>
                  <span style={{ color: "#38bdf8", fontSize: "18px", fontWeight: 700 }}>
                    {stats.totalCctv}
                  </span>
                </div>
              </div>

              {/* All Fields */}
              <div style={{ marginTop: "8px" }}>
                <p style={{ color: "#8b90a7", fontSize: "11px", fontWeight: 600, marginBottom: "6px" }}>
                  분야별 공사
                </p>
                {allFields.map(([fieldCode, count]) => {
                  const fieldLabel = FIELD_CONFIG[fieldCode]?.label || fieldCode;
                  const isActiveCarousel = activeCarouselType === 'construction' && activeCarouselCategory === fieldCode;

                  return (
                    <div
                      key={fieldCode}
                      style={{
                        ...statCard,
                        marginBottom: "4px",
                        padding: "6px 10px",
                        background: isActiveCarousel 
                          ? "rgba(249,115,22,0.25)" 
                          : "rgba(255,255,255,0.03)",
                        border: isActiveCarousel 
                          ? "2px solid rgba(249,115,22,0.8)" 
                          : "1px solid rgba(255,255,255,0.08)",
                        boxShadow: isActiveCarousel 
                          ? "0 0 12px rgba(249,115,22,0.4)" 
                          : "none",
                      }}
                      onClick={() => onConstructionFieldClick?.(fieldCode)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${fieldLabel} 공사 ${count}개, 클릭하여 자동 순환`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onConstructionFieldClick?.(fieldCode);
                        }
                      }}
                      onMouseEnter={(e) => {
                        if (!isActiveCarousel) {
                          e.currentTarget.style.background = "rgba(56,189,248,0.08)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActiveCarousel) {
                          e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                        }
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: isActiveCarousel ? "#fed7aa" : "#e8eaf0", fontSize: "11px", fontWeight: isActiveCarousel ? 600 : 400 }}>
                          {isActiveCarousel && "🔄 "}{fieldLabel}
                        </span>
                        <span style={{ color: isActiveCarousel ? "#f97316" : "#38bdf8", fontSize: "13px", fontWeight: 600 }}>
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* All Districts */}
              <div style={{ marginTop: "8px" }}>
                <p style={{ color: "#8b90a7", fontSize: "11px", fontWeight: 600, marginBottom: "6px" }}>
                  지역별 공사
                </p>
                {allDistricts.map(([district, count]) => (
                  <div
                    key={district}
                    style={{
                      ...statCard,
                      marginBottom: "4px",
                      padding: "6px 10px",
                    }}
                    onClick={() => handleDistrictClick(district)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${district} 공사 ${count}개, 클릭하여 지도 이동`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleDistrictClick(district);
                      }
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(56,189,248,0.08)";
                      e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#e8eaf0", fontSize: "11px" }}>📍 {district}</span>
                      <span style={{ color: "#38bdf8", fontSize: "13px", fontWeight: 600 }}>
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* All Tourism Categories */}
              <div style={{ marginTop: "8px" }}>
                <p style={{ color: "#8b90a7", fontSize: "11px", fontWeight: 600, marginBottom: "6px" }}>
                  관광 카테고리
                </p>
                {allCategories.map(([category, count]) => {
                  const isActiveCarousel = activeCarouselType === 'tourism' && activeCarouselCategory === category;

                  return (
                    <div
                      key={category}
                      style={{
                        ...statCard,
                        marginBottom: "4px",
                        padding: "6px 10px",
                        background: isActiveCarousel 
                          ? "rgba(236,72,153,0.25)" 
                          : "rgba(255,255,255,0.03)",
                        border: isActiveCarousel 
                          ? "2px solid rgba(236,72,153,0.8)" 
                          : "1px solid rgba(255,255,255,0.08)",
                        boxShadow: isActiveCarousel 
                          ? "0 0 12px rgba(236,72,153,0.4)" 
                          : "none",
                      }}
                      onClick={() => onTourismCategoryClick?.(category)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${category} 관광지 ${count}개, 클릭하여 자동 순환`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onTourismCategoryClick?.(category);
                        }
                      }}
                      onMouseEnter={(e) => {
                        if (!isActiveCarousel) {
                          e.currentTarget.style.background = "rgba(236,72,153,0.08)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActiveCarousel) {
                          e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                        }
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: isActiveCarousel ? "#fbcfe8" : "#e8eaf0", fontSize: "11px", fontWeight: isActiveCarousel ? 600 : 400 }}>
                          {isActiveCarousel && "🔄 "}{category}
                        </span>
                        <span style={{ color: isActiveCarousel ? "#ec4899" : "#ec4899", fontSize: "13px", fontWeight: 600 }}>
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
