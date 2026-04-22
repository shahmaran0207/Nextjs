import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/auth";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const title = formData.get("title") as string;
        const content = formData.get("content") as string;
        const imageFile = formData.get("image") as File;
        const questionId = formData.get("QuestionId") as String;
        const token = request.headers.get("Authorization")?.split(" ")[1];
        const user = token ? verifyToken(token) as { email: string } | null : null;

        if (!user) {
            return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
        }

        const now = new Date();
        const kstOffset = 9 * 60 * 1000;
        const kstDate = new Date(now.getTime() + kstOffset);

        let imageBuffer: Buffer | null = null;
        if (imageFile) {
            const arrayBuffer = await imageFile.arrayBuffer();
            imageBuffer = Buffer.from(arrayBuffer);
        };

        await prisma.answer.create({
            data: {
                title: title,
                content: content,
                createdat: kstDate,
                writer: user.email,
                questionid: Number(questionId),
                ...(imageBuffer && { image: imageBuffer }),
            },
        });

        return NextResponse.json({ result: "ok" });

    } catch (err: any) {
        console.error("QnA 답변 추가 API 에러::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}