import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(request: Request, { params }: { params:Promise<{id: string}>}) {
    const { id } = await params;

    try {
        const result = await prisma.postlike.findMany({
            where: { postid: Number(id)},
        });

        return NextResponse.json(result);
    } catch(err: any) {
        console.error("getPostLike API 에러")
        return NextResponse.json({status: 500})
    } 
}