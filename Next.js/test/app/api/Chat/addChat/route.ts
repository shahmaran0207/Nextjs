import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try{
        const formData = await request.formData();
        const recepientId = formData.get("recepientId") as string;
        const userId = formData.get("userId") as string;
        const message = formData.get("message") as string;
        const image = formData.get("image") as File;

        let imageBuffer: Buffer | null = null;
        let imageUrl: string | null = null;

        if (image) {
            const arrayBuffer = await image.arrayBuffer();
            imageBuffer = Buffer.from(arrayBuffer);
            imageUrl = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
        }

        await prisma.chat.create({
            data: {
                recepient: recepientId,
                sender: userId,
                content: message,
                ...(imageBuffer && { image: imageBuffer as any }),
            },
        });

        return NextResponse.json({ result: "ok", imageUrl });
    } catch (err: any) {
        console.error("채팅 기록 API 에러::::::", err);
        return NextResponse.json({error: err.message}, {status: 500});
    } 
}