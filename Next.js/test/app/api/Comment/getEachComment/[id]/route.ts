import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;
  try{
    const result = await prisma.postcomment.findMany({
      where: {postid: Number(id)},
      orderBy: { id: "desc"}
    })

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({error: err.message}, { status: 500});
  }
}