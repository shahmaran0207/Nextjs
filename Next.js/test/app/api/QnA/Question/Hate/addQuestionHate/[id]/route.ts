import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params } : { params: Promise<{id: string}>}) {
    const { id } = await params;
    const name = new URL(request.url).searchParams.get("name");

    try {
        await prisma.questionhate.create({
            data: {
                questionid: Number(id),
                userid: String(name)
            }
        });

        return NextResponse.json({ result: "ok" })
    } catch ( err: any ) {
        console.error("Question hate Add API Error:::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500})
    }
}