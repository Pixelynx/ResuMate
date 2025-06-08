// @ts-check

/**
 * @typedef {Object} SkillMatch
 * @property {string} skill - The skill being matched
 * @property {number} confidence - Match confidence score (0-1)
 * @property {'direct' | 'related'} matchType - Whether this is a direct or related skill match
 * @property {string} [context] - Context in which the skill was matched
 */

/**
 * @typedef {Object} SkillCompensation
 * @property {string} requiredSkill - The original required skill
 * @property {string} relatedSkill - The candidate's related skill that provides compensation
 * @property {number} factor - Compensation factor (0-1)
 * @property {string} reason - Reason for the compensation
 */

/**
 * @typedef {Object} SkillMatchResult
 * @property {number} score - Overall skill match score (0-1)
 * @property {SkillMatch[]} matches - List of matched skills
 * @property {SkillCompensation[]} compensations - List of compensations applied
 * @property {string[]} missingCritical - Critical skills that are missing
 * @property {string[]} suggestions - Suggested skills for improvement
 */

/**
 * @typedef {Object} SkillMatchConfig
 * @property {number} baseWeight - Base weight for skill matches
 * @property {number} contextMultiplier - Multiplier based on context relevance
 * @property {number} compensationFactor - Factor for skill compensation
 * @property {number} minThreshold - Minimum threshold for considering a match
 */

/**
 * @typedef {Object} SkillMatcherType
 * @property {(jobSkills: string[], candidateSkills: string[], config?: Partial<SkillMatchConfig>) => Promise<SkillMatchResult>} matchSkills - Match candidate skills against job requirements
 * @property {(skill: string, context: string) => Promise<number>} calculateSkillRelevance - Calculate relevance of a skill in a given context
 * @property {(skill: string) => Promise<string[]>} findRelatedSkills - Find skills related to a given skill
 */

module.exports = {}; // Empty export to make the file a module 