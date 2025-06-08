// @ts-check

/**
 * @typedef {Object} ExperienceMatch
 * @property {string} area - Area of experience being matched
 * @property {number} required - Required years of experience
 * @property {number} actual - Actual years of experience
 * @property {number} score - Match score (0-1)
 * @property {number} relevance - Relevance to the job context
 */

/**
 * @typedef {Object} ExperienceMatchConfig
 * @property {number} yearsWeight - Weight for years of experience
 * @property {number} relevanceWeight - Weight for relevance
 * @property {number} maxExperienceBonus - Maximum bonus for exceeding requirements
 * @property {number} insufficiencyPenalty - Penalty factor for insufficient experience
 */

/**
 * @typedef {Object} ExperienceMatchResult
 * @property {number} score - Overall experience match score (0-1)
 * @property {ExperienceMatch[]} matches - Detailed matches by area
 * @property {string[]} gaps - Areas where experience is insufficient
 * @property {string[]} recommendations - Suggestions for improvement
 */

/**
 * @typedef {Object} IExperienceMatcher
 * @property {(jobRequirements: Object.<string, number>, candidateExperience: Object.<string, number>, config?: Partial<ExperienceMatchConfig>) => Promise<ExperienceMatchResult>} matchExperience - Match candidate experience against job requirements
 * @property {(experience: { area: string, years: number }, jobContext: string) => Promise<number>} calculateExperienceRelevance - Calculate relevance of experience in a given context
 * @property {(matchResult: ExperienceMatchResult) => Promise<string[]>} analyzeGaps - Analyze experience gaps and provide recommendations
 */

module.exports = {}; // Empty export to make the file a module 