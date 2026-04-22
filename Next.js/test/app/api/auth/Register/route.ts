import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {

    try {
        const { email, password, name } = await request.json();

        if (!email || !password || !name) {
            return NextResponse.json({ err: "Missing fileds" }, { status: 400 })
        }

        // 이름 중복 확인 (이름 먼저 검증)
        const existingName = await prisma.users.findFirst({ where: { name: String(name) } });
        if (existingName) {
            return NextResponse.json({ err: "이미 사용 중인 이름입니다.", field: "name" }, { status: 409 });
        }

        // 이메일 중복 확인
        const existingEmail = await prisma.users.findFirst({ where: { email: String(email) } });
        if (existingEmail) {
            return NextResponse.json({ err: "이미 사용 중인 이메일입니다.", field: "email" }, { status: 409 });
        }

        await prisma.users.create({
            data: {
                email: String(email),
                password: await bcrypt.hash(password, 10),
                name: String(name),
                ROLE: "USER"
            }
        });

        return NextResponse.json({ result: "ok" });

    } catch (err: any) {
        console.error("User Register API Error:::::::::::::::", err);
        return NextResponse.json({ err: err.message }, { status: 500 })
    }
}