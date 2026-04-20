import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params } : { params: Promise<{id: string}>}) {
    const { id } = await params;

    try {
        const result = await prisma.posthate.findMany({
            where: { postid: Number(id)},
        });

        return NextResponse.json(result);
    } catch(err: any) {
        console.error("gePostHate API Error:::::::::::::::::", err);
        return NextResponse.json({status: 500});
    }
}