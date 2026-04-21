import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/traffic/history
 * 특정 시점(±5분 범위)의 링크별 평균 속도 조회
 * 
 * Query Parameters:
 * - time: ISO 8601 형식의 시점 (예: 2024-01-15T14:30:00Z)
 * - findNearest: true일 경우 시간 범위 내에서 가장 가까운 데이터 조회
 * - startTime: findNearest=true일 때 검색 시작 시간
 * - endTime: findNearest=true일 때 검색 종료 시간
 * 
 * Response:
 * {
 *   time: string,
 *   actualTime?: string,  // findNearest=true일 때 실제 데이터의 시간
 *   data: Array<{ linkId: string, speed: number }>,
 *   count: number
 * }
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const timeParam = searchParams.get("time");
    const findNearest = searchParams.get("findNearest") === "true";
    const startTimeParam = searchParams.get("startTime");
    const endTimeParam = searchParams.get("endTime");

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

    // findNearest 모드: 시간 범위 내에서 가장 가까운 데이터 찾기
    if (findNearest && startTimeParam && endTimeParam) {
      const rangeStart = new Date(startTimeParam);
      const rangeEnd = new Date(endTimeParam);

      if (isNaN(rangeStart.getTime()) || isNaN(rangeEnd.getTime())) {
        return NextResponse.json(
          { error: "Invalid startTime or endTime format" },
          { status: 400 }
        );
      }

      // 시간 범위 내에서 가장 가까운 recorded_at 찾기
      const nearestRecord = await prisma.link_speed_history.findFirst({
        where: {
          recorded_at: {
            gte: rangeStart,
            lte: rangeEnd,
          },
        },
        orderBy: {
          recorded_at: targetTime < rangeStart ? 'asc' : 'desc',
        },
        select: {
          recorded_at: true,
        },
      });

      if (!nearestRecord) {
        return NextResponse.json({
          time: targetTime.toISOString(),
          data: [],
          count: 0,
        });
      }

      // 가장 가까운 시간 기준으로 ±5분 범위 데이터 조회
      const actualTime = nearestRecord.recorded_at;
      const startTime = new Date(actualTime.getTime() - 5 * 60 * 1000);
      const endTime = new Date(actualTime.getTime() + 5 * 60 * 1000);

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

      const data = results.map((result) => ({
        linkId: result.link_id,
        speed: result._avg.speed ?? 0,
      }));

      return NextResponse.json({
        time: targetTime.toISOString(),
        actualTime: actualTime.toISOString(),
        data,
        count: data.length,
      });
    }

    // 기본 모드: ±5분 범위 계산
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
