import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params } : { params: Promise<{id: string}>}) {
    const { id } = await params;

    try {
        const formData = await request.formData();
        const title = formData.get("title") as string;
        const content = formData.get("content") as string;
        const imageFile = formData.get("image") as File | null;

        let imageBuffer: Uint8Array<ArrayBuffer> | null = null;

        if (imageFile) {
            const arrayBuffer = await imageFile.arrayBuffer();
            imageBuffer = new Uint8Array(arrayBuffer as ArrayBuffer);
        };

        await prisma.answer.updateMany({
            where: { questionid: Number(id)},
            data: {
                title: title,
                content: content,
                ...(imageBuffer && { image: imageBuffer}),
            },
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("QnA - AnswerUpdate API Error:::::::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500});
    }
}