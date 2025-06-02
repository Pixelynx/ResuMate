import { CompatibilityAssessment, CompatibilitySuggestion, CompatibilityMetrics } from '../types/mismatchTypes';

interface ServerResponse {
  success: boolean;
  isCompatible: boolean;
  compatibilityScore: number;
  message?: string;
  blockers?: CompatibilitySuggestion[];
  metadata?: CompatibilityMetrics;
}

/**
 * Detects if a server response indicates a compatibility mismatch
 * @param response The server response object
 * @returns True if the response indicates a mismatch
 */
export const detectMismatch = (response: ServerResponse): boolean => {
  try {
    // A response is considered a mismatch if:
    // 1. It's a successful response (HTTP 200) but isCompatible is false
    // 2. Has a compatibility score below threshold
    // 3. Contains blocking suggestions
    return (
      response.success &&
      (!response.isCompatible ||
        response.compatibilityScore < 70 ||
        (response.blockers?.length ?? 0) > 0)
    );
  } catch (error) {
    console.error('Error detecting mismatch:', error);
    return false;
  }
};

/**
 * Parses mismatch data from a server response
 * @param response The server response object
 * @returns Parsed compatibility assessment data
 */
export const parseMismatchData = (response: ServerResponse): CompatibilityAssessment => {
  try {
    const { isCompatible, compatibilityScore, blockers = [], metadata = {
      skillsMatch: [],
      missingCriticalSkills: [],
      experienceMismatch: false,
      roleTypeMismatch: false,
      assessmentDetails: {},
    } } = response;

    return {
      isCompatible,
      compatibilityScore,
      suggestions: blockers,
      metadata,
    };
  } catch (error) {
    console.error('Error parsing mismatch data:', error);
    // Return a safe default state
    return {
      isCompatible: false,
      compatibilityScore: 0,
      suggestions: [],
      metadata: {
        skillsMatch: [],
        missingCriticalSkills: [],
        experienceMismatch: false,
        roleTypeMismatch: false,
        assessmentDetails: {},
      },
    };
  }
};

/**
 * Logs mismatch details for debugging purposes
 * @param assessment The compatibility assessment data
 */
const logMismatchDetails = (assessment: CompatibilityAssessment): void => {
  console.group('Mismatch Details');
  console.log('Compatibility Score:', assessment.compatibilityScore);
  console.log('Is Compatible:', assessment.isCompatible);
  console.log('Suggestions:', assessment.suggestions);
  console.log('Metadata:', assessment.metadata);
  console.groupEnd();
};

export const MismatchService = {
  detectMismatch,
  parseMismatchData,
  logMismatchDetails,
}; 