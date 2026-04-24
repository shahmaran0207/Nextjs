import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviews = await prisma.product_reviews.findMany({
      where: { product_id: Number(id) },
      orderBy: { created_at: "desc" }
    });
    
    // 이메일을 표시하기 위해 user 정보 조인 (단순화를 위해 매뉴얼 조인)
    const userIds = reviews.map((r: any) => r.user_id);
    const users = await prisma.users.findMany({
      where: { id: { in: userIds } }
    });
    const userMap = new Map(users.map(u => [Number(u.id), u.email || u.name || "익명"]));
    
    const formattedReviews = reviews.map((r: any) => ({
      id: r.id,
      rating: r.rating,
      content: r.content,
      has_image: !!r.image_data,
      created_at: r.created_at,
      author: userMap.get(Number(r.user_id)) || "익명",
      authorEmail: users.find(u => Number(u.id) === Number(r.user_id))?.email || ""
    }));

    return NextResponse.json(formattedReviews);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    
    const email = formData.get("email") as string;
    const rating = formData.get("rating") as string;
    const content = formData.get("content") as string;
    const image = formData.get("image") as File | null;

    if (!email || !rating || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 내가 등록한 상품인지 확인
    const product = await prisma.products.findUnique({
      where: { id: Number(id) }
    });
    if (product && (product as any).seller_id === user.id) {
      return NextResponse.json({ error: "본인이 등록한 상품에는 리뷰를 남길 수 없습니다." }, { status: 403 });
    }

    // 실제 구매 여부 서버단 확인 (PAID 등 결제 완료 주문)
    const paidOrders = await prisma.orders.findMany({
      where: {
        user_id: user.id,
        order_status: { in: ["PAID", "COMPLETED", "SHIPPED", "DELIVERED"] }
      },
      select: { id: true }
    });
    
    let purchasedOrderCount = 0;
    if (paidOrders.length > 0) {
      const orderItems = await prisma.order_items.findMany({
        where: {
          product_id: Number(id),
          order_id: { in: paidOrders.map(o => o.id) }
        }
      });
      // 중복 주문(동일 주문 내 여러 수량)을 1건으로 처리
      const distinctOrders = new Set(orderItems.map(item => item.order_id));
      purchasedOrderCount = distinctOrders.size;
    }

    if (purchasedOrderCount === 0) {
      return NextResponse.json({ error: "구매한 상품만 리뷰를 작성할 수 있습니다." }, { status: 403 });
    }

    const existingReviewsCount = await prisma.product_reviews.count({
      where: {
        user_id: user.id,
        product_id: Number(id)
      }
    });

    if (existingReviewsCount >= purchasedOrderCount) {
      return NextResponse.json({ error: `주문 1건당 1개의 리뷰만 작성 가능합니다. (주문 건수: ${purchasedOrderCount}, 작성 리뷰: ${existingReviewsCount})` }, { status: 403 });
    }
    let imageData = null;
    let imageType = null;
    if (image) {
      const arrayBuffer = await image.arrayBuffer();
      imageData = Buffer.from(arrayBuffer);
      imageType = image.type;
    }

    const review = await prisma.product_reviews.create({
      data: {
        user_id: user.id,
        product_id: Number(id),
        rating: Number(rating),
        content,
        image_data: imageData,
        image_type: imageType
      }
    });

    return NextResponse.json(review);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
