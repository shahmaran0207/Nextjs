import { PolygonLayer } from "@deck.gl/layers";

export interface LandParcel {
  id: number;
  name: string;
  description: string | null;
  coordinates: number[][];  // [[lng, lat], ...]
  price_eth: string;
  status: string;           // "available" | "owned"
  owner_wallet: string | null;
  owner_user_id: number | null;
  nft_token_id: number | null;
  tx_hash: string | null;
  created_by: number | null;
}

interface LandLayerOptions {
  parcels: LandParcel[];
  myWallet: string | null;          // 현재 로그인한 유저의 지갑 주소
  onParcelClick: (parcel: LandParcel, screenX: number, screenY: number) => void;
  hoveredParcelId: number | null;   // 마우스 호버 중인 구역 ID
}

// ── 구역 상태별 색상 정의 ─────────────────────────────────────────
// [R, G, B, A] 형식, A는 0~255
function getParcelFillColor(parcel: LandParcel, myWallet: string | null, isHovered: boolean): [number, number, number, number] {
  const baseAlpha = isHovered ? 160 : 80;
  const hoverBoost = isHovered ? 40 : 0;

  if (parcel.status === "owned") {
    // 내 땅: 파란색 계열
    if (myWallet && parcel.owner_wallet?.toLowerCase() === myWallet.toLowerCase()) {
      return [56, 189, 248, baseAlpha + hoverBoost]; // 시안 (내 소유)
    }
    // 타인 소유: 빨간색 계열
    return [239, 68, 68, baseAlpha];
  }

  // 구매 가능: 초록색 계열
  return [74, 222, 128, baseAlpha + hoverBoost];
}

function getParcelLineColor(parcel: LandParcel, myWallet: string | null, isHovered: boolean): [number, number, number, number] {
  const alpha = isHovered ? 255 : 200;

  if (parcel.status === "owned") {
    if (myWallet && parcel.owner_wallet?.toLowerCase() === myWallet.toLowerCase()) {
      return [56, 189, 248, alpha];
    }
    return [239, 68, 68, alpha];
  }
  return [74, 222, 128, alpha];
}

// ── 랜드 구역 PolygonLayer 생성 팩토리 ───────────────────────────
export function createLandParcelLayer(options: LandLayerOptions) {
  const { parcels, myWallet, onParcelClick, hoveredParcelId } = options;

  return new PolygonLayer<LandParcel>({
    id: "land-parcel-layer",
    data: parcels,
    getPolygon: (d) => d.coordinates,
    getFillColor: (d) => getParcelFillColor(d, myWallet, d.id === hoveredParcelId),
    getLineColor: (d) => getParcelLineColor(d, myWallet, d.id === hoveredParcelId),
    lineWidthMinPixels: 2,
    lineWidthMaxPixels: 4,
    stroked: true,
    filled: true,
    pickable: true,
    extruded: false,
    onClick: (info) => {
      if (info.object) {
        onParcelClick(info.object, info.x, info.y);
        return true;
      }
    },
    updateTriggers: {
      getFillColor: [hoveredParcelId, myWallet],
      getLineColor: [hoveredParcelId, myWallet],
    },
    transitions: {
      getFillColor: { duration: 200 },
    },
  });
}

// ── 드로잉 중인 폴리곤 미리보기 레이어 ───────────────────────────
// 사용자가 꼭짓점을 클릭해 나갈 때 실시간으로 보여주는 임시 레이어
export function createDrawingPreviewLayer(drawingPoints: [number, number][]) {
  if (drawingPoints.length < 2) return null;

  // 닫히지 않은 임시 폴리곤 (마지막 꼭짓점 → 첫 번째 꼭짓점 연결 미리보기)
  const previewCoords = [...drawingPoints, drawingPoints[0]];

  return new PolygonLayer({
    id: "land-drawing-preview-layer",
    data: [{ coords: previewCoords }],
    getPolygon: (d: any) => d.coords,
    getFillColor: [250, 204, 21, 40],    // 노란색 반투명
    getLineColor: [250, 204, 21, 220],   // 노란 테두리
    lineWidthMinPixels: 2,
    stroked: true,
    filled: true,
    pickable: false,                      // 드로잉 미리보기는 클릭 불가
  });
}
