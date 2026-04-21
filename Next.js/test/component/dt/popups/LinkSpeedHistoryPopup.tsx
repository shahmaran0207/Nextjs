"use client";

import { useEffect, useState } from "react";

interface SpeedPoint {
  speed: number;
  time: string;
}

interface LinkSpeedHistoryPopupProps {
  linkId: string;
  currentSpeed: number | null;
  position: { x: number; y: number };
  onClose: () => void;
}

/** 속도 → 색상 (교통정보 기준) */
function speedColor(spd: number): string {
  if (spd >= 60) return "#10b981"; // 원활 (초록)
  if (spd >= 30) return "#f59e0b"; // 서행 (노랑)
  return "#ef4444";                 // 정체 (빨강)
}

/** SVG 미니 라인차트 */
function SpeedChart({ data }: { data: SpeedPoint[] }) {
  if (data.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0", color: "#8b90a7", fontSize: "12px" }}>
        아직 데이터가 수집되지 않았습니다.<br />
        <span style={{ fontSize: "11px", opacity: 0.7 }}>10분마다 속도가 기록됩니다.</span>
      </div>
    );
  }

  const W = 260;
  const H = 80;
  const PAD = { top: 8, right: 8, bottom: 20, left: 28 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const speeds = data.map((d) => d.speed);
  const minSpd = Math.min(...speeds, 0);
  const maxSpd = Math.max(...speeds, 10);

  const xScale = (i: number) => PAD.left + (i / (data.length - 1 || 1)) * chartW;
  const yScale = (v: number) =>
    PAD.top + chartH - ((v - minSpd) / (maxSpd - minSpd || 1)) * chartH;

  // 라인 path
  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i).toFixed(1)} ${yScale(d.speed).toFixed(1)}`)
    .join(" ");

  // 영역 채우기 path
  const areaPath = [
    `M ${xScale(0).toFixed(1)} ${(PAD.top + chartH).toFixed(1)}`,
    ...data.map((d, i) => `L ${xScale(i).toFixed(1)} ${yScale(d.speed).toFixed(1)}`),
    `L ${xScale(data.length - 1).toFixed(1)} ${(PAD.top + chartH).toFixed(1)} Z`,
  ].join(" ");

  // 시간 레이블 (최대 5개)
  const labelIndices = data.length <= 5
    ? data.map((_, i) => i)
    : [0, Math.floor(data.length / 4), Math.floor(data.length / 2), Math.floor((data.length * 3) / 4), data.length - 1];

  // 현재 속도 색으로 그라데이션
  const latestSpd = data[data.length - 1].speed;
  const gradColor = speedColor(latestSpd);

  return (
    <svg width={W} height={H} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={gradColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={gradColor} stopOpacity="0.02" />
        </linearGradient>
        {/* 속도별 배경 구간 */}
        <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.05" />
          <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* 배경 */}
      <rect x={PAD.left} y={PAD.top} width={chartW} height={chartH} fill="url(#bgGrad)" rx="2" />

      {/* 그리드 라인 (y축 3단계) */}
      {[0, 0.5, 1].map((t) => {
        const y = PAD.top + chartH * (1 - t);
        const val = Math.round(minSpd + (maxSpd - minSpd) * t);
        return (
          <g key={t}>
            <line x1={PAD.left} y1={y} x2={PAD.left + chartW} y2={y}
              stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={PAD.left - 4} y={y + 4} textAnchor="end"
              fontSize="8" fill="#8b90a7">{val}</text>
          </g>
        );
      })}

      {/* 영역 채우기 */}
      <path d={areaPath} fill="url(#areaGrad)" />

      {/* 라인 */}
      <path d={linePath} fill="none" stroke={gradColor} strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round" />

      {/* 데이터 포인트 (마지막 포인트 강조) */}
      {data.map((d, i) => {
        const x = xScale(i);
        const y = yScale(d.speed);
        const isLast = i === data.length - 1;
        return (
          <circle key={i} cx={x} cy={y}
            r={isLast ? 3.5 : 2}
            fill={isLast ? gradColor : "rgba(255,255,255,0.3)"}
            stroke={isLast ? "rgba(255,255,255,0.6)" : "none"}
            strokeWidth={isLast ? 1 : 0}
          />
        );
      })}

      {/* 시간 레이블 */}
      {labelIndices.map((i) => {
        const d = data[i];
        const x = xScale(i);
        const t = new Date(d.time);
        const label = `${t.getHours().toString().padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}`;
        return (
          <text key={i} x={x} y={H - 4} textAnchor="middle"
            fontSize="8" fill="#8b90a7">{label}</text>
        );
      })}
    </svg>
  );
}

export default function LinkSpeedHistoryPopup({
  linkId,
  currentSpeed,
  position,
  onClose,
}: LinkSpeedHistoryPopupProps) {
  const [history, setHistory] = useState<SpeedPoint[]>([]);
  const [allTimeStats, setAllTimeStats] = useState<{ avg: number | null; max: number | null; min: number | null }>({ avg: null, max: null, min: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/GIS/Busan/Link/getSpeedHistory/${linkId}`)
      .then((r) => r.json())
      .then((d) => {
        setHistory(Array.isArray(d.data) ? d.data : []);
        setAllTimeStats({
          avg: d.stats?.avg !== undefined && d.stats?.avg !== null ? Math.round(d.stats.avg) : null,
          max: d.stats?.max !== undefined && d.stats?.max !== null ? Math.round(d.stats.max) : null,
          min: d.stats?.min !== undefined && d.stats?.min !== null ? Math.round(d.stats.min) : null,
        });
      })
      .catch(() => {
        setHistory([]);
        setAllTimeStats({ avg: null, max: null, min: null });
      })
      .finally(() => setIsLoading(false));
  }, [linkId]);

  // 뷰포트 경계 처리 (팝업이 화면 밖으로 나가지 않도록)
  const popupW = 300;
  const popupH = 220;
  const left = Math.min(position.x + 10, window.innerWidth - popupW - 10);
  const top = Math.min(position.y - 10, window.innerHeight - popupH - 10);

  const latestSpd = history.length > 0 ? history[history.length - 1].speed : currentSpeed;
  const spdColor = latestSpd !== null ? speedColor(latestSpd) : "#8b90a7";

  const avgSpd = allTimeStats.avg;
  const maxSpd = allTimeStats.max;
  const minSpd = allTimeStats.min;

  return (
    <div
      style={{
        position: "fixed",
        left,
        top,
        zIndex: 2000,
        background: "rgba(10, 14, 26, 0.96)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${spdColor}44`,
        borderRadius: "12px",
        padding: "14px",
        width: `${popupW}px`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${spdColor}22`,
        animation: "dtFadeIn 0.2s ease-out",
        pointerEvents: "auto",
      }}
    >
      <style>{`
        @keyframes dtFadeIn {
          from { opacity: 0; transform: translateY(4px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "13px" }}>🛣️</span>
            <span style={{ color: "#e8eaf0", fontSize: "12px", fontWeight: 700 }}>
              속도 이력
            </span>
          </div>
          <p style={{ color: "#8b90a7", fontSize: "10px", margin: "2px 0 0", fontFamily: "monospace" }}>
            LINK · {linkId}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "6px",
            color: "#8b90a7",
            cursor: "pointer",
            fontSize: "12px",
            padding: "2px 8px",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.12)";
            e.currentTarget.style.color = "#e8eaf0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.color = "#8b90a7";
          }}
        >
          ✕
        </button>
      </div>

      {/* 현재 속도 + 통계 */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
        {[
          { label: "현재", value: currentSpeed !== null ? `${Math.round(currentSpeed)}` : "-", unit: "km/h", color: spdColor },
          { label: "평균", value: avgSpd !== null ? `${avgSpd}` : "-", unit: "km/h", color: "#38bdf8" },
          { label: "최고", value: maxSpd !== null ? `${maxSpd}` : "-", unit: "km/h", color: "#10b981" },
          { label: "최저", value: minSpd !== null ? `${minSpd}` : "-", unit: "km/h", color: "#ef4444" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${stat.color}33`,
              borderRadius: "6px",
              padding: "5px 6px",
              textAlign: "center",
            }}
          >
            <div style={{ color: "#8b90a7", fontSize: "9px", marginBottom: "2px" }}>{stat.label}</div>
            <div style={{ color: stat.color, fontSize: "14px", fontWeight: 700, fontFamily: "monospace", lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ color: "#8b90a7", fontSize: "8px" }}>{stat.unit}</div>
          </div>
        ))}
      </div>

      {/* 차트 */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "8px",
        padding: "6px",
      }}>
        <div style={{ color: "#8b90a7", fontSize: "10px", marginBottom: "4px" }}>
          최근 24시간 속도 변화
          {history.length > 0 && (
            <span style={{ marginLeft: "6px", color: "#38bdf8" }}>({history.length}개 기록)</span>
          )}
        </div>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#8b90a7", fontSize: "12px" }}>
            불러오는 중...
          </div>
        ) : (
          <SpeedChart data={history} />
        )}
      </div>
    </div>
  );
}
