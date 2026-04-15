"use client";

import { useEffect, useRef, useState } from "react";
import RoadTable from "@/component/roadTable";
import SectionTable from "@/component/SectionTable";
import LinkTable from "@/component/LinkTable";
import { useMapFunction } from "../hook/useMapFunction";

export default function KakaoMap() {

  const { selectedLinks, setSelectedLinks, handleLinkSelect, polylineMapRef, clearAllHighlights,
        roadData, setRoadData, sectionData, linkData, setBusanLinkData, kakaoMapRef, existingLinkIdsRef,
        handleSection, handleLink, enterLinkSelectMode, setLinkData, handleRoadWithSelect, isLinkSelectModeRef,
        isLinkSelectMode, setisLinkSelectMode, showTrafficOnly, selectedRoadId, setSelectedRoadId,
        selectedSectionId, handleSectionWithSelect, resetPolylines, handleLinkSelectRef,  
   } = useMapFunction();

  useEffect(() => {
    handleLinkSelectRef.current = handleLinkSelect;
  }, [handleLinkSelect]);

  useEffect(() => {
    isLinkSelectModeRef.current = isLinkSelectMode;
  }, [isLinkSelectMode]);

  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      if (!window.kakao) return;

      const road = await fetch("/api/GIS/Busan/Road/getRoadList");
      const roadJson = await road.json();
      setRoadData(Array.isArray(roadJson) ? roadJson : []);

      const res = await fetch("/api/GIS/Busan/Bus");
      const data = await res.json();

      const link = await fetch("/api/GIS/Busan/Link/AllLink");
      const linkData = await link.json();
      setBusanLinkData(linkData);

      const traffic = await fetch("/api/GIS/Busan/Traffic");
      const trafficRaw = await traffic.json();
      const trafficData: any[] = Array.isArray(trafficRaw) ? trafficRaw : [];

      const trafficMap = new Map<string, number>();
      trafficData.forEach((item: any) => trafficMap.set(item.lkId, item.spd));

      const incidentRes = await fetch("/api/GIS/Busan/Incident");
      const incidentRaw = await incidentRes.json();
      const incidentData: any[] = Array.isArray(incidentRaw) ? incidentRaw : [];
      
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

        const incidentInfowindow = new window.kakao.maps.InfoWindow({ zIndex: 2 });
        let currentIncidentMarker: any = null;

        const getIncidentColor = (type: string) => {
          switch (type) {
            case "01": return "#ff4444"; // 사고
            case "02": return "#ff8800"; // 공사
            case "03": return "#ffcc00"; // 행사
            default:   return "#888888";
          }
        };

        incidentData
          .filter((inc: any) => inc.lat && inc.lot) // lot = 경도(lng), lat = 위도
          .forEach((inc: any) => {
            const markerImage = new window.kakao.maps.MarkerImage(
              "/download.png",
              new window.kakao.maps.Size(28, 28)
            );

            const marker = new window.kakao.maps.Marker({
              position: new window.kakao.maps.LatLng(inc.lat, inc.lot),
              title: inc.incSpotNm,
              image: markerImage,
            });
            marker.setMap(map);

            window.kakao.maps.event.addListener(marker, "click", () => {
              if (currentIncidentMarker === marker && incidentInfowindow.getMap()) {
                incidentInfowindow.close();
                currentIncidentMarker = null;
              } else {
                incidentInfowindow.setContent(`
                  <div style="padding:10px; font-size:13px; color:#000; min-width:200px">
                    <b>📍 ${inc.incSpotNm}</b><br/>
                    <span>발생일시: ${inc.ocrnDt}</span><br/>
                    <span>제공기관: ${inc.instNm}</span><br/>
                    <span>유형: ${inc.incTypeCd}</span><br/>
                    <span>상태: ${inc.prgrsSttsCd === 0 ? "진행중" : "종료"}</span><br/>
                    <span>내용: ${inc.rcptCn ?? "-"}</span>
                  </div>
                `);
                incidentInfowindow.open(map, marker);
                currentIncidentMarker = marker;
              }
            });
          });


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
    <div style={{ position: "relative", width: "100%", flex: 1, minHeight: 0 }}>
      <div ref={mapRef} style={{ width: "100%", height: "100vh" }} />
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
        resetPolylines={resetPolylines}
        enterLinkSelectMode={enterLinkSelectMode}
      />
    </div>
  );
}