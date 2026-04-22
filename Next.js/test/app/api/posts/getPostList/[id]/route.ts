import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
 
  try {
    const result = await prisma.post.findUnique({
      where: { id: Number(id)},
    });

    if(!result) {
      return NextResponse.json({error: "Not found"}, { status: 404})
    };

    let imageBase64: string | null = null;
    let imageType = "jpeg";
    if (result.image) {
      const buf = Buffer.from(result.image);
      // magic bytes로 이미지 타입 감지
      if (buf[0] === 0x89 && buf[1] === 0x50) imageType = "png";
      else if (buf[0] === 0x47 && buf[1] === 0x49) imageType = "gif";
      else if (buf[0] === 0x52 && buf[1] === 0x49) imageType = "webp";
      else imageType = "jpeg";
      imageBase64 = buf.toString("base64");
    }
    const data = {
      ...result,
      image: imageBase64,
      imageType,
    };

    return NextResponse.json(data);
  } catch(err: any) {
    console.error("getPost에러:::::::::", err);
    return NextResponse.json({error: err.message}, { status: 500});
  }

}