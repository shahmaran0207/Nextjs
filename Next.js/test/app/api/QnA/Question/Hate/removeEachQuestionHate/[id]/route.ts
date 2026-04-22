import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { email } = useAuthGuard();

    try {
        await prisma.questionhate.deleteMany({
            where: { questionid: Number(id), userid: email }
        });

        return NextResponse.json({ result: "ok" });
    } catch (err: any) {
        console.error("removeQuestion Hate API Error:::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}