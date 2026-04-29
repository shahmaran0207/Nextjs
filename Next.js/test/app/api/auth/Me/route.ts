import { verifyAccessToken } from "@/utils/auth";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    // Authorization 헤더에서 토큰 확인
    let token = request.headers.get("Authorization")?.split(" ")[1];

    // 헤더에 없으면 쿠키에서 확인
    if (!token) {
        const cookieStore = await cookies();
        token = cookieStore.get("accessToken")?.value;
    }

    const payload = token ? verifyAccessToken(token) : null;

    if (!payload) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const dbUser = await prisma.users.findUnique({
        where: { id: Number(payload.id) },
        select: { name: true, naver_id: true, points: true, wallet_address: true },
    });

    return new Response(
        JSON.stringify({
            id: payload.id,
            email: payload.email,
            role: payload.role,
            name: dbUser?.name ?? null,
            naver_id: dbUser?.naver_id ?? null,
            points: dbUser?.points ?? 0,
            wallet_address: dbUser?.wallet_address ?? null,
        }),
        {
            headers: { "Content-Type": "application/json" },
        }
    );
};