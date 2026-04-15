import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{id: string}>}) {
    const { id } = await params;
    const name = new URL(request.url).searchParams.get("name");

    try {
        console.log("name:::::::::::", name)
        const res = await prisma.postlike.findMany({
            where: { postid: Number(id), userid: String(name)},
        });

        return NextResponse.json(res);
    } catch(err: any) {
        console.error("getPostLike API 에러:::::::::::", err);
        return NextResponse.json({status: 500});
    }
}