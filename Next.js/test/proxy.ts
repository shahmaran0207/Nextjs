import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/utils/auth";

export default function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // 보호된 라우트 패턴
    const protectedPaths = [
        "/api/post",
        "/api/qna",
        "/api/Comment",
        "/api/Chat",
        "/api/answer",
        "/api/postcomment",
        "/api/commentbycomment",
        "/api/postlike",
        "/api/questionlike",
        "/api/questionhate",
        "/api/answerlike",
        "/api/answerhate",
        "/api/posthate",
        "/api/commentlike",
        "/api/commenthate",
    ];

    // 공개 라우트 (인증 불필요)
    const publicPaths = [
        "/api/auth/Login",
        "/api/auth/Register",
        "/api/auth/refresh",
        "/api/auth/logout",
        "/api/auth/CheckDuplicate",
        "/api/airquality",
        "/api/traffic",
    ];

    // 공개 라우트는 통과
    if (publicPaths.some((p) => path.startsWith(p))) {
        return NextResponse.next();
    }

    // 보호된 라우트 검증
    if (protectedPaths.some((p) => path.startsWith(p))) {
        // Authorization 헤더에서 액세스 토큰 추출
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];

        if (!token) {
            console.error("[PROXY] No token provided for:", path);
            return NextResponse.json(
                { error: "Unauthorized: No token provided" },
                { status: 401 }
            );
        }

        // 액세스 토큰 검증
        const payload = verifyAccessToken(token);

        if (!payload) {
            console.error("[PROXY] Invalid or expired token for:", path);
            return NextResponse.json(
                { error: "Unauthorized: Invalid or expired token" },
                { status: 401 }
            );
        }

        // 검증된 사용자 정보를 헤더에 추가 (선택적)
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("X-User-Id", payload.id);
        requestHeaders.set("X-User-Email", payload.email);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    // 기타 라우트는 통과
    return NextResponse.next();
}

export const config = {
    matcher: "/api/:path*",
};
