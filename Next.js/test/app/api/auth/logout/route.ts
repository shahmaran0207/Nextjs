import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revokeRefreshToken } from "@/lib/tokenStore";

export async function POST(request: Request) {
    try {
        // 1. 쿠키에서 리프레시 토큰 추출
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get("refreshToken")?.value;

        // 2. 리프레시 토큰이 있으면 데이터베이스에서 삭제
        if (refreshToken) {
            await revokeRefreshToken(refreshToken);
        }

        // 3. 응답 생성
        const response = NextResponse.json(
            { message: "Logged out successfully" },
            { status: 200 }
        );

        // 4. 액세스 토큰 쿠키 만료
        response.cookies.set("accessToken", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 0, // 즉시 만료
        });

        // 5. 리프레시 토큰 쿠키 만료
        response.cookies.set("refreshToken", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 0, // 즉시 만료
        });

        return response;

    } catch (error) {
        console.error("[LOGOUT ERROR]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
