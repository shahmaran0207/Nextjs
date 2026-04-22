import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const email = request.headers.get("X-User-Email");

    if (!email) {
        return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
    }

    try {
        const res = await prisma.postlike.findMany({
            where: { postid: Number(id), userid: email },
        });

        return NextResponse.json(res);
    } catch (err: any) {
        console.error("getPostLike API 에러:::::::::::", err);
        return NextResponse.json({ status: 500 });
    }
}