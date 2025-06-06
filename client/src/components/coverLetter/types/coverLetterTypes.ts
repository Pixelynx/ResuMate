export interface CoverLetter {
  id: string;
  title: string;
  content: string;
  resumeid?: string;
  resumeTitle?: string;
  jobtitle?: string;
  company?: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber?: string;
  prevEmployed?: string[];
  jobdescription?: string;
  createdAt: string;
  updatedAt?: string;
  generationoptions?: GenerationOptions;
}

export interface CoverLetterGenerationRequest {
  resumeid: string;
  jobtitle?: string;
  company?: string;
  jobdescription?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phoneNumber?: string;
}

export interface CoverLetterResponse {
  id?: string;
  success: boolean;
  data?: CoverLetter;
  message?: string;
}

export interface CoverLetterListResponse {
  success: boolean;
  data?: CoverLetter[];
  message?: string;
}

export interface CoverLetterFormData {
  title: string;
  content: string;
  resumeid?: string;
  jobtitle?: string;
  company?: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber?: string;
  prevEmployed?: string[];
  jobdescription?: string;
}

export interface CoverLetterGenerationStatus {
  isGenerating: boolean;
  error: string | null;
  progress: number; // 0-100
  message?: string;
}

export interface CoverLetterContextType {
  coverLetters: CoverLetter[];
  selectedCoverLetter: CoverLetter | null;
  generationStatus: CoverLetterGenerationStatus;
  setCoverLetters: (coverLetters: CoverLetter[]) => void;
  setSelectedCoverLetter: (coverLetter: CoverLetter | null) => void;
  generateCoverLetter: (params: CoverLetterGenerationRequest) => Promise<CoverLetter>;
  updateCoverLetter: (id: string, data: Partial<CoverLetterFormData>) => Promise<void>;
  deleteCoverLetter: (id: string) => Promise<void>;
}

// API Service Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Validation Types
// export interface CoverLetterValidationErrors {
//   title?: string;
//   content?: string;
//   jobtitle?: string;
//   company?: string;
// }

// Form State Types
export interface CoverLetterFormState {
  isSubmitting: boolean;
  isEditing: boolean;
  validationErrors: {
    [key: string]: string;
  };
}

// AI Generation Options
export interface GenerationOptions {
  tone?: 'professional' | 'casual' | 'enthusiastic';
  length?: 'short' | 'medium' | 'long';
  focusPoints?: string[];
  includeReferences?: boolean;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

// Default values for generation options
export const DEFAULT_GENERATION_OPTIONS: GenerationOptions = {
  tone: 'professional',
  length: 'medium',
  focusPoints: [],
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1000,
  topP: 1
};

// Generation progress states
export const GENERATION_STATES = {
  IDLE: 'idle',
  PREPARING: 'preparing',
  GENERATING: 'generating',
  SAVING: 'saving',
  COMPLETED: 'completed',
  ERROR: 'error'
} as const;

export type GenerationState = typeof GENERATION_STATES[keyof typeof GENERATION_STATES]; 