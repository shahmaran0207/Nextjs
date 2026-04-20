import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params } : { params: Promise<{id: string}>}) {
    const { id } = await params;

    try {
        await prisma.qna.update({
            where: { id: Number(id)},
            data: { isend: 0},
        });

        return NextResponse.json({ success: true});
    } catch (err: any) {
        console.error("QnA 답변 삭제 - QnA  테이블 상태변환 API 에러::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500});
    }
}