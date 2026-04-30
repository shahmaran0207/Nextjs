import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/dao/vote-stats?voter=0x...
 * 오프체인 투표 집계 + 현재 유저의 투표 여부 반환
 * 
 * 응답 형식:
 * {
 *   "1": { offchainFor: 3, offchainAgainst: 1, hasVoted: true, votedSupport: true },
 *   "2": { offchainFor: 0, offchainAgainst: 2, hasVoted: false, votedSupport: null }
 * }
 */
export async function GET(req: NextRequest) {
  try {
    const voter = req.nextUrl.searchParams.get("voter")?.toLowerCase() ?? null;

    // 오프체인 투표 전체 집계
    const allVotes = await prisma.offchain_votes.findMany();

    // proposal_id별 집계
    const stats: Record<string, {
      offchainFor: number;
      offchainAgainst: number;
      hasVoted: boolean;
      votedSupport: boolean | null;
    }> = {};

    for (const v of allVotes) {
      const key = String(v.proposal_id);
      if (!stats[key]) {
        stats[key] = { offchainFor: 0, offchainAgainst: 0, hasVoted: false, votedSupport: null };
      }
      if (v.support) {
        stats[key].offchainFor += v.weight;
      } else {
        stats[key].offchainAgainst += v.weight;
      }
      // 현재 유저 투표 여부
      if (voter && v.voter === voter) {
        stats[key].hasVoted     = true;
        stats[key].votedSupport = v.support;
      }
    }

    return NextResponse.json(stats);
  } catch (err) {
    console.error("vote-stats 조회 실패:", err);
    return NextResponse.json({ error: "투표 통계 조회 실패" }, { status: 500 });
  }
}
