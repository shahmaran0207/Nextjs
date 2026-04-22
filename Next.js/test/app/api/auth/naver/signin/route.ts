import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const callbackUrl = searchParams.get("callbackUrl") || "/api/auth/callback/naver";
    
    // 네이버 OAuth 파라미터
    const naverAuthUrl = new URL("https://nid.naver.com/oauth2.0/authorize");
    naverAuthUrl.searchParams.set("response_type", "code");
    naverAuthUrl.searchParams.set("client_id", process.env.NAVER_CLIENT_ID!);
    naverAuthUrl.searchParams.set("redirect_uri", `${process.env.NEXTAUTH_URL}${callbackUrl}`);
    naverAuthUrl.searchParams.set("state", Math.random().toString(36).substring(2, 15));
    
    return NextResponse.redirect(naverAuthUrl.toString());
}