import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const user = token ? verifyToken(token) as { email: string } | null : null;

    if (!user) {
        return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
    }

    try {
        const res = await prisma.commentlike.findMany({
            where: { commentid: Number(id), userid: user.email }
        });

        return NextResponse.json(res);
    } catch (err: any) {
        console.error("getCommentLike API Error::::::::::::", err);
        return NextResponse.json({ status: 500 })
    }
}