import { CoverLetter, GenerationOptions } from './coverLetterTypes';

export interface AIServiceConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface AIGenerationRequest {
  resumeData: {
    personalDetails: {
      firstName: string;
      lastName: string;
      title?: string;
      email: string;
      phone: string;
      location: string;
    };
    workExperience?: Array<{
      jobTitle: string;
      company: string;
      description: string;
      startDate: string;
      endDate?: string;
    }>;
    skills?: {
      skills_: string;
    };
  };
  jobDetails: {
    jobTitle: string;
    company: string;
    jobDescription?: string;
  };
  options?: GenerationOptions;
}

export interface AIGenerationResponse {
  success: boolean;
  content?: string;
  error?: string;
  metadata?: {
    model: string;
    tokensUsed: number;
    generationTime: number;
  };
}

export interface AIServiceError {
  code: string;
  message: string;
  details?: any;
}

export interface GenerationProgress {
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress: number;
  message?: string;
  error?: AIServiceError;
}

export type AIEventCallback = (event: {
  type: 'progress' | 'complete' | 'error';
  data: GenerationProgress;
}) => void; 