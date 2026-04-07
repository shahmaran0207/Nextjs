import { useState, useRef } from "react";
import axios from "axios";

export function useMapData() {
  const [roadData, setRoadData] = useState<any[]>([]);
  const [sectionData, setSectionData] = useState<any[]>([]);
  const [linkData, setLinkData] = useState<any[]>([]);
  const [busanLinkData, setBusanLinkData] = useState<any>(null);

  const kakaoMapRef = useRef<any>(null);
  const highlightPolylineRef = useRef<any>(null);
  const currentLinkIdRef = useRef<string | null>(null);

  const handleRoad = async (roadID: number) => {
    try {
      const getSection = await axios.get(`/api/getSectionList/${roadID}`);
      setSectionData(getSection.data);
    } catch (err: any) {
      console.log("RoadError::::::::::::::", err);
    }
  };

  const handleSection = async (sectionId: number) => {
    try {
      const getLinkList = await axios.get(`/api/getLinkList/${sectionId}`);
      setLinkData(getLinkList.data);
    } catch (err: any) {
      console.log("SectionErr:::::::::::::", err);
    }
  };

  const handleLink = async (linkId: string) => {
    const map = kakaoMapRef.current;
    if (!map) return;

    if (highlightPolylineRef.current) {
        highlightPolylineRef.current.setMap(null);
        highlightPolylineRef.current = null;
    }

    if (currentLinkIdRef.current === linkId) {
        currentLinkIdRef.current = null;
        map.setCenter(new window.kakao.maps.LatLng(35.1695, 129.1317));
        map.setLevel(6);
        return;
    }

    const matched = busanLinkData?.features?.filter(
        (feature: any) => feature.properties?.link_id === linkId
    );
    if (!matched || matched.length === 0) return;

    currentLinkIdRef.current = linkId;

    const feature = matched[0];
    const coords = feature.geometry.coordinates[0];
    const firstPoint = coords[0];

    map.setCenter(new window.kakao.maps.LatLng(firstPoint[1], firstPoint[0]));
    map.setLevel(3);

    const path = coords.map(([lng, lat]: number[]) =>
        new window.kakao.maps.LatLng(lat, lng)
    );

    highlightPolylineRef.current = new window.kakao.maps.Polyline({
        map,
        path,
        strokeWeight: 6,
        strokeColor: "#ff00ffff",
        strokeOpacity: 1,
        strokeStyle: "solid",
    });
    };

  return {
    roadData,
    setRoadData,
    sectionData,
    linkData,
    busanLinkData,
    setBusanLinkData,
    kakaoMapRef,
    handleRoad,
    handleSection,
    handleLink,
    highlightPolylineRef,
    setLinkData,
  };
}