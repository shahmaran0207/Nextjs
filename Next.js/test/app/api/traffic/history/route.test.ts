import { GET } from "./route";
import { prisma } from "@/lib/prisma";

// Prisma 모킹
jest.mock("@/lib/prisma", () => ({
  prisma: {
    link_speed_history: {
      groupBy: jest.fn(),
    },
  },
}));

describe("GET /api/traffic/history", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("특정 시점의 교통 데이터를 성공적으로 조회한다", async () => {
    // Given: 모킹된 데이터베이스 응답
    const mockData = [
      { link_id: "link1", _avg: { speed: 45.5 } },
      { link_id: "link2", _avg: { speed: 30.2 } },
      { link_id: "link3", _avg: { speed: 15.8 } },
    ];

    (prisma.link_speed_history.groupBy as jest.Mock).mockResolvedValue(
      mockData
    );

    // When: API 호출
    const targetTime = "2024-01-15T14:30:00Z";
    const request = new Request(
      `http://localhost:3000/api/traffic/history?time=${targetTime}`
    );
    const response = await GET(request);
    const data = await response.json();

    // Then: 응답 검증
    expect(response.status).toBe(200);
    expect(data.time).toBe(targetTime);
    expect(data.count).toBe(3);
    expect(data.data).toHaveLength(3);
    expect(data.data[0]).toEqual({ linkId: "link1", speed: 45.5 });
    expect(data.data[1]).toEqual({ linkId: "link2", speed: 30.2 });
    expect(data.data[2]).toEqual({ linkId: "link3", speed: 15.8 });

    // Prisma 호출 검증 (±5분 범위)
    expect(prisma.link_speed_history.groupBy).toHaveBeenCalledWith({
      by: ["link_id"],
      where: {
        recorded_at: {
          gte: new Date("2024-01-15T14:25:00Z"),
          lte: new Date("2024-01-15T14:35:00Z"),
        },
      },
      _avg: {
        speed: true,
      },
    });
  });

  it("time 파라미터가 없으면 400 에러를 반환한다", async () => {
    // When: time 파라미터 없이 API 호출
    const request = new Request("http://localhost:3000/api/traffic/history");
    const response = await GET(request);
    const data = await response.json();

    // Then: 에러 응답 검증
    expect(response.status).toBe(400);
    expect(data.error).toBe("time parameter is required");
  });

  it("잘못된 시간 형식이면 400 에러를 반환한다", async () => {
    // When: 잘못된 시간 형식으로 API 호출
    const request = new Request(
      "http://localhost:3000/api/traffic/history?time=invalid-time"
    );
    const response = await GET(request);
    const data = await response.json();

    // Then: 에러 응답 검증
    expect(response.status).toBe(400);
    expect(data.error).toContain("Invalid time format");
  });

  it("데이터가 없으면 빈 배열을 반환한다", async () => {
    // Given: 데이터베이스에 데이터 없음
    (prisma.link_speed_history.groupBy as jest.Mock).mockResolvedValue([]);

    // When: API 호출
    const targetTime = "2024-01-15T14:30:00Z";
    const request = new Request(
      `http://localhost:3000/api/traffic/history?time=${targetTime}`
    );
    const response = await GET(request);
    const data = await response.json();

    // Then: 빈 응답 검증
    expect(response.status).toBe(200);
    expect(data.count).toBe(0);
    expect(data.data).toEqual([]);
  });

  it("데이터베이스 오류 시 500 에러를 반환한다", async () => {
    // Given: 데이터베이스 오류
    (prisma.link_speed_history.groupBy as jest.Mock).mockRejectedValue(
      new Error("Database connection failed")
    );

    // When: API 호출
    const targetTime = "2024-01-15T14:30:00Z";
    const request = new Request(
      `http://localhost:3000/api/traffic/history?time=${targetTime}`
    );
    const response = await GET(request);
    const data = await response.json();

    // Then: 에러 응답 검증
    expect(response.status).toBe(500);
    expect(data.error).toBe("Database query failed");
  });

  it("속도가 null인 경우 0으로 처리한다", async () => {
    // Given: 속도가 null인 데이터
    const mockData = [
      { link_id: "link1", _avg: { speed: null } },
      { link_id: "link2", _avg: { speed: 25.5 } },
    ];

    (prisma.link_speed_history.groupBy as jest.Mock).mockResolvedValue(
      mockData
    );

    // When: API 호출
    const targetTime = "2024-01-15T14:30:00Z";
    const request = new Request(
      `http://localhost:3000/api/traffic/history?time=${targetTime}`
    );
    const response = await GET(request);
    const data = await response.json();

    // Then: null이 0으로 변환되었는지 검증
    expect(response.status).toBe(200);
    expect(data.data[0]).toEqual({ linkId: "link1", speed: 0 });
    expect(data.data[1]).toEqual({ linkId: "link2", speed: 25.5 });
  });
});
