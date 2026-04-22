import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const formData = await request.formData();
        const title = formData.get("replyTitle") as string;
        const content = formData.get("replyContent") as string;
        const upperCommentId = formData.get("upperCommentId") as string;
        const email = request.headers.get("X-User-Email");

        if (!email) {
            return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
        }

        await prisma.commentbycomment.create({
            data: {
                postid: Number(id),
                commenttitle: title,
                commentcontent: content,
                upprcommentid: Number(upperCommentId),
                commentwriter: email
            }
        });

        return NextResponse.json({ result: "ok" });
    } catch (err: any) {
        console.error("addReplyComment API Error:::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}