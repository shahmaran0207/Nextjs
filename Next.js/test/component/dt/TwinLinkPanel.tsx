"use client";

const panel: React.CSSProperties = {
  background: "rgba(10, 14, 26, 0.92)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(56,189,248,0.2)",
  borderRadius: "12px",
  padding: "14px",
  width: "260px",
  display: "flex",
  flexDirection: "column",
  maxHeight: "calc(50vh - 2rem)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  animation: "dtFadeIn 0.25s ease-out",
};

const btnBase: React.CSSProperties = {
  padding: "7px 12px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  transition: "transform 0.15s, box-shadow 0.15s",
};

interface LinkPanelProps {
  linkData: any[];
  selectedSectionId: number | null;
  isLinkSelectMode: boolean;
  selectedLinks: { linkid: string; seq: number }[];
  existingLinkIds: string[];
  enterLinkSelectMode: () => void;
  handleLink: (id: string) => void;
  clearAllHighlights: () => void;
  saveLinks: () => Promise<void>;
}

export default function TwinLinkPanel({
  linkData,
  selectedSectionId,
  isLinkSelectMode,
  selectedLinks,
  existingLinkIds,
  enterLinkSelectMode,
  handleLink,
  clearAllHighlights,
  saveLinks,
}: LinkPanelProps) {
  const newCount = selectedLinks.filter(l => !existingLinkIds.includes(l.linkid)).length;

  return (
    <div style={panel}>
      <p style={{ color: "#8b90a7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "10px", textTransform: "uppercase", flexShrink: 0 }}>
        링크 관리
      </p>

      {!isLinkSelectMode ? (
        <>
          {selectedSectionId && (
            <button
              style={{ ...btnBase, width: "100%", marginBottom: "8px", background: "rgba(56,189,248,0.15)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.3)", flexShrink: 0 }}
              onClick={enterLinkSelectMode}
              onMouseEnter={e => { (e.currentTarget.style.boxShadow = "0 0 12px rgba(56,189,248,0.3)"); (e.currentTarget.style.transform = "scale(1.02)"); }}
              onMouseLeave={e => { (e.currentTarget.style.boxShadow = "none"); (e.currentTarget.style.transform = "scale(1)"); }}
            >
              + 링크 추가
            </button>
          )}

          {linkData.length === 0 ? (
            <p style={{ color: "#4b5160", fontSize: "12px", textAlign: "center", padding: "8px 0", flexShrink: 0 }}>
              {selectedSectionId ? "링크가 없습니다" : "구역을 선택하세요"}
            </p>
          ) : (
            <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }} className="dt-panel-scroll">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead style={{ position: "sticky", top: 0, background: "rgba(10, 14, 26, 0.95)", zIndex: 1 }}>
                  <tr>
                    <th style={{ color: "#8b90a7", padding: "4px 6px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.07)", fontWeight: 600 }}>구역ID</th>
                    <th style={{ color: "#8b90a7", padding: "4px 6px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.07)", fontWeight: 600 }}>링크ID</th>
                  </tr>
                </thead>
                <tbody>
                  {linkData.map((link: any) => (
                    <tr
                      key={`${link.sectionid}-${link.linkid}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleLink(link.linkid)}
                    >
                      <td style={{ color: "#8b90a7", padding: "5px 6px" }}>{link.sectionid}</td>
                      <td style={{ color: "#38bdf8", padding: "5px 6px", fontFamily: "monospace", fontSize: "11px" }}>{link.linkid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", flexShrink: 0 }}>
            <span style={{ display: "inline-block", width: "8px", height: "8px", background: "#38bdf8", borderRadius: "50%", animation: "pulse 1.2s infinite" }} />
            <p style={{ color: "#38bdf8", fontSize: "12px", fontWeight: 600 }}>지도에서 링크를 클릭하세요</p>
          </div>
          <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }`}</style>

          {newCount > 0 && (
            <p style={{ color: "#4ade80", fontSize: "11px", marginBottom: "8px", flexShrink: 0 }}>새 링크 {newCount}개 추가 예정</p>
          )}

          {selectedLinks.length > 0 && (
            <div style={{ flex: 1, overflowY: "auto", minHeight: 0, marginBottom: "10px" }} className="dt-panel-scroll">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead style={{ position: "sticky", top: 0, background: "rgba(10, 14, 26, 0.95)", zIndex: 1 }}>
                  <tr>
                    <th style={{ color: "#8b90a7", padding: "4px 6px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.07)", fontWeight: 600 }}>순서</th>
                    <th style={{ color: "#8b90a7", padding: "4px 6px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.07)", fontWeight: 600 }}>링크ID</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedLinks.map((link, i) => (
                    <tr key={`${i}-${link.linkid}`}>
                      <td style={{ color: "#8b90a7", padding: "4px 6px" }}>{link.seq}</td>
                      <td style={{
                        color: existingLinkIds.includes(link.linkid) ? "#6b7280" : "#4ade80",
                        padding: "4px 6px",
                        fontFamily: "monospace",
                        fontSize: "11px",
                      }}>{link.linkid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
            <button
              onClick={saveLinks}
              style={{ ...btnBase, flex: 1, background: "rgba(56,189,248,0.2)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.4)" }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 12px rgba(56,189,248,0.3)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
            >저장</button>
            <button
              onClick={clearAllHighlights}
              style={{ ...btnBase, flex: 1, background: "rgba(255,255,255,0.06)", color: "#8b90a7", border: "1px solid rgba(255,255,255,0.1)" }}
            >취소</button>
          </div>
        </>
      )}
    </div>
  );
}
