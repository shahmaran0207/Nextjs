import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { email } = useAuthGuard();

    try {
        const res = await prisma.postlike.findMany({
            where: { postid: Number(id), userid: email },
        });

        return NextResponse.json(res);
    } catch (err: any) {
        console.error("getPostLike API 에러:::::::::::", err);
        return NextResponse.json({ status: 500 });
    }
}