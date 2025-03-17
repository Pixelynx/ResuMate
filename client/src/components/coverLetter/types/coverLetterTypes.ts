export interface CoverLetter {
  id: string;
  title: string;
  content: string;
  resumeId: string;
  jobTitle: string;
  company: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CoverLetterGenerationRequest {
  resumeId: string;
  jobTitle: string;
  company: string;
  jobDescription?: string;
}

export interface CoverLetterResponse {
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
  resumeId: string;
  jobTitle: string;
  company: string;
  jobDescription?: string;
}

export interface CoverLetterGenerationStatus {
  isGenerating: boolean;
  error: string | null;
  progress: number; // 0-100
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
export interface CoverLetterValidationErrors {
  title?: string;
  content?: string;
  jobTitle?: string;
  company?: string;
}

// Form State Types
export interface CoverLetterFormState {
  isSubmitting: boolean;
  isEditing: boolean;
  validationErrors: CoverLetterValidationErrors;
}

// AI Generation Options
export interface GenerationOptions {
  tone?: 'professional' | 'casual' | 'enthusiastic';
  length?: 'short' | 'medium' | 'long';
  emphasis?: string[]; // specific skills or experiences to emphasize
  customInstructions?: string;
} 