import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{id: string}>}) {

    const { id } = await params;
    const name = new URL(request.url).searchParams.get("name");
    const postId = new URL(request.url).searchParams.get("postId");

    try{
        await prisma.commentlike.create({
            data: {
                postid: Number(postId),
                userid: name,
                commentid: Number(id)
            }
        })

        return NextResponse.json({ result: "ok"});
    } catch(err: any) {
        console.error("commentLike Add API Error:::::::::::", err);
        return NextResponse.json({error: err.message}, { status: 500})
    }
}