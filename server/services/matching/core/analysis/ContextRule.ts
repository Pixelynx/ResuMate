/**
 * Types of context rules for skill and experience evaluation
 */
export type ContextRuleType = 'skill_boost' | 'experience_boost' | 'minimum_requirement' | 'skill_combination';

/**
 * Condition for context rule evaluation
 */
export interface RuleCondition {
  type: 'skill_present' | 'experience_years' | 'skill_count' | 'skill_combination';
  value: string | number | string[];
  operator?: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'all' | 'any';
}

/**
 * Effect to apply when rule conditions are met
 */
export interface RuleEffect {
  type: 'score_multiplier' | 'minimum_score' | 'bonus_points';
  value: number;
  target?: 'skill' | 'experience' | 'overall';
}

/**
 * Context rule definition
 */
export interface ContextRule {
  id: string;
  name: string;
  type: ContextRuleType;
  conditions: RuleCondition[];
  effect: RuleEffect;
  priority: number;
  description: string;
}

/**
 * Result of rule evaluation
 */
export interface RuleEvaluationResult {
  ruleId: string;
  matched: boolean;
  appliedEffect?: RuleEffect;
  score: number;
  explanation: string;
}

/**
 * Context for rule evaluation
 */
export interface EvaluationContext {
  skills: string[];
  experienceYears: { [skill: string]: number };
  jobContext: string;
  jobLevel: string;
  industry: string;
} 