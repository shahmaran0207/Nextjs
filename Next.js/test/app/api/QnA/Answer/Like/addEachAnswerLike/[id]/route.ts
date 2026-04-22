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
        await prisma.answerlike.create({
            data: {
                answerid: Number(id),
                userid: user.email,
                questionid: 0  // placeholder, will be updated if needed
            }
        });

        return NextResponse.json({ result: "ok" });
    } catch (err: any) {
        console.error("Answer Like Add API Error::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
