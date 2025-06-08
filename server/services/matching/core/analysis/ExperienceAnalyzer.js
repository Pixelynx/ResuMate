// @ts-check
const { TechnologyMapper } = require('../TechnologyMapper');

/**
 * @typedef {Object} ExperienceEvaluation
 * @property {number} score - Overall score
 * @property {number} relevanceScore - Relevance score
 * @property {number} yearsScore - Years score
 * @property {ExperienceDetail[]} details - Evaluation details
 * @property {string[]} suggestions - Improvement suggestions
 */

/**
 * @typedef {Object} ExperienceDetail
 * @property {string} area - Experience area
 * @property {number} requiredYears - Required years
 * @property {number} actualYears - Actual years
 * @property {number} relevance - Relevance score
 * @property {number} score - Area score
 * @property {string} explanation - Detailed explanation
 */

/**
 * @typedef {Object} ExperienceAnalyzerConfig
 * @property {number} baseWeight - Base weight for scoring
 * @property {number} yearsWeight - Weight for years of experience
 * @property {number} relevanceWeight - Weight for relevance
 * @property {number} maxYearsBonus - Maximum bonus for extra years
 * @property {number} minYearsPenalty - Minimum penalty for missing years
 * @property {number} relevanceThreshold - Threshold for relevance
 */

/** @type {ExperienceAnalyzerConfig} */
const DEFAULT_CONFIG = {
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
class ExperienceAnalyzer {
  /**
   * @param {Partial<ExperienceAnalyzerConfig>} [config] - Analyzer configuration
   */
  constructor(config = {}) {
    /** @type {ExperienceAnalyzerConfig} */
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Evaluate experience against requirements
   * @param {Object.<string, number>} requirements - Experience requirements
   * @param {Object.<string, number>} experience - Actual experience
   * @param {string} context - Job context
   * @returns {ExperienceEvaluation} Experience evaluation
   */
  evaluateExperience(requirements, experience, context) {
    try {
      /** @type {ExperienceDetail[]} */
      const details = [];
      /** @type {string[]} */
      const suggestions = [];

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
   * @param {string} area - Experience area
   * @param {string} context - Job context
   * @returns {number} Relevance score
   * @private
   */
  calculateRelevance(area, context) {
    const groupInfo = TechnologyMapper.findGroupForSkill(area);
    if (!groupInfo) return 0.5; // Default relevance for unknown areas

    // Get all skills from the group
    const groupSkills = [
      groupInfo.group.primary,
      ...groupInfo.group.related
    ];
    
    const contextWords = context.toLowerCase().split(/\s+/);
    
    // Calculate how many skills from the group appear in the context
    const matchingSkills = groupSkills.filter(skill => 
      contextWords.some(word => word.includes(skill.toLowerCase()))
    );

    return Math.min(1, (matchingSkills.length / groupSkills.length) + 0.3);
  }

  /**
   * Calculate score for a specific experience area
   * @param {number} required - Required years
   * @param {number} actual - Actual years
   * @param {number} relevance - Relevance score
   * @returns {number} Area score
   * @private
   */
  calculateAreaScore(required, actual, relevance) {
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
   * @param {ExperienceDetail[]} details - Experience details
   * @returns {number} Years score
   * @private
   */
  calculateYearsScore(details) {
    if (details.length === 0) return 0;

    const totalScore = details.reduce((sum, detail) => 
      sum + (detail.actualYears / detail.requiredYears), 0);
    
    return Math.min(1, totalScore / details.length);
  }

  /**
   * Calculate overall relevance score
   * @param {ExperienceDetail[]} details - Experience details
   * @returns {number} Relevance score
   * @private
   */
  calculateRelevanceScore(details) {
    if (details.length === 0) return 0;

    const totalRelevance = details.reduce((sum, detail) => 
      sum + detail.relevance, 0);
    
    return totalRelevance / details.length;
  }

  /**
   * Calculate final overall score
   * @param {number} yearsScore - Years score
   * @param {number} relevanceScore - Relevance score
   * @returns {number} Overall score
   * @private
   */
  calculateOverallScore(yearsScore, relevanceScore) {
    return (yearsScore * this.config.yearsWeight + 
      relevanceScore * this.config.relevanceWeight) * 
      this.config.baseWeight;
  }

  /**
   * Generate explanation for experience evaluation
   * @param {string} area - Experience area
   * @param {number} required - Required years
   * @param {number} actual - Actual years
   * @param {number} relevance - Relevance score
   * @returns {string} Explanation
   * @private
   */
  generateExplanation(area, required, actual, relevance) {
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
   * @param {string} area - Experience area
   * @param {number} required - Required years
   * @param {number} actual - Actual years
   * @returns {string} Suggestion
   * @private
   */
  generateSuggestion(area, required, actual) {
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

module.exports = {
  ExperienceAnalyzer,
  DEFAULT_CONFIG
}; 