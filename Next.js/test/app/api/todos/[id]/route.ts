import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/utils/auth";

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

        const { id } = await params;
        const todoId = Number(id);

        if (isNaN(todoId)) {
            return NextResponse.json({ error: "Invalid Todo ID" }, { status: 400 });
        }

        const body = await req.json();
        const { is_completed } = body;

        // @ts-ignore
        const existingTodo = await prisma.todos.findUnique({
            where: { id: todoId }
        });

        if (!existingTodo) {
            return NextResponse.json({ error: "Todo not found" }, { status: 404 });
        }

        if (existingTodo.user_id !== Number(payload.id)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 마감기한 지났는지 확인 로직
        if (is_completed === true && existingTodo.deadline) {
            const now = new Date();
            const deadlineDate = new Date(existingTodo.deadline);
            if (now > deadlineDate) {
                return NextResponse.json({ error: "마감 시간이 지났습니다. (기한 초과)" }, { status: 400 });
            }
        }

        // @ts-ignore
        const updatedTodo = await prisma.todos.update({
            where: { id: todoId },
            data: { is_completed }
        });

        return NextResponse.json(updatedTodo);
    } catch (error) {
        console.error("PATCH Todos Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

        const { id } = await params;
        const todoId = Number(id);

        // @ts-ignore
        const existingTodo = await prisma.todos.findUnique({
            where: { id: todoId }
        });

        if (!existingTodo || existingTodo.user_id !== Number(payload.id)) {
            return NextResponse.json({ error: "Forbidden or Not Found" }, { status: 403 });
        }

        // @ts-ignore
        await prisma.todos.delete({
            where: { id: todoId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE Todos Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
