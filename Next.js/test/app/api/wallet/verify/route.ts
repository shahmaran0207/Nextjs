// app/api/wallet/verify/route.ts
// ─────────────────────────────────────────────────────────────
// POST /api/wallet/verify
// Body: { address: "0x...", signature: "0x..." }
//
// MetaMask 서명을 검증해 지갑 주소 소유권을 확인하고 DB에 저장합니다.
// 검증 원리:
//   - 사용자가 nonce 문자열을 MetaMask로 서명 → signature 생성
//   - 서버에서 ethers.verifyMessage(nonce, signature) 로 서명자 주소 복원
//   - 복원된 주소 === 요청한 address 이면 소유권 증명 완료
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { ethers } from "ethers";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "secret");

export async function POST(req: NextRequest) {
  // ── 1. 로그인 확인 ──────────────────────────────────────────
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

  // ── 2. 요청 바디 파싱 ────────────────────────────────────────
  const { address, signature } = await req.json();

  if (!address || !signature) {
    return NextResponse.json({ error: "address와 signature가 필요합니다." }, { status: 400 });
  }

  if (!ethers.isAddress(address)) {
    return NextResponse.json({ error: "올바르지 않은 이더리움 주소입니다." }, { status: 400 });
  }

  // ── 3. DB에서 사용자의 nonce 조회 ───────────────────────────
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { wallet_nonce: true },
  });

  if (!user?.wallet_nonce) {
    return NextResponse.json(
      { error: "nonce가 없습니다. GET /api/wallet/nonce를 먼저 호출하세요." },
      { status: 400 }
    );
  }

  // ── 4. 서명 검증 ─────────────────────────────────────────────
  // ethers.verifyMessage: 서명에서 서명자 주소를 복원
  // 복원된 주소가 요청된 address와 일치하면 해당 지갑의 소유자임이 증명됨
  let recoveredAddress: string;
  try {
    recoveredAddress = ethers.verifyMessage(user.wallet_nonce, signature);
  } catch {
    return NextResponse.json({ error: "서명 검증에 실패했습니다." }, { status: 400 });
  }

  if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
    return NextResponse.json(
      { error: "서명이 일치하지 않습니다. 해당 주소의 소유자가 아닙니다." },
      { status: 403 }
    );
  }

  // ── 5. 검증 완료 — DB 저장 ──────────────────────────────────
  await prisma.users.update({
    where: { id: userId },
    data: {
      wallet_address: address,          // 소유권이 증명된 주소 저장
      wallet_verified_at: new Date(),   // 검증 시각 기록
      wallet_nonce: null,               // nonce 무효화 (재사용 방지)
    },
  });

  return NextResponse.json({
    ok: true,
    address,
    verifiedAt: new Date().toISOString(),
  });
}
