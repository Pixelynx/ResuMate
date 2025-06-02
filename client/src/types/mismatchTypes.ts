/**
 * Represents the severity level of a compatibility suggestion
 */
export type SuggestionSeverity = 'blocking' | 'warning' | 'info';

/**
 * Represents a single compatibility suggestion
 * @interface
 */
export interface CompatibilitySuggestion {
  /** The type/category of the suggestion (e.g., 'experience', 'skills', 'role_type') */
  type: string;
  /** The detailed message explaining the compatibility issue */
  message: string;
  /** The severity level of the suggestion */
  severity: SuggestionSeverity;
}

/**
 * Represents detailed metrics about the compatibility assessment
 * @interface
 */
export interface CompatibilityMetrics {
  skillsMatch: string[];
  missingCriticalSkills: string[];
  experienceMismatch: boolean;
  roleTypeMismatch: boolean;
  assessmentDetails: {
    [key: string]: number;
  };
  assessmentTimestamp?: string;
  assessmentVersion?: string;
  hasWarnings?: boolean;
}

/**
 * Represents the complete compatibility assessment result
 * @interface
 */
export interface CompatibilityAssessment {
  isCompatible: boolean;
  compatibilityScore: number;
  suggestions: CompatibilitySuggestion[];
  metadata: CompatibilityMetrics;
}

/**
 * Props for the MismatchOverlay component
 * @interface
 */
export interface MismatchOverlayProps {
  assessment: CompatibilityAssessment;
  isVisible: boolean;
  onClose: () => void;
  onRetry?: () => void;
  title?: string;
  className?: string;
}

/**
 * Props for the MismatchContent component
 * @interface
 */
export interface MismatchContentProps {
  assessment: CompatibilityAssessment;
  explanation?: string;
  alternativeRoles?: Array<{
    title: string;
    reason: string;
    matchScore: number;
  }>;
  className?: string;
}

/**
 * Props for the MismatchSuggestion component
 * @interface
 */
export interface MismatchSuggestionProps {
  suggestion: CompatibilitySuggestion;
  className?: string;
}

/**
 * API response format for cover letter generation
 * @interface
 */
export interface CoverLetterGenerationResponse {
  success: boolean;
  message?: string;
  isCompatible: boolean;
  blockers?: CompatibilitySuggestion[];
  compatibilityScore: number;
  metadata: CompatibilityMetrics;
  data?: {
    id: string;
    content: string;
    title: string;
  };
} 