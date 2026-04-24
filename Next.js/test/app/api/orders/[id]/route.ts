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
