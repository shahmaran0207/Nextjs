"use client";

import axios from "axios";
import { useState } from "react";

const panel: React.CSSProperties = {
  position: "absolute",
  top: "1rem",
  right: "1rem",
  background: "rgba(10, 14, 26, 0.88)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  padding: "14px",
  zIndex: 100,
  minWidth: "240px",
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

interface SectionPanelProps {
  sectionData: any[];
  handleSection: (id: number) => void;
  selectedRoadId: number | null;
  selectedSectionId: number | null;
  setLinkData: (v: any) => void;
  setSelectedLinks: (v: any) => void;
  setIsLinkSelectMode: (v: boolean) => void;
  clearAllHighlights: () => void;
}

export default function TwinSectionPanel({
  sectionData,
  handleSection,
  selectedRoadId,
  selectedSectionId,
  setLinkData,
  setSelectedLinks,
  setIsLinkSelectMode,
  clearAllHighlights,
}: SectionPanelProps) {
  const [showModal, setShowModal] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [hovered, setHovered] = useState<number | null>(null);

  const handleSave = async () => {
    if (!sectionName.trim()) return;
    await axios.post("/api/GIS/Busan/Section/addSection", { sectionName, roadId: selectedRoadId });
    setShowModal(false);
    setSectionName("");
    window.location.reload();
  };

  return (
    <div style={panel}>
      <p style={{ color: "#8b90a7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "10px", textTransform: "uppercase" }}>
        구역 관리
      </p>

      {!showModal ? (
        <>
          {selectedRoadId && (
            <button
              style={{ ...btnBase, background: "rgba(56,189,248,0.15)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.3)" }}
              onClick={() => {
                setShowModal(true);
                setIsLinkSelectMode(false);
                setSelectedLinks([]);
                setLinkData([]);
                clearAllHighlights();
              }}
              onMouseEnter={e => { (e.currentTarget.style.boxShadow = "0 0 12px rgba(56,189,248,0.3)"); (e.currentTarget.style.transform = "scale(1.02)"); }}
              onMouseLeave={e => { (e.currentTarget.style.boxShadow = "none"); (e.currentTarget.style.transform = "scale(1)"); }}
            >
              + 구역 추가
            </button>
          )}

          {sectionData.length === 0 && (
            <p style={{ color: "#4b5160", fontSize: "12px", textAlign: "center", padding: "12px 0" }}>
              {selectedRoadId ? "구역이 없습니다" : "도로를 선택하세요"}
            </p>
          )}

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              {sectionData.length > 0 && (
                <tr>
                  <th style={{ color: "#8b90a7", padding: "4px 6px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.07)", fontWeight: 600 }}>ID</th>
                  <th style={{ color: "#8b90a7", padding: "4px 6px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.07)", fontWeight: 600 }}>구역명</th>
                  <th style={{ color: "#8b90a7", padding: "4px 6px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.07)", fontWeight: 600 }}>링크</th>
                </tr>
              )}
            </thead>
            <tbody>
              {sectionData.map((section: any) => (
                <tr
                  key={section.id}
                  onClick={() => {
                    handleSection(section.id);
                    setIsLinkSelectMode(false);
                    setSelectedLinks([]);
                  }}
                  onMouseEnter={() => setHovered(section.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    cursor: "pointer",
                    background: selectedSectionId === section.id
                      ? "rgba(56,189,248,0.18)"
                      : hovered === section.id
                      ? "rgba(56,189,248,0.08)"
                      : "transparent",
                    transition: "background 0.15s",
                  }}
                >
                  <td style={{ color: "#8b90a7", padding: "5px 6px" }}>{section.id}</td>
                  <td style={{ color: selectedSectionId === section.id ? "#38bdf8" : "#e8eaf0", padding: "5px 6px" }}>{section.sectionname}</td>
                  <td style={{ color: "#6b7280", padding: "5px 6px", fontSize: "11px" }}>
                    {section.linkid ? section.linkid.replace(/^\[|\]$/g, "").split(",").length + "개" : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ color: "#e8eaf0", fontSize: "12px", marginBottom: "4px" }}>구역명 입력</p>
          <input
            type="text"
            placeholder="예: 해운대 구역 1"
            value={sectionName}
            onChange={e => setSectionName(e.target.value)}
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
              onClick={() => { setShowModal(false); setSectionName(""); }}
              style={{ ...btnBase, marginBottom: 0, flex: 1, background: "rgba(255,255,255,0.06)", color: "#8b90a7", border: "1px solid rgba(255,255,255,0.1)" }}
            >취소</button>
          </div>
        </div>
      )}
    </div>
  );
}
