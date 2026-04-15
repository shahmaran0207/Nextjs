import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params } : { params: Promise<{id: string}>}) {
    const { id } = await params;

    try {
        await prisma.questionhate.deleteMany({
            where: { questionid: Number(id)}
        });

        return NextResponse.json({ result: "ok" });
    } catch ( err: any ) {
        console.error("removeAll Question Hate API Error:::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500});
    }
}