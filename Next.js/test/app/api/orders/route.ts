import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, imp_uid, merchant_uid, amount, items, fromCart, receiver_name, receiver_phone, shipping_address, shipping_message, total_product_amount, shipping_fee, discount_amount, used_points, used_coupon_id, coupon_discount } = body;

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 본인이 등록한 상품이 포함되어 있는지 확인
    const productIds = items.map((item: any) => Number(item.product_id));
    const ownProducts = await prisma.products.findMany({
      where: {
        id: { in: productIds },
        // Prisma Client 타입 업데이트 지연으로 인한 동적 속성 참조 우회
      }
    });
    
    const hasOwnProduct = ownProducts.some((p: any) => p.seller_id === user.id);
    if (hasOwnProduct) {
      return NextResponse.json({ error: "본인이 등록한 상품은 결제할 수 없습니다." }, { status: 403 });
    }

    // 트랜잭션 사용: order 생성 -> order_items 생성 -> payment 생성 -> 장바구니/재고 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Order
      const order = await tx.orders.create({
        data: {
          user_id: user.id,
          order_number: merchant_uid,
          order_status: "PAID",
          total_product_amount: total_product_amount || amount,
          shipping_fee: shipping_fee || 0,
          discount_amount: discount_amount || 0,
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
            option_name: item.option_name || null
          }
        });

        // Decrement stock
        if (item.option_name) {
          // 옵션 상품인 경우 옵션 재고만 차감
          await tx.product_options.updateMany({
            where: { product_id: item.product_id, option_name: item.option_name },
            data: { stock: { decrement: item.quantity } }
          });
        } else {
          // 옵션이 없는 일반 상품인 경우
          await tx.products.update({
            where: { id: item.product_id },
            data: { stock: { decrement: item.quantity } }
          });
        }
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
          // 삭제할 때 각 아이템별로 (product_id, option_name) 쌍에 맞게 삭제
          for (const item of items) {
            await tx.cart_items.deleteMany({
              where: {
                cart_id: cart.id,
                product_id: item.product_id,
                option_name: item.option_name || null
              }
            });
          }
        }
      }

      // 5. Update Points
      if (used_points && used_points > 0) {
        // 포인트 사용
        await tx.users.update({
          where: { id: user.id },
          data: { points: { decrement: used_points } }
        });
        await tx.point_logs.create({
          data: {
            user_id: user.id,
            amount: -used_points,
            description: `주문(${merchant_uid}) 결제 시 포인트 사용`
          }
        });
      }

      // 6. 쿠폰 사용 처리
      if (used_coupon_id) {
        await tx.user_coupons.update({
          where: { id: used_coupon_id },
          data: {
            is_used: true,
            used_at: new Date()
          }
        });
      }

      // 구매 포인트 적립 (최종 결제 금액의 1%)
      const earnedPoints = Math.floor(amount * 0.01);
      if (earnedPoints > 0) {
        await tx.users.update({
          where: { id: user.id },
          data: { points: { increment: earnedPoints } }
        });
        await tx.point_logs.create({
          data: {
            user_id: user.id,
            amount: earnedPoints,
            description: `주문(${merchant_uid}) 구매 적립금 (1%)`
          }
        });
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
