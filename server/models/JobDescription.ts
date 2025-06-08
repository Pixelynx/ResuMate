/**
 * Job description model
 */
export interface JobDescription {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requiredSkills?: string[];
  preferredSkills?: string[];
  requiredYears?: number;
  level?: string;
  industry?: string;
  employmentType?: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  benefits?: string[];
  createdAt: string;
  updatedAt: string;
}