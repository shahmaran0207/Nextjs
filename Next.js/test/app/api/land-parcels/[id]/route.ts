import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/utils/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// ── PATCH: 구역 구매 처리 (소유권 이전) ──────────────────────────
// 블록체인 결제 완료 후 프론트엔드가 호출하는 엔드포인트입니다.
// tx_hash를 함께 전달하여 트랜잭션 증거를 기록합니다.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      req.headers.get("Authorization")?.split(" ")[1] ??
      cookieStore.get("accessToken")?.value;

    const payload = token ? verifyAccessToken(token) : null;
    if (!payload) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { owner_wallet, tx_hash } = await req.json();

    if (!owner_wallet) {
      return NextResponse.json({ error: "구매자 지갑 주소가 필요합니다." }, { status: 400 });
    }

    // 현재 구역 상태 확인
    const parcel = await prisma.land_parcels.findUnique({
      where: { id: Number(id) },
    });

    if (!parcel) {
      return NextResponse.json({ error: "존재하지 않는 구역입니다." }, { status: 404 });
    }
    if (parcel.status === "owned") {
      return NextResponse.json({ error: "이미 소유된 구역입니다." }, { status: 409 });
    }

    // 소유권 이전
    const updated = await prisma.land_parcels.update({
      where: { id: Number(id) },
      data: {
        status: "owned",
        owner_wallet,
        owner_user_id: Number(payload.id),
        tx_hash: tx_hash ?? null,
        updated_at: new Date(),
      },
    });

    // 구매자에게 알림 전송
    try {
      await prisma.notifications.create({
        data: {
          user_id: Number(payload.id),
          title: "🏠 가상 부동산 구매 완료!",
          message: `[${parcel.name}] 구역의 소유권이 등록되었습니다. 지도에서 내 땅을 확인해보세요!`,
          link: "/dt",
          is_read: false,
        },
      });
    } catch (notifyErr) {
      console.warn("[LandParcel PATCH] 알림 전송 실패:", notifyErr);
    }

    return NextResponse.json({ success: true, parcel: updated });
  } catch (err: any) {
    console.error("[LandParcels PATCH]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── DELETE: 구역 삭제 (등록자 또는 관리자만 가능) ─────────────────
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      req.headers.get("Authorization")?.split(" ")[1] ??
      cookieStore.get("accessToken")?.value;

    const payload = token ? verifyAccessToken(token) : null;
    if (!payload) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const parcel = await prisma.land_parcels.findUnique({
      where: { id: Number(id) },
    });

    if (!parcel) {
      return NextResponse.json({ error: "존재하지 않는 구역입니다." }, { status: 404 });
    }

    // 등록자 본인 또는 ADMIN만 삭제 가능
    const isOwner = parcel.created_by === Number(payload.id);
    const isAdmin = payload.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
    }

    await prisma.land_parcels.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[LandParcels DELETE]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
