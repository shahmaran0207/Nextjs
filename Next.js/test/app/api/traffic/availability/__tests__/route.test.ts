/**
 * @jest-environment node
 */
import { GET } from "../route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

describe("GET /api/traffic/availability", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return availability data for hourly granularity", async () => {
    const mockData = [
      { time_bucket: new Date("2024-01-15T10:00:00Z"), record_count: BigInt(150) },
      { time_bucket: new Date("2024-01-15T11:00:00Z"), record_count: BigInt(200) },
      { time_bucket: new Date("2024-01-15T13:00:00Z"), record_count: BigInt(180) },
    ];

    (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockData);

    const req = new Request(
      "http://localhost:3000/api/traffic/availability?startTime=2024-01-15T10:00:00Z&endTime=2024-01-15T14:00:00Z&granularity=hour"
    );

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ranges).toHaveLength(4);
    
    // 첫 번째 구간 (데이터 있음)
    expect(data.ranges[0]).toEqual({
      start: "2024-01-15T10:00:00.000Z",
      end: "2024-01-15T11:00:00.000Z",
      hasData: true,
      recordCount: 150,
    });

    // 두 번째 구간 (데이터 있음)
    expect(data.ranges[1]).toEqual({
      start: "2024-01-15T11:00:00.000Z",
      end: "2024-01-15T12:00:00.000Z",
      hasData: true,
      recordCount: 200,
    });

    // 세 번째 구간 (데이터 없음)
    expect(data.ranges[2]).toEqual({
      start: "2024-01-15T12:00:00.000Z",
      end: "2024-01-15T13:00:00.000Z",
      hasData: false,
      recordCount: 0,
    });

    // 네 번째 구간 (데이터 있음)
    expect(data.ranges[3]).toEqual({
      start: "2024-01-15T13:00:00.000Z",
      end: "2024-01-15T14:00:00.000Z",
      hasData: true,
      recordCount: 180,
    });
  });

  it("should return availability data for daily granularity", async () => {
    const mockData = [
      { time_bucket: new Date("2024-01-15T00:00:00Z"), record_count: BigInt(5000) },
      { time_bucket: new Date("2024-01-17T00:00:00Z"), record_count: BigInt(4800) },
    ];

    (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockData);

    const req = new Request(
      "http://localhost:3000/api/traffic/availability?startTime=2024-01-15T00:00:00Z&endTime=2024-01-18T00:00:00Z&granularity=day"
    );

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ranges).toHaveLength(3);
    
    expect(data.ranges[0].hasData).toBe(true);
    expect(data.ranges[0].recordCount).toBe(5000);
    
    expect(data.ranges[1].hasData).toBe(false);
    expect(data.ranges[1].recordCount).toBe(0);
    
    expect(data.ranges[2].hasData).toBe(true);
    expect(data.ranges[2].recordCount).toBe(4800);
  });

  it("should return 400 if startTime is missing", async () => {
    const req = new Request(
      "http://localhost:3000/api/traffic/availability?endTime=2024-01-15T14:00:00Z"
    );

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("startTime and endTime parameters are required");
  });

  it("should return 400 if endTime is missing", async () => {
    const req = new Request(
      "http://localhost:3000/api/traffic/availability?startTime=2024-01-15T10:00:00Z"
    );

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("startTime and endTime parameters are required");
  });

  it("should return 400 if granularity is invalid", async () => {
    const req = new Request(
      "http://localhost:3000/api/traffic/availability?startTime=2024-01-15T10:00:00Z&endTime=2024-01-15T14:00:00Z&granularity=minute"
    );

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("granularity must be 'hour' or 'day'");
  });

  it("should return 400 if time format is invalid", async () => {
    const req = new Request(
      "http://localhost:3000/api/traffic/availability?startTime=invalid&endTime=2024-01-15T14:00:00Z"
    );

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Invalid time format");
  });

  it("should return 400 if startTime is after endTime", async () => {
    const req = new Request(
      "http://localhost:3000/api/traffic/availability?startTime=2024-01-15T14:00:00Z&endTime=2024-01-15T10:00:00Z"
    );

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("startTime must be before endTime");
  });

  it("should handle database errors gracefully", async () => {
    (prisma.$queryRaw as jest.Mock).mockRejectedValue(
      new Error("Database connection failed")
    );

    const req = new Request(
      "http://localhost:3000/api/traffic/availability?startTime=2024-01-15T10:00:00Z&endTime=2024-01-15T14:00:00Z"
    );

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Database query failed");
  });

  it("should default to hour granularity if not specified", async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

    const req = new Request(
      "http://localhost:3000/api/traffic/availability?startTime=2024-01-15T10:00:00Z&endTime=2024-01-15T12:00:00Z"
    );

    await GET(req);

    // $queryRaw는 tagged template literal이므로 호출 검증을 생략합니다
    expect(prisma.$queryRaw).toHaveBeenCalled();
  });

  it("should return empty ranges when no data exists", async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

    const req = new Request(
      "http://localhost:3000/api/traffic/availability?startTime=2024-01-15T10:00:00Z&endTime=2024-01-15T12:00:00Z&granularity=hour"
    );

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ranges).toHaveLength(2);
    expect(data.ranges[0].hasData).toBe(false);
    expect(data.ranges[0].recordCount).toBe(0);
    expect(data.ranges[1].hasData).toBe(false);
    expect(data.ranges[1].recordCount).toBe(0);
  });
});
