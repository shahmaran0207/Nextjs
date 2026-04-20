import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const res = await prisma.answerhate.findMany({
            where: { answerid: Number(id) }
        });

        return NextResponse.json(res);
    } catch (err: any) {
        console.error("getEachHate API Error::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}