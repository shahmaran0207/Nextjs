import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { name } = await request.json();

    try {
        const res = await prisma.answerhate.findFirst({
            where: { answerid: Number(id), userid: String(name) }
        });

        return NextResponse.json(res);
    } catch (err: any) {
        console.error("getEachAnswerHate API Error::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
