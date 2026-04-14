import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params } : { params: Promise<{id: string}>}) {
    const { id } = await params;

    try {
        const result = await prisma.qna.findUnique({
            where: { id: Number(id)},
        });

        if (!result) {
            return NextResponse.json({ error: "Not Found"});
        };

        const data = {
            ...result,
            image: result.image ? Buffer.from(result.image).toString("base64"):null,
        };

        return NextResponse.json(data);
    } catch (err: any) {
        console.error("getEachQnA API Error:::::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500})
    }
}