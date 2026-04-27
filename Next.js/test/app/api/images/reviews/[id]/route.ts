import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    const review = await prisma.product_reviews.findUnique({
      where: { id: Number(id) },
      select: { image_data: true, image_type: true }
    });

    if (!review || !review.image_data) {
      return new NextResponse("Image not found", { status: 404 });
    }

    // ✅ Uint8Array → ArrayBuffer로 변환
    const buffer = Buffer.from(review.image_data);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": review.image_type || "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("Review Image GET Error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}