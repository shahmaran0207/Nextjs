import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TimeSlider from "./TimeSlider";

describe("TimeSlider Component", () => {
  const mockOnChange = jest.fn();
  const mockOnRangeChange = jest.fn();

  const defaultProps = {
    startTime: new Date("2024-01-01T00:00:00"),
    endTime: new Date("2024-01-01T23:59:59"),
    currentTime: new Date("2024-01-01T12:00:00"),
    availability: [
      {
        start: new Date("2024-01-01T00:00:00"),
        end: new Date("2024-01-01T12:00:00"),
        hasData: true,
      },
      {
        start: new Date("2024-01-01T12:00:00"),
        end: new Date("2024-01-01T23:59:59"),
        hasData: false,
      },
    ],
    onChange: mockOnChange,
    onRangeChange: mockOnRangeChange,
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders current time in YYYY-MM-DD HH:mm format", () => {
    render(<TimeSlider {...defaultProps} />);
    expect(screen.getByText("2024-01-01 12:00")).toBeInTheDocument();
  });

  it("renders start and end time inputs", () => {
    render(<TimeSlider {...defaultProps} />);
    const startInput = screen.getByLabelText("시작 시간");
    const endInput = screen.getByLabelText("종료 시간");
    
    expect(startInput).toBeInTheDocument();
    expect(endInput).toBeInTheDocument();
  });

  it("renders slider with correct position", () => {
    render(<TimeSlider {...defaultProps} />);
    const slider = screen.getByLabelText("시간 슬라이더");
    
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute("type", "range");
  });

  it("calls onChange when slider is dragged", () => {
    render(<TimeSlider {...defaultProps} />);
    const slider = screen.getByLabelText("시간 슬라이더") as HTMLInputElement;
    
    fireEvent.change(slider, { target: { value: "75" } });
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it("shows error when start time is after end time", () => {
    render(<TimeSlider {...defaultProps} />);
    const startInput = screen.getByLabelText("시작 시간") as HTMLInputElement;
    
    // Set start time to be after end time
    fireEvent.change(startInput, { target: { value: "2024-01-02T00:00" } });
    
    expect(screen.getByText("시작 시간은 종료 시간보다 이전이어야 합니다")).toBeInTheDocument();
  });

  it("calls onRangeChange when start time is changed with valid range", () => {
    render(<TimeSlider {...defaultProps} />);
    const startInput = screen.getByLabelText("시작 시간") as HTMLInputElement;
    
    fireEvent.change(startInput, { target: { value: "2024-01-01T01:00" } });
    
    expect(mockOnRangeChange).toHaveBeenCalled();
  });

  it("calls onRangeChange when end time is changed with valid range", () => {
    render(<TimeSlider {...defaultProps} />);
    const endInput = screen.getByLabelText("종료 시간") as HTMLInputElement;
    
    fireEvent.change(endInput, { target: { value: "2024-01-01T22:00" } });
    
    expect(mockOnRangeChange).toHaveBeenCalled();
  });

  it("disables all inputs when disabled prop is true", () => {
    render(<TimeSlider {...defaultProps} disabled={true} />);
    
    const slider = screen.getByLabelText("시간 슬라이더");
    const startInput = screen.getByLabelText("시작 시간");
    const endInput = screen.getByLabelText("종료 시간");
    
    expect(slider).toBeDisabled();
    expect(startInput).toBeDisabled();
    expect(endInput).toBeDisabled();
  });

  it("renders availability visualization", () => {
    const { container } = render(<TimeSlider {...defaultProps} />);
    
    // Check that availability background elements are rendered
    const availabilityElements = container.querySelectorAll('[style*="rgba(56, 189, 248, 0.3)"]');
    expect(availabilityElements.length).toBeGreaterThan(0);
  });
});
