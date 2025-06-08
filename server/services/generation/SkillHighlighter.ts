import { SkillMatchResult, SkillMatch } from '../matching/core/interfaces/SkillMatcherType';

/**
 * Configuration for skill highlighting
 */
interface HighlightConfig {
  maxSkillsPerSection: number;
  minConfidenceScore: number;
  prioritizeCore: boolean;
  groupByCategory: boolean;
}

/**
 * Result of skill highlighting process
 */
interface HighlightResult {
  highlightedSkills: {
    skill: string;
    confidence: number;
    category?: string;
    context?: string;
  }[];
  suggestedPhrases: string[];
  statistics: {
    totalHighlighted: number;
    averageConfidence: number;
    categoryCoverage: Record<string, number>;
  };
}

/**
 * Handles skill highlighting and context generation for cover letters
 */
export class SkillHighlighter {
  private readonly defaultConfig: HighlightConfig = {
    maxSkillsPerSection: 5,
    minConfidenceScore: 0.7,
    prioritizeCore: true,
    groupByCategory: true
  };

  /**
   * Highlight relevant skills based on job matching results
   */
  public async highlightSkills(
    matchResult: SkillMatchResult,
    customConfig?: Partial<HighlightConfig>
  ): Promise<HighlightResult> {
    const config = { ...this.defaultConfig, ...customConfig };
    
    try {
      const highlightedSkills = await this.processSkills(matchResult, config);
      const suggestedPhrases = this.generateSuggestedPhrases(highlightedSkills);
      const statistics = this.calculateStatistics(highlightedSkills);

      return {
        highlightedSkills,
        suggestedPhrases,
        statistics
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Skill highlighting failed: ${error.message}`);
      }
      throw new Error('Skill highlighting failed: Unknown error');
    }
  }

  /**
   * Process and filter skills based on configuration
   */
  private async processSkills(
    matchResult: SkillMatchResult,
    config: HighlightConfig
  ): Promise<HighlightResult['highlightedSkills']> {
    const { matches } = matchResult;

    // Filter and sort skills by confidence
    let processedSkills = matches
      .filter(match => match.confidence >= config.minConfidenceScore)
      .sort((a, b) => b.confidence - a.confidence);

    // Prioritize direct matches if configured
    if (config.prioritizeCore) {
      processedSkills = [
        ...processedSkills.filter(skill => skill.matchType === 'direct'),
        ...processedSkills.filter(skill => skill.matchType === 'related')
      ];
    }

    // Limit number of skills per section
    processedSkills = processedSkills.slice(0, config.maxSkillsPerSection);

    // Add context and category information
    return processedSkills.map(skill => ({
      skill: skill.skill,
      confidence: skill.confidence,
      category: this.inferSkillCategory(skill),
      context: skill.context || this.generateSkillContext(skill)
    }));
  }

  /**
   * Infer skill category based on match information
   */
  private inferSkillCategory(match: SkillMatch): string {
    // This could be enhanced with actual technology mapping logic
    if (match.context) {
      if (match.context.toLowerCase().includes('programming')) return 'programming';
      if (match.context.toLowerCase().includes('framework')) return 'framework';
      if (match.context.toLowerCase().includes('tool')) return 'tool';
    }
    return 'general';
  }

  /**
   * Generate context for a skill
   */
  private generateSkillContext(skill: SkillMatch): string {
    if (skill.context) {
      return skill.context;
    }

    // Generate generic context based on match type and inferred category
    const category = this.inferSkillCategory(skill);
    const contextTemplates: Record<string, string> = {
      'programming': 'proficient in developing with',
      'framework': 'experienced in building applications using',
      'tool': 'skilled in utilizing',
      'soft-skill': 'demonstrated ability in',
      'domain': 'knowledgeable in',
      'default': 'experienced with'
    };

    const template = contextTemplates[category] || contextTemplates.default;
    return `${template} ${skill.skill}`;
  }

  /**
   * Generate suggested phrases for highlighting skills
   */
  private generateSuggestedPhrases(
    highlightedSkills: HighlightResult['highlightedSkills']
  ): string[] {
    const phrases: string[] = [];

    // Group skills by category if available
    const skillsByCategory = highlightedSkills.reduce((acc, skill) => {
      const category = skill.category || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    }, {} as Record<string, typeof highlightedSkills>);

    // Generate phrases for each category
    for (const [category, skills] of Object.entries(skillsByCategory)) {
      if (skills.length === 1) {
        phrases.push(this.generateSkillContext({
          skill: skills[0].skill,
          confidence: skills[0].confidence,
          matchType: 'direct'
        }));
      } else if (skills.length === 2) {
        phrases.push(
          `proficient in ${skills[0].skill} and ${skills[1].skill}`
        );
      } else if (skills.length > 2) {
        const lastSkill = skills[skills.length - 1];
        const otherSkills = skills.slice(0, -1).map(s => s.skill).join(', ');
        phrases.push(
          `experienced in ${otherSkills}, and ${lastSkill.skill}`
        );
      }
    }

    return phrases;
  }

  /**
   * Calculate statistics for highlighted skills
   */
  private calculateStatistics(
    highlightedSkills: HighlightResult['highlightedSkills']
  ): HighlightResult['statistics'] {
    const totalHighlighted = highlightedSkills.length;
    const averageConfidence = highlightedSkills.reduce(
      (sum, skill) => sum + skill.confidence,
      0
    ) / totalHighlighted;

    const categoryCoverage = highlightedSkills.reduce((acc, skill) => {
      if (skill.category) {
        acc[skill.category] = (acc[skill.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalHighlighted,
      averageConfidence,
      categoryCoverage
    };
  }
} 