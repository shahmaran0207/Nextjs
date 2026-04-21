import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ err: "Missing fields" }, { status: 400 });
        }

        const user = await prisma.users.findUnique({ where: { email: String(email) } });

        if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
            return NextResponse.json({ err: "Invalid credentials" }, { status: 401 });
        }

        const token = generateToken({
            id: String(user.id),
            email: user.email ?? "",
        });

        return NextResponse.json({ token }, { status: 200 });

    } catch (error) {
        console.error("[LOGIN ERROR]", error);
        return NextResponse.json({ err: "Internal server error" }, { status: 500 });
    }
}