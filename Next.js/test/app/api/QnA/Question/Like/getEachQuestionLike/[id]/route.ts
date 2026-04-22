import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const user = token ? verifyToken(token) as { email: string } | null : null;

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const res = await prisma.questionlike.findFirst({
            where: { questionid: Number(id), userid: user.email }
        });

        return NextResponse.json(res);
    } catch (err: any) {
        console.error("getQuestionLike API Error::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}