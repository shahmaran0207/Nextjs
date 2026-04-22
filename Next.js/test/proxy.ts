import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/utils/auth";

export default function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // 관리자 전용 페이지 (ROLE: ADMIN 필수)
    const adminPages = ["/ADMIN"];

    // 관리자 전용 API (ROLE: ADMIN 필수)
    const adminApis = ["/api/admin"];

    // 보호된 라우트 패턴 (인증 필요, ROLE 무관)
    const protectedPaths = [
        "/api/post",
        "/api/posts",
        "/api/qna",
        "/api/QnA",       // 대문자 경로 추가
        "/api/Comment",
        "/api/Chat",
        "/api/answer",
        "/api/Answer",    // 대문자 경로 추가
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

    // 관리자 페이지 접근 검증
    if (adminPages.some((p) => path.startsWith(p))) {
        const token = request.cookies.get("accessToken")?.value;

        if (!token) {
            console.error("[PROXY] No token for admin page:", path);
            return NextResponse.redirect(new URL("/Login", request.url));
        }

        const payload = verifyAccessToken(token);

        if (!payload) {
            console.error("[PROXY] Invalid token for admin page:", path);
            return NextResponse.redirect(new URL("/Login", request.url));
        }

        if (payload.role !== "ADMIN") {
            console.error("[PROXY] Access denied - not admin:", payload.email);
            return NextResponse.redirect(new URL("/forbidden", request.url));
        }

        console.log("[PROXY] Admin page access granted:", payload.email);
        return NextResponse.next();
    }

    // 관리자 API 접근 검증
    if (adminApis.some((p) => path.startsWith(p))) {
        let token = request.cookies.get("accessToken")?.value;

        if (!token) {
            const authHeader = request.headers.get("Authorization");
            token = authHeader?.split(" ")[1];
        }

        if (!token) {
            console.error("[PROXY] No token for admin API:", path);
            return NextResponse.json(
                { error: "Unauthorized: No token provided" },
                { status: 401 }
            );
        }

        const payload = verifyAccessToken(token);

        if (!payload) {
            console.error("[PROXY] Invalid token for admin API:", path);
            return NextResponse.json(
                { error: "Unauthorized: Invalid or expired token" },
                { status: 401 }
            );
        }

        if (payload.role !== "ADMIN") {
            console.error("[PROXY] Access denied - not admin:", payload.email);
            return NextResponse.json(
                { error: "Forbidden: Admin access required" },
                { status: 403 }
            );
        }

        console.log("[PROXY] Admin API access granted:", payload.email);
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("X-User-Id", payload.id);
        requestHeaders.set("X-User-Email", payload.email);
        requestHeaders.set("X-User-Role", payload.role);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    // 보호된 라우트 검증 (일반 인증)
    if (protectedPaths.some((p) => path.startsWith(p))) {
        let token = request.cookies.get("accessToken")?.value;

        if (!token) {
            const authHeader = request.headers.get("Authorization");
            token = authHeader?.split(" ")[1];
        }

        if (!token) {
            console.error("[PROXY] No token provided for:", path);
            return NextResponse.json(
                { error: "Unauthorized: No token provided" },
                { status: 401 }
            );
        }

        const payload = verifyAccessToken(token);

        if (!payload) {
            console.error("[PROXY] Invalid or expired token for:", path);
            return NextResponse.json(
                { error: "Unauthorized: Invalid or expired token" },
                { status: 401 }
            );
        }

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("X-User-Id", payload.id);
        requestHeaders.set("X-User-Email", payload.email);
        requestHeaders.set("X-User-Role", payload.role);

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
    matcher: ["/api/:path*", "/ADMIN/:path*"],
};
