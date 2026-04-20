import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request:Request) {
    try{
        const { sectionName, roadId } = await request.json();

        await prisma.section.create({
            data: {
                roadid: roadId,
                sectionname: sectionName
            },
        });

        return NextResponse.json({result: "ok"});
    } catch(err: any) {
        console.error("구역 리스트 조회 API 에러::::::::::::", err);
        return NextResponse.json({error: err.message}, { status: 500});
    }
}