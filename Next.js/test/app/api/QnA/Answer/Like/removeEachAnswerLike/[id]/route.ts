import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { name } = await request.json();

    try {
        await prisma.answerlike.deleteMany({
            where: { answerid: Number(id), userid: String(name) }
        });

        return NextResponse.json({ result: "ok" });
    } catch (err: any) {
        console.error("removeEach Answer Like API Error", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
