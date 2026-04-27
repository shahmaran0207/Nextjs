import { useState, useEffect, useRef } from "react";
import { CCTVPoint } from "@/types/cctv";
import { ConstructionPoint } from "@/component/dt/modules/DashboardStatsModule";

interface DeliverySimulationProps {
  trackingNumber?: string;
  shippingAddress?: string;
  cctvData: CCTVPoint[];
  constructionData: ConstructionPoint[];
  setViewState: React.Dispatch<React.SetStateAction<any>>;
  setSelectedCctv: (cctv: CCTVPoint | null) => void;
  setIsCctvPopupOpen: (isOpen: boolean) => void;
}

// Haversine 거리 계산 함수 (km)
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export function useDeliverySimulation({
  trackingNumber,
  shippingAddress,
  cctvData,
  constructionData,
  setViewState,
  setSelectedCctv,
  setIsCctvPopupOpen,
}: DeliverySimulationProps) {
  const [deliveryRoute, setDeliveryRoute] = useState<[number, number][] | null>(null);
  const [deliveryProgress, setDeliveryProgress] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [truckPos, setTruckPos] = useState<{ longitude: number; latitude: number } | null>(null);
  const [nearbyEvent, setNearbyEvent] = useState<{
    type: "cctv" | "construction";
    data: any;
    distance: number;
  } | null>(null);
  const [truckAngle, setTruckAngle] = useState<number>(0);

  const eventDataRef = useRef({ cctv: cctvData, construction: constructionData });
  const autoOpenedCctvRef = useRef(false);

  useEffect(() => {
    eventDataRef.current = { cctv: cctvData, construction: constructionData };
  }, [cctvData, constructionData]);

  // 시뮬레이션 중 CCTV 감지 시 자동으로 영상 팝업 띄우기
  useEffect(() => {
    if (isSimulating) {
      if (nearbyEvent?.type === "cctv") {
        setSelectedCctv(nearbyEvent.data);
        setIsCctvPopupOpen(true);
        autoOpenedCctvRef.current = true;
      } else {
        // CCTV 구역을 벗어났을 때, 자동으로 띄운 팝업이라면 닫아줌
        if (autoOpenedCctvRef.current) {
          setIsCctvPopupOpen(false);
          autoOpenedCctvRef.current = false;
        }
      }
    } else {
      // 시뮬레이션이 종료(도착지 도달 등)되었을 때, 팝업이 크게 튀어나오지 않고 닫히게 처리
      if (autoOpenedCctvRef.current) {
        setIsCctvPopupOpen(false);
        autoOpenedCctvRef.current = false;
      }
    }
  }, [nearbyEvent, isSimulating, setIsCctvPopupOpen, setSelectedCctv]);

  // 시뮬레이션 로직
  useEffect(() => {
    if (!trackingNumber) return;

    const startSimulation = async () => {
      // 알림 권한 요청 (최초 1회)
      if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
      }

      try {
        setIsSimulating(true);
        // 출발지: 부산 BIFC
        const origin = "129.0645,35.1462";

        // 도착지: trackingNumber 해시 기반 랜덤 좌표
        let hash = 0;
        for (let i = 0; i < trackingNumber.length; i++) {
          hash = trackingNumber.charCodeAt(i) + ((hash << 5) - hash);
        }
        let randLat, randLng;
        if (
          shippingAddress &&
          (shippingAddress.includes("부산") || shippingAddress.toLowerCase().includes("busan"))
        ) {
          randLat = 35.158 + (hash % 100) * 0.001;
          randLng = 129.055 + (hash % 100) * 0.001;
        } else {
          randLat = 37.5665 + (hash % 100) * 0.001;
          randLng = 126.978 + (hash % 100) * 0.001;
        }

        const dest = `${randLng},${randLat}`;

        // OSRM API 호출
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin};${dest}?overview=full&geometries=geojson`;
        const res = await fetch(osrmUrl);
        const data = await res.json();

        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates as [number, number][];
          setDeliveryRoute(coords);

          // 초기 뷰 설정
          setViewState((prev: any) => ({
            ...prev,
            longitude: coords[0][0],
            latitude: coords[0][1],
            zoom: 16.5,
            pitch: 60,
            bearing: 30,
            transitionDuration: 2000,
          }));

          // 각 구간 누적 거리(km) 계산
          const cumulativeDistances: number[] = [0];
          let totalDistance = 0;
          for (let i = 1; i < coords.length; i++) {
            const d = getDistance(coords[i - 1][1], coords[i - 1][0], coords[i][1], coords[i][0]);
            totalDistance += d;
            cumulativeDistances.push(totalDistance);
          }

          let startTime = Date.now();
          const duration = 90000; // 90초 (기존 60초의 2/3 속도)
          let lastEventCheckTime = 0;
          let passedEvents = new Set<string>();

          const animate = () => {
            const now = Date.now();
            let progress = (now - startTime) / duration;
            if (progress > 1) {
              progress = 1;
              setIsSimulating(false);
              setNearbyEvent(null);

              // 🚀 배송 완료 알림 발생 (OS 푸시 알림 + DB 저장)
              const title = "📦 배송 완료 안내";
              const message = trackingNumber
                ? `[${trackingNumber}] 주문하신 상품이 목적지에 도착했습니다.`
                : "주문하신 상품이 목적지에 도착했습니다.";

              // 브라우저 OS 알림
              if (Notification.permission === "granted") {
                new Notification(title, {
                  body: message,
                  icon: "/icons/truck-icon.png", // 실제 아이콘 경로에 맞게 (선택 사항)
                });
              }

              // DB 저장
              fetch("/api/notifications", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token") || ""}`,
                },
                body: JSON.stringify({
                  title,
                  message,
                  link: "/orders",
                }),
              }).catch(e => console.warn("Failed to save notification:", e));
            }

            setDeliveryProgress(progress);

            const currentTargetDist = progress * totalDistance;

            let index = 0;
            for (let i = 0; i < cumulativeDistances.length - 1; i++) {
              if (
                currentTargetDist >= cumulativeDistances[i] &&
                currentTargetDist <= cumulativeDistances[i + 1]
              ) {
                index = i;
                break;
              }
            }
            const nextIndex = Math.min(index + 1, coords.length - 1);

            let ratio = 0;
            const segmentDist = cumulativeDistances[nextIndex] - cumulativeDistances[index];
            if (segmentDist > 0) {
              ratio = (currentTargetDist - cumulativeDistances[index]) / segmentDist;
            }

            const currentLng =
              coords[index][0] + (coords[nextIndex][0] - coords[index][0]) * ratio;
            const currentLat =
              coords[index][1] + (coords[nextIndex][1] - coords[index][1]) * ratio;

            const dx = coords[nextIndex][0] - coords[index][0];
            const dy = coords[nextIndex][1] - coords[index][1];

            let compassBearing: number | undefined = undefined;
            if (dx !== 0 || dy !== 0) {
              compassBearing = Math.atan2(dx, dy) * (180 / Math.PI);
              setTruckAngle(compassBearing);
            }

            setTruckPos({ longitude: currentLng, latitude: currentLat });

            // 주변 이벤트(CCTV/공사) 체크
            if (now - lastEventCheckTime > 500) {
              lastEventCheckTime = now;

              let nearestCctv: any = null;
              let minCctvDist = 5;

              eventDataRef.current.cctv?.forEach((c) => {
                const id = c.name;
                if (c.lat && c.lng && !passedEvents.has(id)) {
                  const d = getDistance(currentLat, currentLng, c.lat, c.lng);
                  if (d < minCctvDist) {
                    minCctvDist = d;
                    nearestCctv = c;
                  }
                }
              });

              let nearestConst: any = null;
              let minConstDist = 5;
              eventDataRef.current.construction?.forEach((c) => {
                const id = c.project_name;
                if (
                  c.lat &&
                  c.lng &&
                  (c.progress_rate == null || c.progress_rate < 100) &&
                  id &&
                  !passedEvents.has(id)
                ) {
                  const d = getDistance(currentLat, currentLng, c.lat, c.lng);
                  if (d < minConstDist) {
                    minConstDist = d;
                    nearestConst = c;
                  }
                }
              });

              let newEvent: {
                type: "cctv" | "construction";
                data: any;
                distance: number;
              } | null = null;
              if (nearestCctv)
                newEvent = { type: "cctv", data: nearestCctv, distance: minCctvDist };
              else if (nearestConst)
                newEvent = {
                  type: "construction",
                  data: nearestConst,
                  distance: minConstDist,
                };

              setNearbyEvent((prev) => {
                let isPrevValid = false;
                let prevDist = 5;
                if (prev && prev.data.lat && prev.data.lng) {
                  prevDist = getDistance(
                    currentLat,
                    currentLng,
                    prev.data.lat,
                    prev.data.lng
                  );

                  if (prevDist > prev.distance + 0.1) {
                    const id = prev.data.name || prev.data.project_name;
                    if (id) passedEvents.add(id);
                    isPrevValid = false;
                  } else if (prevDist < 5) {
                    isPrevValid = true;
                  }
                }

                if (isPrevValid && prev!.type === "construction" && newEvent?.type === "cctv") {
                  return newEvent;
                }

                if (isPrevValid) {
                  if (prev!.distance.toFixed(1) === prevDist.toFixed(1)) {
                    return prev;
                  }
                  return { ...prev!, distance: Math.min(prev!.distance, prevDist) };
                }

                return newEvent;
              });
            }

            if (progress < 1) {
              setViewState((prev: any) => ({
                ...prev,
                longitude: currentLng,
                latitude: currentLat,
                bearing: compassBearing !== undefined ? compassBearing - 90 : prev.bearing,
                pitch: 45,
              }));
              requestAnimationFrame(animate);
            }
          };

          setTimeout(() => {
            requestAnimationFrame(animate);
          }, 2000);
        }
      } catch (err) {
        console.error("OSRM Route Fetch Error:", err);
      }
    };

    startSimulation();
  }, [trackingNumber, shippingAddress, setViewState]);

  return {
    deliveryRoute,
    deliveryProgress,
    isSimulating,
    truckPos,
    nearbyEvent,
    truckAngle,
    autoOpenedCctvRef,
  };
}
