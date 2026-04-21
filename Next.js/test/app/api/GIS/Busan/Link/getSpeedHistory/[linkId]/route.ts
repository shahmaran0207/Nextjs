import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/GIS/Busan/Link/getSpeedHistory/[linkId]
 * 특정 링크의 최근 24시간 속도 이력 조회
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ linkId: string }> }
) {
  const { linkId } = await params;

  if (!linkId) {
    return NextResponse.json({ error: "linkId is required" }, { status: 400 });
  }

  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24시간 전

    // 최근 24시간 데이터 조회
    const rows = await prisma.link_speed_history.findMany({
      where: {
        link_id: linkId,
        recorded_at: { gte: since },
      },
      orderBy: { recorded_at: "asc" },
      select: { speed: true, recorded_at: true },
    });

    // 전체 기간 통계 조회 (평균, 최고, 최저)
    const stats = await prisma.link_speed_history.aggregate({
      where: { link_id: linkId },
      _avg: { speed: true },
      _max: { speed: true },
      _min: { speed: true },
    });

    return NextResponse.json({
      linkId,
      count: rows.length,
      data: rows.map((r) => ({
        speed: r.speed,
        time: r.recorded_at.toISOString(),
      })),
      stats: {
        avg: stats._avg.speed,
        max: stats._max.speed,
        min: stats._min.speed,
      }
    });
  } catch (err) {
    console.error("[SpeedHistory API] 조회 실패:", err);
    return NextResponse.json({ error: "DB query failed" }, { status: 500 });
  }
}
