import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, product_id, quantity, unit_price } = body;

    if (!email || !product_id || !quantity || !unit_price) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
    }

    // 1. 사용자 찾기
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    // 2. 사용자의 장바구니 찾기 또는 생성
    let cart = await prisma.carts.findFirst({
      where: { user_id: user.id },
    });

    if (!cart) {
      cart = await prisma.carts.create({
        data: {
          user_id: user.id,
        },
      });
    }

    // 3. 장바구니 아이템 추가 또는 업데이트
    const existingCartItem = await prisma.cart_items.findFirst({
      where: {
        cart_id: cart.id,
        product_id: product_id,
      },
    });

    if (existingCartItem) {
      // 기존 수량에 더하기
      await prisma.cart_items.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: Number(existingCartItem.quantity) + Number(quantity),
          updated_at: new Date(),
        },
      });
    } else {
      // 새 아이템 생성
      await prisma.cart_items.create({
        data: {
          cart_id: cart.id,
          product_id: product_id,
          quantity: quantity,
          unit_price: unit_price,
        },
      });
    }

    return NextResponse.json({ success: true, message: "장바구니에 담겼습니다." });
  } catch (error: any) {
    console.error("Cart API Error:", error);
    return NextResponse.json({ error: "장바구니 담기에 실패했습니다." }, { status: 500 });
  }
}
