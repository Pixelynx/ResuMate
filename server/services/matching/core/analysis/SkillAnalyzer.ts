import { TechnologyMapper } from '../TechnologyMapper';
import { SkillNormalizer } from '../SkillNormalizer';
import { ContextAnalyzer } from './ContextAnalyzer';
import { EvaluationContext } from './ContextRule';
import { TechnologyCategory, TechnologyMap, TechGroup } from '../TechnologyMapper';

/**
 * Result of skill analysis
 */
export interface SkillAnalysisResult {
  score: number;
  contextScore: number;
  matchScore: number;
  details: SkillAnalysisDetail[];
  combinations: SkillCombination[];
  suggestions: string[];
}

/**
 * Detailed analysis for a specific skill
 */
export interface SkillAnalysisDetail {
  skill: string;
  matched: boolean;
  relevance: number;
  context: string;
  relatedMatches: string[];
  score: number;
}

/**
 * Skill combination analysis
 */
export interface SkillCombination {
  skills: string[];
  type: 'synergy' | 'stack' | 'workflow';
  score: number;
  explanation: string;
}

/**
 * Configuration for skill analysis
 */
export interface SkillAnalyzerConfig {
  baseWeight: number;
  contextWeight: number;
  combinationBonus: number;
  minRelevance: number;
  fuzzyMatchThreshold: number;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: SkillAnalyzerConfig = {
  baseWeight: 1.0,
  contextWeight: 0.3,
  combinationBonus: 0.2,
  minRelevance: 0.6,
  fuzzyMatchThreshold: 0.8
};

/**
 * Analyzes skills with context consideration
 */
export class SkillAnalyzer {
  private config: SkillAnalyzerConfig;
  private contextAnalyzer: ContextAnalyzer;

  constructor(
    config: Partial<SkillAnalyzerConfig> = {},
    contextAnalyzer: ContextAnalyzer = new ContextAnalyzer()
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.contextAnalyzer = contextAnalyzer;
  }

  /**
   * Analyze skills against requirements with context consideration
   */
  public analyzeSkills(
    requiredSkills: string[],
    candidateSkills: string[],
    context: string
  ): SkillAnalysisResult {
    try {
      const normalizedRequired = requiredSkills.map(s => SkillNormalizer.normalizeSkill(s));
      const normalizedCandidate = candidateSkills.map(s => SkillNormalizer.normalizeSkill(s));
      
      // Analyze individual skills
      const details = this.analyzeIndividualSkills(
        normalizedRequired,
        normalizedCandidate,
        context
      );

      // Analyze skill combinations
      const combinations = this.analyzeSkillCombinations(
        normalizedRequired,
        normalizedCandidate
      );

      // Calculate context score
      const contextScore = this.calculateContextScore(details, context);

      // Calculate match score
      const matchScore = this.calculateMatchScore(details);

      // Calculate overall score
      const score = this.calculateOverallScore(matchScore, contextScore, combinations);

      // Generate suggestions
      const suggestions = this.generateSuggestions(details, combinations);

      return {
        score,
        contextScore,
        matchScore,
        details,
        combinations,
        suggestions
      };
    } catch (error) {
      console.error('Error analyzing skills:', error);
      throw new Error('Failed to analyze skills');
    }
  }

  /**
   * Analyze individual skills
   */
  private analyzeIndividualSkills(
    required: string[],
    candidate: string[],
    context: string
  ): SkillAnalysisDetail[] {
    return required.map(skill => {
      // Check for direct match
      const directMatch = candidate.some(s => 
        SkillNormalizer.areSimilarSkills(s, skill, this.config.fuzzyMatchThreshold)
      );

      // Find related matches
      const relatedMatches = candidate.filter(s => {
        if (directMatch) return false;
        const related = TechnologyMapper.getRelatedSkills(skill);
        return related.some(r => 
          SkillNormalizer.areSimilarSkills(s, r, this.config.fuzzyMatchThreshold)
        );
      });

      // Calculate relevance
      const relevance = this.calculateSkillRelevance(skill, context);

      // Calculate score
      const score = this.calculateSkillScore(directMatch, relatedMatches.length, relevance);

      return {
        skill,
        matched: directMatch,
        relevance,
        context: this.getSkillContext(skill),
        relatedMatches,
        score
      };
    });
  }

  /**
   * Analyze skill combinations
   */
  private analyzeSkillCombinations(
    required: string[],
    candidate: string[]
  ): SkillCombination[] {
    const combinations: SkillCombination[] = [];

    // Check for technology stack combinations
    Object.entries(TechnologyMapper['technologyMap']).forEach(([category, data]) => {
      // Get all skills from the category's groups
      const stackSkills = Object.values(data as TechnologyCategory)
        .flatMap((groups: TechGroup[] | undefined) => 
          groups?.flatMap(group => [group.primary, ...group.related]) || []
        );

      const matchedSkills = stackSkills.filter((s: string) => 
        candidate.some(cs => SkillNormalizer.areSimilarSkills(cs, s))
      );

      if (matchedSkills.length >= 2) {
        combinations.push({
          skills: matchedSkills,
          type: 'stack',
          score: matchedSkills.length / stackSkills.length,
          explanation: `Found ${matchedSkills.length} skills from ${category} stack`
        });
      }
    });

    // Check for workflow combinations
    this.checkWorkflowCombinations(required, candidate).forEach(combo => 
      combinations.push(combo)
    );

    return combinations;
  }

