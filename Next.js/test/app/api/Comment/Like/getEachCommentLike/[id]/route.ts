import { NextResponse } from "next/server";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { email } = useAuthGuard();

    try {
        const res = await prisma.commentlike.findMany({
            where: { commentid: Number(id), userid: email }
        });

        return NextResponse.json(res);
    } catch (err: any) {
        console.error("getCommentLike API Error::::::::::::", err);
        return NextResponse.json({ status: 500 })
    }
}