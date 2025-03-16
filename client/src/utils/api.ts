import axios from 'axios';
import { ResumeFormData } from '../components/resume/ResumeForm';

export interface CoverLetterData {
  id?: string;
  title: string;
  content: string;
  resumeId?: string;
  jobTitle?: string;
  company?: string;
  createdAt?: string;
  updatedAt?: string;
}

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const resumeService = {
  createResume: async (resumeData: ResumeFormData) => {
    try {
      const response = await API.post('/resumes', resumeData);
      return response.data;
    } catch (error) {
      console.error('Error creating resume:', error);
      throw error;
    }
  },

  getAllResumes: async () => {
    try {
      const response = await API.get('/resumes');
      return response.data;
    } catch (error) {
      console.error('Error fetching resumes:', error);
      throw error;
    }
  },

  getResumeById: async (id: string) => {
    try {
      const response = await API.get(`/resumes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching resume with ID ${id}:`, error);
      throw error;
    }
  },

  updateResume: async (id: string, resumeData: ResumeFormData) => {
    try {
      const response = await API.put(`/resumes/${id}`, resumeData);
      return response.data;
    } catch (error) {
      console.error(`Error updating resume with ID ${id}:`, error);
      throw error;
    }
  },

  deleteResume: async (id: string) => {
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
  createCoverLetter: async (coverLetterData: CoverLetterData) => {
    try {
      const response = await API.post('/cover-letters', coverLetterData);
      return response.data;
    } catch (error) {
      console.error('Error creating cover letter:', error);
      throw error;
    }
  },

  getAllCoverLetters: async () => {
    try {
      const response = await API.get('/cover-letters');
      return response.data;
    } catch (error) {
      console.error('Error fetching cover letters:', error);
      throw error;
    }
  },

  getCoverLetterById: async (id: string) => {
    try {
      const response = await API.get(`/cover-letters/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching cover letter with ID ${id}:`, error);
      throw error;
    }
  },

  updateCoverLetter: async (id: string, coverLetterData: CoverLetterData) => {
    try {
      const response = await API.put(`/cover-letters/${id}`, coverLetterData);
      return response.data;
    } catch (error) {
      console.error(`Error updating cover letter with ID ${id}:`, error);
      throw error;
    }
  },

  deleteCoverLetter: async (id: string) => {
    try {
      await API.delete(`/cover-letters/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting cover letter with ID ${id}:`, error);
      throw error;
    }
  },

  generateCoverLetter: async (resumeId: string, jobDetails: { jobTitle: string, company: string, jobDescription?: string }) => {
    try {
      const response = await API.post(`/cover-letters/generate`, { resumeId, ...jobDetails });
      return response.data;
    } catch (error) {
      console.error('Error generating cover letter:', error);
      throw error;
    }
  },
}; 