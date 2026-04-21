import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TrafficHistoryPanel from "./TrafficHistoryPanel";

// Mock the hooks
jest.mock("@/app/hook/useTrafficHistory", () => ({
  useTrafficHistory: jest.fn(() => ({
    currentTime: new Date("2024-01-15T14:30:00Z"),
    startTime: new Date("2024-01-14T14:30:00Z"),
    endTime: new Date("2024-01-15T14:30:00Z"),
    trafficData: new Map([["link1", 50]]),
    availability: [],
    isLoading: false,
    error: null,
    setCurrentTime: jest.fn(),
    setTimeRange: jest.fn(),
    fetchTrafficData: jest.fn(),
    returnToNow: jest.fn(),
  })),
}));

jest.mock("@/app/hook/usePlayback", () => ({
  usePlayback: jest.fn(() => ({
    isPlaying: false,
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    setSpeed: jest.fn(),
    setInterval: jest.fn(),
  })),
}));

jest.mock("@/app/hook/useHistoryCache", () => ({
  useHistoryCache: jest.fn(() => ({
    get: jest.fn(() => null),
    set: jest.fn(),
    prefetch: jest.fn(),
    clear: jest.fn(),
    size: 0,
  })),
}));

describe("TrafficHistoryPanel", () => {
  const mockOnClose = jest.fn();
  const mockOnTrafficDataChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("패널이 열려있을 때 렌더링된다", () => {
    render(
      <TrafficHistoryPanel
        isOpen={true}
        onClose={mockOnClose}
        onTrafficDataChange={mockOnTrafficDataChange}
      />
    );

    expect(screen.getByText("교통 상황 재생")).toBeInTheDocument();
  });

  it("패널이 닫혀있을 때 렌더링되지 않는다", () => {
    const { container } = render(
      <TrafficHistoryPanel
        isOpen={false}
        onClose={mockOnClose}
        onTrafficDataChange={mockOnTrafficDataChange}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("닫기 버튼 클릭 시 onClose가 호출된다", () => {
    render(
      <TrafficHistoryPanel
        isOpen={true}
        onClose={mockOnClose}
        onTrafficDataChange={mockOnTrafficDataChange}
      />
    );

    const closeButton = screen.getByLabelText("패널 닫기");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("현재 시간으로 버튼이 렌더링된다", () => {
    render(
      <TrafficHistoryPanel
        isOpen={true}
        onClose={mockOnClose}
        onTrafficDataChange={mockOnTrafficDataChange}
      />
    );

    expect(screen.getByText("현재 시간으로")).toBeInTheDocument();
  });

  it("TimeSlider와 PlaybackController가 렌더링된다", () => {
    render(
      <TrafficHistoryPanel
        isOpen={true}
        onClose={mockOnClose}
        onTrafficDataChange={mockOnTrafficDataChange}
      />
    );

    // TimeSlider 확인
    expect(screen.getByLabelText("시간 슬라이더")).toBeInTheDocument();

    // PlaybackController 확인
    expect(screen.getByLabelText("재생")).toBeInTheDocument();
    expect(screen.getByLabelText("일시정지")).toBeInTheDocument();
    expect(screen.getByLabelText("정지")).toBeInTheDocument();
  });
});
