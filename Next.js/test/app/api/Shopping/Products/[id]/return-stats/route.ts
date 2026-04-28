import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/Shopping/Products/[id]/return-stats
// 해당 상품의 실제 반품 통계 반환
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    // 이 상품이 포함된 order_items 조회 (최근 6개월)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const items = await prisma.order_items.findMany({
      where: {
        product_id: Number(productId),
        created_at: { gte: sixMonthsAgo },
      },
      select: { order_id: true },
    });

    if (items.length === 0) {
      return NextResponse.json({ returnRate: 0, topReason: null, totalOrders: 0, returnCount: 0 });
    }

    const orderIds = items.map((i) => i.order_id);

    // 반품 요청된 주문 조회
    const returnOrders = await prisma.orders.findMany({
      where: {
        id: { in: orderIds.map((id) => Number(id)) },
        order_status: { in: ["RETURN_REQUEST", "RETURN_COMPLETED"] },
      },
      select: { return_reason: true },
    });

    const totalOrders = orderIds.length;
    const returnCount = returnOrders.length;
    const returnRate = totalOrders > 0 ? Math.round((returnCount / totalOrders) * 100) : 0;

    // 반품 사유 집계 (가장 많은 것 1개)
    const reasonMap: Record<string, number> = {};
    for (const o of returnOrders) {
      const reason = o.return_reason || "기타";
      reasonMap[reason] = (reasonMap[reason] || 0) + 1;
    }

    const topReason = Object.entries(reasonMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return NextResponse.json({ returnRate, topReason, totalOrders, returnCount });
  } catch (err: any) {
    console.error("Return stats API error:", err);
    return NextResponse.json({ returnRate: 0, topReason: null, totalOrders: 0, returnCount: 0 });
  }
}
