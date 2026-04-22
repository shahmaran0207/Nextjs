import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { email } = useAuthGuard();

    try {
        await prisma.questionlike.create({
            data: {
                questionid: Number(id),
                userid: email
            }
        });

        return NextResponse.json({ result: "ok" })
    } catch (err: any) {
        console.error("Question Like Add API Error::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    };
}