// app/api/wallet/route.ts
// ─────────────────────────────────────────────────────────────
// GET /api/wallet        — 내 지갑 주소 조회
// DELETE /api/wallet     — 내 지갑 주소 등록 해제
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "secret");

async function getAuthUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return parseInt(payload.id as string, 10);
  } catch {
    return null;
  }
}

// ── GET: 내 지갑 주소 조회 ───────────────────────────────────
export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      wallet_address: true,
      wallet_verified_at: true,
    },
  });

  return NextResponse.json({
    address: user?.wallet_address ?? null,
    verifiedAt: user?.wallet_verified_at ?? null,
  });
}

// ── DELETE: 지갑 주소 등록 해제 ─────────────────────────────
export async function DELETE() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  await prisma.users.update({
    where: { id: userId },
    data: {
      wallet_address: null,
      wallet_verified_at: null,
      wallet_nonce: null,
    },
  });

  return NextResponse.json({ ok: true });
}
