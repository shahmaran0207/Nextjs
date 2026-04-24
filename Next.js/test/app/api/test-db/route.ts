import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const constraints = await prisma.$queryRaw`
    SELECT pg_get_constraintdef(c.oid) AS constraint_def, c.conname
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'orders';
  `;
  return NextResponse.json({ constraints });
}
