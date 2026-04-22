import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "@/utils/auth";
import { saveRefreshToken } from "@/lib/tokenStore";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email, password, role } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ err: "Missing fields" }, { status: 400 });
        }

        const user = await prisma.users.findUnique({ where: { email: String(email) } });

        if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
            return NextResponse.json({ err: "Invalid credentials" }, { status: 401 });
        }

        // 액세스 토큰 생성 (15분)
        const accessToken = generateAccessToken({
            id: String(user.id),
            email: user.email ?? "",
            ROLE: user.ROLE ?? "",
        });

        // 리프레시 토큰 생성 (7일)
        const refreshToken = generateRefreshToken({
            id: String(user.id),
            tokenVersion: 1, // 기본 버전
            ROLE: user.ROLE ?? "",
        });

        // 리프레시 토큰을 데이터베이스에 저장
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일 후
        await saveRefreshToken(String(user.id), refreshToken, expiresAt);

        // 응답 생성
        const response = NextResponse.json(
            {
                accessToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    ROLE: user.ROLE,
                },
            },
            { status: 200 }
        );

        // 액세스 토큰을 HttpOnly 쿠키로 설정 (15분)
        response.cookies.set("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 15 * 60, // 15분 (초 단위)
        });

        // 리프레시 토큰을 HttpOnly 쿠키로 설정 (7일)
        response.cookies.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // 프로덕션에서만 HTTPS
            sameSite: "strict",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7일 (초 단위)
        });

        return response;

    } catch (error) {
        console.error("[LOGIN ERROR]", error);
        return NextResponse.json({ err: "Internal server error" }, { status: 500 });
    }
}