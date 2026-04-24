import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notify";

export async function POST(req: Request) {
  try {
    const { order_item_id } = await req.json();
    if (!order_item_id) return NextResponse.json({ error: "Missing order_item_id" }, { status: 400 });

    const orderItem = await prisma.order_items.findUnique({
      where: { id: Number(order_item_id) },
    });

    if (!orderItem) return NextResponse.json({ error: "Order item not found" }, { status: 404 });
    if (orderItem.item_status !== "RETURN_REQUEST") {
      return NextResponse.json({ error: "반품 요청 상태가 아닙니다." }, { status: 400 });
    }

    const order = await prisma.orders.findUnique({
      where: { id: Number(orderItem.order_id) }
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Transaction for Return Approval
    await prisma.$transaction(async (tx) => {
      // 1. 상태 변경
      await tx.order_items.update({
        where: { id: Number(order_item_id) },
        data: { item_status: "RETURN_COMPLETED" }
      });

      // 2. 재고 복구
      if (orderItem.option_name) {
        await tx.product_options.updateMany({
          where: { product_id: orderItem.product_id, option_name: orderItem.option_name },
          data: { stock: { increment: orderItem.quantity } }
        });
      } else {
        await tx.products.update({
          where: { id: orderItem.product_id },
          data: { stock: { increment: orderItem.quantity } }
        });
      }

      // (실제 서비스에서는 이 시점에 포트원 부분 환불 API를 호출해야 하나, 현재는 부분 환불 대신 전체 주문 취소만 연동되어 있으므로 재고 복구까지만 구현합니다)
    });

    // 구매자에게 반품 승인 알림
    const orderForNotify = await prisma.orders.findUnique({
      where: { id: Number(orderItem.order_id) },
      select: { user_id: true, order_number: true }
    });
    if (orderForNotify) {
      await createNotification(
        Number(orderForNotify.user_id),
        "반품이 승인되었습니다 ✅",
        `주문(${orderForNotify.order_number})의 반품 요청이 승인되었습니다. 재고가 복구되었습니다.`,
        `/orders/${orderItem.order_id}`
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Return Approve Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
