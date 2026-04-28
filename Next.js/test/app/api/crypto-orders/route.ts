import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/crypto-orders
 *
 * 구매자: ?email=buyer@example.com
 *   → buyer_email 로 조회
 *
 * 판매자: ?sellerWallet=0xABC...
 *   → seller_wallet 로 조회 (판매자 수신 내역)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email        = searchParams.get("email");
  const sellerWallet = searchParams.get("sellerWallet");

  if (!email && !sellerWallet) {
    return NextResponse.json({ error: "email 또는 sellerWallet 파라미터가 필요합니다." }, { status: 400 });
  }

  try {
    let where: any = {};

    if (email) {
      where.buyer_email = email;
    } else if (sellerWallet) {
      where.seller_wallet = { equals: sellerWallet, mode: "insensitive" };
    }

    const orders = await prisma.crypto_payment_orders.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("crypto-orders API Error:", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}
