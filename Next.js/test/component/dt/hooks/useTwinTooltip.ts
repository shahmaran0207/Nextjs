import { useState, useCallback } from 'react';
import { FIELD_CONFIG, THEME_CONFIG } from '@/component/dt/constants/iconConfigs';
import { ConstructionPoint, ThemeTravelPoint } from '@/component/dt/modules/DashboardStatsModule';
import { CCTVPoint } from '@/types/cctv';

interface TooltipState {
  x: number;
  y: number;
  content: string;
}

/**
 * DeckGL onHover 핸들러와 툴팁 상태를 관리하는 Hook
 *
 * @returns tooltip - 현재 툴팁 상태 (null이면 숨김)
 * @returns handleHover - DeckGL onHover prop에 직접 전달하는 핸들러
 */
export function useTwinTooltip() {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const handleHover = useCallback((info: any) => {
    if (info.layer?.id === 'bit-layer' && info.object) {
      const p = info.object.properties;
      setTooltip({
        x: info.x, y: info.y,
        content: `📍 ${p?.stationLoc ?? ''}\n${p?.addr ?? ''}`,
      });
    } else if (info.layer?.id === 'bit-cluster-layer' && info.object) {
      setTooltip({
        x: info.x, y: info.y,
        content: `🚌 버스 정류장 ${info.object.properties.point_count}개`,
      });
    } else if (info.layer?.id === 'boundary-layer' && info.object) {
      setTooltip({
        x: info.x, y: info.y,
        content: `🗺 ${info.object.name}\n코드: ${info.object.code}`,
      });
    } else if (info.layer?.id === 'construction-point-core' && info.object) {
      const p = info.object.properties as ConstructionPoint;
      const rate = p?.progress_rate ?? 0;
      const plan = p?.plan_rate ?? 0;
      const fieldLabel = FIELD_CONFIG[p?.field_code ?? '']?.label ?? '기타';
      const lines = [
        `🚧 ${p?.project_name ?? '공사현장'}`,
        `📋 분야: ${fieldLabel}`,
        p?.location_text ? `📍 ${p.location_text}` : null,
        `📅 ${p?.start_date ?? '?'} ~ ${p?.end_date ?? '?'}`,
        `📊 공정률: ${rate}%  (계획 ${plan}%)`,
        p?.budget_text ? `💰 ${p.budget_text}` : null,
        p?.contact ? `☎ ${p.contact}` : null,
      ].filter(Boolean).join('\n');
      setTooltip({ x: info.x, y: info.y, content: lines });
    } else if (info.layer?.id === 'construction-cluster-layer' && info.object) {
      setTooltip({
        x: info.x, y: info.y,
        content: `🚧 공사현장 ${info.object.properties.point_count}개`,
      });
    } else if (info.layer?.id === 'theme-point-core' && info.object) {
      const p = info.object.properties as ThemeTravelPoint;
      const cfg = THEME_CONFIG[p?.category_name ?? ''] ?? THEME_CONFIG['기타'];
      const lines = [
        `${cfg.emoji} [${p?.category_name ?? '테마여행'}] ${p?.content_name ?? ''}`,
        p?.title ? `✨ ${p.title}` : null,
        p?.subtitle ? `  ${p.subtitle}` : null,
        p?.place_name ? `📍 ${p.place_name}` : null,
        p?.district_name ? `🏙 ${p.district_name}` : null,
        p?.address ? `🏠 ${p.address}` : null,
        p?.operating_hours ? `🕐 ${p.operating_hours}` : null,
        p?.closed_days ? `🚫 휴무: ${p.closed_days}` : null,
        p?.fee_info ? `💳 ${p.fee_info}` : null,
        p?.phone ? `☎ ${p.phone}` : null,
      ].filter(Boolean).join('\n');
      setTooltip({ x: info.x, y: info.y, content: lines });
    } else if (info.layer?.id === 'theme-cluster-layer' && info.object) {
      setTooltip({
        x: info.x, y: info.y,
        content: `🗺 테마여행 ${info.object.properties.point_count}개`,
      });
    } else if (info.layer?.id === 'cctv-point-core' && info.object) {
      const p = info.object.properties as CCTVPoint;
      setTooltip({
        x: info.x,
        y: info.y,
        content: `📹 ${p.name ?? 'CCTV'}\n📍 ${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`,
      });
    } else if (info.layer?.id === 'cctv-cluster-layer' && info.object) {
      setTooltip({
        x: info.x,
        y: info.y,
        content: `📹 CCTV ${info.object.properties.point_count}개`,
      });
    } else if (info.layer?.id === 'path-layer' && info.object) {
      setTooltip({
        x: info.x, y: info.y,
        content: `🛣 링크 ID: ${info.object.lkId}`,
      });
    } else {
      setTooltip(null);
    }
  }, []);

  return { tooltip, handleHover };
}
