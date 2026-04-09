import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: {params: Promise<{id: string}>}) {
    const { id } = await params;

    try {
        await prisma.post.update({
            where: { id: Number(id)},
            data: { postview: { increment: 1}},
        });

        return NextResponse.json({success: true});
    } catch(err: any) {
        console.log("View Count API error::::::::::::", err);
        return NextResponse.json({error: err.message}, {status: 500})
    } 
}