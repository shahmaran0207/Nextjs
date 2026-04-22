import { useState, useCallback, useRef, useEffect } from "react";

/**
 * 재생 속도 타입 (1배속, 2배속, 4배속, 8배속)
 */
export type PlaybackSpeed = 1 | 2 | 4 | 8;

/**
 * usePlayback Hook 옵션
 */
export interface UsePlaybackOptions {
  startTime: Date;
  endTime: Date;
  currentTime: Date;
  playbackSpeed: PlaybackSpeed;
  availableTimes: Date[]; // 재생 가능한 모든 시간 목록
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
}

/**
 * 플레이백 기능을 관리하는 커스텀 Hook
 * 
 * 시작~종료 시간 사이의 모든 데이터를 순차적으로 재생
 * 배속만 조절 가능
 */
export function usePlayback(options: UsePlaybackOptions): UsePlaybackReturn {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSpeed, setCurrentSpeed] = useState<PlaybackSpeed>(options.playbackSpeed);
  
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef<number>(0);
  const optionsRef = useRef(options);

  // options를 ref에 저장하여 최신 값 유지
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  /**
   * 재생 시작
   */
  const play = useCallback(() => {
    // 이미 재생 중이면 무시
    if (intervalIdRef.current !== null) {
      return;
    }

    const opts = optionsRef.current;
    
    // 재생 가능한 시간이 없으면 종료
    if (!opts.availableTimes || opts.availableTimes.length === 0) {
      console.warn("[usePlayback] No available times to play");
      return;
    }

    // 현재 시간에서 가장 가까운 인덱스 찾기
    let currentIdx = opts.availableTimes.findIndex(
      t => t.getTime() >= opts.currentTime.getTime()
    );
    
    // 인덱스를 찾지 못했거나 마지막에 도달했으면 처음부터 시작
    if (currentIdx < 0 || currentIdx >= opts.availableTimes.length) {
      currentIdx = 0;
      // 첫 번째 시간으로 이동
      opts.onTimeChange(opts.availableTimes[0]);
    }
    
    currentIndexRef.current = currentIdx;

    setIsPlaying(true);

    // 기본 재생 간격 (1초)
    const baseInterval = 1000;
    const realTimeInterval = baseInterval / currentSpeed;

    intervalIdRef.current = setInterval(() => {
      const opts = optionsRef.current;
      
      // 다음 인덱스로 이동
      currentIndexRef.current++;

      // 모든 데이터 재생 완료
      if (currentIndexRef.current >= opts.availableTimes.length) {
        // 재생 정지
        if (intervalIdRef.current !== null) {
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
        }
        setIsPlaying(false);
        
        // 마지막 시간으로 설정
        opts.onTimeChange(opts.availableTimes[opts.availableTimes.length - 1]);
        
        // 완료 콜백 호출
        opts.onComplete();
        return;
      }

      // 다음 시점으로 이동
      const nextTime = opts.availableTimes[currentIndexRef.current];
      opts.onTimeChange(nextTime);
    }, realTimeInterval);
  }, [currentSpeed]);

  /**
   * 재생 일시정지
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
   */
  const stop = useCallback(() => {
    // 재생 중지
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    setIsPlaying(false);

    // 시작 시간으로 복귀
    currentIndexRef.current = 0;
    const opts = optionsRef.current;
    if (opts.availableTimes && opts.availableTimes.length > 0) {
      opts.onTimeChange(opts.availableTimes[0]);
    } else {
      opts.onTimeChange(opts.startTime);
    }
  }, []);

  /**
   * 재생 속도 변경
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

    // 재생 중이었다면 새로운 속도로 재시작
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
  };
}
