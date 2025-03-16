
export interface PersonalDetails {
    firstName: string;
    lastName: string;
    title?: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
    github?: string;
    instagram?: string;
  }
  
  export interface WorkExperience {
    companyName: string;
    jobTitle: string;
    location: string;
    startDate: Date | null;
    endDate: Date | null;
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
    dateObtained: Date | null;
    expirationDate: Date | null;
    credentialUrl?: string;
  }
  
  export interface Project {
    title: string;
    role: string;
    duration: string;
    description: string;
    technologies: string;
    projectUrl?: string;
  }

  export interface Resume {
    id: string;
    personalDetails: PersonalDetails;
    workExperience: WorkExperience[];
    education: Education[];
    skills: Skills;
    certifications: Certification[];
    projects: Project[];
    createdAt?: string;
    updatedAt?: string;
  }

  export interface ResumeResponse {
    success: boolean;
    data: Resume;
    message?: string;
  }

  export interface ResumeListResponse {
    success: boolean;
    data: Resume[];
    message?: string;
  }