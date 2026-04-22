import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const user = token ? verifyToken(token) as { email: string } | null : null;

    if (!user) {
        return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
    }

    try {
        await prisma.postlike.deleteMany({
            where: { postid: Number(id), userid: user.email },
        });
        return NextResponse.json({ result: "ok" })
    } catch (err: any) {
        console.error("게시글 좋아요 제거 API 에러:::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}