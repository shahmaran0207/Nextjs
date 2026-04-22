import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

export async function POST(request: Request) {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const { email } = useAuthGuard();

    try {
        const res = await prisma.posthate.findMany({
            where: { postid: Number(id), userid: email }
        });

        return NextResponse.json(res);
    } catch (err: any) {
        console.error("getPOstHate API Error:::::::::::", err);
        return NextResponse.json({ status: 500 });
    }
}