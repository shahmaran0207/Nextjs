import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {

  try {
    const { roadName } = await request.json();

    await prisma.road.create({
        data: {
            roadname: roadName
        }
    })

    return NextResponse.json({result: "ok"});
  } catch(err: any) {
    console.error("도로 추가 API 에러::::::::::::", err);
    return NextResponse.json({ error: err.message}, { status: 500})
  }
}