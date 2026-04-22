import { verifyToken } from "@/utils/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {

    const { id } = await params;
    const postId = new URL(request.url).searchParams.get("postId");
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const user = token ? verifyToken(token) as { email: string } | null : null;

    if (!user) {
        return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
    }

    try {
        await prisma.commentlike.create({
            data: {
                postid: Number(postId),
                userid: user.email,
                commentid: Number(id)
            }
        })

        return NextResponse.json({ result: "ok" });
    } catch (err: any) {
        console.error("commentLike Add API Error:::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}