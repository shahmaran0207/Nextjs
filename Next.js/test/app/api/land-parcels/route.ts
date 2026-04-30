import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/utils/auth";
import { cookies } from "next/headers";
import { registerParcelOnChain } from "@/utils/land-contract";

export const dynamic = "force-dynamic";

// ── GET: 전체 구역 목록 조회 ──────────────────────────────────────
// 랜드 모드에서 지도 위에 표시할 모든 구역 데이터를 반환합니다.
export async function GET() {
  try {
    const parcels = await prisma.land_parcels.findMany({
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json({ parcels });
  } catch (err: any) {
    console.error("[LandParcels GET]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── POST: 새 구역 등록 ────────────────────────────────────────────
// 지도에서 폴리곤을 직접 그린 뒤 DB에 저장 + 컨트랙트에 자동 등록합니다.
// 로그인한 사용자라면 누구나 땅을 그려서 판매 등록할 수 있습니다.
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = req.headers.get("Authorization")?.split(" ")[1]
      ?? cookieStore.get("accessToken")?.value;

    const payload = token ? verifyAccessToken(token) : null;
    if (!payload) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { name, description, coordinates, price_eth } = await req.json();

    if (!name || !coordinates || !Array.isArray(coordinates) || coordinates.length < 3) {
      return NextResponse.json(
        { error: "구역 이름과 3개 이상의 좌표 꼭짓점이 필요합니다." },
        { status: 400 }
      );
    }

    // 폴리곤 닫기: 마지막 좌표 ≠ 첫 번째 좌표이면 자동으로 닫아줌
    const closedCoords = [...coordinates];
    const first = closedCoords[0];
    const last = closedCoords[closedCoords.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      closedCoords.push(first);
    }

    // ── 1. DB 저장 ─────────────────────────────────────────────────
    const parcel = await prisma.land_parcels.create({
      data: {
        name,
        description: description ?? null,
        coordinates: closedCoords,
        price_eth: price_eth ?? "0.1",
        status: "available",
        created_by: Number(payload.id),
      },
    });

    // ── 2. 스마트 컨트랙트에 자동 등록 ────────────────────────────
    // DB 저장은 이미 완료됐으므로, 컨트랙트 등록 실패 시에도 DB는 유지됩니다.
    // 컨트랙트 등록에 실패해도 나중에 register-parcel.js 스크립트로 수동 등록 가능.
    let onChainTxHash: string | null = null;
    try {
      onChainTxHash = await registerParcelOnChain(
        parcel.id,
        name,
        price_eth ?? "0.1"
      );
    } catch (chainErr: any) {
      // 컨트랙트 등록 실패 → DB 저장은 성공했으므로 경고만 출력
      console.warn(
        `[LandParcels POST] 컨트랙트 등록 실패 (나중에 수동 등록 가능): ${chainErr.message}`
      );
    }

    return NextResponse.json({
      success: true,
      parcel,
      onChain: onChainTxHash
        ? { registered: true, txHash: onChainTxHash }
        : { registered: false, reason: "컨트랙트 등록 실패 또는 이미 등록됨" },
    });
  } catch (err: any) {
    console.error("[LandParcels POST]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
