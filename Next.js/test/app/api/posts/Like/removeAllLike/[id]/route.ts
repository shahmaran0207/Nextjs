import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: {params: Promise<{id: string}>}) {
    const { id } = await params;

    try {
        await prisma.postlike.deleteMany({
            where: { postid: Number(id) }
        });

        return NextResponse.json({ result: "ok" });
    } catch(err: any) {
        console.error("게시글 좋아요 삭제 API 에러:::::", err);
        return NextResponse.json({error: err.message}, { status: 500})
    }
}