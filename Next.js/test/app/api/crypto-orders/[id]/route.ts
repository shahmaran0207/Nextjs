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

    const order = await prisma.crypto_payment_orders.findUnique({
      where: {
        id: Number(orderId),
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 상품 정보 조회
    let product = null;
    if (order.product_id) {
      product = await prisma.products.findUnique({
        where: { id: order.product_id },
        select: {
          name: true,
          price: true,
        }
      });
    }

    return NextResponse.json({
      order: {
        ...order,
        product,
      },
    });
  } catch (err: any) {
    console.error("Crypto Order Detail GET API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
