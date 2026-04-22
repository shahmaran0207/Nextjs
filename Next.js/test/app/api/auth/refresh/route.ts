import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "@/utils/auth";
import {
    verifyRefreshToken as verifyRefreshTokenInDB,
    revokeRefreshToken,
    saveRefreshToken,
    detectTokenReuse,
    revokeAllUserTokens,
} from "@/lib/tokenStore";

export async function POST(request: Request) {
    try {
        // 1. 쿠키에서 리프레시 토큰 추출
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get("refreshToken")?.value;

        if (!refreshToken) {
            console.error("[REFRESH ERROR] No refresh token in cookie");
            return NextResponse.json(
                { error: "Unauthorized: No refresh token provided" },
                { status: 401 }
            );
        }

        // 2. JWT 검증
        const payload = verifyRefreshToken(refreshToken);

        if (!payload) {
            console.error("[REFRESH ERROR] Invalid refresh token signature");
            return NextResponse.json(
                { error: "Unauthorized: Invalid or expired token" },
                { status: 401 }
            );
        }

        // 3. 토큰 재사용 감지
        const isReused = await detectTokenReuse(refreshToken);

        if (isReused) {
            console.error("[SECURITY] Token reuse detected for user:", payload.id);
            // 보안 위협: 해당 사용자의 모든 토큰 무효화
            await revokeAllUserTokens(payload.id);
            return NextResponse.json(
                { error: "Unauthorized: Please log in again" },
                { status: 401 }
            );
        }

        // 4. 데이터베이스에서 토큰 검증
        const isValid = await verifyRefreshTokenInDB(payload.id, refreshToken);

        if (!isValid) {
            console.error("[REFRESH ERROR] Token not found in database");
            return NextResponse.json(
                { error: "Unauthorized: Invalid or expired token" },
                { status: 401 }
            );
        }

        // 5. 이전 리프레시 토큰 삭제 (토큰 로테이션)
        await revokeRefreshToken(refreshToken);

        // 6. 새로운 액세스 토큰 생성
        const newAccessToken = generateAccessToken({
            id: payload.id,
            email: "", // 리프레시 토큰에는 이메일이 없으므로 빈 문자열
        });

        // 7. 새로운 리프레시 토큰 생성
        const newRefreshToken = generateRefreshToken({
            id: payload.id,
            tokenVersion: payload.tokenVersion,
        });

        // 8. 새 리프레시 토큰을 데이터베이스에 저장
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일 후
        await saveRefreshToken(payload.id, newRefreshToken, expiresAt);

        // 9. 응답 생성
        const response = NextResponse.json(
            { accessToken: newAccessToken },
            { status: 200 }
        );

        // 10. 새 리프레시 토큰을 HttpOnly 쿠키로 설정
        response.cookies.set("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7일 (초 단위)
        });

        return response;

    } catch (error) {
        console.error("[REFRESH ERROR]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
