"use client"

import axios from "axios";

export default function LinkTable({ existingLinkIds, enterLinkSelectMode, linkData, handleLink, selectedSectionId, isLinkSelectMode,
   setIsLinkSelectMode, selectedLinks, setSelectedLinks, handleLinkSelect, clearAllHighlights, resetPolylines  } :
   { existingLinkIds: string[], enterLinkSelectMode: () => void, linkData: any[], handleLink: (id: string) => void, clearAllHighlights: () => void, resetPolylines: () => void,
     selectedSectionId: number | null,
     isLinkSelectMode: boolean,
     setIsLinkSelectMode: (value: boolean) => void,
     selectedLinks: {linkid: string, seq: number}[],
     setSelectedLinks: (value: any) => void,
     handleLinkSelect: (linkid: string) => void
    }) {
  
    const handleSave = async () => {
      const newLinks =selectedLinks.filter(l => !existingLinkIds.includes(l.linkid));
      await axios.post("/api/GIS/Busan/Link/addLink", { links: newLinks, sectionId: selectedSectionId });
      setIsLinkSelectMode(false);
      setSelectedLinks([])
      window.location.reload();
    };
  
    return (
      <div style={{
        position: "absolute",
        bottom: "10rem",
        right: "1rem",
        background: "#1a1d27",
        borderRadius: "12px",
        border: "1px solid rgba(56,189,248,0.15)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        padding: "0.75rem",
        zIndex: 10,
        minWidth: "250px",
      }}>
        {!isLinkSelectMode ? (
          <>
            {selectedSectionId && (
              <button
                onClick={() => {
                  resetPolylines();
                  enterLinkSelectMode();
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
                링크 추가
              </button>
            )}
            <table style={{ fontSize: "13px", width: "100%", borderCollapse: "collapse" }}>
              <thead>
              <tr style={{ borderBottom: "1px solid rgba(56,189,248,0.15)" }}>
                <th style={{ padding: "0.5rem 0.75rem", textAlign: "center", color: "#8b90a7", fontWeight: 500 }}>구역 ID</th>
                <th style={{ padding: "0.5rem 0.75rem", textAlign: "center", color: "#8b90a7", fontWeight: 500 }}>링크 ID</th>
              </tr>
            </thead>
              <tbody>
                {linkData.map((link: any) => (
                  <tr key={`${link.sectionid}-${link.linkid}`}
                    style={{ borderBottom: "1px solid rgba(56,189,248,0.08)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#22263a")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "0.5rem 0.75rem", textAlign: "center", color: "#e8eaf0" }}>{link.sectionid}</td>
                    <td style={{ padding: "0.5rem 0.75rem", textAlign: "center", color: "#38bdf8", cursor: "pointer" }}
                      onClick={() => handleLink(link.linkid)}>{link.linkid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <>
        <p style={{ fontSize: "13px", marginBottom: "0.5rem", color: "#8b90a7" }}>지도에서 링크를 클릭하세요</p>
        <table style={{ fontSize: "13px", marginBottom: "0.5rem", width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(56,189,248,0.15)" }}>
              <th style={{ padding: "0.5rem 0.75rem", textAlign: "center", color: "#8b90a7", fontWeight: 500 }}>순서</th>
              <th style={{ padding: "0.5rem 0.75rem", textAlign: "center", color: "#8b90a7", fontWeight: 500 }}>링크 ID</th>
            </tr>
          </thead>
          <tbody>
            {selectedLinks.map((link, index) => (
              <tr key={`${index}-${link.linkid}`}
                style={{ borderBottom: "1px solid rgba(56,189,248,0.08)" }}
              >
                <td style={{ padding: "0.5rem 0.75rem", textAlign: "center", color: "#e8eaf0" }}>{link.seq}</td>
                <td style={{ padding: "0.5rem 0.75rem", textAlign: "center", color: "#e8eaf0" }}>{link.linkid}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
            onClick={clearAllHighlights}
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
      </>
    )}
  </div>
);
}