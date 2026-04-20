import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params } : { params: Promise<{id: string}>}) {
    const { id } = await params;

    try {
        await prisma.qna.update({
            where: { id: Number(id)},
            data: {
                isend: 1
            },
        });
        return NextResponse.json({ success: true})
    } catch (err: any) {
        console.error("QnA 답변상태 업데이트 API 에러:::::::::::::::::", err);
        return NextResponse.json({error: err.message}, { status: 500})
    }
}