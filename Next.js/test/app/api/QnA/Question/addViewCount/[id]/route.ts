import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params } : { params: Promise<{id: string}>}) {
    const { id } = await params;
    
    try {
        await prisma.qna.update({
            where: { id: Number(id)},
            data: { qnaview: { increment: 1}},
        });

        return NextResponse.json({success: true});
    } catch(err: any) {
        console.error("QnA View Count API Error:::::::::::::::", err);
        return NextResponse.json({error: err.message }, { status: 500});
    }
}