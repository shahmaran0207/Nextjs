import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const result = await prisma.products.findUnique({
            where: { id: Number(id) },
        });

        return NextResponse.json(result);
    } catch (err: any) {
        console.error("getProducts API Error::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 })
    }

}