  /**
   * Check for workflow-based skill combinations
   */
  private checkWorkflowCombinations(
    required: string[],
    candidate: string[]
  ): SkillCombination[] {
    const combinations: SkillCombination[] = [];
    const workflowPatterns = [
      {
        name: 'Full Stack',
        groups: ['frontend', 'backend'],
        minSkills: 2
      },
      {
        name: 'DevOps',
        groups: ['backend', 'devops'],
        minSkills: 2
      },
      {
        name: 'Cloud Native',
        groups: ['cloud', 'devops'],
        minSkills: 2
      }
    ];

    workflowPatterns.forEach(pattern => {
      const matchedSkills = pattern.groups.flatMap(group => {
        const categoryData = TechnologyMapper['technologyMap'][group] as TechnologyCategory;
        if (!categoryData) return [];
        
        return Object.values(categoryData)
          .flatMap((groups: TechGroup[] | undefined) => 
            groups?.flatMap(group => [group.primary, ...group.related]) || []
          )
          .filter((skill: string) =>
            candidate.some(cs => SkillNormalizer.areSimilarSkills(cs, skill))
          );
      });

      if (matchedSkills.length >= pattern.minSkills) {
        combinations.push({
          skills: matchedSkills,
          type: 'workflow',
          score: Math.min(1, matchedSkills.length / (pattern.minSkills * 2)),
          explanation: `Matched ${pattern.name} workflow pattern`
        });
      }
    });

    return combinations;
  }

  /**
   * Calculate relevance of a skill in context
   */
  private calculateSkillRelevance(skill: string, context: string): number {
    const groupInfo = TechnologyMapper.findGroupForSkill(skill);
    if (!groupInfo) return 0.5;

    const contextWords = context.toLowerCase().split(/\s+/);
    
    // Get all skills from the group
    const groupSkills = [
      groupInfo.group.primary,
      ...groupInfo.group.related
    ];
    
    const relevantTerms = groupSkills.filter((s: string) => 
      contextWords.some(w => w.includes(s.toLowerCase()))
    );

    return Math.min(1, (relevantTerms.length / groupSkills.length) + 0.3);
  }

  /**
   * Get context description for a skill
   */
  private getSkillContext(skill: string): string {
    const groupInfo = TechnologyMapper.findGroupForSkill(skill);
    if (!groupInfo) return 'General technology skill';

    const relatedSkills = TechnologyMapper.getRelatedSkills(skill);
    return `${groupInfo.group.primary} technology, related to ${relatedSkills.slice(0, 3).join(', ')}`;
  }

  /**
   * Calculate score for a single skill
   */
  private calculateSkillScore(
    directMatch: boolean,
    relatedMatchCount: number,
    relevance: number
  ): number {
    let score = 0;
    
    if (directMatch) {
      score = 1.0;
    } else if (relatedMatchCount > 0) {
      score = 0.7 * Math.min(1, relatedMatchCount * 0.3);
    }

    return score * (relevance * this.config.contextWeight + 
      (1 - this.config.contextWeight));
  }

  /**
   * Calculate context-based score
   */
  private calculateContextScore(
    details: SkillAnalysisDetail[],
    context: string
  ): number {
    const evaluationContext: EvaluationContext = {
      skills: details.filter(d => d.matched).map(d => d.skill),
      experienceYears: {},
      jobContext: context,
      jobLevel: '',
      industry: ''
    };

    return this.contextAnalyzer.calculateContextScore(evaluationContext);
  }

  /**
   * Calculate match-based score
   */
  private calculateMatchScore(details: SkillAnalysisDetail[]): number {
    if (details.length === 0) return 0;

    const totalScore = details.reduce((sum, detail) => sum + detail.score, 0);
    return totalScore / details.length;
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(
    matchScore: number,
    contextScore: number,
    combinations: SkillCombination[]
  ): number {
    let score = (matchScore * (1 - this.config.contextWeight) + 
      contextScore * this.config.contextWeight) * 
      this.config.baseWeight;

    // Add bonus for skill combinations
    const combinationBonus = combinations.reduce(
      (bonus, combo) => bonus + (combo.score * this.config.combinationBonus),
      0
    );

    return Math.min(1, score + combinationBonus);
  }

  /**
   * Generate suggestions for improvement
   */
  private generateSuggestions(
    details: SkillAnalysisDetail[],
    combinations: SkillCombination[]
  ): string[] {
    const suggestions: string[] = [];

    // Suggest missing skills
    details.filter(d => !d.matched && d.score < this.config.minRelevance)
      .forEach(detail => {
        const related = detail.relatedMatches.slice(0, 2).join(' or ');
        suggestions.push(
          related
            ? `Consider learning ${detail.skill} (you know ${related})`
            : `Consider learning ${detail.skill}`
        );
      });

    // Suggest skill combinations
    const missingCombos = this.findMissingCombinations(combinations);
    missingCombos.forEach(combo => {
      suggestions.push(
        `Consider learning ${combo.missing.join(', ')} to complete the ${combo.type} combination`
      );
    });

    return suggestions;
  }

  /**
   * Find missing skills in potential combinations
   */
  private findMissingCombinations(
    combinations: SkillCombination[]
  ): Array<{ type: string; missing: string[] }> {
    const missing: Array<{ type: string; missing: string[] }> = [];

    combinations.forEach(combo => {
      if (combo.score < 0.7) {
        const groupInfo = TechnologyMapper.findGroupForSkill(combo.skills[0]);
        if (groupInfo) {
          const allGroupSkills = [
            groupInfo.group.primary,
            ...groupInfo.group.related
          ];
          
          const missingSkills = allGroupSkills.filter((s: string) => 
            !combo.skills.some(cs => SkillNormalizer.areSimilarSkills(cs, s))
          );

          if (missingSkills.length > 0) {
            missing.push({
              type: combo.type,
              missing: missingSkills.slice(0, 3)
            });
          }
        }
      }
    });

    return missing;
  }
} 