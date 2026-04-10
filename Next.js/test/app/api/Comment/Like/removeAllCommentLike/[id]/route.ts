import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params } : { params: Promise<{id: string}>}) {
    const { id } = await params;

    try{
        await prisma.commentlike.deleteMany({
            where: { postid: Number(id)},
        });
        return NextResponse.json({ result: "ok"});
    } catch(err: any ) {
        console.error("댓글 좋아요 전체 삭제 API 에러:::::::::::", err);
        return NextResponse.json({ error: err.message}, { status: 500})
    }
}