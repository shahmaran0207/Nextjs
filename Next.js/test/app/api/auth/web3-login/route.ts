import { prisma } from "@/lib/prisma";
import { generateAccessToken, generateRefreshToken } from "@/utils/auth";
import { saveRefreshToken } from "@/lib/tokenStore";
import { NextResponse } from "next/server";
import { ethers } from "ethers";

export async function POST(request: Request) {
    try {
        const { account, message, signature } = await request.json();

        if (!account || !message || !signature) {
            return NextResponse.json({ err: "필수 데이터가 누락되었습니다." }, { status: 400 });
        }

        // 1. 블록체인 서명 검증 (Cryptography 해독)
        // 서명된 메시지를 수학적으로 역산하여, 이 서명을 만든 주인의 '지갑 주소(Public Address)'를 복구합니다.
        const recoveredAddress = ethers.verifyMessage(message, signature);

        // 2. 검증된 주소와 사용자가 주장하는 주소가 일치하는지 확인 (대소문자 무시)
        if (recoveredAddress.toLowerCase() !== account.toLowerCase()) {
            return NextResponse.json({ err: "서명 검증에 실패했습니다. (가짜 서명입니다)" }, { status: 401 });
        }

        // 3. 서명 검증이 완료되었으므로, 우리 DB에서 해당 지갑 주소를 가진 회원을 찾습니다.
        let user = await prisma.users.findUnique({
            where: { wallet_address: account.toLowerCase() }
        });

        // 4. 만약 가입되지 않은 지갑이라면, 로그인 거부 (네이버 연동과 동일한 방식)
        if (!user) {
            return NextResponse.json({ err: "연동된 계정이 없습니다. 먼저 일반 로그인 후 계정 설정에서 MetaMask를 연동하세요." }, { status: 404 });
        }

        // 5. 일반 로그인과 동일하게 JWT 토큰(액세스/리프레시) 발급
        const accessToken = generateAccessToken({
            id: String(user.id),
            email: user.email ?? "",
            ROLE: user.ROLE ?? "",
        });

        const refreshToken = generateRefreshToken({
            id: String(user.id),
            tokenVersion: 1,
            ROLE: user.ROLE ?? "",
        });

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일 후
        await saveRefreshToken(String(user.id), refreshToken, expiresAt);

        // 6. 응답 객체 생성 및 쿠키 굽기
        const response = NextResponse.json(
            {
                accessToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    ROLE: user.ROLE,
                    wallet_address: user.wallet_address
                },
            },
            { status: 200 }
        );

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
        console.error("[WEB3 LOGIN API ERROR]", error);
        return NextResponse.json({ err: "서버 내부 오류가 발생했습니다." }, { status: 500 });
    }
}
