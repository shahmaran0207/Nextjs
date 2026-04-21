import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PlaybackController from "./PlaybackController";

describe("PlaybackController Component", () => {
  const mockOnPlay = jest.fn();
  const mockOnPause = jest.fn();
  const mockOnStop = jest.fn();
  const mockOnSpeedChange = jest.fn();
  const mockOnIntervalChange = jest.fn();

  const defaultProps = {
    isPlaying: false,
    playbackSpeed: 1 as const,
    timeInterval: 5 as const,
    onPlay: mockOnPlay,
    onPause: mockOnPause,
    onStop: mockOnStop,
    onSpeedChange: mockOnSpeedChange,
    onIntervalChange: mockOnIntervalChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all control buttons", () => {
    render(<PlaybackController {...defaultProps} />);
    
    expect(screen.getByLabelText("재생")).toBeInTheDocument();
    expect(screen.getByLabelText("일시정지")).toBeInTheDocument();
    expect(screen.getByLabelText("정지")).toBeInTheDocument();
  });

  it("renders speed and interval selectors", () => {
    render(<PlaybackController {...defaultProps} />);
    
    expect(screen.getByLabelText("재생 속도")).toBeInTheDocument();
    expect(screen.getByLabelText("시간 간격")).toBeInTheDocument();
  });

  it("calls onPlay when play button is clicked", () => {
    render(<PlaybackController {...defaultProps} />);
    const playButton = screen.getByLabelText("재생");
    
    fireEvent.click(playButton);
    
    expect(mockOnPlay).toHaveBeenCalledTimes(1);
  });

  it("calls onPause when pause button is clicked while playing", () => {
    render(<PlaybackController {...defaultProps} isPlaying={true} />);
    const pauseButton = screen.getByLabelText("일시정지");
    
    fireEvent.click(pauseButton);
    
    expect(mockOnPause).toHaveBeenCalledTimes(1);
  });

  it("calls onStop when stop button is clicked", () => {
    render(<PlaybackController {...defaultProps} />);
    const stopButton = screen.getByLabelText("정지");
    
    fireEvent.click(stopButton);
    
    expect(mockOnStop).toHaveBeenCalledTimes(1);
  });

  it("calls onSpeedChange when speed selector is changed", () => {
    render(<PlaybackController {...defaultProps} />);
    const speedSelector = screen.getByLabelText("재생 속도") as HTMLSelectElement;
    
    fireEvent.change(speedSelector, { target: { value: "2" } });
    
    expect(mockOnSpeedChange).toHaveBeenCalledWith(2);
  });

  it("calls onIntervalChange when interval selector is changed", () => {
    render(<PlaybackController {...defaultProps} />);
    const intervalSelector = screen.getByLabelText("시간 간격") as HTMLSelectElement;
    
    fireEvent.change(intervalSelector, { target: { value: "10" } });
    
    expect(mockOnIntervalChange).toHaveBeenCalledWith(10);
  });

  it("disables play button when isPlaying is true", () => {
    render(<PlaybackController {...defaultProps} isPlaying={true} />);
    const playButton = screen.getByLabelText("재생");
    
    expect(playButton).toBeDisabled();
  });

  it("disables pause button when isPlaying is false", () => {
    render(<PlaybackController {...defaultProps} isPlaying={false} />);
    const pauseButton = screen.getByLabelText("일시정지");
    
    expect(pauseButton).toBeDisabled();
  });

  it("disables all controls when disabled prop is true", () => {
    render(<PlaybackController {...defaultProps} disabled={true} />);
    
    const playButton = screen.getByLabelText("재생");
    const pauseButton = screen.getByLabelText("일시정지");
    const stopButton = screen.getByLabelText("정지");
    const speedSelector = screen.getByLabelText("재생 속도");
    const intervalSelector = screen.getByLabelText("시간 간격");
    
    expect(playButton).toBeDisabled();
    expect(pauseButton).toBeDisabled();
    expect(stopButton).toBeDisabled();
    expect(speedSelector).toBeDisabled();
    expect(intervalSelector).toBeDisabled();
  });

  it("displays correct speed options", () => {
    render(<PlaybackController {...defaultProps} />);
    const speedSelector = screen.getByLabelText("재생 속도") as HTMLSelectElement;
    
    const options = Array.from(speedSelector.options).map(opt => opt.value);
    expect(options).toEqual(["1", "2", "4", "8"]);
  });

  it("displays correct interval options", () => {
    render(<PlaybackController {...defaultProps} />);
    const intervalSelector = screen.getByLabelText("시간 간격") as HTMLSelectElement;
    
    const options = Array.from(intervalSelector.options).map(opt => opt.text);
    expect(options).toEqual(["1분", "5분", "10분", "30분", "1시간"]);
  });

  it("reflects current playback speed in selector", () => {
    render(<PlaybackController {...defaultProps} playbackSpeed={4} />);
    const speedSelector = screen.getByLabelText("재생 속도") as HTMLSelectElement;
    
    expect(speedSelector.value).toBe("4");
  });

  it("reflects current time interval in selector", () => {
    render(<PlaybackController {...defaultProps} timeInterval={30} />);
    const intervalSelector = screen.getByLabelText("시간 간격") as HTMLSelectElement;
    
    expect(intervalSelector.value).toBe("30");
  });
});
