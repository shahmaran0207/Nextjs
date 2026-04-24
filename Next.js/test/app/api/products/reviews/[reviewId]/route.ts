import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params;
    const { email, rating, content } = await req.json();

    if (!email || !rating || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existingReview = await prisma.product_reviews.findUnique({
      where: { id: Number(reviewId) }
    });

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (Number(existingReview.user_id) !== Number(user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const review = await prisma.product_reviews.update({
      where: { id: Number(reviewId) },
      data: {
        rating: Number(rating),
        content,
      }
    });

    return NextResponse.json(review);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params;
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existingReview = await prisma.product_reviews.findUnique({
      where: { id: Number(reviewId) }
    });

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (Number(existingReview.user_id) !== Number(user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.product_reviews.delete({
      where: { id: Number(reviewId) }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
