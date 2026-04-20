import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params } : { params: Promise<{ id: string}>}) {
    const { id } = await params;
    const name = new URL(request.url).searchParams.get("name");

    try {
        const res = await prisma.questionhate.findFirst({
            where: { questionid: Number(id), userid: String(name)}
        });

        return NextResponse.json(res);
    } catch (err: any) {
        console.error("getQuetsionHate API Error::::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500})
    }
}