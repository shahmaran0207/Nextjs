import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, imp_uid, merchant_uid, amount, items, fromCart, receiver_name, receiver_phone, shipping_address, shipping_message } = body;

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 트랜잭션 사용: order 생성 -> order_items 생성 -> payment 생성 -> 장바구니/재고 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Order
      const order = await tx.orders.create({
        data: {
          user_id: user.id,
          order_number: merchant_uid,
          order_status: "PAID",
          total_product_amount: amount,
          final_amount: amount,
          receiver_name: receiver_name || null,
          receiver_phone: receiver_phone || null,
          shipping_address: shipping_address || null,
          shipping_message: shipping_message || null,
        }
      });

      // 2. Create Order Items and decrease stock
      for (const item of items) {
        await tx.order_items.create({
          data: {
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.product_name,
            unit_price: item.unit_price,
            quantity: item.quantity,
            total_price: item.unit_price * item.quantity,
          }
        });

        // Decrement stock (optional: 주석 처리 가능)
        await tx.products.update({
          where: { id: item.product_id },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // 3. Create Payment record
      await tx.payments.create({
        data: {
          user_id: user.id,
          order_id: order.id,
          payment_key: imp_uid,
          payment_method: "CARD",
          payment_status: "DONE",
          amount: amount,
          approved_at: new Date(),
        }
      });

      // 4. Delete cart items if fromCart
      if (fromCart) {
        const cart = await tx.carts.findFirst({ where: { user_id: user.id } });
        if (cart) {
          const productIds = items.map((i: any) => i.product_id);
          await tx.cart_items.deleteMany({
            where: {
              cart_id: cart.id,
              product_id: { in: productIds }
            }
          });
        }
      }

      return order;
    });

    return NextResponse.json({ success: true, order: result });
  } catch (err: any) {
    console.error("Order API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const orders = await prisma.orders.findMany({
      where: { user_id: user.id },
      orderBy: { ordered_at: "desc" }
    });

    // 수동 조인: order_items
    const orderIds = orders.map(o => o.id);
    const items = await prisma.order_items.findMany({
      where: { order_id: { in: orderIds } }
    });

    const itemsByOrder = new Map();
    for (const item of items) {
      if (!itemsByOrder.has(String(item.order_id))) itemsByOrder.set(String(item.order_id), []);
      itemsByOrder.get(String(item.order_id)).push(item);
    }

    const ordersWithItems = orders.map(o => ({
      ...o,
      items: itemsByOrder.get(String(o.id)) || []
    }));

    return NextResponse.json({ orders: ordersWithItems });
  } catch (err: any) {
    console.error("Order GET API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
