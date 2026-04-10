import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const name = url.searchParams.get("name");

    try {
        const res = await prisma.posthate.findMany({
            where: { postid: Number(id), userid: String(name)}
        });

        return NextResponse.json(res);
    } catch(err: any) {
        console.error("getPOstHate API Error:::::::::::", err);
        return NextResponse.json({ status: 500});
    }
}