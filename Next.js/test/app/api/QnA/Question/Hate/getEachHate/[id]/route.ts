import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const res = await prisma.questionhate.findMany({
            where: { questionid: Number(id) }
        })

        return NextResponse.json(res);
    } catch (err: any) {
        console.error("getQuestionHate API Error::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
} 