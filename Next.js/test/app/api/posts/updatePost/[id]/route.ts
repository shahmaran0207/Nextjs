import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const result = await prisma.post.findUnique({
      where: { id: Number(id)},
    });

    if (!result) {
      return NextResponse.json({error: "Not fount"}, { status: 400});
    };

    const data = {
      ...result,
      image: result.image ? Buffer.from(result.image).toString("base64"):null,
    };

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message}, { status: 500});
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const imageFile = formData.get("image") as File | null;

    let imageBuffer: Uint8Array | null = null;
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      imageBuffer = new Uint8Array(arrayBuffer as ArrayBuffer);
    }

    // Prisma: ...(imageBuffer && { image: imageBuffer }) 로 조건부 필드 한 번에 처리
    await prisma.post.update({
      where: { id: Number(id) },
      data: {
        title,
        content,
        updatedat: new Date(),
        ...(imageBuffer && { image: imageBuffer }), // 이미지 있을 때만 포함
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}