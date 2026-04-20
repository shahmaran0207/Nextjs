import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params } : { params: Promise<{id: string}>}) {
    const { id } = await params;

    try {
        await prisma.qna.delete({
            where: { id: Number(id)}
        });

        return NextResponse.json({ result: "ok" });
    } catch (err: any) {
        console.error("Question Delete API Error:::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500});
    }
}