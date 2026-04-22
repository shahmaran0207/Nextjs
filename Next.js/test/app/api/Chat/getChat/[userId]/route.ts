import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId } = await params;

    if (!userId) {
        return NextResponse.json({ error: "userId가 없습니다." }, { status: 400 });
    }

    try {
        const result = await prisma.chat.findMany({
            where: {
                OR: [
                    { recepient: userId },
                    { sender: userId },
                ]
            },
            orderBy: { id: "asc" }
        });

        const data = result.map((row) => ({
            from: row.sender,
            to: row.recepient,
            message: row.content,
            imageUrl: row.image ?
                `data:image/jpeg;base64,${Buffer.from(row.image).toString("base64")}` : null,
        }));

        return NextResponse.json(data);
    } catch (err: any) {
        console.error("채팅 내역 조회 API 에러::::::", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}