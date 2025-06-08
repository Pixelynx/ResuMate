import { SkillMatchResult } from '../core/interfaces/SkillMatcherType';
import { SkillAnalyzer, SkillAnalysisResult } from '../core/analysis/SkillAnalyzer';
import { ContextAnalyzer } from '../core/analysis/ContextAnalyzer';
import { TechnologyMapper } from '../core/TechnologyMapper';

/**
 * Input for skill highlighting in cover letter generation
 */
export interface SkillHighlightInput {
  jobSkills: string[];
  candidateSkills: string[];
  matchResults: SkillMatchResult;
  context: string;
}

/**
 * Highlighted skill with context and relevance
 */
export interface HighlightedSkill {
  skill: string;
  relevance: number;
  context: string[];
  matchType: 'direct' | 'related' | 'potential';
  suggestedEmphasis: 'high' | 'medium' | 'low';
}

/**
 * Result of skill highlighting analysis
 */
export interface SkillHighlightResult {
  primarySkills: HighlightedSkill[];
  secondarySkills: HighlightedSkill[];
  suggestedOrder: string[];
  contextualPhrases: string[];
}

/**
 * Handles skill highlighting for cover letter generation
 */
export class SkillHighlighter {
  private skillAnalyzer: SkillAnalyzer;
  private contextAnalyzer: ContextAnalyzer;

  constructor(
    skillAnalyzer: SkillAnalyzer = new SkillAnalyzer(),
    contextAnalyzer: ContextAnalyzer = new ContextAnalyzer()
  ) {
    this.skillAnalyzer = skillAnalyzer;
    this.contextAnalyzer = contextAnalyzer;
  }

  /**
   * Generate skill highlights for cover letter
   */
  public async generateHighlights(input: SkillHighlightInput): Promise<SkillHighlightResult> {
    try {
      // Analyze skills in context
      const analysisResult = await this.skillAnalyzer.analyzeSkills(
        input.jobSkills,
        input.candidateSkills,
        input.context
      );

      // Generate highlights
      const highlights = this.generateSkillHighlights(analysisResult, input.matchResults);

      // Sort skills by relevance and context
      const { primarySkills, secondarySkills } = this.categorizeSkills(highlights);

      // Generate suggested order and contextual phrases
      const suggestedOrder = this.generateSuggestedOrder(primarySkills, secondarySkills);
      const contextualPhrases = this.generateContextualPhrases(primarySkills);

      return {
        primarySkills,
        secondarySkills,
        suggestedOrder,
        contextualPhrases
      };
    } catch (error) {
      console.error('Error generating skill highlights:', error);
      throw new Error('Failed to generate skill highlights');
    }
  }

  /**
   * Generate individual skill highlights
   */
  private generateSkillHighlights(
    analysis: SkillAnalysisResult,
    matchResults: SkillMatchResult
  ): HighlightedSkill[] {
    const highlights: HighlightedSkill[] = [];

    // Process direct matches
    matchResults.matches.forEach(match => {
      const detail = analysis.details.find(d => d.skill === match.skill);
      if (detail) {
        highlights.push({
          skill: match.skill,
          relevance: detail.relevance,
          context: TechnologyMapper.getSkillContext(match.skill),
          matchType: match.matchType,
          suggestedEmphasis: this.calculateEmphasis(detail.relevance)
        });
      }
    });

    // Process related skills
    matchResults.compensations.forEach(comp => {
      if (!highlights.some(h => h.skill === comp.relatedSkill)) {
        highlights.push({
          skill: comp.relatedSkill,
          relevance: comp.factor,
          context: TechnologyMapper.getSkillContext(comp.relatedSkill),
          matchType: 'related',
          suggestedEmphasis: this.calculateEmphasis(comp.factor)
        });
      }
    });

    return highlights;
  }

  /**
   * Categorize skills into primary and secondary
   */
  private categorizeSkills(
    highlights: HighlightedSkill[]
  ): { primarySkills: HighlightedSkill[]; secondarySkills: HighlightedSkill[] } {
    const sorted = [...highlights].sort((a, b) => b.relevance - a.relevance);

    const primaryThreshold = 0.7;
    return {
      primarySkills: sorted.filter(h => h.relevance >= primaryThreshold),
      secondarySkills: sorted.filter(h => h.relevance < primaryThreshold)
    };
  }

  /**
   * Calculate emphasis level based on relevance
   */
  private calculateEmphasis(relevance: number): 'high' | 'medium' | 'low' {
    if (relevance >= 0.8) return 'high';
    if (relevance >= 0.6) return 'medium';
    return 'low';
  }

  /**
   * Generate suggested order for mentioning skills
   */
  private generateSuggestedOrder(
    primary: HighlightedSkill[],
    secondary: HighlightedSkill[]
  ): string[] {
    // Start with high emphasis primary skills
    const order = primary
      .filter(s => s.suggestedEmphasis === 'high')
      .map(s => s.skill);

    // Add medium emphasis primary skills
    order.push(...primary
      .filter(s => s.suggestedEmphasis === 'medium')
      .map(s => s.skill));

    // Add relevant secondary skills
    order.push(...secondary
      .filter(s => s.suggestedEmphasis !== 'low')
      .map(s => s.skill));

    return order;
  }

  /**
   * Generate contextual phrases for skills
   */
  private generateContextualPhrases(skills: HighlightedSkill[]): string[] {
    return skills.map(skill => {
      const contextPhrase = skill.context
        .slice(0, 2)
        .join(' and ');

      return `${skill.skill} for ${contextPhrase}`;
    });
  }
} 