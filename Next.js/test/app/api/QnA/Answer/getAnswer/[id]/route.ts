import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params } : { params: Promise<{id: string}>}) {
    const { id } = await params;

    try {
        const result = await prisma.answer.findFirst({
            where: { questionid: Number(id)},
        });

        if (!result) {
            return NextResponse.json({ error: "Not Found"});
        };

        const data = {
            ...result,
            image: result.image ? Buffer.from(result.image).toString("base64"):null,
        };

        return NextResponse.json(data);
    } catch(err: any) {
        console.error("getAnswerAPI Error::::::::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500})
    }
}