import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: {params: Promise<{commentId: string}>}) {
    const { commentId } = await params;

    try{
        await prisma.postcomment.delete({
            where: { id: Number(commentId)},
        });

        return NextResponse.json({ result: "ok" });
    } catch(err: any) {
        console.error("댓글 삭제 API 에러:::::::::::::", err);
        return NextResponse.json({error: err.message}, { status: 500});
    }
}