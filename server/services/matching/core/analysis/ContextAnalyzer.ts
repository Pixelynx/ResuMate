import { 
  ContextRule, 
  RuleCondition, 
  RuleEvaluationResult, 
  EvaluationContext,
  RuleEffect
} from './ContextRule';

/**
 * Analyzes context and applies rules for skill and experience evaluation
 */
export class ContextAnalyzer {
  private rules: ContextRule[] = [];

  /**
   * Add a new context rule
   */
  public addRule(rule: ContextRule): void {
    this.rules.push(rule);
    // Sort rules by priority (higher priority first)
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Evaluate context rules against given context
   */
  public evaluateRules(context: EvaluationContext): RuleEvaluationResult[] {
    try {
      return this.rules.map(rule => this.evaluateRule(rule, context));
    } catch (error) {
      console.error('Error evaluating context rules:', error);
      return [];
    }
  }

  /**
   * Calculate context-based score adjustments
   */
  public calculateContextScore(context: EvaluationContext): number {
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
   */
  private evaluateRule(rule: ContextRule, context: EvaluationContext): RuleEvaluationResult {
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
   */
  private evaluateCondition(condition: RuleCondition, context: EvaluationContext): boolean {
    switch (condition.type) {
      case 'skill_present':
        return context.skills.includes(condition.value as string);

      case 'experience_years':
        const years = condition.value as number;
        return Object.values(context.experienceYears).some(exp => 
          this.compareValues(exp, years, condition.operator || 'greater_than')
        );

      case 'skill_count':
        return this.compareValues(
          context.skills.length,
          condition.value as number,
          condition.operator || 'greater_than'
        );

      case 'skill_combination':
        const requiredSkills = condition.value as string[];
        return condition.operator === 'all'
          ? requiredSkills.every(skill => context.skills.includes(skill))
          : requiredSkills.some(skill => context.skills.includes(skill));

      default:
        return false;
    }
  }

  /**
   * Compare values using the specified operator
   */
  private compareValues(a: number, b: number, operator: string): boolean {
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
   */
  private calculateEffectScore(effect: RuleEffect): number {
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
   */
  private generateExplanation(rule: ContextRule, matched: boolean): string {
    return matched
      ? `Rule "${rule.name}" matched: ${rule.description}`
      : `Rule "${rule.name}" did not match`;
  }
} 