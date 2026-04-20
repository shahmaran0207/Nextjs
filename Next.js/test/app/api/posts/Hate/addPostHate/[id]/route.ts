import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params } : { params: Promise<{id: string}>}) {
    const { id } = await params;
    const name = new URL(request.url).searchParams.get("name");

    try {
        await prisma.posthate.create({
            data: {
                postid: Number(id),
                userid: name
            },
        });

        return NextResponse.json({ reuslt: "ok"});
    } catch(err: any) {
        console.error("싫어요 추가 API 에러:::::::::::::", err);
        return NextResponse.json({ error: err.message}, { status: 500})
    }
}