import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const email = request.headers.get("X-User-Email");

    if (!email) {
        return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
    }

    try {
        await prisma.commenthate.deleteMany({
            where: { commentid: Number(id), userid: email },
        });
        return NextResponse.json({ result: "ok" });
    } catch (err: any) {
        console.error("댓글 싫어요 제거 API 에러::::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}