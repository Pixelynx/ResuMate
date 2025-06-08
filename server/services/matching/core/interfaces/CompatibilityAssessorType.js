// @ts-check

/** @typedef {import('./SkillMatcherType').SkillMatchResult} SkillMatchResult */
/** @typedef {import('./ExperienceMatcherType').ExperienceMatchResult} ExperienceMatchResult */

/**
 * @typedef {Object} ScoringBreakdown
 * @property {number} overall - Overall compatibility score (0-1)
 * @property {{ score: number, weight: number, result: SkillMatchResult }} skills - Skill match details
 * @property {{ score: number, weight: number, result: ExperienceMatchResult }} experience - Experience match details
 * @property {{ score: number, weight: number, relevantFactors: string[] }} context - Context match details
 */

/**
 * @typedef {Object} MatchRecommendations
 * @property {string[]} critical - Critical improvements needed
 * @property {string[]} important - Important but not critical improvements
 * @property {string[]} optional - Nice-to-have improvements
 * @property {Object.<string, number>} impacts - Estimated impact of each recommendation (0-1)
 */

/**
 * @typedef {Object} CompatibilityConfig
 * @property {{ skills: number, experience: number, context: number }} weights - Weights for different assessment components
 * @property {{ minimum: number, moderate: number, good: number, excellent: number }} thresholds - Thresholds for different compatibility levels
 */

/**
 * @typedef {Object} ICompatibilityAssessor
 * @property {(config?: Partial<CompatibilityConfig>) => Promise<number>} calculateOverallScore - Calculate overall compatibility score
 * @property {() => Promise<ScoringBreakdown>} getDetailedBreakdown - Get detailed breakdown of compatibility assessment
 * @property {() => Promise<MatchRecommendations>} getRecommendations - Get recommendations for improving compatibility
 * @property {(threshold?: number) => Promise<boolean>} meetsMinimumRequirements - Check if compatibility meets minimum requirements
 */

module.exports = {}; // Empty export to make the file a module 