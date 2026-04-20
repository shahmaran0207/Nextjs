import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        // First, find the answer for this question
        const answer = await prisma.answer.findFirst({
            where: { questionid: Number(id) }
        });

        if (answer) {
            // Delete all hates for this answer
            await prisma.answerhate.deleteMany({
                where: { answerid: answer.id }
            });
        }

        return NextResponse.json({ result: "ok" });
    } catch (err: any) {
        console.error("removeAll Answer Hate API Error", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
