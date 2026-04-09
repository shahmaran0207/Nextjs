import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const result = await prisma.road.findMany({
            orderBy: { id: "desc"},
        });

        return NextResponse.json(result);
    } catch (err: any) {
        console.log("도로 리스트 조회 API 에러:::::::::::::", err);
        return NextResponse.json({ error: err.message}, { status: 500})
    }
}
