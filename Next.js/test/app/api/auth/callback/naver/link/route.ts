import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code) {
            const settingsUrl = new URL("/settings", request.url);
            settingsUrl.searchParams.set("error", "네이버 인증 코드가 없습니다");
            return NextResponse.redirect(settingsUrl);
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
                redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/naver/link`,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            console.error("[NAVER TOKEN ERROR]", tokenData);
            const settingsUrl = new URL("/settings", request.url);
            settingsUrl.searchParams.set("error", "네이버 토큰 발급에 실패했습니다");
            return NextResponse.redirect(settingsUrl);
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
            const settingsUrl = new URL("/settings", request.url);
            settingsUrl.searchParams.set("error", "네이버 프로필 정보를 가져올 수 없습니다");
            return NextResponse.redirect(settingsUrl);
        }

        const naverId = profileData.response.id;
        const userId = parseInt(state!); // state에서 사용자 ID 가져오기
        
        console.log("[NAVER LINK DEBUG] 사용자 정보:", { naverId, userId });

        if (!userId || isNaN(userId)) {
            const settingsUrl = new URL("/settings", request.url);
            settingsUrl.searchParams.set("error", "사용자 정보를 찾을 수 없습니다");
            return NextResponse.redirect(settingsUrl);
        }

        // 이미 다른 계정에 연동된 네이버 ID인지 확인
        const existingLink = await prisma.users.findFirst({
            where: { 
                naver_id: naverId,
                id: { not: userId }
            }
        });

        if (existingLink) {
            const settingsUrl = new URL("/settings", request.url);
            settingsUrl.searchParams.set("error", "이미 다른 계정에 연동된 네이버 계정입니다");
            return NextResponse.redirect(settingsUrl);
        }

        // naver_id 업데이트
        await prisma.users.update({
            where: { id: userId },
            data: { naver_id: naverId }
        });

        const settingsUrl = new URL("/settings", request.url);
        settingsUrl.searchParams.set("success", "네이버 계정이 성공적으로 연동되었습니다");
        return NextResponse.redirect(settingsUrl);

    } catch (error) {
        console.error("[NAVER LINK ERROR]", error);
        const settingsUrl = new URL("/settings", request.url);
        settingsUrl.searchParams.set("error", "네이버 계정 연동에 실패했습니다");
        return NextResponse.redirect(settingsUrl);
    }
}