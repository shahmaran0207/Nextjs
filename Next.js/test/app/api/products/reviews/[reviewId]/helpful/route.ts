import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/utils/auth";
import { cookies } from "next/headers";

// 투표 추가
export async function POST(req: Request, { params }: { params: Promise<{ reviewId: string }> }) {
  const { reviewId } = await params;
  try {
    let token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("accessToken")?.value;
    }
    const payload = token ? verifyAccessToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.review_helpful.create({
      data: { review_id: Number(reviewId), user_id: Number(payload.id) },
    });

    const count = await prisma.review_helpful.count({ where: { review_id: Number(reviewId) } });
    return NextResponse.json({ success: true, count });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "이미 도움이 됐다고 표시하셨습니다." }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 투표 취소
export async function DELETE(req: Request, { params }: { params: Promise<{ reviewId: string }> }) {
  const { reviewId } = await params;
  try {
    let token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("accessToken")?.value;
    }
    const payload = token ? verifyAccessToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.review_helpful.deleteMany({
      where: { review_id: Number(reviewId), user_id: Number(payload.id) },
    });

    const count = await prisma.review_helpful.count({ where: { review_id: Number(reviewId) } });
    return NextResponse.json({ success: true, count });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
