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

    const geometry = matched[0].geometry;
    // LineString: coordinates = [[lng, lat], [lng, lat], ...]
    const coords = geometry.coordinates;
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
  const enterLinkSelectMode = useCallback(async (busanLinkData: any, setAllLinksData: (data: any) => void) => {
    const existingLinks = linkData.map((l: any) => ({ linkid: l.linkid, seq: l.seq }));
    existingLinkIdsRef.current = existingLinks.map(l => l.linkid);
    setSelectedLinks(existingLinks);

    const ids = new Set<string>(existingLinks.map(l => l.linkid));
    setHighlightedLinkIds(ids);
    isLinkSelectModeRef.current = true;
    setIsLinkSelectMode(true);
    setActiveLinkId(null);

    // 링크 선택 모드에서는 AllLink API로 전체 링크 가져오기
    try {
      const response = await fetch("/api/GIS/Busan/Link/AllLink");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const allLinkData = await response.json();

      // 전체 링크 데이터를 상태로 저장 (TwinMap에서 사용)
      setAllLinksData(allLinkData);
    } catch (err) {
      console.error("❌ AllLink 로드 실패:", err);
    }

    // 마지막 링크 위치로 이동
    if (existingLinks.length > 0) {
      const lastId = existingLinks[existingLinks.length - 1].linkid;
      const matched = busanLinkData?.features?.find(
        (f: any) => f.properties?.link_id === lastId
      );
      if (matched) {
        // LineString: coordinates = [[lng, lat], [lng, lat], ...]
        const [lng, lat] = matched.geometry.coordinates[0];
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

  // ─── 선택 가능한 링크 ID 계산 ──────────────────────────────────
  const getSelectableLinkIds = useCallback((selectedLinks: any[], busanLinkData: any): Set<string> => {
    // 링크가 하나도 선택되지 않았으면 모든 링크 선택 가능
    if (selectedLinks.length === 0) {
      return new Set(busanLinkData?.features?.map((f: any) => f.properties?.link_id) || []);
    }

    // 마지막 선택된 링크의 노드 정보
    const lastLink = selectedLinks[selectedLinks.length - 1];

    const lastFeature = busanLinkData?.features?.find(
      (f: any) => f.properties?.link_id === lastLink.linkid
    );

    if (!lastFeature) {
      console.warn("마지막 링크 feature를 찾을 수 없음:", lastLink.linkid);
      return new Set();
    }

    const lastProps = lastFeature.properties;
    const lastFNode = lastProps.f_node;
    const lastTNode = lastProps.t_node;

    // 연결 가능한 링크 필터링
    const selectableIds = new Set<string>();

    busanLinkData?.features?.forEach((feature: any) => {
      const props = feature.properties;
      const linkId = props.link_id;
      const fNode = props.f_node;
      const tNode = props.t_node;

      // 이미 선택된 링크는 제외
      if (selectedLinks.find(l => l.linkid === linkId)) {
        return;
      }

      // 양방향 링크 제외
      if (lastFNode === tNode && lastTNode === fNode) {
        return;
      }

      // 연결 가능한 링크만 추가
      if (lastTNode === fNode) {
        selectableIds.add(linkId);
      }
    });

    return selectableIds;
  }, []);

  // ─── 지도 링크 클릭 (선택 모드) ──────────────────────────────
  const handleLinkSelect = useCallback((linkId: string, busanLinkData: any) => {
    if (!isLinkSelectModeRef.current) return;

    setSelectedLinks(prev => {
      const exists = prev.find(l => l.linkid === linkId);

      // 이미 선택된 링크를 클릭하면 제거
      if (exists) {
        const next = prev.filter(l => l.linkid !== linkId).map((l, i) => ({ ...l, seq: i + 1 }));
        const ids = new Set<string>(next.map(l => l.linkid));
        setHighlightedLinkIds(ids);
        return next;
      }

      // 새 링크 추가 시 연결 검증
      if (prev.length > 0) {
        // 클릭한 링크의 노드 정보 가져오기
        const clickedFeature = busanLinkData?.features?.find(
          (f: any) => f.properties?.link_id === linkId
        );

        if (!clickedFeature) {
          console.warn("링크 정보를 찾을 수 없습니다:", linkId);
          return prev;
        }

        const clickedProps = clickedFeature.properties;
        const clickedFNode = clickedProps.f_node;
        const clickedTNode = clickedProps.t_node;

        // 마지막 선택된 링크의 노드 정보
        const lastLink = prev[prev.length - 1];
        const lastFeature = busanLinkData?.features?.find(
          (f: any) => f.properties?.link_id === lastLink.linkid
        );

        if (!lastFeature) {
          console.warn("마지막 링크 정보를 찾을 수 없습니다:", lastLink.linkid);
          return prev;
        }

        const lastProps = lastFeature.properties;
        const lastFNode = lastProps.f_node;
        const lastTNode = lastProps.t_node;

        // 검증 1: 양방향 링크 제외 (같은 길의 반대 방향)
        if (lastFNode === clickedTNode && lastTNode === clickedFNode) {
          console.warn("❌ 양방향 링크 - 선택 무시");
          return prev;
        }

        // 검증 2: 연결 가능 여부 확인
        const isConnected = lastTNode === clickedFNode;

        if (!isConnected) {
          console.warn("❌ 연결되지 않은 링크 - 선택 무시");
          return prev;
        }
      }

      // 연결 가능하면 추가
      const next = [...prev, { linkid: linkId, seq: prev.length + 1 }];
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
    getSelectableLinkIds,
  };
}
