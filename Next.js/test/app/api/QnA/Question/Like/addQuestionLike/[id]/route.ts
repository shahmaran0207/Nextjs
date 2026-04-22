import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const email = request.headers.get("X-User-Email");

    if (!email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await prisma.questionlike.create({
            data: {
                questionid: Number(id),
                userid: email
            }
        });

        return NextResponse.json({ result: "ok" })
    } catch (err: any) {
        console.error("Question Like Add API Error::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    };
}