import axios from 'axios';
import { ResumeFormData } from '../components/resume/types/resumeTypes';
import { Resume } from '../components/resume/types/resumeTypes';
import {
  CoverLetterFormData,
  CoverLetterGenerationRequest,
  CoverLetterResponse,
  CoverLetterListResponse,
  GenerationOptions,
  CoverLetter
} from '../components/coverLetter/types/coverLetterTypes';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export type ResumeResponse = Resume;
export type ResumeListResponse = Resume[];

export const resumeService = {
  createResume: async (resumeData: ResumeFormData): Promise<ResumeResponse> => {
    try {
      const response = await API.post('/resumes', resumeData);
      return response.data;
    } catch (error) {
      console.error('Error creating resume:', error);
      throw error;
    }
  },

  getAllResumes: async (): Promise<ResumeListResponse> => {
    try {
      const response = await API.get('/resumes');
      return response.data;
    } catch (error) {
      console.error('Error fetching resumes:', error);
      throw error;
    }
  },

  getResumeById: async (id: string): Promise<ResumeResponse> => {
    try {
      const response = await API.get(`/resumes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching resume with ID ${id}:`, error);
      throw error;
    }
  },

  updateResume: async (id: string, resumeData: ResumeFormData): Promise<void> => {
    try {
      await API.put(`/resumes/${id}`, resumeData);
    } catch (error) {
      console.error(`Error updating resume with ID ${id}:`, error);
      throw error;
    }
  },

  deleteResume: async (id: string): Promise<boolean> => {
    try {
      await API.delete(`/resumes/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting resume with ID ${id}:`, error);
      throw error;
    }
  },
};

export const coverLetterService = {
  createCoverLetter: async (coverLetterData: CoverLetterFormData): Promise<CoverLetterResponse | CoverLetter> => {
    try {
      const response = await API.post('/cover-letter', coverLetterData);
      return response.data;
    } catch (error) {
      console.error('Error creating cover letter:', error);
      throw error;
    }
  },

  getCoverLetter: async (id: string): Promise<CoverLetterResponse | CoverLetter> => {
    try {
      const response = await API.get(`/cover-letter/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching cover letter with ID ${id}:`, error);
      throw error;
    }
  },

  getAllCoverLetters: async (): Promise<CoverLetterListResponse | CoverLetter[]> => {
    try {
      const response = await API.get('/cover-letter');
      return response.data;
    } catch (error) {
      console.error('Error fetching cover letters:', error);
      throw error;
    }
  },

  updateCoverLetter: async (id: string, coverLetterData: Partial<CoverLetterFormData>): Promise<CoverLetterResponse | CoverLetter> => {
    try {
      const response = await API.put(`/cover-letter/${id}`, coverLetterData);
      return response.data;
    } catch (error) {
      console.error(`Error updating cover letter with ID ${id}:`, error);
      throw error;
    }
  },

  deleteCoverLetter: async (id: string): Promise<boolean> => {
    try {
      await API.delete(`/cover-letter/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting cover letter with ID ${id}:`, error);
      throw error;
    }
  },

  generateCoverLetter: async (
    request: CoverLetterGenerationRequest,
    options: GenerationOptions
  ): Promise<CoverLetterResponse | CoverLetter> => {
    try {
      const response = await API.post('/cover-letter/generate', {
        ...request,
        options
      });
      return response.data;
    } catch (error) {
      console.error('Error generating cover letter:', error);
      throw error;
    }
  },
}; 