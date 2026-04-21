import { useState, useCallback, useRef, useEffect } from "react";

/**
 * 재생 속도 타입 (1배속, 2배속, 4배속, 8배속)
 */
export type PlaybackSpeed = 1 | 2 | 4 | 8;

/**
 * 시간 간격 타입 (분 단위: 1분, 5분, 10분, 30분, 60분)
 */
export type TimeInterval = 1 | 5 | 10 | 30 | 60;

/**
 * usePlayback Hook 옵션
 */
export interface UsePlaybackOptions {
  startTime: Date;
  endTime: Date;
  currentTime: Date;
  playbackSpeed: PlaybackSpeed;
  timeInterval: TimeInterval;
  onTimeChange: (time: Date) => void;
  onComplete: () => void;
}

/**
 * usePlayback Hook 반환 타입
 */
export interface UsePlaybackReturn {
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  setInterval: (interval: TimeInterval) => void;
}

/**
 * 플레이백 기능을 관리하는 커스텀 Hook
 * 
 * 자동 재생, 재생 속도 조정, 시간 간격 조정, 종료 시점 자동 정지
 * 
 * 요구사항: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 5.1, 5.2, 5.3, 5.4
 */
export function usePlayback(options: UsePlaybackOptions): UsePlaybackReturn {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSpeed, setCurrentSpeed] = useState<PlaybackSpeed>(options.playbackSpeed);
  const [currentInterval, setCurrentInterval] = useState<TimeInterval>(options.timeInterval);
  
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const optionsRef = useRef(options);

  // options를 ref에 저장하여 최신 값 유지
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  /**
   * 재생 시작
   * 요구사항: 3.2, 3.8
   */
  const play = useCallback(() => {
    // 이미 재생 중이면 무시
    if (intervalIdRef.current !== null) {
      return;
    }

    // 실제 시간 간격 계산 (재생 속도 적용)
    // 예: 5분 간격, 2배속 → 2.5초마다 업데이트
    const realTimeInterval = (currentInterval * 60 * 1000) / currentSpeed;

    setIsPlaying(true);

    intervalIdRef.current = setInterval(() => {
      const opts = optionsRef.current;
      
      // currentTime 유효성 검사
      if (!opts.currentTime || isNaN(opts.currentTime.getTime())) {
        console.error("[usePlayback] Invalid currentTime:", opts.currentTime);
        // 재생 정지
        if (intervalIdRef.current !== null) {
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
        }
        setIsPlaying(false);
        return;
      }

      const nextTime = new Date(
        opts.currentTime.getTime() + currentInterval * 60 * 1000
      );

      // nextTime 유효성 검사
      if (isNaN(nextTime.getTime())) {
        console.error("[usePlayback] Invalid nextTime calculated from:", opts.currentTime);
        // 재생 정지
        if (intervalIdRef.current !== null) {
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
        }
        setIsPlaying(false);
        return;
      }

      // 종료 시점 도달 시 자동 정지 (요구사항 3.5)
      if (nextTime > opts.endTime) {
        // 재생 정지
        if (intervalIdRef.current !== null) {
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
        }
        setIsPlaying(false);
        
        // 종료 시간으로 설정
        opts.onTimeChange(opts.endTime);
        
        // 완료 콜백 호출
        opts.onComplete();
      } else {
        // 다음 시점으로 이동
        opts.onTimeChange(nextTime);
      }
    }, realTimeInterval);
  }, [currentSpeed, currentInterval]);

  /**
   * 재생 일시정지
   * 요구사항: 3.3
   */
  const pause = useCallback(() => {
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  /**
   * 재생 정지 및 시작 시간으로 복귀
   * 요구사항: 3.4
   */
  const stop = useCallback(() => {
    // 재생 중지
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    setIsPlaying(false);

    // 시작 시간으로 복귀
    const opts = optionsRef.current;
    opts.onTimeChange(opts.startTime);
  }, []);

  /**
   * 재생 속도 변경
   * 요구사항: 3.6, 3.7
   */
  const setSpeed = useCallback((speed: PlaybackSpeed) => {
    const wasPlaying = intervalIdRef.current !== null;
    
    // 재생 중이면 일시정지
    if (wasPlaying) {
      clearInterval(intervalIdRef.current!);
      intervalIdRef.current = null;
      setIsPlaying(false);
    }

    setCurrentSpeed(speed);

    // 재생 중이었다면 새로운 속도로 재시작 (요구사항 3.7)
    if (wasPlaying) {
      setTimeout(() => {
        play();
      }, 0);
    }
  }, [play]);

  /**
   * 시간 간격 변경
   * 요구사항: 5.2, 5.4
   */
  const setInterval = useCallback((interval: TimeInterval) => {
    const wasPlaying = intervalIdRef.current !== null;
    
    // 재생 중이면 일시정지
    if (wasPlaying) {
      clearInterval(intervalIdRef.current!);
      intervalIdRef.current = null;
      setIsPlaying(false);
    }

    setCurrentInterval(interval);

    // 재생 중이었다면 새로운 간격으로 재시작 (요구사항 5.4)
    if (wasPlaying) {
      setTimeout(() => {
        play();
      }, 0);
    }
  }, [play]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  return {
    isPlaying,
    play,
    pause,
    stop,
    setSpeed,
    setInterval,
  };
}
