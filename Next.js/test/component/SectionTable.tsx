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
      await axios.post("/api/addSection", {sectionName, roadId: selectedRoadId });
      setShowModal(false);
      setSectionName("");
      window.location.reload();
    };

    return (
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10">
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
              className="mb-2 px-3 py-1 bg-blue-500 text-white rounded text-sm w-full"
            >
              구역 추가
            </button>
          )}
            
            <table className="text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-1 text-center" style={{ color: "#000" }}>구역 ID</th>
                  <th className="px-3 py-1 text-center" style={{ color: "#000" }}>구역 명</th>
                  <th className="px-3 py-1 text-center" style={{ color: "#000" }}>도로 ID</th>
                  <th className="px-3 py-1 text-center" style={{ color: "#000" }}>링크 ID</th>
                </tr>
              </thead>
              <tbody>
                {sectionData.map((section: any) => (
                  <tr key={`${section.ID}`} onClick={() => {
                    handleSectionWithSelect(section.ID);
                    clearAllHighlights();
                    setIsLinkSelectMode(false);
                    setSelectedLinks([]);
                  }} style={{ cursor: "pointer" }}>
                    <td className="px-3 py-1 text-center" style={{ color: "#000" }}>{section.ID}</td>
                    <td className="px-3 py-1 text-center" style={{ color: "#000" }}>{section.SECTIONNAME}</td>
                    <td className="px-3 py-1 text-center" style={{ color: "#000" }}>{section.ROADID}</td>
                    <td className="px-3 py-1 text-center" style={{ color: "#000" }}>
                      {section.LINKID ? section.LINKID.replace(/^\[|\]$/g, "") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ):(
           <div className="flex flex-col gap-2">
                <input
                    type="text"
                    placeholder="구역명 입력"
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    className="border px-2 py-1 rounded text-sm"
                    style={{ color: "#000" }}
                />
                <div className="flex gap-2">
                    <button
                    onClick={handleSave}
                    className="flex-1 px-3 py-1 bg-blue-500 text-white rounded text-sm"
                    >저장</button>
                    <button
                    onClick={() => { setShowModal(false); setSectionName(""); }}
                    className="flex-1 px-3 py-1 bg-gray-300 text-black rounded text-sm"
                    >취소</button>
                </div>
                </div>
        )}
        
      </div>
    );
  }