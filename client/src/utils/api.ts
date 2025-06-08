import axios from 'axios';
import { ResumeFormData, Resume, ResumeResponse, ResumeListResponse, APIResponse } from '../components/resume/types/resumeTypes';
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

const handleError = (error: any): never => {
  console.error('API Error:', error);
  
  if (error.response) {
    console.error('Server response data:', error.response.data);
    console.error('Server response status:', error.response.status);
    throw error.response.data;
  }
  
  throw new Error(error.message || 'An unexpected error occurred');
};

// Data transformation utilities
const transformFormDataForAPI = (formData: ResumeFormData): ResumeFormData => {
  // Clean empty arrays before sending to API
  return {
    ...formData,
    workExperience: formData.workExperience.length > 0 ? formData.workExperience : [],
    education: formData.education.length > 0 ? formData.education : [],
    certifications: formData.certifications.length > 0 ? formData.certifications : [],
    projects: formData.projects.length > 0 ? formData.projects : []
  };
};

const transformAPIResponse = (response: any): Resume => {
  // Ensure null sections are properly handled
  return {
    ...response,
    workExperience: response.workExperience || null,
    education: response.education || null,
    skills: response.skills || null,
    certifications: response.certifications || null,
    projects: response.projects || null
  };
};

export const resumeService = {
  createResume: async (formData: ResumeFormData): Promise<Resume> => {
    try {
      console.log('Creating resume with data:', JSON.stringify(formData, null, 2));
      
      const transformedData = transformFormDataForAPI(formData);
      const response = await API.post<ResumeResponse>('/resumes', transformedData);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create resume');
      }
      
      return transformAPIResponse(response.data.data);
    } catch (error) {
      return handleError(error);
    }
  },

  getAllResumes: async (): Promise<Resume[]> => {
    try {
      console.log('Fetching all resumes...');
      const response = await API.get<ResumeListResponse>('/resumes');
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch resumes');
      }
      
      return response.data.data.map(transformAPIResponse);
    } catch (error) {
      return handleError(error);
    }
  },

  getResumeById: async (id: string): Promise<Resume> => {
    try {
      console.log(`Fetching resume with ID ${id}...`);
      const response = await API.get<ResumeResponse>(`/resumes/${id}`);
      
      console.log('Resume response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch resume');
      }
      
      if (!response.data.data) {
        throw new Error('Resume data is missing from response');
      }
      
      return transformAPIResponse(response.data.data);
    } catch (error: any) {
      console.error('Error in getResumeById:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return handleError(error);
    }
  },

  updateResume: async (id: string, formData: ResumeFormData): Promise<Resume> => {
    try {
      console.log(`Updating resume with ID ${id}:`, JSON.stringify(formData, null, 2));
      
      const transformedData = transformFormDataForAPI(formData);
      const response = await API.put<ResumeResponse>(`/resumes/${id}`, transformedData);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to update resume');
      }
      
      return transformAPIResponse(response.data.data);
    } catch (error) {
      return handleError(error);
    }
  },

  deleteResume: async (id: string): Promise<boolean> => {
    try {
      console.log(`Deleting resume with ID ${id}...`);
      const response = await API.delete<APIResponse<boolean>>(`/resumes/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete resume');
      }
      
      return true;
    } catch (error) {
      return handleError(error);
    }
  }
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