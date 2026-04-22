import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
        const settingsUrl = new URL("/settings", request.url);
        settingsUrl.searchParams.set("error", "사용자 정보가 필요합니다");
        return NextResponse.redirect(settingsUrl);
    }
    
    // 네이버 OAuth 파라미터 (연동용)
    const naverAuthUrl = new URL("https://nid.naver.com/oauth2.0/authorize");
    naverAuthUrl.searchParams.set("response_type", "code");
    naverAuthUrl.searchParams.set("client_id", process.env.NAVER_CLIENT_ID!);
    naverAuthUrl.searchParams.set("redirect_uri", `${process.env.NEXTAUTH_URL}/api/auth/callback/naver/link`);
    naverAuthUrl.searchParams.set("state", userId); // 사용자 ID를 state에 포함
    
    return NextResponse.redirect(naverAuthUrl.toString());
}