import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: {params: Promise<{id: string}>}) {
    try {
        const { id } = await params;
        const formData = await request.formData();
        const title = formData.get("commentTitle") as string;
        const content = formData.get("commentContent") as string;
        const commentWriter = formData.get("writer") as string;

        await prisma.postcomment.create({
            data: {
                postid: Number(id),
                commenttitle: title,
                commentcontent: content,
                commentwriter: commentWriter
            }
        });

        return NextResponse.json({ result: "ok"});
    } catch(err: any) {
        console.log("댓글 추가 에러:::::::::::::::", err);
        return NextResponse.json({error: err.message}, { status: 500})
    }
}