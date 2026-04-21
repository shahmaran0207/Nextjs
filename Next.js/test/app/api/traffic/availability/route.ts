import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/traffic/availability
 * 시간 범위 내 데이터 존재 여부를 시간별/일별로 집계
 * 
 * Query Parameters:
 * - startTime: ISO 8601 형식의 시작 시간 (예: 2024-01-15T00:00:00Z)
 * - endTime: ISO 8601 형식의 종료 시간 (예: 2024-01-16T00:00:00Z)
 * - granularity: 집계 단위 (hour | day)
 * 
 * Response:
 * {
 *   ranges: Array<{
 *     start: string,
 *     end: string,
 *     hasData: boolean,
 *     recordCount: number
 *   }>
 * }
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startTimeParam = searchParams.get("startTime");
    const endTimeParam = searchParams.get("endTime");
    const granularity = searchParams.get("granularity") || "hour";

    // 필수 파라미터 검증
    if (!startTimeParam || !endTimeParam) {
      return NextResponse.json(
        { error: "startTime and endTime parameters are required" },
        { status: 400 }
      );
    }

    // granularity 검증
    if (granularity !== "hour" && granularity !== "day") {
      return NextResponse.json(
        { error: "granularity must be 'hour' or 'day'" },
        { status: 400 }
      );
    }

    // ISO 8601 형식 검증
    const startTime = new Date(startTimeParam);
    const endTime = new Date(endTimeParam);
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return NextResponse.json(
        { error: "Invalid time format. Use ISO 8601 format (e.g., 2024-01-15T14:30:00Z)" },
        { status: 400 }
      );
    }

    // 시간 범위 검증
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "startTime must be before endTime" },
        { status: 400 }
      );
    }

    // PostgreSQL의 date_trunc 함수를 사용하여 시간별/일별 집계
    const truncateUnit = granularity === "hour" ? "hour" : "day";
    
    // Raw SQL 쿼리로 시간 구간별 레코드 수 집계
    const results = await prisma.$queryRaw<
      Array<{
        time_bucket: Date;
        record_count: bigint;
      }>
    >`
      SELECT 
        DATE_TRUNC(${truncateUnit}, recorded_at) as time_bucket,
        COUNT(*) as record_count
      FROM link_speed_history
      WHERE recorded_at >= ${startTime} AND recorded_at < ${endTime}
      GROUP BY time_bucket
      ORDER BY time_bucket
    `;

    // 시간 구간 생성 (데이터가 없는 구간도 포함)
    const ranges = [];
    const intervalMs = granularity === "hour" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    
    let currentTime = new Date(startTime);
    const resultMap = new Map(
      results.map((r) => [r.time_bucket.toISOString(), Number(r.record_count)])
    );

    while (currentTime < endTime) {
      const nextTime = new Date(currentTime.getTime() + intervalMs);
      const key = currentTime.toISOString();
      const recordCount = resultMap.get(key) || 0;

      ranges.push({
        start: currentTime.toISOString(),
        end: nextTime.toISOString(),
        hasData: recordCount > 0,
        recordCount,
      });

      currentTime = nextTime;
    }

    return NextResponse.json({ ranges });
  } catch (err) {
    console.error("[Traffic Availability API] 조회 실패:", err);
    return NextResponse.json(
      { error: "Database query failed" },
      { status: 500 }
    );
  }
}
