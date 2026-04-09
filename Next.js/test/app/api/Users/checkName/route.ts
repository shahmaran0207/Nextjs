import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    const name = request.nextUrl.searchParams.get("name");

    try {
        const result = await prisma.users.findFirst({
            where: { name: String(name)},
        });

        if(!result) {
            return NextResponse.json({error: "Not fount"}, { status: 500})
        };

        return NextResponse.json({exists: !!result});
    } catch(err: any) {
        console.log("닉네임 중복 체크 API 에러:::::::::::", err);
        return NextResponse.json({error: err.message}, { status: 500});
    }
}