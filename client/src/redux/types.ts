import { Resume, ResumeFormData } from '../components/resume/types/resumeTypes';
import { CoverLetter, CoverLetterGenerationStatus } from '../components/coverLetter/types/coverLetterTypes';
import { JobFitState } from './slices/jobFitSlice';
import { PersistPartial } from 'redux-persist/es/persistReducer';

// Resume State Types
export interface ResumeState {
  resumes: Resume[];
  currentResume: Resume | null;
  draftResume: ResumeFormData | null;
  activeStep: number;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  savedResumeId: string | null;
  validationErrors: Record<string, any>;
  // Parsing related states
  parsingStatus: {
    isParsing: boolean;
    progress: number;
    error: string | null;
  };
}

// Cover Letter State Types
export interface CoverLetterState {
  coverLetters: CoverLetter[];
  currentCoverLetter: CoverLetter | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  generationStatus: CoverLetterGenerationStatus;
}

// Print State Types
export interface PrintState {
  isPrinting: boolean;
  printTarget: 'resume' | 'coverLetter' | null;
  printId: string | null;
  printError: string | null;
}

// Root State
export interface RootState {
  resume: ResumeState & PersistPartial;
  coverLetter: CoverLetterState & PersistPartial;
  print: PrintState & PersistPartial;
  jobFit: JobFitState & PersistPartial;
} 