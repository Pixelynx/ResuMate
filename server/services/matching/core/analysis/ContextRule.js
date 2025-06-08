// @ts-check

/**
 * @typedef {'skill_boost' | 'experience_boost' | 'minimum_requirement' | 'skill_combination'} ContextRuleType
 */

/**
 * @typedef {Object} RuleCondition
 * @property {'skill_present' | 'experience_years' | 'skill_count' | 'skill_combination'} type - Condition type
 * @property {string | number | string[]} value - Condition value
 * @property {'equals' | 'greater_than' | 'less_than' | 'contains' | 'all' | 'any'} [operator] - Comparison operator
 */

/**
 * @typedef {Object} RuleEffect
 * @property {'score_multiplier' | 'minimum_score' | 'bonus_points'} type - Effect type
 * @property {number} value - Effect value
 * @property {'skill' | 'experience' | 'overall'} [target] - Effect target
 */

/**
 * @typedef {Object} ContextRule
 * @property {string} id - Rule ID
 * @property {string} name - Rule name
 * @property {ContextRuleType} type - Rule type
 * @property {RuleCondition[]} conditions - Rule conditions
 * @property {RuleEffect} effect - Rule effect
 * @property {number} priority - Rule priority
 * @property {string} description - Rule description
 */

/**
 * @typedef {Object} RuleEvaluationResult
 * @property {string} ruleId - Rule ID
 * @property {boolean} matched - Whether rule matched
 * @property {RuleEffect} [appliedEffect] - Applied effect if matched
 * @property {number} score - Rule score
 * @property {string} explanation - Rule explanation
 */

/**
 * @typedef {Object} EvaluationContext
 * @property {string[]} skills - Skills to evaluate
 * @property {Object.<string, number>} experienceYears - Years of experience per skill
 * @property {string} jobContext - Job context
 * @property {string} jobLevel - Job level
 * @property {string} industry - Industry
 */

module.exports = {
  // We don't need to export anything since we're only using JSDoc types
}; 