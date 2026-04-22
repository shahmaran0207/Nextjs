import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const formData = await request.formData();
        const title = formData.get("replyTitle") as string;
        const content = formData.get("replyContent") as string;
        const upperCommentId = formData.get("upperCommentId") as string;
        const token = request.headers.get("Authorization")?.split(" ")[1];
        const user = token ? verifyToken(token) as { email: string } | null : null;

        if (!user) {
            return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
        }

        await prisma.commentbycomment.create({
            data: {
                postid: Number(id),
                commenttitle: title,
                commentcontent: content,
                upprcommentid: Number(upperCommentId),
                commentwriter: user.email
            }
        });

        return NextResponse.json({ result: "ok" });
    } catch (err: any) {
        console.error("addReplyComment API Error:::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}