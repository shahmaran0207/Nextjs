import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const email = request.headers.get("X-User-Email");

    if (!email) {
        return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
    }

    try {
        await prisma.questionhate.create({
            data: {
                questionid: Number(id),
                userid: email
            }
        });

        return NextResponse.json({ result: "ok" })
    } catch (err: any) {
        console.error("Question hate Add API Error:::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}