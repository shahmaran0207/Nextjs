import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/Chat/getUsers?excludeEmail=xxx@xxx.com
 * 자신(excludeEmail)을 제외한 모든 users 반환
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const excludeEmail = searchParams.get("excludeEmail");

    if (!excludeEmail) {
        return NextResponse.json({ error: "excludeEmail 파라미터가 없습니다." }, { status: 400 });
    }

    try {
        const users = await prisma.users.findMany({
            where: {
                email: {
                    not: excludeEmail,
                },
            },
            select: {
                email: true,
                name: true,
            },
            orderBy: { name: "asc" },
        });

        return NextResponse.json(users);
    } catch (err: any) {
        console.error("유저 목록 조회 에러::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
