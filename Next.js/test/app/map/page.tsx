"use client";

import { useEffect, useRef, useState } from "react";
import { useMapData } from "../hook/useMapData"; 
import RoadTable from "@/component/roadTable";
import SectionTable from "@/component/SectionTable";
import LinkTable from "@/component/LinkTable";

export default function KakaoMap() {
  const [selectedRoadId, setSelectedRoadId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [isLinkSelectMode, setisLinkSelectMode] = useState(false);
  const [selectedLinks, setSelectedLinks] = useState<{linkId: string, seq: number}[]>([]);

  const existingLinkIdsRef = useRef<string[]>([]);
  const polylineMapRef = useRef<Map<string, any[]>>(new Map());

  const handleLinkSelect = (linkId: string) => {
    setSelectedLinks(prev => {
      const exists = prev.find(l => l.linkId === linkId);

      const polylines =polylineMapRef.current.get(linkId) ?? [];
      polylines.forEach((p: any) => {
        if (exists) {
          p.setOptions({ strokeWeight: 4, strokeOpacity: 0.7, strokeColor: "#aaaaaa"})
        } else {
          p.setOptions({ strokeWeight: 6, strokeOpacity: 1, strokeColor: "#002fffff"});
        }
      });

      if (exists) {
        return prev.filter(l => l.linkId !== linkId).map((l, i) => ({ ...l, seq: i + 1 }));
      }
      return [...prev, { linkId, seq: prev.length + 1 }];
    });
  };

  const showTrafficOnly = async () => {
    clearAllHighlights();
    setSelectedRoadId(null);
    setSelectedSectionId(null);
    setisLinkSelectMode(false);
    setSelectedLinks([]);
    setLinkData([]);

    const traffic = await fetch("/api/GIS/Busan/Traffic");
    const trafficData = await traffic.json();

    const trafficMap = new Map<string, number>();
    trafficData.forEach((item: any) => trafficMap.set(item.lkId, item.spd));

    const getSpeedColor = (spd: number | undefined) => {
      if(spd === undefined || spd === null) return "#dddddd";
      if(spd >= 60 ) return "#00cc44";
      if(spd >= 40 ) return "#88cc00";
      if(spd >= 20 ) return "#ffaa00";
      if(spd >= 10 ) return "#ff5500";
      return "#ff0000"
    };

    polylineMapRef.current.forEach((polylines, lkId) => {
      polylines.forEach((p: any) => {
        p.setOptions({
          strokeColor: getSpeedColor(trafficMap.get(lkId)),
          strokeWeight: 4,
          strokeOpacity: 0.7,
        });
      });
    });
  };

  const clearAllHighlights = () => {

    if(highlightPolylineRef.current) {
      highlightPolylineRef.current.setMap(null);
      highlightPolylineRef.current = null;
    }

    polylineMapRef.current.forEach((polylines, lkId) => {
      polylines.forEach((p: any) => {
        p.setOptions({ strokeWeight: 4, strokeOpacity: 0.7, strokeColor: "#aaaaaa" });
      });
    });
    setSelectedLinks([]);
    setisLinkSelectMode(false);
  };

  const handleLinkSelectRef = useRef(handleLinkSelect);
  useEffect(() => {
    handleLinkSelectRef.current = handleLinkSelect;
  }, [handleLinkSelect]);

  const isLinkSelectModeRef = useRef(isLinkSelectMode);
  useEffect(() => {
    isLinkSelectModeRef.current = isLinkSelectMode;
  }, [isLinkSelectMode]);

  const handleRoadWithSelect = (roadID: number) => {
    setSelectedRoadId(roadID);
    setLinkData([]);
    setSelectedSectionId(null);
    setisLinkSelectMode(false);
    handleRoad(roadID);
  };

  const handleSectionWithSelect = (sectionId: number) => {
    setSelectedSectionId(sectionId);
    handleSection(sectionId);
  };

  const enterLinkSelectMode = () => {
    const existingLinks = linkData.map((link: any) => ({
      linkId: link.LINKID,
      seq: link.SEQ
    }));
    existingLinkIdsRef.current = existingLinks.map(l=>l.linkId);
    setSelectedLinks(existingLinks);

    existingLinks.forEach(({ linkId }) => {
      const polylines = polylineMapRef.current.get(linkId) ?? [];
      polylines.forEach((p: any) => {
        p.setOptions({strokeWeight: 6, strokeOpacity: 1, strokeColor: "#002fffff"})
      });
    });

    if(existingLinks.length > 0) {
      const lastLinkId = existingLinks[existingLinks.length -1].linkId;
      const matched = busanLinkData?.features?.find(
        (feature: any) => feature.properties?.link_id === lastLinkId
      );
      if(matched) {
        const coords = matched.geometry.coordinates[0];
        const firstPoint = coords[0];
        const map = kakaoMapRef.current;
        if(map) {
          map.setCenter(new window.kakao.maps.LatLng(firstPoint[1], firstPoint[0]));
          map.setLevel(3);
        }
      }
    }
    setisLinkSelectMode(true);
  };

  const mapRef = useRef<HTMLDivElement>(null);
  const {
    roadData, setRoadData,
    sectionData,
    linkData,
    setBusanLinkData,
    kakaoMapRef,
    handleRoad,
    handleSection,
    handleLink,
    highlightPolylineRef,
    setLinkData,
    busanLinkData,
  } = useMapData();

  useEffect(() => {
    const init = async () => {
      if (!window.kakao) return;

      const road = await fetch("/api/GIS/Busan/Road/getRoadList");
      setRoadData(await road.json());

      const res = await fetch("/api/GIS/Busan/Bus");
      const data = await res.json();

      const link = await fetch("/api/GIS/Busan/Link/AllLink");
      const linkData = await link.json();
      setBusanLinkData(linkData);

      const traffic = await fetch("/api/GIS/Busan/Traffic");
      const trafficData = await traffic.json();

      const trafficMap = new Map<string, number>();
      trafficData.forEach((item: any) => trafficMap.set(item.lkId, item.spd));

      const getSpeedColor = (spd: number | undefined) => {
        if (spd === undefined || spd === null) return "#dddddd";
        if (spd >= 60) return "#00cc44";
        if (spd >= 40) return "#88cc00";
        if (spd >= 20) return "#ffaa00";
        if (spd >= 10) return "#ff5500";
        return "#ff0000";
      };

      let currentMarker: any = null;

      window.kakao.maps.load(() => {
        const infowindow = new window.kakao.maps.InfoWindow({ zIndex: 1 });
        if (!mapRef.current) return;

        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(35.1695, 129.1317),
          level: 6,
        });
        kakaoMapRef.current = map;

        const clusterer = new window.kakao.maps.MarkerClusterer({
          map,
          averageCetner: true,
          minLevel: 4,
          disableClickZoom: false,
        });

        const markers = data
          .filter((station: any) => station.lat && station.lng)
          .map((station: any) => {
            const marker = new window.kakao.maps.Marker({
              position: new window.kakao.maps.LatLng(station.lat, station.lng),
              title: station.stationLoc,
              image: new window.kakao.maps.MarkerImage("/2916369.png", new window.kakao.maps.Size(32, 32)),
            });

            window.kakao.maps.event.addListener(marker, "click", () => {
              if (currentMarker === marker && infowindow.getMap()) {
                infowindow.close();
                currentMarker = null;
              } else {
                infowindow.setContent(`
                  <div style="padding: 8px; font-size: 13px; color: #000">
                    <b>BIT 설치 번호: ${station.stationNum}</b><br />
                    <b>수집 일시: ${station.dataDay}</b><br />
                    <b>BIT 설치 위치: ${station.stationLoc}</b><br/>
                    <b>BIT 설치 주소: ${station.addr}</b>
                  </div>
                `);
                infowindow.open(map, marker);
                currentMarker = marker;
              }
            });

            window.kakao.maps.event.addListener(map, "click", () => infowindow.close());
            return marker;
          });

        clusterer.addMarkers(markers);

        const polylineMap = new Map<string, any[]>();
        linkData.features.forEach((feature: any) => {
          const lkId = feature.properties?.link_id;

          feature.geometry.coordinates.forEach((line: any) => {
            const polyline = new window.kakao.maps.Polyline({
              map,
              path: line.map(([lng, lat]: number[]) => new window.kakao.maps.LatLng(lat, lng)),
              strokeWeight: 4,
              strokeColor: getSpeedColor(trafficMap.get(lkId)),
              strokeOpacity: 0.7,
              strokeStyle: "solid",
              clickable: true
            });

            if (!polylineMap.has(lkId)) polylineMap.set(lkId, []);
            polylineMap.get(lkId)!.push(polyline);

            window.kakao.maps.event.addListener(polyline, "click", () => {
              if (isLinkSelectModeRef.current) {
                handleLinkSelectRef.current(lkId);
              }
            });
          });
        });

        polylineMapRef.current = polylineMap;
      });
    };
    init();
  }, []);

  return (
    <div className="relative w-full h-screen">
      <div ref={mapRef} className="w-full h-screen" />
      <RoadTable
        roadData={roadData}
        handleRoad={handleRoadWithSelect}
        clearAllHighlights={clearAllHighlights}
        showTrafficOnly={showTrafficOnly}
      />
      <SectionTable
        setLinkData={setLinkData}
        setSelectedLinks={setSelectedLinks}
        setIsLinkSelectMode={setisLinkSelectMode}
        sectionData={sectionData}
        handleSection={handleSection}
        selectedRoadId={selectedRoadId}
        handleSectionWithSelect={handleSectionWithSelect}
        clearAllHighlights={clearAllHighlights}
      />
      <LinkTable
        existingLinkIds={existingLinkIdsRef.current}
        linkData={linkData}
        handleLink={handleLink}
        selectedSectionId={selectedSectionId}
        isLinkSelectMode={isLinkSelectMode}
        setIsLinkSelectMode={setisLinkSelectMode}
        selectedLinks={selectedLinks}
        setSelectedLinks={setSelectedLinks}
        handleLinkSelect={handleLinkSelect}
        clearAllHighlights={clearAllHighlights}
        enterLinkSelectMode={enterLinkSelectMode}
      />
    </div>
  );
}