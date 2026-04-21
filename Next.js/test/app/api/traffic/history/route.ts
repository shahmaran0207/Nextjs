import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/traffic/history
 * 특정 시점(±5분 범위)의 링크별 평균 속도 조회
 * 
 * Query Parameters:
 * - time: ISO 8601 형식의 시점 (예: 2024-01-15T14:30:00Z)
 * 
 * Response:
 * {
 *   time: string,
 *   data: Array<{ linkId: string, speed: number }>,
 *   count: number
 * }
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const timeParam = searchParams.get("time");

    // 시간 파라미터 검증
    if (!timeParam) {
      return NextResponse.json(
        { error: "time parameter is required" },
        { status: 400 }
      );
    }

    // ISO 8601 형식 검증
    const targetTime = new Date(timeParam);
    if (isNaN(targetTime.getTime())) {
      return NextResponse.json(
        { error: "Invalid time format. Use ISO 8601 format (e.g., 2024-01-15T14:30:00Z)" },
        { status: 400 }
      );
    }

    // ±5분 범위 계산
    const startTime = new Date(targetTime.getTime() - 5 * 60 * 1000);
    const endTime = new Date(targetTime.getTime() + 5 * 60 * 1000);

    // 링크별 평균 속도 조회
    const results = await prisma.link_speed_history.groupBy({
      by: ["link_id"],
      where: {
        recorded_at: {
          gte: startTime,
          lte: endTime,
        },
      },
      _avg: {
        speed: true,
      },
    });

    // 응답 데이터 변환
    const data = results.map((result) => ({
      linkId: result.link_id,
      speed: result._avg.speed ?? 0,
    }));

    return NextResponse.json({
      time: targetTime.toISOString(),
      data,
      count: data.length,
    });
  } catch (err) {
    console.error("[Traffic History API] 조회 실패:", err);
    return NextResponse.json(
      { error: "Database query failed" },
      { status: 500 }
    );
  }
}
