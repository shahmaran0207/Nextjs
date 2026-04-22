import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { email } = useAuthGuard();
    const postId = new URL(request.url).searchParams.get("postId");

    try {
        await prisma.commenthate.create({
            data: {
                postid: Number(postId),
                userid: email,
                commentid: Number(id)
            }
        })

        return NextResponse.json({ result: "ok" });
    } catch (err: any) {
        console.error("commentHate Add API Error:::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}