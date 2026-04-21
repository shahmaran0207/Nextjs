import { renderHook, act, waitFor } from "@testing-library/react";
import { useTrafficHistory } from "./useTrafficHistory";

// Mock fetch
global.fetch = jest.fn();

describe("useTrafficHistory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe("초기화", () => {
    it("기본 상태로 초기화되어야 한다", () => {
      const { result } = renderHook(() => useTrafficHistory());

      expect(result.current.trafficData).toBeInstanceOf(Map);
      expect(result.current.trafficData.size).toBe(0);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.availability).toEqual([]);
    });

    it("초기 시작/종료 시간을 설정할 수 있어야 한다", () => {
      const initialStartTime = new Date("2024-01-01T00:00:00Z");
      const initialEndTime = new Date("2024-01-02T00:00:00Z");

      const { result } = renderHook(() =>
        useTrafficHistory({
          initialStartTime,
          initialEndTime,
        })
      );

      expect(result.current.startTime).toEqual(initialStartTime);
      expect(result.current.endTime).toEqual(initialEndTime);
    });
  });

  describe("fetchTrafficData", () => {
    it("성공적으로 교통 데이터를 조회해야 한다", async () => {
      const mockData = {
        time: "2024-01-15T14:30:00Z",
        data: [
          { linkId: "link1", speed: 50 },
          { linkId: "link2", speed: 30 },
          { linkId: "link3", speed: 10 },
        ],
        count: 3,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useTrafficHistory());
      const testTime = new Date("2024-01-15T14:30:00Z");

      await act(async () => {
        await result.current.fetchTrafficData(testTime);
      });

      expect(result.current.trafficData.size).toBe(3);
      expect(result.current.trafficData.get("link1")).toBe(50);
      expect(result.current.trafficData.get("link2")).toBe(30);
      expect(result.current.trafficData.get("link3")).toBe(10);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("데이터가 없을 때 에러를 표시해야 한다", async () => {
      const mockData = {
        time: "2024-01-15T14:30:00Z",
        data: [],
        count: 0,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useTrafficHistory());
      const testTime = new Date("2024-01-15T14:30:00Z");

      await act(async () => {
        await result.current.fetchTrafficData(testTime);
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toBe("해당 시점의 데이터가 없습니다");
    });

    it("API 호출 실패 시 에러를 처리해야 한다", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const onError = jest.fn();
      const { result } = renderHook(() => useTrafficHistory({ onError }));
      const testTime = new Date("2024-01-15T14:30:00Z");

      await act(async () => {
        await result.current.fetchTrafficData(testTime);
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toBe(
        "데이터를 불러오는 중 오류가 발생했습니다"
      );
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it("로딩 상태를 올바르게 관리해야 한다", async () => {
      const mockData = {
        time: "2024-01-15T14:30:00Z",
        data: [{ linkId: "link1", speed: 50 }],
        count: 1,
      };

      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => mockData,
                }),
              100
            )
          )
      );

      const { result } = renderHook(() => useTrafficHistory());
      const testTime = new Date("2024-01-15T14:30:00Z");

      act(() => {
        result.current.fetchTrafficData(testTime);
      });

      // 로딩 중
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("setTimeRange", () => {
    it("유효한 시간 범위를 설정해야 한다", () => {
      const { result } = renderHook(() => useTrafficHistory());
      const start = new Date("2024-01-01T00:00:00Z");
      const end = new Date("2024-01-02T00:00:00Z");

      act(() => {
        result.current.setTimeRange(start, end);
      });

      expect(result.current.startTime).toEqual(start);
      expect(result.current.endTime).toEqual(end);
      expect(result.current.error).toBeNull();
    });

    it("시작 시간이 종료 시간보다 늦으면 에러를 표시해야 한다", () => {
      const onError = jest.fn();
      const { result } = renderHook(() => useTrafficHistory({ onError }));
      const start = new Date("2024-01-02T00:00:00Z");
      const end = new Date("2024-01-01T00:00:00Z");

      act(() => {
        result.current.setTimeRange(start, end);
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toBe(
        "시작 시간은 종료 시간보다 이전이어야 합니다"
      );
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it("시작 시간과 종료 시간이 같으면 에러를 표시해야 한다", () => {
      const { result } = renderHook(() => useTrafficHistory());
      const sameTime = new Date("2024-01-01T00:00:00Z");

      act(() => {
        result.current.setTimeRange(sameTime, sameTime);
      });

      expect(result.current.error).not.toBeNull();
    });
  });

  describe("returnToNow", () => {
    it("현재 시간으로 복귀해야 한다", () => {
      const { result } = renderHook(() => useTrafficHistory());
      const pastTime = new Date("2024-01-01T00:00:00Z");

      // 과거 시간으로 설정
      act(() => {
        result.current.setCurrentTime(pastTime);
      });

      expect(result.current.currentTime).toEqual(pastTime);

      // 현재 시간으로 복귀
      const beforeNow = Date.now();
      act(() => {
        result.current.returnToNow();
      });
      const afterNow = Date.now();

      // 현재 시간이 복귀 전후 사이에 있어야 함
      expect(result.current.currentTime.getTime()).toBeGreaterThanOrEqual(
        beforeNow
      );
      expect(result.current.currentTime.getTime()).toBeLessThanOrEqual(
        afterNow
      );
    });

    it("trafficData를 초기화해야 한다", () => {
      const { result } = renderHook(() => useTrafficHistory());

      // trafficData에 데이터 추가
      act(() => {
        const newMap = new Map([["link1", 50]]);
        result.current.trafficData.set("link1", 50);
      });

      // 현재 시간으로 복귀
      act(() => {
        result.current.returnToNow();
      });

      expect(result.current.trafficData.size).toBe(0);
      expect(result.current.error).toBeNull();
    });
  });

  describe("setCurrentTime", () => {
    it("현재 시점을 변경할 수 있어야 한다", () => {
      const { result } = renderHook(() => useTrafficHistory());
      const newTime = new Date("2024-01-15T14:30:00Z");

      act(() => {
        result.current.setCurrentTime(newTime);
      });

      expect(result.current.currentTime).toEqual(newTime);
    });
  });
});
