import { TechnologyMapper } from '../TechnologyMapper';

/**
 * Experience evaluation result
 */
export interface ExperienceEvaluation {
  score: number;
  relevanceScore: number;
  yearsScore: number;
  details: ExperienceDetail[];
  suggestions: string[];
}

/**
 * Detailed experience evaluation for a specific area
 */
export interface ExperienceDetail {
  area: string;
  requiredYears: number;
  actualYears: number;
  relevance: number;
  score: number;
  explanation: string;
}

/**
 * Configuration for experience evaluation
 */
export interface ExperienceAnalyzerConfig {
  baseWeight: number;
  yearsWeight: number;
  relevanceWeight: number;
  maxYearsBonus: number;
  minYearsPenalty: number;
  relevanceThreshold: number;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: ExperienceAnalyzerConfig = {
  baseWeight: 1.0,
  yearsWeight: 0.6,
  relevanceWeight: 0.4,
  maxYearsBonus: 0.3,
  minYearsPenalty: 0.4,
  relevanceThreshold: 0.7
};

/**
 * Analyzes and scores work experience
 */
export class ExperienceAnalyzer {
  private config: ExperienceAnalyzerConfig;

  constructor(config: Partial<ExperienceAnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Evaluate experience against requirements
   */
  public evaluateExperience(
    requirements: { [area: string]: number },
    experience: { [area: string]: number },
    context: string
  ): ExperienceEvaluation {
    try {
      const details: ExperienceDetail[] = [];
      const suggestions: string[] = [];

      // Evaluate each required area
      for (const [area, requiredYears] of Object.entries(requirements)) {
        const actualYears = experience[area] || 0;
        const relevance = this.calculateRelevance(area, context);
        const score = this.calculateAreaScore(requiredYears, actualYears, relevance);

        details.push({
          area,
          requiredYears,
          actualYears,
          relevance,
          score,
          explanation: this.generateExplanation(area, requiredYears, actualYears, relevance)
        });

        if (score < this.config.relevanceThreshold) {
          suggestions.push(this.generateSuggestion(area, requiredYears, actualYears));
        }
      }

      // Calculate overall scores
      const yearsScore = this.calculateYearsScore(details);
      const relevanceScore = this.calculateRelevanceScore(details);
      const overallScore = this.calculateOverallScore(yearsScore, relevanceScore);

      return {
        score: overallScore,
        yearsScore,
        relevanceScore,
        details,
        suggestions
      };
    } catch (error) {
      console.error('Error evaluating experience:', error);
      throw new Error('Failed to evaluate experience');
    }
  }

  /**
   * Calculate relevance of experience area to job context
   */
  private calculateRelevance(area: string, context: string): number {
    const group = TechnologyMapper.findGroupForSkill(area);
    if (!group) return 0.5; // Default relevance for unknown areas

    const groupSkills = TechnologyMapper.getGroupSkills(group);
    const contextWords = context.toLowerCase().split(/\s+/);
    
    // Calculate how many skills from the group appear in the context
    const matchingSkills = groupSkills.filter(skill => 
      contextWords.some(word => word.includes(skill.toLowerCase()))
    );

    return Math.min(1, (matchingSkills.length / groupSkills.length) + 0.3);
  }

  /**
   * Calculate score for a specific experience area
   */
  private calculateAreaScore(
    required: number,
    actual: number,
    relevance: number
  ): number {
    const yearsRatio = actual / required;
    let score = yearsRatio;

    // Apply bonus for exceeding requirements
    if (yearsRatio > 1) {
      score += Math.min(this.config.maxYearsBonus, (yearsRatio - 1) * 0.1);
    }
    // Apply penalty for insufficient experience
    else if (yearsRatio < 1) {
      score -= Math.min(this.config.minYearsPenalty, (1 - yearsRatio) * 0.2);
    }

    // Factor in relevance
    score *= (relevance * this.config.relevanceWeight + 
      (1 - this.config.relevanceWeight));

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculate overall years of experience score
   */
  private calculateYearsScore(details: ExperienceDetail[]): number {
    if (details.length === 0) return 0;

    const totalScore = details.reduce((sum, detail) => 
      sum + (detail.actualYears / detail.requiredYears), 0);
    
    return Math.min(1, totalScore / details.length);
  }

  /**
   * Calculate overall relevance score
   */
  private calculateRelevanceScore(details: ExperienceDetail[]): number {
    if (details.length === 0) return 0;

    const totalRelevance = details.reduce((sum, detail) => 
      sum + detail.relevance, 0);
    
    return totalRelevance / details.length;
  }

  /**
   * Calculate final overall score
   */
  private calculateOverallScore(yearsScore: number, relevanceScore: number): number {
    return (yearsScore * this.config.yearsWeight + 
      relevanceScore * this.config.relevanceWeight) * 
      this.config.baseWeight;
  }

  /**
   * Generate explanation for experience evaluation
   */
  private generateExplanation(
    area: string,
    required: number,
    actual: number,
    relevance: number
  ): string {
    const yearsDiff = actual - required;
    const relevanceText = relevance >= 0.8 ? 'highly relevant' :
      relevance >= 0.5 ? 'moderately relevant' : 'less relevant';

    if (yearsDiff >= 0) {
      return `${actual} years of ${relevanceText} experience in ${area}, ` +
        `exceeding the required ${required} years`;
    } else {
      return `${actual} years of ${relevanceText} experience in ${area}, ` +
        `${Math.abs(yearsDiff)} years below the required ${required} years`;
    }
  }

  /**
   * Generate suggestion for improving experience
   */
  private generateSuggestion(area: string, required: number, actual: number): string {
    const yearsDiff = required - actual;
    const group = TechnologyMapper.findGroupForSkill(area);
    
    if (group) {
      const relatedSkills = TechnologyMapper.getRelatedSkills(area);
      if (relatedSkills.length > 0) {
        return `Consider gaining ${yearsDiff} more years of experience in ${area} ` +
          `or related areas like ${relatedSkills.slice(0, 2).join(', ')}`;
      }
    }

    return `Gain ${yearsDiff} more years of experience in ${area}`;
  }
} 