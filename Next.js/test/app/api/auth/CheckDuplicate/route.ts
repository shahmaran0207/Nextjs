import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/auth/CheckDuplicate?field=name&value=홍길동
// GET /api/auth/CheckDuplicate?field=email&value=test@test.com
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const field = searchParams.get("field");
        const value = searchParams.get("value");

        if (!field || !value) {
            return NextResponse.json({ err: "field, value 파라미터가 필요합니다." }, { status: 400 });
        }

        if (field === "name") {
            // 이름 중복 확인
            const existing = await prisma.users.findFirst({ where: { name: value } });
            return NextResponse.json({ isDuplicate: !!existing });
        }

        if (field === "email") {
            // 이메일 중복 확인
            const existing = await prisma.users.findFirst({ where: { email: value } });
            return NextResponse.json({ isDuplicate: !!existing });
        }

        return NextResponse.json({ err: "field는 name 또는 email이어야 합니다." }, { status: 400 });

    } catch (err: any) {
        console.error("CheckDuplicate API Error:::::::::::::::", err);
        return NextResponse.json({ err: err.message }, { status: 500 });
    }
}
