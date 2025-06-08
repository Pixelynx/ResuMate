/**
 * Represents a match between required and actual experience
 */
export interface ExperienceMatch {
  /** Area of experience being matched */
  area: string;
  /** Required years of experience */
  required: number;
  /** Actual years of experience */
  actual: number;
  /** Match score (0-1) */
  score: number;
  /** Relevance to the job context */
  relevance: number;
}

/**
 * Configuration for experience matching
 */
export interface ExperienceMatchConfig {
  /** Weight for years of experience */
  yearsWeight: number;
  /** Weight for relevance */
  relevanceWeight: number;
  /** Maximum bonus for exceeding requirements */
  maxExperienceBonus: number;
  /** Penalty factor for insufficient experience */
  insufficiencyPenalty: number;
}

/**
 * Result of an experience matching operation
 */
export interface ExperienceMatchResult {
  /** Overall experience match score (0-1) */
  score: number;
  /** Detailed matches by area */
  matches: ExperienceMatch[];
  /** Areas where experience is insufficient */
  gaps: string[];
  /** Suggestions for improvement */
  recommendations: string[];
}

/**
 * Interface for experience matching operations
 */
export interface IExperienceMatcher {
  /**
   * Match candidate experience against job requirements
   * @param jobRequirements Required experience from job description
   * @param candidateExperience Candidate's experience
   * @param config Optional matching configuration
   * @returns Detailed matching results
   */
  matchExperience(
    jobRequirements: { [area: string]: number },
    candidateExperience: { [area: string]: number },
    config?: Partial<ExperienceMatchConfig>
  ): Promise<ExperienceMatchResult>;

  /**
   * Calculate relevance of experience in a given context
   * @param experience Experience details
   * @param jobContext Job context information
   * @returns Relevance score (0-1)
   */
  calculateExperienceRelevance(
    experience: { area: string; years: number },
    jobContext: string
  ): Promise<number>;

  /**
   * Analyze experience gaps and provide recommendations
   * @param matchResult Result of experience matching
   * @returns Detailed recommendations for improvement
   */
  analyzeGaps(matchResult: ExperienceMatchResult): Promise<string[]>;
} 