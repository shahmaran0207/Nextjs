"use client"

import axios from "axios";
import { useState } from "react";

export default function RoadTable({ showTrafficOnly, clearAllHighlights, roadData, handleRoad }:
     { showTrafficOnly: () => void, clearAllHighlights: () => void, roadData: any[], handleRoad: (id: number) => void }) {
    const [showModal, setShowModal] = useState(false);
    const [roadName, setRoadName] = useState("");

    const handleSave = async() => {
        await axios.post("/api/addRoad", {roadName});
        setShowModal(false);
        setRoadName("");
        window.location.reload();
    };

  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
        <button
            onClick={showTrafficOnly}
            className="mb-2 px-3 py-1 bg-green-500 text-white rounded text-sm w-full"
        >
            소통정보 보기
        </button>
        {!showModal ? (
            <>
                <button
                    onClick={() => setShowModal(true)}
                     className="mb-2 px-3 py-1 bg-blue-500 text-white rounded text-sm w-full"
                >
                    도로 추가
                </button>
                 <table className="text-sm">
                    <thead>
                    <tr className="border-b">
                        <th className="px-3 py-1 text-center" style={{ color: "#000" }}>도로 ID</th>
                        <th className="px-3 py-1 text-center" style={{ color: "#000" }}>도로명</th>
                        <th className="px-3 py-1 text-center" style={{ color: "#000" }}>구역 ID</th>
                    </tr>
                    </thead>
                    <tbody>
                    {roadData.map((road: any) => (
                        <tr key={`${road.ID}`} onClick={() => {
                            handleRoad(road.ID);
                            clearAllHighlights();
                        }} style={{ cursor: "pointer" }}>
                            <td className="px-3 py-1 text-center" style={{ color: "#000" }}>{road.ID}</td>
                            <td className="px-3 py-1 text-center" style={{ color: "#000" }}>{road.ROADNAME}</td>
                            <td className="px-3 py-1 text-center" style={{ color: "#000" }}>
                                {road.SECTIONID ? JSON.parse(road.SECTIONID).join(",") : ""}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </>
             ) : (
                <div className="flex flex-col gap-2">
                <input
                    type="text"
                    placeholder="도로명 입력"
                    value={roadName}
                    onChange={(e) => setRoadName(e.target.value)}
                    className="border px-2 py-1 rounded text-sm"
                    style={{ color: "#000" }}
                />
                <div className="flex gap-2">
                    <button
                    onClick={handleSave}
                    className="flex-1 px-3 py-1 bg-blue-500 text-white rounded text-sm"
                    >저장</button>
                    <button
                    onClick={() => { setShowModal(false); setRoadName(""); }}
                    className="flex-1 px-3 py-1 bg-gray-300 text-black rounded text-sm"
                    >취소</button>
                </div>
                </div>
            )}
            </div>
  );
}