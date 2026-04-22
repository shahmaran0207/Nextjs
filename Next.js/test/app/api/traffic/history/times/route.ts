import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/traffic/history/times
 * 시간 범위 내의 모든 고유한 recorded_at 시간 목록 조회
 * 
 * Query Parameters:
 * - startTime: ISO 8601 형식의 시작 시간
 * - endTime: ISO 8601 형식의 종료 시간
 * 
 * Response:
 * {
 *   times: string[],  // ISO 8601 형식의 시간 배열
 *   count: number
 * }
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startTimeParam = searchParams.get("startTime");
    const endTimeParam = searchParams.get("endTime");

    // 파라미터 검증
    if (!startTimeParam || !endTimeParam) {
      return NextResponse.json(
        { error: "startTime and endTime parameters are required" },
        { status: 400 }
      );
    }

    const startTime = new Date(startTimeParam);
    const endTime = new Date(endTimeParam);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return NextResponse.json(
        { error: "Invalid time format. Use ISO 8601 format" },
        { status: 400 }
      );
    }

    // 시간 범위 내의 모든 고유한 recorded_at 조회
    const results = await prisma.link_speed_history.findMany({
      where: {
        recorded_at: {
          gte: startTime,
          lte: endTime,
        },
      },
      select: {
        recorded_at: true,
      },
      distinct: ["recorded_at"],
      orderBy: {
        recorded_at: "asc",
      },
    });

    const times = results.map((result) => result.recorded_at.toISOString());

    return NextResponse.json({
      times,
      count: times.length,
    });
  } catch (err) {
    console.error("[Traffic History Times API] 조회 실패:", err);
    return NextResponse.json(
      { error: "Database query failed" },
      { status: 500 }
    );
  }
}
