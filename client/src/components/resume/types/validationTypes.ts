import { Dayjs } from "dayjs";

export interface PersonalDetailsValidation {
    firstname: FieldValidation;
    lastname: FieldValidation;
    title: FieldValidation;
    email: FieldValidation;
    phone: FieldValidation;
    location: FieldValidation;
    linkedin: FieldValidation;
    website: FieldValidation;
    github: FieldValidation;
    instagram: FieldValidation;
  }
  
  export interface WorkExperienceValidation {
    companyName: FieldValidation;
    jobtitle: FieldValidation;
    location: FieldValidation;
    description: FieldValidation;
    // Date validation flags
    startDateValid: boolean;
    endDateValid: boolean;
    dateErrorMessage: string;
  }
  
  export interface EducationValidation {
    institutionName: FieldValidation;
    degree: FieldValidation;
    fieldOfStudy: FieldValidation;
    location: FieldValidation;
    graduationDate: Date | null;
  }
  
  export interface SkillsValidation {
    skills_: FieldValidation;
    languages: FieldValidation;
  }
  
  export interface CertificationValidation {
    name: FieldValidation;
    organization: FieldValidation;
    dateObtained: FieldValidation;
    expirationDate: FieldValidation;
    credentialUrl: FieldValidation;
  }
  
  export interface ProjectValidation {
    title: FieldValidation;
    role: FieldValidation;
    duration: FieldValidation;
    description: FieldValidation;
    technologies: FieldValidation;
    projectUrl: FieldValidation;
  }

  // Validation types
  interface FieldValidation {
    error: boolean;
    message: string;
    touched: boolean
  }

  export interface ValidationState {
    [key: string]: FieldValidation | WorkExperienceValidation[] | any;
  }

  export interface ValidationError {
    fieldName: string;
    message: string;
    fieldId?: string;
  }
  