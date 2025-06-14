export interface PersonalDetails {
    firstname: string;
    lastname: string;
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
    jobtitle: string;
    location: string;
    startDate: Date | string | null;
    endDate: Date | string | null;
    description: string;
  }
  
  export interface Education {
    institutionName: string;
    degree: string;
    fieldOfStudy: string;
    location: string;
    graduationDate: Date | string | null;
  }
  
  export interface Skills {
    skills_: string;
    languages: string;
  }
  
  export interface Certification {
    name: string;
    organization: string;
    dateObtained: Date | string | null;
    expirationDate: Date | string | null;
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
    workExperience: WorkExperience[] | null;
    education: Education[] | null;
    skills: Skills | null;
    certifications: Certification[] | null;
    projects: Project[] | null;
    createdAt?: string;
    updatedAt?: string;
  }

  export interface ResumeFormData {
    personalDetails: PersonalDetails;
    workExperience: WorkExperience[];
    education: Education[];
    skills: Skills;
    certifications: Certification[];
    projects: Project[];
  }

  export interface APIResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
  }

  export interface ResumeResponse extends APIResponse<Resume> {}

  export interface ResumeListResponse extends APIResponse<Resume[]> {}