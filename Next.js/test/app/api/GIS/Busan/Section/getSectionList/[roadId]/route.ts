import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ roadId: string }> }) {
    const { roadId } = await params;

    try {
        const result = await prisma.section.findMany({
            where: { roadid: Number(roadId) },
            orderBy: { id: "desc" }
        });

        if (!result) {
            return NextResponse.json({ error: "Not found" }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (err: any) {
        console.error("구역 리스트 - 도로 리스트 조회 API 에러::::::", err)
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}