// app/api/wallet/seller/[sellerId]/route.ts
// ─────────────────────────────────────────────────────────────
// GET /api/wallet/seller/:sellerId
// 특정 판매자(users.id)의 검증된 지갑 주소를 반환합니다.
// 결제 페이지에서 상품의 seller_id로 판매자 지갑을 조회할 때 사용합니다.
//
// 보안: 지갑 주소는 공개 정보이므로 인증 없이 조회 허용
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  const { sellerId } = await params;
  const id = parseInt(sellerId, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: "유효하지 않은 판매자 ID입니다." }, { status: 400 });
  }

  const seller = await prisma.users.findUnique({
    where: { id },
    select: {
      wallet_address: true,
      wallet_verified_at: true,
    },
  });

  if (!seller) {
    return NextResponse.json({ error: "판매자를 찾을 수 없습니다." }, { status: 404 });
  }

  if (!seller.wallet_address) {
    return NextResponse.json(
      { error: "이 판매자는 지갑 주소를 등록하지 않았습니다." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    address: seller.wallet_address,
    verifiedAt: seller.wallet_verified_at,
  });
}
