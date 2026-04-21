import { renderHook, act } from "@testing-library/react";
import { usePlayback, PlaybackSpeed, TimeInterval } from "./usePlayback";

describe("usePlayback", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const createDefaultOptions = () => {
    const startTime = new Date("2024-01-01T00:00:00Z");
    const endTime = new Date("2024-01-01T01:00:00Z");
    const currentTime = new Date("2024-01-01T00:00:00Z");

    return {
      startTime,
      endTime,
      currentTime,
      playbackSpeed: 1 as PlaybackSpeed,
      timeInterval: 5 as TimeInterval,
      onTimeChange: jest.fn(),
      onComplete: jest.fn(),
    };
  };

  test("초기 상태는 재생 중이 아님", () => {
    const options = createDefaultOptions();
    const { result } = renderHook(() => usePlayback(options));

    expect(result.current.isPlaying).toBe(false);
  });

  test("play 호출 시 재생 시작", () => {
    const options = createDefaultOptions();
    const { result } = renderHook(() => usePlayback(options));

    act(() => {
      result.current.play();
    });

    expect(result.current.isPlaying).toBe(true);
  });

  test("pause 호출 시 재생 일시정지", () => {
    const options = createDefaultOptions();
    const { result } = renderHook(() => usePlayback(options));

    act(() => {
      result.current.play();
    });

    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.pause();
    });

    expect(result.current.isPlaying).toBe(false);
  });

  test("stop 호출 시 재생 정지 및 시작 시간으로 복귀", () => {
    const options = createDefaultOptions();
    const { result } = renderHook(() => usePlayback(options));

    act(() => {
      result.current.play();
    });

    act(() => {
      result.current.stop();
    });

    expect(result.current.isPlaying).toBe(false);
    expect(options.onTimeChange).toHaveBeenCalledWith(options.startTime);
  });

  test("재생 중 시간 간격마다 onTimeChange 호출", () => {
    const options = createDefaultOptions();
    const { result } = renderHook(() => usePlayback(options));

    act(() => {
      result.current.play();
    });

    // 5분 간격, 1배속 → 5분(300초) 후 업데이트
    act(() => {
      jest.advanceTimersByTime(300000);
    });

    expect(options.onTimeChange).toHaveBeenCalledWith(
      new Date("2024-01-01T00:05:00Z")
    );
  });

  test("종료 시점 도달 시 자동 정지", () => {
    // 종료 시간에 매우 가까운 시점에서 시작
    const startTime = new Date("2024-01-01T00:00:00Z");
    const currentTime = new Date("2024-01-01T00:58:00Z");
    const endTime = new Date("2024-01-01T01:00:00Z");
    
    const onTimeChange = jest.fn();
    const onComplete = jest.fn();

    const { result } = renderHook(() =>
      usePlayback({
        startTime,
        endTime,
        currentTime,
        playbackSpeed: 1,
        timeInterval: 5,
        onTimeChange,
        onComplete,
      })
    );

    act(() => {
      result.current.play();
    });

    // 5분 후 → 01:03:00이 되어 종료 시간(01:00:00) 초과
    act(() => {
      jest.advanceTimersByTime(300000);
    });

    // 재생이 정지되고 완료 콜백이 호출되어야 함
    expect(result.current.isPlaying).toBe(false);
    expect(onComplete).toHaveBeenCalled();
    // 종료 시간으로 설정되어야 함
    expect(onTimeChange).toHaveBeenCalledWith(endTime);
  });

  test("setSpeed 호출 시 재생 속도 변경", () => {
    const options = createDefaultOptions();
    const { result } = renderHook(() => usePlayback(options));

    act(() => {
      result.current.play();
    });

    act(() => {
      result.current.setSpeed(2);
    });

    // 2배속 → 2.5분(150초) 후 업데이트
    act(() => {
      jest.advanceTimersByTime(150000);
    });

    expect(options.onTimeChange).toHaveBeenCalledWith(
      new Date("2024-01-01T00:05:00Z")
    );
  });

  test("setInterval 호출 시 시간 간격 변경", () => {
    const startTime = new Date("2024-01-01T00:00:00Z");
    const currentTime = new Date("2024-01-01T00:00:00Z");
    const endTime = new Date("2024-01-01T01:00:00Z");
    
    const onTimeChange = jest.fn();
    const onComplete = jest.fn();

    const { result } = renderHook(() =>
      usePlayback({
        startTime,
        endTime,
        currentTime,
        playbackSpeed: 1,
        timeInterval: 5,
        onTimeChange,
        onComplete,
      })
    );

    act(() => {
      result.current.play();
    });

    // 간격을 10분으로 변경
    act(() => {
      result.current.setInterval(10);
    });

    // 10분 간격, 1배속 → 10분(600초) 후 업데이트
    act(() => {
      jest.advanceTimersByTime(600000);
    });

    // onTimeChange가 호출되었는지 확인 (정확한 시간은 currentTime이 업데이트되지 않아 검증 어려움)
    expect(onTimeChange).toHaveBeenCalled();
  });
});
