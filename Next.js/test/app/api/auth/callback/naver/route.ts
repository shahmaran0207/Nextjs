import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { linkAccountByEmail } from "../../../../../lib/accountLinker";
import { issueTokensForNaverLogin } from "../../../../../lib/jwtIssuer";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code) {
            const loginUrl = new URL("/Login", request.url);
            loginUrl.searchParams.set("error", "네이버 인증 코드가 없습니다");
            return NextResponse.redirect(loginUrl);
        }

        // 네이버 액세스 토큰 요청
        const tokenResponse = await fetch("https://nid.naver.com/oauth2.0/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                client_id: process.env.NAVER_CLIENT_ID!,
                client_secret: process.env.NAVER_CLIENT_SECRET!,
                code,
                redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/naver`,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            console.error("[NAVER TOKEN ERROR]", tokenData);
            const loginUrl = new URL("/Login", request.url);
            loginUrl.searchParams.set("error", "네이버 토큰 발급에 실패했습니다");
            return NextResponse.redirect(loginUrl);
        }

        // 네이버 사용자 정보 요청
        const profileResponse = await fetch("https://openapi.naver.com/v1/nid/me", {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });

        const profileData = await profileResponse.json();

        if (!profileData.response) {
            console.error("[NAVER PROFILE ERROR]", profileData);
            const loginUrl = new URL("/Login", request.url);
            loginUrl.searchParams.set("error", "네이버 프로필 정보를 가져올 수 없습니다");
            return NextResponse.redirect(loginUrl);
        }

        const naverId = profileData.response.id;
        const email = profileData.response.email;

        // 네이버 ID로 사용자 조회
        let user = await prisma.users.findFirst({
            where: { naver_id: naverId },
        });

        let linkErrorMessage = "연동된 계정이 없습니다. 먼저 회원가입을 진행해주세요";

        if (!user && email) {
            // 계정 연동 시도
            const linkResult = await linkAccountByEmail(naverId, email);
            if (linkResult.success && linkResult.user) {
                user = linkResult.user;
            } else if (linkResult.message) {
                linkErrorMessage = linkResult.message;
            }
        }

        if (!user) {
            const loginUrl = new URL("/Login", request.url);
            loginUrl.searchParams.set("error", linkErrorMessage);
            return NextResponse.redirect(loginUrl);
        }

        // JWT 토큰 발급
        const { accessToken, refreshToken } = await issueTokensForNaverLogin({
            userId: user.id,
            email: user.email!,
            role: user.ROLE!,
        });

        // 메인 페이지로 리다이렉트
        const homeUrl = new URL("/", request.url);
        homeUrl.searchParams.set("token", accessToken);
        const response = NextResponse.redirect(homeUrl);

        // 쿠키 설정
        response.cookies.set("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 15 * 60,
        });

        response.cookies.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 7 * 24 * 60 * 60,
        });

        return response;
    } catch (error) {
        console.error("[NAVER CALLBACK ERROR]", error);
        const loginUrl = new URL("/Login", request.url);
        loginUrl.searchParams.set("error", "네이버 로그인에 실패했습니다");
        return NextResponse.redirect(loginUrl);
    }
}