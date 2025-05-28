import { RootState } from '../store';

export const selectJobFitScore = (state: RootState): number | null => state.jobFit.score;
export const selectJobFitExplanation = (state: RootState): string | null => state.jobFit.explanation;
export const selectJobFitLoading = (state: RootState): boolean => state.jobFit.loading;
export const selectJobFitError = (state: RootState): string | null => state.jobFit.error; 