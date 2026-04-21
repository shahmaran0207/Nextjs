import { GET } from "./route";
import { prisma } from "@/lib/prisma";

// Prisma 모킹
jest.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRawUnsafe: jest.fn(),
  },
}));

describe("GET /api/traffic/availability", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("시간별 데이터 가용성을 성공적으로 조회한다", async () => {
    // Given: 모킹된 데이터베이스 응답 (시간별 집계)
    const mockResults = [
      { time_bucket: new Date("2024-01-15T10:00:00Z"), record_count: BigInt(150) },
      { time_bucket: new Date("2024-01-15T11:00:00Z"), record_count: BigInt(200) },
      { time_bucket: new Date("2024-01-15T13:00:00Z"), record_count: BigInt(180) },
    ];

    (prisma.$queryRawUnsafe as jest.Mock).mockResolvedValue(mockResults);

    // When: API 호출 (10:00 ~ 14:00, 4시간)
    const startTime = "2024-01-15T10:00:00Z";
    const endTime = "2024-01-15T14:00:00Z";
    const request = new Request(
      `http://localhost:3000/api/traffic/availability?startTime=${startTime}&endTime=${endTime}&granularity=hour`
    );
    const response = await GET(request);
    const data = await response.json();

    // Then: 응답 검증
    expect(response.status).toBe(200);
    expect(data.ranges).toHaveLength(4); // 4시간

    // 데이터가 있는 시간대
    expect(data.ranges[0]).toEqual({
      start: "2024-01-15T10:00:00.000Z",
      end: "2024-01-15T11:00:00.000Z",
      hasData: true,
      recordCount: 150,
    });

    expect(data.ranges[1]).toEqual({
      start: "2024-01-15T11:00:00.000Z",
      end: "2024-01-15T12:00:00.000Z",
      hasData: true,
      recordCount: 200,
    });

    // 데이터가 없는 시간대
    expect(data.ranges[2]).toEqual({
      start: "2024-01-15T12:00:00.000Z",
      end: "2024-01-15T13:00:00.000Z",
      hasData: false,
      recordCount: 0,
    });

    expect(data.ranges[3]).toEqual({
      start: "2024-01-15T13:00:00.000Z",
      end: "2024-01-15T14:00:00.000Z",
      hasData: true,
      recordCount: 180,
    });
  });

  it("일별 데이터 가용성을 성공적으로 조회한다", async () => {
    // Given: 모킹된 데이터베이스 응답 (일별 집계)
    const mockResults = [
      { time_bucket: new Date("2024-01-15T00:00:00Z"), record_count: BigInt(5000) },
      { time_bucket: new Date("2024-01-16T00:00:00Z"), record_count: BigInt(4800) },
    ];

    (prisma.$queryRawUnsafe as jest.Mock).mockResolvedValue(mockResults);

    // When: API 호출 (3일간)
    const startTime = "2024-01-15T00:00:00Z";
    const endTime = "2024-01-18T00:00:00Z";
    const request = new Request(
      `http://localhost:3000/api/traffic/availability?startTime=${startTime}&endTime=${endTime}&granularity=day`
    );
    const response = await GET(request);
    const data = await response.json();

    // Then: 응답 검증
    expect(response.status).toBe(200);
    expect(data.ranges).toHaveLength(3); // 3일

    expect(data.ranges[0].hasData).toBe(true);
    expect(data.ranges[0].recordCount).toBe(5000);
    expect(data.ranges[1].hasData).toBe(true);
    expect(data.ranges[1].recordCount).toBe(4800);
    expect(data.ranges[2].hasData).toBe(false);
    expect(data.ranges[2].recordCount).toBe(0);
  });

  it("startTime 파라미터가 없으면 400 에러를 반환한다", async () => {
    // When: startTime 없이 API 호출
    const request = new Request(
      "http://localhost:3000/api/traffic/availability?endTime=2024-01-15T14:00:00Z"
    );
    const response = await GET(request);
    const data = await response.json();

    // Then: 에러 응답 검증
    expect(response.status).toBe(400);
    expect(data.error).toBe("startTime and endTime parameters are required");
  });

  it("endTime 파라미터가 없으면 400 에러를 반환한다", async () => {
    // When: endTime 없이 API 호출
    const request = new Request(
      "http://localhost:3000/api/traffic/availability?startTime=2024-01-15T10:00:00Z"
    );
    const response = await GET(request);
    const data = await response.json();

    // Then: 에러 응답 검증
    expect(response.status).toBe(400);
    expect(data.error).toBe("startTime and endTime parameters are required");
  });

  it("잘못된 granularity 값이면 400 에러를 반환한다", async () => {
    // When: 잘못된 granularity로 API 호출
    const request = new Request(
      "http://localhost:3000/api/traffic/availability?startTime=2024-01-15T10:00:00Z&endTime=2024-01-15T14:00:00Z&granularity=minute"
    );
    const response = await GET(request);
    const data = await response.json();

    // Then: 에러 응답 검증
    expect(response.status).toBe(400);
    expect(data.error).toBe("granularity must be 'hour' or 'day'");
  });

  it("잘못된 시간 형식이면 400 에러를 반환한다", async () => {
    // When: 잘못된 시간 형식으로 API 호출
    const request = new Request(
      "http://localhost:3000/api/traffic/availability?startTime=invalid&endTime=2024-01-15T14:00:00Z"
    );
    const response = await GET(request);
    const data = await response.json();

    // Then: 에러 응답 검증
    expect(response.status).toBe(400);
    expect(data.error).toContain("Invalid time format");
  });

  it("startTime이 endTime보다 늦으면 400 에러를 반환한다", async () => {
    // When: startTime > endTime으로 API 호출
    const request = new Request(
      "http://localhost:3000/api/traffic/availability?startTime=2024-01-15T14:00:00Z&endTime=2024-01-15T10:00:00Z"
    );
    const response = await GET(request);
    const data = await response.json();

    // Then: 에러 응답 검증
    expect(response.status).toBe(400);
    expect(data.error).toBe("startTime must be before endTime");
  });

  it("granularity 기본값은 hour이다", async () => {
    // Given: 모킹된 데이터베이스 응답
    (prisma.$queryRawUnsafe as jest.Mock).mockResolvedValue([]);

    // When: granularity 없이 API 호출
    const startTime = "2024-01-15T10:00:00Z";
    const endTime = "2024-01-15T12:00:00Z";
    const request = new Request(
      `http://localhost:3000/api/traffic/availability?startTime=${startTime}&endTime=${endTime}`
    );
    const response = await GET(request);

    // Then: hour 단위로 쿼리되었는지 검증
    expect(prisma.$queryRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining("DATE_TRUNC('hour'"),
      new Date(startTime),
      new Date(endTime)
    );
  });

  it("데이터베이스 오류 시 500 에러를 반환한다", async () => {
    // Given: 데이터베이스 오류
    (prisma.$queryRawUnsafe as jest.Mock).mockRejectedValue(
      new Error("Database connection failed")
    );

    // When: API 호출
    const request = new Request(
      "http://localhost:3000/api/traffic/availability?startTime=2024-01-15T10:00:00Z&endTime=2024-01-15T14:00:00Z"
    );
    const response = await GET(request);
    const data = await response.json();

    // Then: 에러 응답 검증
    expect(response.status).toBe(500);
    expect(data.error).toBe("Database query failed");
  });
});
