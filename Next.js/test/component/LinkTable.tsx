"use client"

import { useState } from "react";
import axios from "axios";

export default function LinkTable({ existingLinkIds, enterLinkSelectMode, linkData, handleLink, selectedSectionId, isLinkSelectMode,
   setIsLinkSelectMode, selectedLinks, setSelectedLinks, handleLinkSelect, clearAllHighlights  } :
   { existingLinkIds: string[], enterLinkSelectMode: () => void, linkData: any[], handleLink: (id: string) => void, clearAllHighlights: () => void,
     selectedSectionId: number | null,
     isLinkSelectMode: boolean,
     setIsLinkSelectMode: (value: boolean) => void,
     selectedLinks: {linkId: string, seq: number}[],
     setSelectedLinks: (value: any) => void,
     handleLinkSelect: (linkId: string) => void
    }) {
  
    const handleSave = async () => {
      const newLinks =selectedLinks.filter(l => !existingLinkIds.includes(l.linkId));
      await axios.post("/api/addLink", { links: newLinks, sectionId: selectedSectionId });
      setIsLinkSelectMode(false);
      setSelectedLinks([])
      window.location.reload();
    };
  
    return (
      <div className="absolute bottom-40 right-4 bg-white rounded-lg shadow-lg p-3 z-10">
        {!isLinkSelectMode ? (
          <>
            {selectedSectionId && (
              <button
                onClick={() => {
                  clearAllHighlights();
                  setIsLinkSelectMode(true);
                  enterLinkSelectMode();
                }}
                className="mb-2 px-3 py-1 bg-blue-500 text-white rounded text-sm w-full"
              >
                링크 추가
              </button>
            )}
            <table className="text-sm">
              <thead>
              <tr className="border-b">
                <th className="px-3 py-1 text-center" style={{ color: "#000" }}>구역 ID</th>
                <th className="px-3 py-1 text-center" style={{ color: "#000" }}>링크 ID</th>
              </tr>
            </thead>
              <tbody>
                {linkData.map((link: any) => (
                  <tr key={`${link.SECTIONID}-${link.LINKID}`}>
                    <td className="px-3 py-1 text-center" style={{ color: "#000" }}>{link.SECTIONID}</td>
                    <td className="px-3 py-1 text-center" style={{ color: "#000" }}
                      onClick={() => handleLink(link.LINKID)}>{link.LINKID}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <>
        <p className="text-sm mb-2" style={{ color: "#000" }}>지도에서 링크를 클릭하세요</p>
        <table className="text-sm mb-2">
          <thead>
            <tr className="border-b">
              <th className="px-3 py-1 text-center" style={{ color: "#000" }}>순서</th>
              <th className="px-3 py-1 text-center" style={{ color: "#000" }}>링크 ID</th>
            </tr>
          </thead>
          <tbody>
            {selectedLinks.map((link) => (
              <tr key={link.linkId}>
                <td className="px-3 py-1 text-center" style={{ color: "#000" }}>{link.seq}</td>
                <td className="px-3 py-1 text-center" style={{ color: "#000" }}>{link.linkId}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >저장</button>
          <button
            onClick={clearAllHighlights}
            className="flex-1 px-3 py-1 bg-gray-300 text-black rounded text-sm"
          >취소</button>
        </div>
      </>
    )}
  </div>
);
}