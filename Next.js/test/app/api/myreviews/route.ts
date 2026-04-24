import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const reviews = await prisma.product_reviews.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' }
    });

    if (reviews.length === 0) {
      return NextResponse.json([]);
    }

    // 상품 정보 조회
    const productIds = [...new Set(reviews.map((r: any) => Number(r.product_id)))];
    const products = await prisma.products.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, image_data: true }
    });

    const productMap = new Map(products.map((p: any) => [Number(p.id), p]));

    const formattedReviews = reviews.map((r: any) => {
      const p = productMap.get(Number(r.product_id));
      return {
        id: r.id,
        product_id: Number(r.product_id),
        rating: r.rating,
        content: r.content,
        created_at: r.created_at,
        product: p ? { id: p.id, name: p.name, has_image: !!p.image_data } : null
      };
    });

    return NextResponse.json(formattedReviews);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
