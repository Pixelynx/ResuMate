// @ts-check

/**
 * @typedef {import('./ContextRule').ContextRule} ContextRule
 * @typedef {import('./ContextRule').RuleCondition} RuleCondition
 * @typedef {import('./ContextRule').RuleEvaluationResult} RuleEvaluationResult
 * @typedef {import('./ContextRule').EvaluationContext} EvaluationContext
 * @typedef {import('./ContextRule').RuleEffect} RuleEffect
 */

/**
 * Analyzes context and applies rules for skill and experience evaluation
 */
class ContextAnalyzer {
  constructor() {
    /** @type {ContextRule[]} */
    this.rules = [];
  }

  /**
   * Add a new context rule
   * @param {ContextRule} rule - Rule to add
   */
  addRule(rule) {
    this.rules.push(rule);
    // Sort rules by priority (higher priority first)
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Evaluate context rules against given context
   * @param {EvaluationContext} context - Context to evaluate
   * @returns {RuleEvaluationResult[]} Evaluation results
   */
  evaluateRules(context) {
    try {
      return this.rules.map(rule => this.evaluateRule(rule, context));
    } catch (error) {
      console.error('Error evaluating context rules:', error);
      return [];
    }
  }

  /**
   * Calculate context-based score adjustments
   * @param {EvaluationContext} context - Context to evaluate
   * @returns {number} Context score
   */
  calculateContextScore(context) {
    try {
      const results = this.evaluateRules(context);
      let score = 1.0; // Base score

      results.forEach(result => {
        if (result.matched && result.appliedEffect) {
          switch (result.appliedEffect.type) {
            case 'score_multiplier':
              score *= result.appliedEffect.value;
              break;
            case 'bonus_points':
              score += result.appliedEffect.value;
              break;
            case 'minimum_score':
              score = Math.max(score, result.appliedEffect.value);
              break;
          }
        }
      });

      return Math.min(1, Math.max(0, score)); // Normalize to 0-1
    } catch (error) {
      console.error('Error calculating context score:', error);
      return 1.0; // Default to neutral score on error
    }
  }

  /**
   * Evaluate a single rule against the context
   * @param {ContextRule} rule - Rule to evaluate
   * @param {EvaluationContext} context - Context to evaluate against
   * @returns {RuleEvaluationResult} Rule evaluation result
   * @private
   */
  evaluateRule(rule, context) {
    try {
      const conditionsMatch = rule.conditions.every(condition => 
        this.evaluateCondition(condition, context)
      );

      return {
        ruleId: rule.id,
        matched: conditionsMatch,
        appliedEffect: conditionsMatch ? rule.effect : undefined,
        score: conditionsMatch ? this.calculateEffectScore(rule.effect) : 0,
        explanation: this.generateExplanation(rule, conditionsMatch)
      };
    } catch (error) {
      console.error(`Error evaluating rule ${rule.id}:`, error);
      return {
        ruleId: rule.id,
        matched: false,
        score: 0,
        explanation: 'Error evaluating rule'
      };
    }
  }

  /**
   * Evaluate a single condition against the context
   * @param {RuleCondition} condition - Condition to evaluate
   * @param {EvaluationContext} context - Context to evaluate against
   * @returns {boolean} Whether condition is met
   * @private
   */
  evaluateCondition(condition, context) {
    switch (condition.type) {
      case 'skill_present':
        return context.skills.includes(/** @type {string} */ (condition.value));

      case 'experience_years':
        const years = /** @type {number} */ (condition.value);
        return Object.values(context.experienceYears).some(exp => 
          this.compareValues(exp, years, condition.operator || 'greater_than')
        );

      case 'skill_count':
        return this.compareValues(
          context.skills.length,
          /** @type {number} */ (condition.value),
          condition.operator || 'greater_than'
        );

      case 'skill_combination':
        const requiredSkills = /** @type {string[]} */ (condition.value);
        return condition.operator === 'all'
          ? requiredSkills.every(skill => context.skills.includes(skill))
          : requiredSkills.some(skill => context.skills.includes(skill));

      default:
        return false;
    }
  }

  /**
   * Compare values using the specified operator
   * @param {number} a - First value
   * @param {number} b - Second value
   * @param {string} operator - Comparison operator
   * @returns {boolean} Comparison result
   * @private
   */
  compareValues(a, b, operator) {
    switch (operator) {
      case 'equals':
        return a === b;
      case 'greater_than':
        return a > b;
      case 'less_than':
        return a < b;
      default:
        return false;
    }
  }

  /**
   * Calculate score based on effect type
   * @param {RuleEffect} effect - Rule effect
   * @returns {number} Effect score
   * @private
   */
  calculateEffectScore(effect) {
    switch (effect.type) {
      case 'score_multiplier':
        return effect.value;
      case 'bonus_points':
        return 1 + effect.value;
      case 'minimum_score':
        return effect.value;
      default:
        return 1;
    }
  }

  /**
   * Generate explanation for rule evaluation
   * @param {ContextRule} rule - Rule that was evaluated
   * @param {boolean} matched - Whether rule matched
   * @returns {string} Explanation
   * @private
   */
  generateExplanation(rule, matched) {
    return matched
      ? `Rule "${rule.name}" matched: ${rule.description}`
      : `Rule "${rule.name}" did not match`;
  }
}

module.exports = {
  ContextAnalyzer
}; 