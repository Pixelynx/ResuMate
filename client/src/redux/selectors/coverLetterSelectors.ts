import { RootState } from '../types';

export const selectCoverLetters = (state: RootState) => state.coverLetter.coverLetters;
export const selectCurrentCoverLetter = (state: RootState) => state.coverLetter.currentCoverLetter;
export const selectCoverLetterLoading = (state: RootState) => state.coverLetter.loading;
export const selectCoverLetterSubmitting = (state: RootState) => state.coverLetter.submitting;
export const selectCoverLetterError = (state: RootState) => state.coverLetter.error;
export const selectGenerationStatus = (state: RootState) => state.coverLetter.generationStatus;

export const selectIsGenerating = (state: RootState) => 
  state.coverLetter.generationStatus.isGenerating;

export const selectGenerationProgress = (state: RootState) => 
  state.coverLetter.generationStatus.progress;

export const selectGenerationError = (state: RootState) => 
  state.coverLetter.generationStatus.error;

export const selectCoverLetterById = (id: string) => 
  (state: RootState) => state.coverLetter.coverLetters.find(cl => cl.id === id) || null;

export const selectCoverLettersByResumeId = (resumeId: string) => 
  (state: RootState) => state.coverLetter.coverLetters.filter(cl => cl.resumeId === resumeId); 