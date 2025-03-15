import axios from 'axios';
import { ResumeFormData } from '../components/resume/ResumeForm';

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