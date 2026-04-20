"use client"

import { useState, useRef, useCallback } from "react";
import axios from "axios";

export interface TwinViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
  transitionDuration?: number;
}

export function useTwinMapFunction() {
  // ─── 지도 ViewState ───────────────────────────────────────────
  const [viewState, setViewState] = useState<TwinViewState>({
    longitude: 129.1317,
    latitude: 35.1695,
    zoom: 13,
    pitch: 60,
    bearing: -15,
  });

  // ─── 도로/구역/링크 데이터 ────────────────────────────────────
  const [roadData, setRoadData] = useState<any[]>([]);
  const [sectionData, setSectionData] = useState<any[]>([]);
  const [linkData, setLinkData] = useState<any[]>([]);

  // ─── 선택 상태 ────────────────────────────────────────────────
  const [selectedRoadId, setSelectedRoadId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedLinks, setSelectedLinks] = useState<{ linkid: string; seq: number }[]>([]);
  const existingLinkIdsRef = useRef<string[]>([]);

  // ─── 링크 선택 모드 ───────────────────────────────────────────
  const [isLinkSelectMode, setIsLinkSelectMode] = useState(false);
  const isLinkSelectModeRef = useRef(false);

  // ─── 하이라이트 링크 ID Set (DeckGL PathLayer 색상 분기용) ────
  const [highlightedLinkIds, setHighlightedLinkIds] = useState<Set<string>>(new Set());
  const [sectionLinkIds, setSectionLinkIds] = useState<Set<string>>(new Set()); // 구역에 속한 링크
  const [activeLinkId, setActiveLinkId] = useState<string | null>(null);

  // ─── 도로 클릭 ───────────────────────────────────────────────
  const handleRoad = useCallback(async (roadId: number) => {
    try {
      setSelectedRoadId(roadId);
      setSelectedSectionId(null);
      setLinkData([]);
      setIsLinkSelectMode(false);
      isLinkSelectModeRef.current = false;
      setSelectedLinks([]);
      setHighlightedLinkIds(new Set());
      setSectionLinkIds(new Set());
      setActiveLinkId(null);

      const res = await axios.get(`/api/GIS/Busan/Section/getSectionList/${roadId}`);
      setSectionData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("handleRoad error:", err);
    }
  }, []);

  // ─── 구역 클릭 ───────────────────────────────────────────────
  const handleSection = useCallback(async (sectionId: number) => {
    try {
      setSelectedSectionId(sectionId);
      setIsLinkSelectMode(false);
      isLinkSelectModeRef.current = false;
      setSelectedLinks([]);
      setHighlightedLinkIds(new Set());
      setActiveLinkId(null);

      const res = await axios.get(`/api/GIS/Busan/Link/getLinkList/${sectionId}`);
      const links = Array.isArray(res.data) ? res.data : [];
      setLinkData(links);

      // 구역에 속한 링크 ID 하이라이트
      const ids = new Set<string>(links.map((l: any) => l.linkid));
      setSectionLinkIds(ids);
      setHighlightedLinkIds(ids);
    } catch (err) {
      console.error("handleSection error:", err);
    }
  }, []);

  // ─── 링크 클릭 (테이블) → 지도 이동 ──────────────────────────
  const handleLink = useCallback((linkId: string, busanLinkData: any) => {
    setActiveLinkId(linkId);
    const matched = busanLinkData?.features?.filter(
      (f: any) => f.properties?.link_id === linkId
    );
    if (!matched || matched.length === 0) return;

    const coords = matched[0].geometry.coordinates[0];
    const [lng, lat] = coords[0];
    setViewState(prev => ({
      ...prev,
      longitude: lng,
      latitude: lat,
      zoom: 15,
      transitionDuration: 600,
    }));
  }, []);

  // ─── 링크 선택 모드 진입 ──────────────────────────────────────
  const enterLinkSelectMode = useCallback((busanLinkData: any) => {
    const existingLinks = linkData.map((l: any) => ({ linkid: l.linkid, seq: l.seq }));
    existingLinkIdsRef.current = existingLinks.map(l => l.linkid);
    setSelectedLinks(existingLinks);

    const ids = new Set<string>(existingLinks.map(l => l.linkid));
    setHighlightedLinkIds(ids);
    isLinkSelectModeRef.current = true;
    setIsLinkSelectMode(true);
    setActiveLinkId(null);

    // 마지막 링크 위치로 이동
    if (existingLinks.length > 0) {
      const lastId = existingLinks[existingLinks.length - 1].linkid;
      const matched = busanLinkData?.features?.find(
        (f: any) => f.properties?.link_id === lastId
      );
      if (matched) {
        const [lng, lat] = matched.geometry.coordinates[0][0];
        setViewState(prev => ({
          ...prev,
          longitude: lng,
          latitude: lat,
          zoom: 14,
          transitionDuration: 600,
        }));
      }
    }
  }, [linkData]);

  // ─── 지도 링크 클릭 (선택 모드) ──────────────────────────────
  const handleLinkSelect = useCallback((linkId: string) => {
    if (!isLinkSelectModeRef.current) return;

    setSelectedLinks(prev => {
      const exists = prev.find(l => l.linkid === linkId);
      const next = exists
        ? prev.filter(l => l.linkid !== linkId).map((l, i) => ({ ...l, seq: i + 1 }))
        : [...prev, { linkid: linkId, seq: prev.length + 1 }];

      const ids = new Set<string>(next.map(l => l.linkid));
      setHighlightedLinkIds(ids);
      return next;
    });
  }, []);

  // ─── 모든 하이라이트 초기화 ───────────────────────────────────
  const clearAllHighlights = useCallback(() => {
    setHighlightedLinkIds(new Set());
    setSectionLinkIds(new Set());
    setSelectedLinks([]);
    setIsLinkSelectMode(false);
    isLinkSelectModeRef.current = false;
    setActiveLinkId(null);
  }, []);

  // ─── 소통정보만 보기 ──────────────────────────────────────────
  const showTrafficOnly = useCallback(() => {
    clearAllHighlights();
    setSelectedRoadId(null);
    setSelectedSectionId(null);
    setSectionData([]);
    setLinkData([]);
  }, [clearAllHighlights]);

  // ─── 링크 저장 ───────────────────────────────────────────────
  const saveLinks = useCallback(async () => {
    const newLinks = selectedLinks.filter(l => !existingLinkIdsRef.current.includes(l.linkid));
    await axios.post("/api/GIS/Busan/Link/addLink", {
      links: newLinks,
      sectionId: selectedSectionId,
    });
    setIsLinkSelectMode(false);
    isLinkSelectModeRef.current = false;
    setSelectedLinks([]);
    window.location.reload();
  }, [selectedLinks, selectedSectionId]);

  return {
    viewState, setViewState,
    roadData, setRoadData,
    sectionData, setSectionData,
    linkData, setLinkData,
    selectedRoadId, setSelectedRoadId,
    selectedSectionId, setSelectedSectionId,
    selectedLinks, setSelectedLinks,
    isLinkSelectMode, setIsLinkSelectMode,
    isLinkSelectModeRef,
    highlightedLinkIds,
    sectionLinkIds,
    existingLinkIdsRef,
    handleRoad, handleSection, handleLink,
    handleLinkSelect,
    enterLinkSelectMode,
    clearAllHighlights,
    showTrafficOnly,
    saveLinks,
    activeLinkId, setActiveLinkId,
  };
}
