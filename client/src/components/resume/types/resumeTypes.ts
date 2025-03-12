import { Dayjs } from "dayjs";

export interface PersonalDetails {
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
    github: string;
    instagram: string;
  }
  
  export interface WorkExperience {
    companyName: string;
    jobTitle: string;
    location: string;
    startDate: Dayjs | null;
    endDate: Dayjs | null;
    description: string;
  }
  
  export interface Education {
    institutionName: string;
    degree: string;
    fieldOfStudy: string;
    location: string;
    graduationDate: Date | null;
  }
  
  export interface Skills {
    skills_: string;
    languages: string;
  }
  
  export interface Certification {
    name: string;
    organization: string;
    dateObtained: Dayjs | null;
    expirationDate: Dayjs | null;
    credentialUrl: string;
  }
  
  export interface Project {
    title: string;
    role: string;
    duration: string;
    description: string;
    technologies: string;
    projectUrl: string;
  }