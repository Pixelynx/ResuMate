import { SkillMatchResult } from './SkillMatcherType';
import { ExperienceMatchResult } from './ExperienceMatcherType';

/**
 * Detailed breakdown of compatibility scoring
 */
export interface ScoringBreakdown {
  /** Overall compatibility score (0-1) */
  overall: number;
  /** Skill match details */
  skills: {
    score: number;
    weight: number;
    result: SkillMatchResult;
  };
  /** Experience match details */
  experience: {
    score: number;
    weight: number;
    result: ExperienceMatchResult;
  };
  /** Context match details */
  context: {
    score: number;
    weight: number;
    relevantFactors: string[];
  };
}

/**
 * Recommendations for improving compatibility
 */
export interface MatchRecommendations {
  /** Critical improvements needed */
  critical: string[];
  /** Important but not critical improvements */
  important: string[];
  /** Nice-to-have improvements */
  optional: string[];
  /** Estimated impact of each recommendation (0-1) */
  impacts: { [recommendation: string]: number };
}

/**
 * Configuration for compatibility assessment
 */
export interface CompatibilityConfig {
  /** Weights for different assessment components */
  weights: {
    skills: number;
    experience: number;
    context: number;
  };
  /** Thresholds for different compatibility levels */
  thresholds: {
    minimum: number;
    moderate: number;
    good: number;
    excellent: number;
  };
}

/**
 * Interface for overall compatibility assessment
 */
export interface ICompatibilityAssessor {
  /**
   * Calculate overall compatibility score
   * @param config Optional assessment configuration
   * @returns Overall compatibility score (0-1)
   */
  calculateOverallScore(config?: Partial<CompatibilityConfig>): Promise<number>;

  /**
   * Get detailed breakdown of compatibility assessment
   * @returns Detailed scoring breakdown
   */
  getDetailedBreakdown(): Promise<ScoringBreakdown>;

  /**
   * Get recommendations for improving compatibility
   * @returns Prioritized improvement recommendations
   */
  getRecommendations(): Promise<MatchRecommendations>;

  /**
   * Check if compatibility meets minimum requirements
   * @param threshold Optional minimum threshold (defaults to config value)
   * @returns Whether compatibility is sufficient
   */
  meetsMinimumRequirements(threshold?: number): Promise<boolean>;
} 