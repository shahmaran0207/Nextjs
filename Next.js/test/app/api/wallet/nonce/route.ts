// app/api/wallet/nonce/route.ts
// ─────────────────────────────────────────────────────────────
// GET /api/wallet/nonce
// 로그인된 사용자에게 MetaMask 서명용 일회성 nonce를 발급합니다.
// 발급된 nonce는 DB에 임시 저장되어 verify 시 검증에 사용됩니다.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "secret");

export async function GET() {
  // ── 1. JWT로 로그인 사용자 확인 ────────────────────────────
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let userId: number;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    userId = parseInt(payload.id as string, 10);
  } catch {
    return NextResponse.json({ error: "유효하지 않은 토큰입니다." }, { status: 401 });
  }

  // ── 2. 일회성 nonce 생성 ────────────────────────────────────
  // crypto.randomUUID()는 V4 UUID (충분히 무작위)
  const nonce = `지갑 등록 요청 - ${crypto.randomUUID()} - ${new Date().toISOString()}`;

  // ── 3. DB에 nonce 임시 저장 (이전 nonce 덮어쓰기) ───────────
  await prisma.users.update({
    where: { id: userId },
    data: { wallet_nonce: nonce },
  });

  return NextResponse.json({ nonce });
}
