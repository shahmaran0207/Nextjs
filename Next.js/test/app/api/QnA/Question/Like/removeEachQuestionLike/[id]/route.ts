import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const user = token ? verifyToken(token) as { email: string } | null : null;

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await prisma.questionlike.deleteMany({
            where: { questionid: Number(id), userid: user.email }
        });

        return NextResponse.json({ result: "ok" });
    } catch (err: any) {
        console.error("Remove Questoin Like API Error::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}