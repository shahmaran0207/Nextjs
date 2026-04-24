import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const history = await prisma.product_price_history.findMany({
      where: { product_id: Number(id) },
      orderBy: { recorded_at: "asc" },
      take: 30,
    });
    return NextResponse.json({ history });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
