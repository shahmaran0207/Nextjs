"use client";

import axios from "axios";
import { useState } from "react";

const panel: React.CSSProperties = {
  position: "absolute",
  top: "1rem",
  left: "1rem",
  background: "rgba(10, 14, 26, 0.88)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  padding: "14px",
  zIndex: 100,
  minWidth: "200px",
  maxHeight: "80vh",
  overflowY: "auto",
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
  marginBottom: "8px",
  transition: "transform 0.15s, box-shadow 0.15s",
};

interface RoadPanelProps {
  roadData: any[];
  handleRoad: (id: number) => void;
  clearAllHighlights: () => void;
  showTrafficOnly: () => void;
  selectedRoadId: number | null;
}

export default function TwinRoadPanel({
  roadData,
  handleRoad,
  clearAllHighlights,
  showTrafficOnly,
  selectedRoadId,
}: RoadPanelProps) {
  const [showModal, setShowModal] = useState(false);
  const [roadName, setRoadName] = useState("");
  const [hovered, setHovered] = useState<number | null>(null);

  const handleSave = async () => {
    if (!roadName.trim()) return;
    await axios.post("/api/GIS/Busan/Road/addRoad", { roadName });
    setShowModal(false);
    setRoadName("");
    window.location.reload();
  };

  return (
    <div style={panel}>
      <style>{`
        @keyframes dtFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dt-panel-scroll::-webkit-scrollbar { width: 4px; }
        .dt-panel-scroll::-webkit-scrollbar-track { background: transparent; }
        .dt-panel-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
      `}</style>

      {/* 헤더 */}
      <p style={{ color: "#8b90a7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "10px", textTransform: "uppercase" }}>
        도로 관리
      </p>

      {/* 소통정보 버튼 */}
      <button
        style={{ ...btnBase, background: "rgba(74,222,128,0.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }}
        onClick={showTrafficOnly}
        onMouseEnter={e => { (e.currentTarget.style.boxShadow = "0 0 12px rgba(74,222,128,0.3)"); (e.currentTarget.style.transform = "scale(1.02)"); }}
        onMouseLeave={e => { (e.currentTarget.style.boxShadow = "none"); (e.currentTarget.style.transform = "scale(1)"); }}
      >
        🟢 소통정보 보기
      </button>

      {!showModal ? (
        <>
          <button
            style={{ ...btnBase, background: "rgba(56,189,248,0.15)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.3)" }}
            onClick={() => setShowModal(true)}
            onMouseEnter={e => { (e.currentTarget.style.boxShadow = "0 0 12px rgba(56,189,248,0.3)"); (e.currentTarget.style.transform = "scale(1.02)"); }}
            onMouseLeave={e => { (e.currentTarget.style.boxShadow = "none"); (e.currentTarget.style.transform = "scale(1)"); }}
          >
            + 도로 추가
          </button>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr>
                <th style={{ color: "#8b90a7", padding: "4px 8px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.07)", fontWeight: 600 }}>ID</th>
                <th style={{ color: "#8b90a7", padding: "4px 8px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.07)", fontWeight: 600 }}>도로명</th>
              </tr>
            </thead>
            <tbody>
              {roadData.map((road: any) => (
                <tr
                  key={road.id}
                  onClick={() => { handleRoad(road.id); clearAllHighlights(); }}
                  onMouseEnter={() => setHovered(road.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    cursor: "pointer",
                    background: selectedRoadId === road.id
                      ? "rgba(56,189,248,0.18)"
                      : hovered === road.id
                      ? "rgba(56,189,248,0.08)"
                      : "transparent",
                    transition: "background 0.15s",
                    borderRadius: "4px",
                  }}
                >
                  <td style={{ color: "#8b90a7", padding: "5px 8px" }}>{road.id}</td>
                  <td style={{ color: selectedRoadId === road.id ? "#38bdf8" : "#e8eaf0", padding: "5px 8px" }}>{road.roadname}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ color: "#e8eaf0", fontSize: "12px", marginBottom: "4px" }}>도로명 입력</p>
          <input
            type="text"
            placeholder="예: 해운대로"
            value={roadName}
            onChange={e => setRoadName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSave()}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "8px",
              color: "#e8eaf0",
              padding: "7px 10px",
              fontSize: "13px",
              outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={handleSave}
              style={{ ...btnBase, marginBottom: 0, flex: 1, background: "rgba(56,189,248,0.2)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.4)" }}
            >저장</button>
            <button
              onClick={() => { setShowModal(false); setRoadName(""); }}
              style={{ ...btnBase, marginBottom: 0, flex: 1, background: "rgba(255,255,255,0.06)", color: "#8b90a7", border: "1px solid rgba(255,255,255,0.1)" }}
            >취소</button>
          </div>
        </div>
      )}
    </div>
  );
}
