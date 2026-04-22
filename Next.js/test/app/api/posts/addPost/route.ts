import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const imageFile = formData.get("image") as File;
    const email = request.headers.get("X-User-Email");

    if (!email) {
      return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
    }

    let imageBuffer: Uint8Array | null = null;
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      imageBuffer = new Uint8Array(arrayBuffer);
    }

    await prisma.post.create({
      data: {
        title: title,
        content: content,
        writer: email,
        createdat: new Date(),
        ...(imageBuffer && { image: imageBuffer }),
      },
    });

    return NextResponse.json({ result: "ok" });
  } catch (err: any) {
    console.error("게시글 추가 API 에러:::::::::::::", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
