import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const res = await prisma.$queryRawUnsafe(`SELECT count(*) FROM public.link_speed_history`);
    return NextResponse.json({ public_count: res });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
