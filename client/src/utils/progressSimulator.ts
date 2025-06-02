import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

/**
 * Configuration options for the progress simulator
 */
interface ProgressConfig {
  /** Total duration in milliseconds */
  duration?: number;
  /** Initial acceleration phase duration (0-20%) */
  initialPhase?: number;
  /** Main progress phase duration (20-80%) */
  mainPhase?: number;
  /** Final slowdown phase duration (80-100%) */
  finalPhase?: number;
  /** Step interval in milliseconds */
  stepInterval?: number;
}

/**
 * Progress simulator state and controls
 */
interface ProgressSimulator {
  progress: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

const DEFAULT_CONFIG: Required<ProgressConfig> = {
  duration: 3000,
  initialPhase: 500,
  mainPhase: 2000,
  finalPhase: 500,
  stepInterval: 50,
};

/**
 * Custom hook for simulating natural-feeling progress
 * @param config Optional configuration for the progress simulation
 * @returns Progress simulator state and controls
 */
export const useProgressSimulator = (config?: ProgressConfig): ProgressSimulator => {
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Memoize config to prevent unnecessary recalculations
  const finalConfig = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...config,
  }), [config]);

  /**
   * Calculate progress based on elapsed time using easing functions
   */
  const calculateProgress = useCallback((elapsedTime: number): number => {
    const { duration, initialPhase, mainPhase, finalPhase } = finalConfig;

    // Initial acceleration phase (0-20%)
    if (elapsedTime <= initialPhase) {
      return (elapsedTime / initialPhase) * 20;
    }

    // Main progress phase (20-80%)
    if (elapsedTime <= initialPhase + mainPhase) {
      const mainProgress = (elapsedTime - initialPhase) / mainPhase;
      return 20 + (mainProgress * 60);
    }

    // Final slowdown phase (80-100%)
    if (elapsedTime <= duration) {
      const finalProgress = (elapsedTime - (initialPhase + mainPhase)) / finalPhase;
      const easeOutCubic = 1 - Math.pow(1 - finalProgress, 3);
      return 80 + (easeOutCubic * 20);
    }

    return 100;
  }, [finalConfig]);

  /**
   * Update progress based on elapsed time
   */
  const updateProgress = useCallback(() => {
    if (!isRunning || !startTimeRef.current) return;

    const elapsedTime = Date.now() - startTimeRef.current;
    const newProgress = calculateProgress(elapsedTime);

    if (newProgress >= 100) {
      setProgress(100);
      setIsRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } else {
      setProgress(Math.min(100, newProgress));
    }
  }, [isRunning, calculateProgress]);

  /**
   * Start the progress simulation
   */
  const start = useCallback(() => {
    if (isRunning) return;

    setIsRunning(true);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(updateProgress, finalConfig.stepInterval);
  }, [isRunning, updateProgress, finalConfig.stepInterval]);

  /**
   * Stop/cancel the progress simulation
   */
  const stop = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * Reset the progress simulation
   */
  const reset = useCallback(() => {
    stop();
    setProgress(0);
    startTimeRef.current = 0;
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    progress,
    isRunning,
    start,
    stop,
    reset,
  };
}; 