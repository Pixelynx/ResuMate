/**
 * Work experience entry
 */
export interface WorkExperience {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description: string;
  skills: string[];
  achievements: string[];
}

/**
 * Education entry
 */
export interface Education {
  degree: string;
  institution: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
  achievements: string[];
}

/**
 * Project entry
 */
export interface Project {
  name: string;
  description: string;
  skills: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Resume model
 */
export interface Resume {
  id: string;
  title: string;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  summary: string;
  skills: string[];
  workExperience: WorkExperience[];
  education: Education[];
  projects?: Project[];
  certifications?: string[];
  languages?: string[];
  createdAt: string;
  updatedAt: string;
}