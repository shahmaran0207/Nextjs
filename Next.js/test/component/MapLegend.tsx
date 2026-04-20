"use client";

import styles from './TwinMap.module.css';
import { FIELD_CONFIG, THEME_CONFIG } from './dt/constants/iconConfigs';

export default function MapLegend() {
  return (
    <div className={`${styles.panel} ${styles.legendContainer}`}>
      <div className={`${styles.dtPanelScroll} ${styles.legendScrollArea}`}>
        {/* 교통 속도 */}
        <p className={styles.legendTitle}>교통 속도</p>
        {[
          { label: "≥60 km/h", color: "#00ff64" },
          { label: "≥40 km/h", color: "#96ff00" },
          { label: "≥20 km/h", color: "#ffc800" },
          { label: "≥10 km/h", color: "#ff6400" },
          { label: " <10 km/h", color: "#ff0050" },
          { label: "정보 없음", color: "#8c8c8c" },
        ].map(({ label, color }) => (
          <div key={label} className={styles.legendItem}>
            <span style={{
              display: "inline-block",
              width: "28px",
              height: "3px",
              background: color,
              borderRadius: "2px",
              boxShadow: `0 0 8px ${color}66`
            }} />
            <span className={styles.legendItemText}>{label}</span>
          </div>
        ))}

        {/* 공사 분야 */}
        <div className={styles.legendSection}>
          <p className={styles.legendTitle}>공사 분야</p>
          {Object.entries(FIELD_CONFIG).map(([code, cfg]) => (
            <div key={code} className={styles.legendItem}>
              <span style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                background: cfg.fill,
                borderRadius: "50%",
                border: `2px solid ${cfg.stroke}`,
                boxShadow: `0 0 8px ${cfg.fill}88, inset 0 0 4px ${cfg.stroke}44`,
                flexShrink: 0,
              }} />
              <span className={styles.legendItemTextSmall}>
                <span style={{ color: cfg.stroke, fontWeight: 700, marginRight: 4 }}>{code}</span>
                {cfg.label}
              </span>
            </div>
          ))}
        </div>

        {/* 테마여행 */}
        <div className={styles.legendSection}>
          <p className={styles.legendTitle}>테마여행</p>
          {Object.entries(THEME_CONFIG).map(([cat, cfg]) => (
            <div key={cat} className={styles.legendItem}>
              <span style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                background: cfg.fill,
                borderRadius: "50%",
                border: `2px solid ${cfg.stroke}`,
                boxShadow: `0 0 8px ${cfg.fill}88, inset 0 0 4px ${cfg.stroke}44`,
                flexShrink: 0,
              }} />
              <span className={styles.legendItemTextSmall}>
                <span style={{ marginRight: 4 }}>{cfg.emoji}</span>
                {cfg.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
