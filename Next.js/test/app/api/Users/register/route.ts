import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    const session = await auth();
    const { name } = await request.json();

    const naverId = (session?.user as any)?.naverid;
    if (!naverId) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

    try {
        const dupCheck = await prisma.users.findFirst({
            where: { name: String(name)},
        });

        if(dupCheck) {
            return NextResponse.json({error: "이미 사용중인 닉네임입니다."}, { status: 500});
        };

        await prisma.users.create({
            data: {
                naver_id: naverId,
                name: String(name),
            },
        });

        return NextResponse.json({ ok: true});
    } catch(err: any) {
        console.log("계정 등록 API 에러:::::::", err);
        return NextResponse.json({ error: err.message}, { status: 500});
    }
    
}
