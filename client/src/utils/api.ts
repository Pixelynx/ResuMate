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
      console.log('Creating resume with data:', JSON.stringify(resumeData, null, 2));
      // Log specifically the format of phone and any dates
      console.log('Phone format:', resumeData.personalDetails.phone);
      
      // Log work experience dates for debugging
      if (resumeData.workExperience && resumeData.workExperience.length > 0) {
        resumeData.workExperience.forEach((exp, index) => {
          console.log(`Work exp #${index + 1} - startDate:`, exp.startDate);
          console.log(`Work exp #${index + 1} - endDate:`, exp.endDate);
        });
      }
      
      const response = await API.post('/resumes', resumeData);
      console.log('Resume created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating resume:', error);
      if (error.response) {
        console.error('Server response data:', error.response.data);
        console.error('Server response status:', error.response.status);
      }
      throw error;
    }
  },

  getAllResumes: async (): Promise<ResumeListResponse> => {
    try {
      console.log('Fetching all resumes...');
      const response = await API.get('/resumes');
      console.log('Fetched resumes count:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('Error fetching resumes:', error);
      throw error;
    }
  },

  getResumeById: async (id: string): Promise<ResumeResponse> => {
    try {
      console.log(`Fetching resume with ID ${id}...`);
      const response = await API.get(`/resumes/${id}`);
      console.log('Resume fetched successfully:', response.data.id);
      return response.data;
    } catch (error) {
      console.error(`Error fetching resume with ID ${id}:`, error);
      throw error;
    }
  },

  updateResume: async (id: string, resumeData: ResumeFormData): Promise<ResumeResponse> => {
    try {
      console.log(`Updating resume with ID ${id}:`, JSON.stringify(resumeData, null, 2));
      
      // Log phone format
      console.log('Phone format:', resumeData.personalDetails.phone);
      
      // Log work experience dates for debugging
      if (resumeData.workExperience && resumeData.workExperience.length > 0) {
        resumeData.workExperience.forEach((exp, index) => {
          console.log(`Work exp #${index + 1} - startDate:`, exp.startDate);
          console.log(`Work exp #${index + 1} - endDate:`, exp.endDate);
        });
      }
      
      const response = await API.put(`/resumes/${id}`, resumeData);
      console.log('Resume updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating resume with ID ${id}:`, error);
      if (error.response) {
        console.error('Server response data:', error.response.data);
        console.error('Server response status:', error.response.status);
      }
      throw error;
    }
  },

  deleteResume: async (id: string): Promise<boolean> => {
    try {
      console.log(`Deleting resume with ID ${id}...`);
      await API.delete(`/resumes/${id}`);
      console.log('Resume deleted successfully');
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