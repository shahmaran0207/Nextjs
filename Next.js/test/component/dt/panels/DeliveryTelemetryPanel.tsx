import React, { useMemo, useEffect, useRef } from 'react';
import styles from './DeliveryTelemetryPanel.module.css';

interface DeliveryStop {
  id: string;
  name: string;
  progressThreshold: number; // 0 ~ 1 사이, 이 지점의 전체 경로 대비 위치
}

interface DeliveryTelemetryPanelProps {
  progress: number; // 0 ~ 1
  speed: number;    // km/h
  trackingNumber?: string;
  shippingAddress?: string;
}

export default function DeliveryTelemetryPanel({
  progress,
  speed,
  trackingNumber = 'UNKNOWN',
  shippingAddress = '목적지 미상',
}: DeliveryTelemetryPanelProps) {

  const releasedRef = useRef(false);

  // 배송 완료(progress >= 1.0) 시 오라클 API 찌르기
  useEffect(() => {
    if (progress >= 1.0 && !releasedRef.current && trackingNumber && trackingNumber !== 'UNKNOWN') {
      releasedRef.current = true;
      
      console.log(`[Oracle] 배송 완료 감지. 에스크로 자금 해제 요청 (${trackingNumber})...`);
      
      fetch('/api/crypto/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: trackingNumber })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log(`✅ [Oracle] 스마트 컨트랙트 에스크로 대금 지급 완료! TxHash: ${data.txHash}`);
        } else {
          console.error(`❌ [Oracle] 에스크로 대금 지급 실패:`, data.error);
        }
      })
      .catch(err => console.error("오라클 호출 오류:", err));
    }
  }, [progress, trackingNumber]);

  // 가상의 배송지 목록 (마지막이 실제 목적지)
  const stops: DeliveryStop[] = useMemo(() => [
    { id: 'stop-1', name: '부산 남구 대연동 (배송완료)', progressThreshold: 0.25 },
    { id: 'stop-2', name: '부산 수영구 남천동 (배송완료)', progressThreshold: 0.60 },
    { id: 'stop-3', name: shippingAddress, progressThreshold: 1.0 },
  ], [shippingAddress]);

  // 완료된 배송 개수 계산
  const completedStops = stops.filter(s => progress >= s.progressThreshold).length;

  return (
    <div className={styles.telemetryContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>🚚 Delivery Telemetry</h2>
        <div className={styles.trackingInfo}>
          <span className={styles.label}>Tracking No:</span>
          <span className={styles.value}>{trackingNumber}</span>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Current Speed</span>
          <div className={styles.statValueWrap}>
            <span className={styles.statValue}>{speed}</span>
            <span className={styles.statUnit}>km/h</span>
          </div>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Total Progress</span>
          <div className={styles.statValueWrap}>
            <span className={styles.statValue}>{Math.round(progress * 100)}</span>
            <span className={styles.statUnit}>%</span>
          </div>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>경유지 완료</span>
          <div className={styles.statValueWrap}>
            <span className={styles.statValue}>{completedStops} <span className={styles.statUnit}>/ {stops.length} 곳</span></span>
          </div>
        </div>
      </div>

      <div className={styles.timelineSection}>
        <h3 className={styles.timelineTitle}>Route Timeline</h3>
        <div className={styles.timeline}>
          <div className={styles.timelineTrack}>
            <div className={styles.timelineFill} style={{ height: `${progress * 100}%` }} />
            {/* 트럭 마커 */}
            <div className={styles.truckMarker} style={{ top: `${progress * 100}%` }}>
              🚛
            </div>
          </div>
          
          <div className={styles.stopsList}>
            {stops.map((stop, idx) => {
              const isCompleted = progress >= stop.progressThreshold;
              const isCurrent = progress < stop.progressThreshold && (idx === 0 || progress >= stops[idx - 1].progressThreshold);
              
              return (
                <div 
                  key={stop.id} 
                  className={`${styles.stopItem} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.current : ''}`}
                  style={{ top: `${stop.progressThreshold * 100}%` }}
                >
                  <div className={styles.stopDot} />
                  <div className={styles.stopInfo}>
                    <div className={styles.stopName}>{stop.name}</div>
                    <div className={styles.stopStatus}>
                      {isCompleted ? '✓ Delivered' : isCurrent ? '▶ En Route' : 'Pending'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* 장식용 레이더 애니메이션 뷰 */}
      <div className={styles.radarSection}>
        <div className={styles.radarScanner}></div>
        <span className={styles.radarText}>Scanning route conditions...</span>
      </div>
    </div>
  );
}
