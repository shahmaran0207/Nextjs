import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params } : { params: Promise<{id: string}>}) {
    const { id } = await params;

    try {
        await prisma.questionlike.deleteMany({
            where: { questionid: Number(id)}
        });

        return NextResponse.json({ result: "ok"});
    } catch (err: any) {
        console.error("removeAll Question Like API Error", err);
        return NextResponse.json({ error: err.message}, { status: 500});
    }
}