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
      firstname: string;
      lastname: string;
      title?: string;
      email: string;
      phone: string;
      location: string;
    };
    workExperience?: Array<{
      jobtitle: string;
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
    jobtitle: string;
    company: string;
    jobdescription?: string;
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