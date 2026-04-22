import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { email } = useAuthGuard();

    try {
        const res = await prisma.questionhate.findFirst({
            where: { questionid: Number(id), userid: email }
        });

        return NextResponse.json(res);
    } catch (err: any) {
        console.error("getQuetsionHate API Error::::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}