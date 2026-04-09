import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
 
  try {
    const result = await prisma.post.findUnique({
      where: { id: Number(id)},
    });

    if(!result) {
      return NextResponse.json({error: "Not fount"}, { status: 404})
    };

    const data = {
      ...result,
      image: result.image ? Buffer.from(result.image).toString("base64"):null,
    };

    return NextResponse.json(data);
  } catch(err: any) {
    console.error("getPost에러:::::::::", err);
    return NextResponse.json({error: err.message}, { status: 500});
  }

}