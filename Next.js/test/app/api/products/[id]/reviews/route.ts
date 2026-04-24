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
      created_at: r.created_at,
      author: userMap.get(Number(r.user_id)) || "익명"
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
    const { email, rating, content } = await req.json();

    if (!email || !rating || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const review = await prisma.product_reviews.create({
      data: {
        user_id: user.id,
        product_id: Number(id),
        rating: Number(rating),
        content,
      }
    });

    return NextResponse.json(review);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
