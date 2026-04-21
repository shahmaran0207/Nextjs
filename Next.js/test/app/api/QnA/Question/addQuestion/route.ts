import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const title = formData.get("title") as string;
        const content = formData.get("content") as string;
        const email = formData.get("email") as string;
        const imageFile = formData.get("image") as File;

        const now = new Date();
        const kstOffset = 9 * 60 * 60 * 1000;
        const kstDate = new Date(now.getTime() + kstOffset);

        let imageBuffer: Uint8Array | null = null;
        if (imageFile) {
            const arrayBuffer = await imageFile.arrayBuffer();
            imageBuffer = new Uint8Array(arrayBuffer as ArrayBuffer);
        }

        await prisma.qna.create({
            data: {
                title: title,
                content: content,
                writer: email,
                createdat: kstDate,
                ...(imageBuffer && { image: imageBuffer }),
            },
        });

        return NextResponse.json({ result: "ok" });

    } catch (err: any) {
        console.error("QnA 추가 API 에러:::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}