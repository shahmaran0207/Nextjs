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
        const res = await prisma.answerlike.findFirst({
            where: { answerid: Number(id), userid: user.email }
        });

        return NextResponse.json(res);
    } catch (err: any) {
        console.error("getEachAnswerLike API Error::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
