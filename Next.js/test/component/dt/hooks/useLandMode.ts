"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { LandParcel } from "@/component/dt/layers/createLandParcelLayer";

export type LandSubMode = "view" | "draw";  // view: 구경/구매, draw: 폴리곤 그리기

interface SelectedParcelPopup {
  parcel: LandParcel;
  screenX: number;
  screenY: number;
}

// ── useLandMode Hook ──────────────────────────────────────────────
// 랜드 모드에 필요한 모든 상태와 로직을 캡슐화합니다.
export function useLandMode(myWallet: string | null) {
  // ── 랜드 모드 전체 ON/OFF ─────────────────────────────────────
  const [isLandMode, setIsLandMode] = useState(false);

  // ── 서브 모드: 구경(view) vs 그리기(draw) ──────────────────────
  const [landSubMode, setLandSubMode] = useState<LandSubMode>("view");

  // ── DB에서 불러온 전체 구역 목록 ─────────────────────────────
  const [parcels, setParcels] = useState<LandParcel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ── 호버 / 선택 상태 ─────────────────────────────────────────
  const [hoveredParcelId, setHoveredParcelId] = useState<number | null>(null);
  const [selectedPopup, setSelectedPopup] = useState<SelectedParcelPopup | null>(null);

  // ── 드로잉 상태 (그리기 서브모드에서 사용) ─────────────────────
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const [drawForm, setDrawForm] = useState({ name: "", description: "", price_eth: "0.1" });

  // ── 구역 등록 / 구매 처리 상태 ──────────────────────────────
  const [isSaving, setIsSaving] = useState(false);

  // 랜드 모드가 꺼지면 모든 하위 상태 초기화
  useEffect(() => {
    if (!isLandMode) {
      setLandSubMode("view");
      setDrawingPoints([]);
      setSelectedPopup(null);
      setHoveredParcelId(null);
    }
  }, [isLandMode]);

  // 랜드 모드가 켜질 때 구역 데이터 로드
  useEffect(() => {
    if (isLandMode) {
      fetchParcels();
    }
  }, [isLandMode]);

  // ── API: 구역 목록 조회 ──────────────────────────────────────
  const fetchParcels = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/land-parcels");
      if (res.ok) {
        const data = await res.json();
        setParcels(data.parcels ?? []);
      }
    } catch (err) {
      console.error("[useLandMode] fetchParcels 실패:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── 지도 클릭 핸들러 (모드별 분기) ──────────────────────────
  // TwinMap의 onClick에서 landMode가 켜져 있을 때 이 함수를 먼저 호출해야 합니다.
  // 반환값이 true이면 기존 지도 클릭 이벤트를 막습니다(consumed).
  const handleLandModeMapClick = useCallback(
    (info: any): boolean => {
      if (!isLandMode) return false;

      if (landSubMode === "draw") {
        // 드로잉 모드: 클릭 위치를 꼭짓점으로 추가
        if (info.coordinate) {
          const [lng, lat] = info.coordinate;
          setDrawingPoints((prev) => [...prev, [lng, lat]]);
        }
        return true; // 클릭 이벤트 소비
      }

      // view 모드에서 지도 빈 곳 클릭 → 팝업 닫기
      if (!info.object) {
        setSelectedPopup(null);
        return false;
      }

      return false;
    },
    [isLandMode, landSubMode]
  );

  // ── 구역 클릭 → 팝업 열기 ────────────────────────────────────
  const handleParcelClick = useCallback(
    (parcel: LandParcel, screenX: number, screenY: number) => {
      if (landSubMode === "draw") return; // 드로잉 중에는 팝업 무시
      setSelectedPopup({ parcel, screenX, screenY });
    },
    [landSubMode]
  );

  // ── 그리기: 마지막 꼭짓점 취소 ──────────────────────────────
  const undoLastPoint = useCallback(() => {
    setDrawingPoints((prev) => prev.slice(0, -1));
  }, []);

  // ── 그리기: 전체 초기화 ──────────────────────────────────────
  const clearDrawing = useCallback(() => {
    setDrawingPoints([]);
    setDrawForm({ name: "", description: "", price_eth: "0.1" });
  }, []);

  // ── 그리기: 폴리곤 저장 (API 호출) ───────────────────────────
  const saveDrawing = useCallback(async () => {
    if (drawingPoints.length < 3) {
      alert("최소 3개 이상의 꼭짓점을 찍어야 구역을 만들 수 있습니다.");
      return;
    }
    if (!drawForm.name.trim()) {
      alert("구역 이름을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/land-parcels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: drawForm.name,
          description: drawForm.description || null,
          coordinates: drawingPoints,
          price_eth: drawForm.price_eth || "0.1",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "구역 등록 실패");
      }

      alert(`✅ [${drawForm.name}] 구역이 등록되었습니다!`);
      clearDrawing();
      setLandSubMode("view");
      await fetchParcels(); // 목록 새로고침
    } catch (err: any) {
      alert(`❌ 오류: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [drawingPoints, drawForm, clearDrawing, fetchParcels]);

  // ── 구매: ETH 결제 후 소유권 이전 ────────────────────────────
  const purchaseParcel = useCallback(
    async (parcelId: number, ownerWallet: string, txHash?: string) => {
      try {
        const res = await fetch(`/api/land-parcels/${parcelId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ owner_wallet: ownerWallet, tx_hash: txHash }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "구매 처리 실패");
        }

        setSelectedPopup(null);
        await fetchParcels(); // 지도 즉시 갱신
        return true;
      } catch (err: any) {
        alert(`❌ 구매 실패: ${err.message}`);
        return false;
      }
    },
    [fetchParcels]
  );

  return {
    // 모드 상태
    isLandMode,
    setIsLandMode,
    landSubMode,
    setLandSubMode,

    // 구역 데이터
    parcels,
    isLoading,
    fetchParcels,

    // 호버 / 팝업
    hoveredParcelId,
    setHoveredParcelId,
    selectedPopup,
    setSelectedPopup,

    // 드로잉
    drawingPoints,
    drawForm,
    setDrawForm,
    handleLandModeMapClick,
    handleParcelClick,
    undoLastPoint,
    clearDrawing,
    saveDrawing,
    isSaving,

    // 구매
    purchaseParcel,
  };
}
