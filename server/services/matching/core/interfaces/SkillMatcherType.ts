/**
 * Represents a skill match between job requirements and candidate skills
 */
export interface SkillMatch {
  /** The skill being matched */
  skill: string;
  /** Match confidence score (0-1) */
  confidence: number;
  /** Whether this is a direct or related skill match */
  matchType: 'direct' | 'related';
  /** Context in which the skill was matched */
  context?: string;
}

/**
 * Represents compensation applied for related skills
 */
export interface SkillCompensation {
  /** The original required skill */
  requiredSkill: string;
  /** The candidate's related skill that provides compensation */
  relatedSkill: string;
  /** Compensation factor (0-1) */
  factor: number;
  /** Reason for the compensation */
  reason: string;
}

/**
 * Result of a skill matching operation
 */
export interface SkillMatchResult {
  /** Overall skill match score (0-1) */
  score: number;
  /** List of matched skills */
  matches: SkillMatch[];
  /** List of compensations applied */
  compensations: SkillCompensation[];
  /** Critical skills that are missing */
  missingCritical: string[];
  /** Suggested skills for improvement */
  suggestions: string[];
}

/**
 * Configuration for skill matching
 */
export interface SkillMatchConfig {
  /** Base weight for skill matches */
  baseWeight: number;
  /** Multiplier based on context relevance */
  contextMultiplier: number;
  /** Factor for skill compensation */
  compensationFactor: number;
  /** Minimum threshold for considering a match */
  minThreshold: number;
}

/**
 * Interface for skill matching operations
 */
export interface SkillMatcherType {
  /**
   * Match candidate skills against job requirements
   * @param jobSkills Required skills from job description
   * @param candidateSkills Candidate's skills
   * @param config Optional matching configuration
   * @returns Detailed matching results
   */
  matchSkills(
    jobSkills: string[],
    candidateSkills: string[],
    config?: Partial<SkillMatchConfig>
  ): Promise<SkillMatchResult>;

  /**
   * Calculate relevance of a skill in a given context
   * @param skill The skill to evaluate
   * @param context The context to evaluate against
   * @returns Relevance score (0-1)
   */
  calculateSkillRelevance(skill: string, context: string): Promise<number>;

  /**
   * Find skills related to a given skill
   * @param skill The skill to find relations for
   * @returns Array of related skills
   */
  findRelatedSkills(skill: string): Promise<string[]>;
} 