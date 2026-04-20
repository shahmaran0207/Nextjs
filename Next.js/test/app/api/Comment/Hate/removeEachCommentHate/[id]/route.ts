import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params } : {params: Promise<{id: string}>}) {
    const { id } = await params;
    const name = new URL(request.url).searchParams.get("name");

    try {
        await prisma.commenthate.deleteMany({
            where: { commentid: Number(id), userid: String(name)},
        });
        return NextResponse.json({ result: "ok"});
    } catch(err: any) {
        console.error("댓글 싫어요 제거 API 에러::::::::::::::", err);
        return NextResponse.json({error: err.message}, { status: 500});
    }
}