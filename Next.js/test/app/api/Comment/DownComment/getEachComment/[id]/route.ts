import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params } : { params: Promise<{id: string}>}) {
    const { id } = await params;
    
    try {
        const result = await prisma.commentbycomment.findMany({
            where: { postid: Number(id)},
        });

        return NextResponse.json(result);
    } catch(err: any) {
        console.error("대댓글 조회 API 에러:::::::::::", err)
        return NextResponse.json({error: err.message}, { status: 500})
    }
    
}