import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {

    try {
        const { email, password, name } = await request.json();

        if (!email || !password || !name) {
            return NextResponse.json({ err: "Missing fileds" }, { status: 400 })
        }

        await prisma.users.create({
            data: {
                email: String(email),
                password: await bcrypt.hash(password, 10),
                name: String(name),
            }
        });

    } catch (err: any) {
        console.error("User Register API Error:::::::::::::::", err);
        return NextResponse.json({ err: err.message }, { status: 500 })
    }
}