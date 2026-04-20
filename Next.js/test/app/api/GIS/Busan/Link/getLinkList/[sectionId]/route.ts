import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ sectionId: string }> }) {
    try {
        const { sectionId } = await params;
        const sectionIdNum = Number(sectionId);
        const result = await prisma.link.findMany({
            where: { sectionid: sectionIdNum },
            orderBy: { seq: "asc" }
        });

        return NextResponse.json(result);
    } catch(err: any) {
        console.error("링크 리스트 조회 API 에러::::::::::::", err)
        return NextResponse.json({ error: err.message}, { status: 500});
    }
}
