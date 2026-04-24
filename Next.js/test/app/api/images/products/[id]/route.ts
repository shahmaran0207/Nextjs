import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.products.findUnique({
      where: { id: Number(id) },
      select: {
        image_data: true,
        image_type: true
      }
    });

    if (!product || !(product as any).image_data) {
      // 1x1 투명 픽셀 반환 또는 404
      return new NextResponse(null, { status: 404 });
    }

    // Bytes 필드는 Buffer로 반환됨
    const buffer = (product as any).image_data;
    const contentType = (product as any).image_type || "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable" // 캐싱 추가 (하루)
      }
    });
  } catch (err: any) {
    console.error("Image serve error:", err);
    return new NextResponse(null, { status: 500 });
  }
}
