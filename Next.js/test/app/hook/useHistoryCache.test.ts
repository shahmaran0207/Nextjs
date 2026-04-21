import { renderHook, act } from "@testing-library/react";
import { useHistoryCache } from "./useHistoryCache";

describe("useHistoryCache", () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should initialize with empty cache", () => {
    const { result } = renderHook(() => useHistoryCache());

    expect(result.current.size).toBe(0);
    expect(result.current.get(new Date())).toBeNull();
  });

  it("should store and retrieve data from cache", () => {
    const { result } = renderHook(() => useHistoryCache());
    const testTime = new Date("2024-01-15T14:30:00Z");
    const testData = new Map([
      ["link1", 50],
      ["link2", 30],
    ]);

    act(() => {
      result.current.set(testTime, testData);
    });

    expect(result.current.size).toBe(1);
    
    const retrieved = result.current.get(testTime);
    expect(retrieved).toEqual(testData);
    expect(retrieved?.get("link1")).toBe(50);
    expect(retrieved?.get("link2")).toBe(30);
  });

  it("should implement LRU policy with max 10 entries", () => {
    const { result } = renderHook(() => useHistoryCache());

    // Add 11 entries
    act(() => {
      for (let i = 0; i < 11; i++) {
        const time = new Date(`2024-01-15T${String(i).padStart(2, "0")}:00:00Z`);
        const data = new Map([[`link${i}`, i * 10]]);
        result.current.set(time, data);
      }
    });

    // Should only have 10 entries (oldest removed)
    expect(result.current.size).toBe(10);

    // First entry should be removed
    const firstTime = new Date("2024-01-15T00:00:00Z");
    expect(result.current.get(firstTime)).toBeNull();

    // Last entry should exist
    const lastTime = new Date("2024-01-15T10:00:00Z");
    expect(result.current.get(lastTime)).not.toBeNull();
  });

  it("should update access order on get (LRU)", () => {
    const { result } = renderHook(() => useHistoryCache());

    // Add 3 entries
    const times = [
      new Date("2024-01-15T10:00:00Z"),
      new Date("2024-01-15T11:00:00Z"),
      new Date("2024-01-15T12:00:00Z"),
    ];

    act(() => {
      times.forEach((time, i) => {
        result.current.set(time, new Map([[`link${i}`, i * 10]]));
      });
    });

    // Access the first entry (should move to end)
    act(() => {
      result.current.get(times[0]);
    });

    // Add 8 more entries to reach limit
    act(() => {
      for (let i = 3; i < 11; i++) {
        const time = new Date(`2024-01-15T${String(i + 10).padStart(2, "0")}:00:00Z`);
        result.current.set(time, new Map([[`link${i}`, i * 10]]));
      }
    });

    // First entry should still exist (was accessed recently)
    expect(result.current.get(times[0])).not.toBeNull();
    
    // Second entry should be removed (was least recently used)
    expect(result.current.get(times[1])).toBeNull();
  });

  it("should clear all cache entries", () => {
    const { result } = renderHook(() => useHistoryCache());

    // Add some entries
    act(() => {
      for (let i = 0; i < 5; i++) {
        const time = new Date(`2024-01-15T${String(i).padStart(2, "0")}:00:00Z`);
        const data = new Map([[`link${i}`, i * 10]]);
        result.current.set(time, data);
      }
    });

    expect(result.current.size).toBe(5);

    // Clear cache
    act(() => {
      result.current.clear();
    });

    expect(result.current.size).toBe(0);
  });

  it("should prefetch data and store in cache", async () => {
    const { result } = renderHook(() => useHistoryCache());

    const mockData = {
      time: "2024-01-15T14:30:00Z",
      data: [
        { linkId: "link1", speed: 50 },
        { linkId: "link2", speed: 30 },
      ],
      count: 2,
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const timesToPrefetch = [
      new Date("2024-01-15T14:30:00Z"),
      new Date("2024-01-15T14:35:00Z"),
    ];

    await act(async () => {
      await result.current.prefetch(timesToPrefetch);
    });

    // Check that data was cached
    const cached = result.current.get(timesToPrefetch[0]);
    expect(cached).not.toBeNull();
    expect(cached?.get("link1")).toBe(50);
    expect(cached?.get("link2")).toBe(30);
  });

  it("should not prefetch already cached data", async () => {
    const { result } = renderHook(() => useHistoryCache());

    const testTime = new Date("2024-01-15T14:30:00Z");
    const testData = new Map([["link1", 50]]);

    // Add to cache first
    act(() => {
      result.current.set(testTime, testData);
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], count: 0 }),
    });

    await act(async () => {
      await result.current.prefetch([testTime]);
    });

    // Fetch should not be called for already cached data
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should handle prefetch errors gracefully", async () => {
    const { result } = renderHook(() => useHistoryCache());

    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

    await act(async () => {
      await result.current.prefetch([new Date("2024-01-15T14:30:00Z")]);
    });

    // Should log warning but not throw
    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(result.current.size).toBe(0);

    consoleWarnSpy.mockRestore();
  });
});
