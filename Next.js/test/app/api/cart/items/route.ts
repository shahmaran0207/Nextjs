import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "이메일이 제공되지 않았습니다." }, { status: 400 });
    }

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    const cart = await prisma.carts.findFirst({
      where: { user_id: user.id },
    });

    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    // Prisma에서 cart_items와 products 간의 relation이 명시되어 있지 않은 경우 수동으로 조인
    const cartItems = await prisma.cart_items.findMany({
      where: { cart_id: cart.id },
      orderBy: { created_at: 'desc' }
    });

    // product 정보 가져오기
    const productIds = cartItems.map(item => item.product_id);
    const products = await prisma.products.findMany({
      where: {
        id: { in: productIds }
      }
    });

    const productMap = new Map(products.map(p => [String(p.id), p]));

    const itemsWithProductInfo = cartItems.map(item => {
      const product = productMap.get(String(item.product_id));
      return {
        id: item.id,
        cart_id: item.cart_id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        product_name: product?.name || '알 수 없는 상품',
        product_image: product?.image_url || null,
        product_stock: product?.stock || 0,
        is_active: product?.is_active || false,
      };
    });

    return NextResponse.json({ items: itemsWithProductInfo });
  } catch (error: any) {
    console.error("Cart GET API Error:", error);
    return NextResponse.json({ error: "장바구니 정보를 불러오는데 실패했습니다." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get("itemId");
    const cartItemIds = searchParams.get("itemIds");
    const empty = searchParams.get("empty");
    const email = searchParams.get("email");

    if (empty === "true" && email) {
      const user = await prisma.users.findUnique({ where: { email } });
      if (user) {
        const cart = await prisma.carts.findFirst({ where: { user_id: user.id } });
        if (cart) {
          await prisma.cart_items.deleteMany({ where: { cart_id: cart.id } });
        }
      }
      return NextResponse.json({ success: true, message: "장바구니가 비워졌습니다." });
    }

    if (cartItemIds) {
      const ids = cartItemIds.split(",").map(Number);
      await prisma.cart_items.deleteMany({
        where: { id: { in: ids } }
      });
      return NextResponse.json({ success: true, message: "선택한 항목이 삭제되었습니다." });
    }

    if (!cartItemId) {
      return NextResponse.json({ error: "삭제할 아이템 ID가 필요합니다." }, { status: 400 });
    }

    await prisma.cart_items.delete({
      where: { id: Number(cartItemId) }
    });

    return NextResponse.json({ success: true, message: "장바구니에서 삭제되었습니다." });
  } catch (error: any) {
    console.error("Cart DELETE API Error:", error);
    return NextResponse.json({ error: "장바구니 아이템 삭제에 실패했습니다." }, { status: 500 });
  }
}
