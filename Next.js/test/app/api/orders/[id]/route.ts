import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const order = await prisma.orders.findUnique({
      where: {
        id: Number(orderId),
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 보안 검사: 자신의 주문인지 확인
    if (Number(order.user_id) !== user.id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    // 주문에 속한 상품들 가져오기
    const items = await prisma.order_items.findMany({
      where: { order_id: order.id },
    });

    return NextResponse.json({
      order: {
        ...order,
        items,
      },
    });
  } catch (err: any) {
    console.error("Order Detail GET API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const { action, email } = await req.json();

    if (!email || !action) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    const order = await prisma.orders.findUnique({
      where: { id: Number(orderId) },
    });

    if (!order) {
      return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
    }

    if (Number(order.user_id) !== user.id) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    if (action === "CANCEL") {
      if (order.order_status !== "PAID" && order.order_status !== "PENDING") {
        return NextResponse.json({ error: "배송이 시작된 주문은 취소할 수 없습니다." }, { status: 400 });
      }
      
      const updated = await prisma.orders.update({
        where: { id: Number(orderId) },
        data: { order_status: "CANCELLED" }
      });
      return NextResponse.json({ success: true, order: updated });
    }

    if (action === "CONFIRM") {
      if (order.order_status !== "SHIPPED") {
        return NextResponse.json({ error: "배송 중인 주문만 구매 확정할 수 있습니다." }, { status: 400 });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const o = await tx.orders.update({
          where: { id: Number(orderId) },
          data: { order_status: "DELIVERED" }
        });
        await tx.order_items.updateMany({
          where: { order_id: Number(orderId) },
          data: { item_status: "DELIVERED" }
        });
        return o;
      });
      return NextResponse.json({ success: true, order: updated });
    }

    if (action === "RETURN_REQUEST") {
      if (order.order_status !== "DELIVERED") {
        return NextResponse.json({ error: "배송 완료된 주문만 반품 요청이 가능합니다." }, { status: 400 });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const o = await tx.orders.update({
          where: { id: Number(orderId) },
          data: { order_status: "RETURN_REQUEST" }
        });
        await tx.order_items.updateMany({
          where: { order_id: Number(orderId) },
          data: { item_status: "RETURN_REQUEST" }
        });
        return o;
      });
      return NextResponse.json({ success: true, order: updated });
    }

    return NextResponse.json({ error: "유효하지 않은 액션입니다." }, { status: 400 });
  } catch (err: any) {
    console.error("Order PATCH API Error:", err);
    return NextResponse.json({ error: "상태 변경에 실패했습니다." }, { status: 500 });
  }
}
