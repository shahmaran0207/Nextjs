import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params } : { params: Promise<{id: string}>}) {
    const { id } = await params;

    try {
        const formData = await request.formData();
        const title = formData.get("title") as string;
        const content = formData.get("content") as string;
        const imageFile = formData.get("image") as File | null;

        // 업데이트할 데이터 객체 생성
        const updateData: any = {};

        // 값이 있을 때만 업데이트 데이터에 추가
        if (title && title.trim() !== "") {
            updateData.title = title;
        }
        if (content && content.trim() !== "") {
            updateData.content = content;
        }

        // 이미지 파일이 있으면 처리
        if (imageFile && imageFile.size > 0) {
            const arrayBuffer = await imageFile.arrayBuffer();
            updateData.image = new Uint8Array(arrayBuffer as ArrayBuffer);
        }

        // 업데이트할 데이터가 있을 때만 실행
        if (Object.keys(updateData).length > 0) {
            await prisma.qna.update({
                where: { id: Number(id) },
                data: updateData,
            });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("QnA - QuestionUpdate API Error:::::::::::::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
