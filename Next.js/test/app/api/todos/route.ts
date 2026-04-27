import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/utils/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        let token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) {
            const cookieStore = await cookies();
            token = cookieStore.get("accessToken")?.value;
        }

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = verifyAccessToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // @ts-ignore
        const todosList = await prisma.todos.findMany({
            where: { user_id: Number(payload.id) },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json(todosList);
    } catch (error) {
        console.error("GET Todos Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        let token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) {
            const cookieStore = await cookies();
            token = cookieStore.get("accessToken")?.value;
        }

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = verifyAccessToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const body = await req.json();
        const { title, deadline } = body;

        if (!title || title.trim() === "") {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        if (deadline) {
            const deadlineDate = new Date(deadline);
            if (deadlineDate <= new Date()) {
                return NextResponse.json({ error: "마감 시간은 현재 시간 이후여야 합니다." }, { status: 400 });
            }
        }

        // @ts-ignore
        const newTodo = await prisma.todos.create({
            data: {
                user_id: Number(payload.id),
                title: title.trim(),
                deadline: deadline ? new Date(deadline) : null,
                is_completed: false
            }
        });

        return NextResponse.json(newTodo, { status: 201 });
    } catch (error) {
        console.error("POST Todos Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
