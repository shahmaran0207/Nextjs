import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{id: string}>}) {
  const { id } = await params;

  try {
    const result = await prisma.commentlike.findMany({
      where: { commentid: Number(id) },
    });

    return NextResponse.json(result);
  } catch(err: any) {
    console.error("getCommentLike API Error:::::::::::", err);
    return NextResponse.json({ error: "서버 에러" }, { status: 500 });
  }
}