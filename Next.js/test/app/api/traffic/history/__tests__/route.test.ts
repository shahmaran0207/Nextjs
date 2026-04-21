/**
 * @jest-environment node
 */
import { GET } from "../route";
import { prisma } from "@/lib/prisma";

// Mock Prisma client
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

  it("should return 400 when time parameter is missing", async () => {
    const req = new Request("http://localhost:3000/api/traffic/history");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("time parameter is required");
  });

  it("should return 400 when time format is invalid", async () => {
    const req = new Request(
      "http://localhost:3000/api/traffic/history?time=invalid-time"
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Invalid time format");
  });

  it("should return traffic data for valid time parameter", async () => {
    const mockData = [
      { link_id: "1390005302", _avg: { speed: 28.33 } },
      { link_id: "1390006001", _avg: { speed: 52.83 } },
    ];

    (prisma.link_speed_history.groupBy as jest.Mock).mockResolvedValue(
      mockData
    );

    const testTime = "2024-01-15T14:30:00Z";
    const req = new Request(
      `http://localhost:3000/api/traffic/history?time=${testTime}`
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.time).toBe("2024-01-15T14:30:00.000Z");
    expect(data.count).toBe(2);
    expect(data.data).toHaveLength(2);
    expect(data.data[0]).toEqual({
      linkId: "1390005302",
      speed: 28.33,
    });
    expect(data.data[1]).toEqual({
      linkId: "1390006001",
      speed: 52.83,
    });
  });

  it("should query database with ±5 minute range", async () => {
    const mockData = [];
    (prisma.link_speed_history.groupBy as jest.Mock).mockResolvedValue(
      mockData
    );

    const testTime = "2024-01-15T14:30:00Z";
    const req = new Request(
      `http://localhost:3000/api/traffic/history?time=${testTime}`
    );
    await GET(req);

    expect(prisma.link_speed_history.groupBy).toHaveBeenCalledWith({
      by: ["link_id"],
      where: {
        recorded_at: {
          gte: new Date("2024-01-15T14:25:00.000Z"),
          lte: new Date("2024-01-15T14:35:00.000Z"),
        },
      },
      _avg: {
        speed: true,
      },
    });
  });

  it("should return empty data array when no data exists", async () => {
    (prisma.link_speed_history.groupBy as jest.Mock).mockResolvedValue([]);

    const testTime = "2024-01-15T14:30:00Z";
    const req = new Request(
      `http://localhost:3000/api/traffic/history?time=${testTime}`
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.time).toBe("2024-01-15T14:30:00.000Z");
    expect(data.count).toBe(0);
    expect(data.data).toEqual([]);
  });

  it("should handle database errors gracefully", async () => {
    (prisma.link_speed_history.groupBy as jest.Mock).mockRejectedValue(
      new Error("Database connection failed")
    );

    const testTime = "2024-01-15T14:30:00Z";
    const req = new Request(
      `http://localhost:3000/api/traffic/history?time=${testTime}`
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Database query failed");
  });

  it("should handle null average speed values", async () => {
    const mockData = [
      { link_id: "1390005302", _avg: { speed: null } },
      { link_id: "1390006001", _avg: { speed: 52.83 } },
    ];

    (prisma.link_speed_history.groupBy as jest.Mock).mockResolvedValue(
      mockData
    );

    const testTime = "2024-01-15T14:30:00Z";
    const req = new Request(
      `http://localhost:3000/api/traffic/history?time=${testTime}`
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data[0].speed).toBe(0);
    expect(data.data[1].speed).toBe(52.83);
  });
});
