import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const email = request.headers.get("X-User-Email");

    if (!email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const res = await prisma.questionlike.findFirst({
            where: { questionid: Number(id), userid: email }
        });

        return NextResponse.json(res);
    } catch (err: any) {
        console.error("getQuestionLike API Error::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}