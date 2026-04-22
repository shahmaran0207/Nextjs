import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const email = request.headers.get("X-User-Email");

    if (!email) {
        return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
    }

    try {
        await prisma.posthate.create({
            data: {
                postid: Number(id),
                userid: email
            },
        });

        return NextResponse.json({ reuslt: "ok" });
    } catch (err: any) {
        console.error("싫어요 추가 API 에러:::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}