import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params } : { params: Promise<{id: string}>}) {
    try {
        const { id } = await params;
        const formData = await request.formData();
        const title = formData.get("replyTitle") as string;
        const content = formData.get("replyContent") as string;
        const upperCommentId = formData.get("upperCommentId") as string;

        await prisma.commentbycomment.create({
            data: {
                postid: Number(id),
                commenttitle: title,
                commentcontent: content,
                upprcommentid: Number(upperCommentId)
            }
        });

        return NextResponse.json({ result: "ok"});
    } catch (err: any) {
        console.log("addReplyComment API Error:::::::::::", err);
        return NextResponse.json({error: err.message}, { status: 500});
    }
}