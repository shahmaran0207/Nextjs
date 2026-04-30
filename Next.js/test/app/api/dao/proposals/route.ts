import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";


// ── GET: DB에 저장된 제안 목록 조회 ──────────────────────────────
export async function GET() {
  try {
    const proposals = await prisma.dao_proposals.findMany({
      where: { status: { not: "expired" } },
      orderBy: { created_at: "desc" },
    });
    // BigInt(deadline_timestamp)는 JSON 직렬화 불가 → Number로 변환
    const serialized = proposals.map((p: typeof proposals[number]) => ({
      ...p,
      deadline_timestamp: p.deadline_timestamp !== null ? Number(p.deadline_timestamp) : null,
    }));
    return NextResponse.json(serialized);
  } catch (err) {
    console.error("DAO 제안 조회 실패:", err);
    return NextResponse.json({ error: "제안 목록을 불러올 수 없습니다." }, { status: 500 });
  }
}

// ── POST: 제안 등록 (컨트랙트 tx 완료 후 DB에 미러링) ──────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { description, proposerAddress, contractProposalId, deadlineTimestamp } = body;

    if (!description || !proposerAddress) {
      return NextResponse.json({ error: "description, proposerAddress는 필수입니다." }, { status: 400 });
    }

    const proposal = await prisma.dao_proposals.create({
      data: {
        description,
        proposer_address:     proposerAddress,
        contract_proposal_id: contractProposalId ?? null,
        deadline_timestamp:   deadlineTimestamp   ? BigInt(deadlineTimestamp) : null,
        status:               "active",
      },
    });

    return NextResponse.json({ ok: true, id: proposal.id });
  } catch (err) {
    console.error("DAO 제안 저장 실패:", err);
    return NextResponse.json({ error: "제안 저장에 실패했습니다." }, { status: 500 });
  }
}
