import { useState, useCallback, useEffect } from 'react';
import { useProgressSimulator } from '../utils/progressSimulator';
import { CompatibilityAssessment } from '../types/mismatchTypes';

interface MismatchLoadingState {
  isLoading: boolean;
  progress: number;
  showMismatch: boolean;
  loadingMessage: string;
  assessment: CompatibilityAssessment | null;
}

/**
 * Custom hook for managing loading and transition states during mismatch detection
 */
export const useMismatchLoading = () => {
  const [state, setState] = useState<MismatchLoadingState>({
    isLoading: false,
    progress: 0,
    showMismatch: false,
    loadingMessage: 'Analyzing compatibility...',
    assessment: null,
  });

  const { progress, start, stop, reset } = useProgressSimulator({
    duration: 2000,
    initialPhase: 300,
    mainPhase: 1400,
    finalPhase: 300,
  });

  // Update progress from simulator
  useEffect(() => {
    if (state.isLoading) {
      setState(prev => ({ ...prev, progress }));
    }
  }, [progress, state.isLoading]);

  /**
   * Start the mismatch detection loading process
   */
  const startLoading = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      showMismatch: false,
      progress: 0,
      assessment: null,
    }));
    start();
  }, [start]);

  /**
   * Handle transition to mismatch display
   */
  const showMismatchOverlay = useCallback((assessment: CompatibilityAssessment) => {
    stop();
    setState(prev => ({
      ...prev,
      isLoading: false,
      showMismatch: true,
      assessment,
    }));
  }, [stop]);

  /**
   * Reset all states
   */
  const resetState = useCallback(() => {
    reset();
    setState({
      isLoading: false,
      progress: 0,
      showMismatch: false,
      loadingMessage: 'Analyzing compatibility...',
      assessment: null,
    });
  }, [reset]);

  /**
   * Update loading message
   */
  const setLoadingMessage = useCallback((message: string) => {
    setState(prev => ({ ...prev, loadingMessage: message }));
  }, []);

  return {
    isLoading: state.isLoading,
    progress: state.progress,
    showMismatch: state.showMismatch,
    loadingMessage: state.loadingMessage,
    assessment: state.assessment,
    startLoading,
    showMismatchOverlay,
    resetState,
    setLoadingMessage,
  };
}; 