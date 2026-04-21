"use client";

import styles from './TwinMap.module.css';
import { FIELD_CONFIG, THEME_CONFIG } from './dt/constants/iconConfigs';

interface ConstructionPoint {
  gid: number;
  lng: number;
  lat: number;
  project_name: string | null;
  progress_rate: number | null;
  plan_rate: number | null;
  achievement_rate: number | null;
  start_date: string | null;
  end_date: string | null;
  location_text: string | null;
  budget_text: string | null;
  d_day: number | null;
  contact: string | null;
  field_code: string | null;
}

interface ThemeTravelPoint {
  gid: number;
  lng: number;
  lat: number;
  content_name: string | null;
  district_name: string | null;
  category_name: string | null;
  place_name: string | null;
  title: string | null;
  subtitle: string | null;
  address: string | null;
  phone: string | null;
  operating_hours: string | null;
  fee_info: string | null;
  closed_days: string | null;
}

interface TourismCarouselProps {
  categoryName: string;
  currentIndex: number;
  totalCount: number;
  currentItem: ThemeTravelPoint;
}

interface ConstructionCarouselProps {
  fieldCode: string;
  currentIndex: number;
  totalCount: number;
  currentItem: ConstructionPoint;
}

export function TourismCarouselDisplay({ categoryName, currentIndex, totalCount, currentItem }: TourismCarouselProps) {
  const cfg = THEME_CONFIG[currentItem?.category_name ?? ""] ?? THEME_CONFIG["기타"];

  return (
    <>
      {/* 상단 카운터 */}
      <div className={`${styles.carouselCounter} ${styles.carouselCounterTourism}`}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>🎭 {categoryName}</span>
            <span style={{ fontSize: "12px", color: "#fbcfe8" }}>
              {currentIndex + 1} / {totalCount}
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "#fbcfe8", marginTop: "4px" }}>
            {currentItem.content_name || '관광지'}
          </div>
        </div>
      </div>

      {/* 마커 옆 상세 정보 */}
      <div className={`${styles.carouselTooltip} ${styles.carouselTooltipTourism}`}>
        <div className={styles.tooltipContent}>
          <div className={`${styles.tooltipHeader} ${styles.tooltipHeaderTourism}`}>
            <span>{cfg.emoji}</span>
            <span>{currentItem?.content_name ?? "관광지"}</span>
          </div>
          {currentItem?.title && <div className={styles.tooltipItemTitle}>✨ {currentItem.title}</div>}
          {currentItem?.subtitle && <div className={styles.tooltipItemSubtitle}>{currentItem.subtitle}</div>}
          {currentItem?.place_name && <div className={`${styles.tooltipItem} ${styles.tooltipItemNormal}`}>📍 {currentItem.place_name}</div>}
          {currentItem?.district_name && <div className={`${styles.tooltipItem} ${styles.tooltipItemMuted}`}>🏙 {currentItem.district_name}</div>}
          {currentItem?.address && <div className={styles.tooltipItemSmall}>🏠 {currentItem.address}</div>}
          {currentItem?.operating_hours && <div className={`${styles.tooltipItem} ${styles.tooltipItemSuccess}`}>🕐 {currentItem.operating_hours}</div>}
          {currentItem?.closed_days && <div className={`${styles.tooltipItem} ${styles.tooltipItemDanger}`}>🚫 {currentItem.closed_days}</div>}
          {currentItem?.fee_info && <div className={`${styles.tooltipItem} ${styles.tooltipItemWarning}`}>💳 {currentItem.fee_info}</div>}
          {currentItem?.phone && <div className={`${styles.tooltipItem} ${styles.tooltipItemMuted}`}>☎ {currentItem.phone}</div>}
        </div>
      </div>
    </>
  );
}

export function ConstructionCarouselDisplay({ fieldCode, currentIndex, totalCount, currentItem }: ConstructionCarouselProps) {
  const rate = currentItem?.progress_rate ?? 0;
  const plan = currentItem?.plan_rate ?? 0;
  const fieldLabel = FIELD_CONFIG[currentItem?.field_code ?? ""]?.label ?? "기타";

  return (
    <>
      {/* 상단 카운터 */}
      <div className={`${styles.carouselCounter} ${styles.carouselCounterConstruction}`}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>🚧 {FIELD_CONFIG[fieldCode]?.label || '공사'}</span>
            <span style={{ fontSize: "12px", color: "#fed7aa" }}>
              {currentIndex + 1} / {totalCount}
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "#fed7aa", marginTop: "4px" }}>
            {currentItem.project_name || '공사현장'}
          </div>
        </div>
      </div>

      {/* 마커 옆 상세 정보 */}
      <div className={`${styles.carouselTooltip} ${styles.carouselTooltipConstruction}`}>
        <div className={styles.tooltipContent}>
          <div className={`${styles.tooltipHeader} ${styles.tooltipHeaderConstruction}`}>
            🚧 {currentItem?.project_name ?? "공사현장"}
          </div>
          <div className={styles.tooltipItemField}>📋 분야: {fieldLabel}</div>
          {currentItem?.location_text && <div className={`${styles.tooltipItem} ${styles.tooltipItemNormal}`}>📍 {currentItem.location_text}</div>}
          <div className={`${styles.tooltipItem} ${styles.tooltipItemMuted}`}>📅 {currentItem?.start_date ?? "?"} ~ {currentItem?.end_date ?? "?"}</div>
          <div className={`${styles.tooltipItemProgress} ${rate >= plan ? styles.tooltipItemSuccess : styles.tooltipItemDanger}`}>
            📊 공정률: {rate}% (계획 {plan}%)
          </div>
          {currentItem?.budget_text && <div className={`${styles.tooltipItem} ${styles.tooltipItemWarning}`}>💰 {currentItem.budget_text}</div>}
          {currentItem?.contact && <div className={`${styles.tooltipItem} ${styles.tooltipItemMuted}`}>☎ {currentItem.contact}</div>}
        </div>
      </div>
    </>
  );
}
