import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ canReview: false });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ canReview: false });
    }

    // 0. 내가 등록한 상품인지 확인 (seller_id)
    const product = await prisma.products.findUnique({
      where: { id: Number(id) }
    });
    
    // 판매자이면 리뷰 작성 불가 및 본인 상품 플래그 반환
    if (product && (product as any).seller_id === user.id) {
      return NextResponse.json({ canReview: false, isMyProduct: true });
    }

    // 1. 유저가 결제 완료한 주문 ID 목록 조회
    const paidOrders = await prisma.orders.findMany({
      where: {
        user_id: user.id,
        order_status: {
          in: ["PAID", "COMPLETED", "SHIPPED", "DELIVERED"]
        }
      },
      select: { id: true }
    });

    if (paidOrders.length === 0) {
      return NextResponse.json({ canReview: false });
    }

    const orderIds = paidOrders.map(o => o.id);

    // 2. 해당 주문들 중 이 상품이 포함되어 있는 주문 건수 (중복 제거)
    const orderItems = await prisma.order_items.findMany({
      where: {
        product_id: Number(id),
        order_id: { in: orderIds }
      }
    });

    if (orderItems.length === 0) {
      return NextResponse.json({ canReview: false });
    }

    const distinctOrders = new Set(orderItems.map(item => item.order_id));
    const purchasedOrderCount = distinctOrders.size;

    // 3. 사용자가 이미 작성한 리뷰 개수 조회
    const existingReviewsCount = await prisma.product_reviews.count({
      where: {
        user_id: user.id,
        product_id: Number(id)
      }
    });

    // 작성한 리뷰 수가 결제한 주문 건수보다 적을 때만 리뷰 작성 가능
    return NextResponse.json({ 
      canReview: existingReviewsCount < purchasedOrderCount, 
      isMyProduct: false 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, isMyProduct: false }, { status: 500 });
  }
}
