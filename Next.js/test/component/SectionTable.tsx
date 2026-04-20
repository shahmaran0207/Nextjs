"use client"

import axios from "axios";
import { useState } from "react";

export default function SectionTable({ setLinkData, setSelectedLinks, setIsLinkSelectMode, clearAllHighlights, sectionData, handleSection, selectedRoadId, handleSectionWithSelect }:
   { setLinkData: (value: any) => void, setSelectedLinks: (value: any) => void, setIsLinkSelectMode: (value: boolean) => void, clearAllHighlights: () => void, sectionData: any[], handleSection: (id: number) => void, selectedRoadId: number | null,
    handleSectionWithSelect: (id: number) => void
   }) {
    const [showModal, setShowModal] = useState(false);
    const [sectionName, setSectionName] = useState("");

    const handleSave = async() => {
      await axios.post("/api/GIS/Busan/Section/addSection", {sectionName, roadId: selectedRoadId });
      setShowModal(false);
      setSectionName("");
      window.location.reload();
    };

    return (
      <div style={{
        position: "absolute",
        top: "1rem",
        right: "1rem",
        background: "#1a1d27",
        borderRadius: "12px",
        border: "1px solid rgba(56,189,248,0.15)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        padding: "0.75rem",
        zIndex: 10,
        minWidth: "300px",
      }}>
        {!showModal ? (
          <>
          {selectedRoadId && (
            <button
              onClick={() => {
                setShowModal(true);
                setIsLinkSelectMode(false);
                setSelectedLinks([]);
                setLinkData([]);
                clearAllHighlights();
              }}
              style={{
                marginBottom: "0.5rem",
                padding: "0.5rem 0.75rem",
                background: "rgba(56,189,248,0.1)",
                color: "#38bdf8",
                border: "1px solid rgba(56,189,248,0.3)",
                borderRadius: "8px",
                fontSize: "13px",
                width: "100%",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              구역 추가
            </button>
          )}
            
            <table style={{ fontSize: "13px", width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(56,189,248,0.15)" }}>
                  <th style={{ padding: "0.5rem 0.75rem", textAlign: "center", color: "#8b90a7", fontWeight: 500 }}>구역 ID</th>
                  <th style={{ padding: "0.5rem 0.75rem", textAlign: "center", color: "#8b90a7", fontWeight: 500 }}>구역 명</th>
                  <th style={{ padding: "0.5rem 0.75rem", textAlign: "center", color: "#8b90a7", fontWeight: 500 }}>도로 ID</th>
                  <th style={{ padding: "0.5rem 0.75rem", textAlign: "center", color: "#8b90a7", fontWeight: 500 }}>링크 ID</th>
                </tr>
              </thead>
              <tbody>
                {sectionData.map((section: any) => (
                  <tr key={`${section.id}`} onClick={() => {
                    handleSectionWithSelect(section.id);
                    clearAllHighlights();
                    setIsLinkSelectMode(false);
                    setSelectedLinks([]);
                  }} style={{ 
                    cursor: "pointer",
                    borderBottom: "1px solid rgba(56,189,248,0.08)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#22263a")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "0.5rem 0.75rem", textAlign: "center", color: "#e8eaf0" }}>{section.id}</td>
                    <td style={{ padding: "0.5rem 0.75rem", textAlign: "center", color: "#e8eaf0" }}>{section.sectionname}</td>
                    <td style={{ padding: "0.5rem 0.75rem", textAlign: "center", color: "#e8eaf0" }}>{section.roadid}</td>
                    <td style={{ padding: "0.5rem 0.75rem", textAlign: "center", color: "#e8eaf0" }}>
                      {section.linkid ? section.linkid.replace(/^\[|\]$/g, "") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ):(
           <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <input
                    type="text"
                    placeholder="구역명 입력"
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    style={{
                      border: "1px solid rgba(56,189,248,0.15)",
                      padding: "0.5rem",
                      borderRadius: "8px",
                      fontSize: "13px",
                      background: "#22263a",
                      color: "#e8eaf0",
                      outline: "none",
                    }}
                />
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                    onClick={handleSave}
                    style={{
                      flex: 1,
                      padding: "0.5rem 0.75rem",
                      background: "#38bdf8",
                      color: "#0a0e1a",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                    >저장</button>
                    <button
                    onClick={() => { setShowModal(false); setSectionName(""); }}
                    style={{
                      flex: 1,
                      padding: "0.5rem 0.75rem",
                      background: "transparent",
                      color: "#8b90a7",
                      border: "1px solid rgba(56,189,248,0.15)",
                      borderRadius: "8px",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                    >취소</button>
                </div>
                </div>
        )}
        
      </div>
    );
  }