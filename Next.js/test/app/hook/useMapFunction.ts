"use client"

import { useState, useRef } from "react";
import { useMapData } from "./useMapData";

export function useMapFunction() {
    const { roadData, setRoadData, sectionData, linkData, setBusanLinkData, kakaoMapRef,
        handleRoad, handleSection, handleLink, highlightPolylineRef, setLinkData, busanLinkData,
      } = useMapData();

    const [isLinkSelectMode, setisLinkSelectMode] = useState(false);

    const [selectedRoadId, setSelectedRoadId] = useState<number | null>(null);
    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);

    const [selectedLinks, setSelectedLinks] = useState<{linkid: string, seq: number}[]>([]);

    const isLinkSelectModeRef = useRef(isLinkSelectMode);
    const polylineMapRef = useRef<Map<string, any[]>>(new Map());

    const existingLinkIdsRef = useRef<string[]>([]);

    const handleLinkSelect = (linkid: string) => {
        setSelectedLinks(prev => {
        const exists = prev.find(l => l.linkid === linkid);

        const polylines = polylineMapRef.current.get(linkid) ?? [];
        
        polylines.forEach((p: any) => {
            if (exists) {
            p.setOptions({ strokeWeight: 4, strokeOpacity: 0.7, strokeColor: "#aaaaaa"})
            } else {
            p.setOptions({ strokeWeight: 6, strokeOpacity: 1, strokeColor: "#002fffff"});
            }
        });

        if (exists) {
            return prev.filter(l => l.linkid !== linkid).map((l, i) => ({ ...l, seq: i + 1 }));
        }
        return [...prev, { linkid, seq: prev.length + 1 }];
        });
    };

    const clearAllHighlights = () => {
        if(highlightPolylineRef.current) {
        highlightPolylineRef.current.setMap(null);
        highlightPolylineRef.current = null;
        }

        polylineMapRef.current.forEach((polylines) => {
        polylines.forEach((p: any) => {
            p.setOptions({ strokeWeight: 4, strokeOpacity: 0.7, strokeColor: "#aaaaaa" });
        });
        });
        setSelectedLinks([]);
        isLinkSelectModeRef.current = false;
        setisLinkSelectMode(false);
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

    const resetPolylines = () => {
        if(highlightPolylineRef.current) {
            highlightPolylineRef.current.setMap(null);
            highlightPolylineRef.current = null;
        }
        
        polylineMapRef.current.forEach((polylines) => {
            polylines.forEach((p: any) => {
                p.setOptions({ strokeWeight: 4, strokeOpacity: 0.7, strokeColor: "#aaaaaa" });
            });
        });
    };

    const handleLinkSelectRef = useRef(handleLinkSelect);

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
            linkid: link.linkid,
            seq: link.seq
        }));
        
        existingLinkIdsRef.current = existingLinks.map(l => l.linkid);
        setSelectedLinks(existingLinks);
    
        existingLinks.forEach(({ linkid }) => {
            const polylines = polylineMapRef.current.get(linkid) ?? [];
            polylines.forEach((p: any) => {
                p.setOptions({strokeWeight: 6, strokeOpacity: 1, strokeColor: "#002fffff"})
            });
        });
        
        if(existingLinks.length > 0) {
            const lastLinkId = existingLinks[existingLinks.length -1].linkid;
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
        isLinkSelectModeRef.current = true;
        setisLinkSelectMode(true);
      };

    return { selectedLinks, setSelectedLinks, handleLinkSelect, polylineMapRef, clearAllHighlights,
        roadData, setRoadData, sectionData, linkData, setBusanLinkData, kakaoMapRef, handleRoad,
        handleSection, handleLink, highlightPolylineRef, setLinkData, busanLinkData, isLinkSelectModeRef,
        isLinkSelectMode, setisLinkSelectMode, showTrafficOnly, selectedRoadId, setSelectedRoadId,
        selectedSectionId, setSelectedSectionId, resetPolylines, handleLinkSelectRef, handleRoadWithSelect,
        handleSectionWithSelect, enterLinkSelectMode, existingLinkIdsRef
    };
}