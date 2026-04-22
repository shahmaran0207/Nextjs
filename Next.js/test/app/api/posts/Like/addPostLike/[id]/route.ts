import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { email } = useAuthGuard();

    try {
        await prisma.postlike.create({
            data: {
                postid: Number(id),
                userid: email
            },
        });

        return NextResponse.json({ result: "ok" });
    } catch (err: any) {
        console.error("좋아요 추가 API 에러::::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}