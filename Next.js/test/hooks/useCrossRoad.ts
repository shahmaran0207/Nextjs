'use client'

import { useState, useRef, useCallback } from "react";

export interface CrossRoadItem {
    itstId: string;
    itstNm: string;
    mapCtptIntLat: number;
    mapCtptIntLot: number;
};

function getDistanceMeters(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const R = 6371000;
    const dLat = ((lat2-lat1) * Math.PI) / 180;
    const dLng = ((lng2-lng1) * Math.PI) / 180;
    const a = 
        Math.sin(dLat / 2) ** 2+
        Math.cos((lat1 * Math.PI)/180) *
        Math.cos((lat2 * Math.PI)/180) *
        Math.sin(dLng/2) **2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const MOVE_THRESHOLD_METERS = 500;
const FETCH_RADIUS_METERS=10000;

export function useCrossRoad() {
    const [ crossRoads, setCrossRoads ] = useState<CrossRoadItem[]>([]);
    const [ loading, setLoading ] = useState(false);

    const lastFetchCenter = useRef<{lat: number; lng: number } | null>(null);

    const fetchIfMoved = useCallback(async (lat: number, lng: number) => {
        const prev = lastFetchCenter.current;

        if (prev) {
            const dist = getDistanceMeters(prev.lat, prev.lng, lat, lng);
            if(dist < MOVE_THRESHOLD_METERS) return;
        };

        lastFetchCenter.current = { lat, lng };
        setLoading(true);

        try {
            const res = await fetch(
                `/api/GIS/Seoul/CrossRoad/CrossRoads?lat=${lat}&lng=${lng}&radius=${FETCH_RADIUS_METERS}`
            );

            const data = await res.json();

            const filtered = (data.items ?? [])
                .map((item: any) => ({
                    ...item,
                    mapCtptIntLat: parseFloat(item.mapCtptIntLat),
                    mapCtptIntLot: parseFloat(item.mapCtptIntLot),
                }))
                .filter((item: CrossRoadItem) =>
                    getDistanceMeters(lat, lng, item.mapCtptIntLat, item.mapCtptIntLot) <= FETCH_RADIUS_METERS
                );
            console.log('filtered result:', filtered.length);
            setCrossRoads(filtered);
        } finally {
            setLoading(false);
        }
    }, []);

    return { crossRoads, loading, fetchIfMoved};
}