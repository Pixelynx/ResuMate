// @ts-check

/**
 * @typedef {import('../matching/core/interfaces/SkillMatcherType').SkillMatchResult} SkillMatchResult
 * @typedef {import('../matching/core/interfaces/SkillMatcherType').SkillMatch} SkillMatch
 */

/**
 * @typedef {Object} HighlightConfig
 * @property {number} maxSkillsPerSection - Maximum skills per section
 * @property {number} minConfidenceScore - Minimum confidence score
 * @property {boolean} prioritizeCore - Whether to prioritize core skills
 * @property {boolean} groupByCategory - Whether to group by category
 */

/**
 * @typedef {Object} HighlightResult
 * @property {Array<{
 *   skill: string,
 *   confidence: number,
 *   category?: string,
 *   context?: string
 * }>} highlightedSkills - Highlighted skills
 * @property {string[]} suggestedPhrases - Suggested phrases
 * @property {{
 *   totalHighlighted: number,
 *   averageConfidence: number,
 *   categoryCoverage: Record<string, number>
 * }} statistics - Statistics
 */

/**
 * Handles skill highlighting and context generation for cover letters
 */
class SkillHighlighter {
  constructor() {
    /** @type {HighlightConfig} */
    this.defaultConfig = {
      maxSkillsPerSection: 5,
      minConfidenceScore: 0.7,
      prioritizeCore: true,
      groupByCategory: true
    };
  }

  /**
   * Highlight relevant skills based on job matching results
   * @param {SkillMatchResult} matchResult - Match results
   * @param {Partial<HighlightConfig>} [customConfig] - Custom configuration
   * @returns {Promise<HighlightResult>} Highlight result
   */
  async highlightSkills(matchResult, customConfig = {}) {
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
   * @param {SkillMatchResult} matchResult - Match results
   * @param {HighlightConfig} config - Configuration
   * @returns {Promise<HighlightResult['highlightedSkills']>} Processed skills
   * @private
   */
  async processSkills(matchResult, config) {
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
   * @param {SkillMatch} match - Skill match
   * @returns {string} Inferred category
   * @private
   */
  inferSkillCategory(match) {
    if (match.context) {
      if (match.context.toLowerCase().includes('programming')) return 'programming';
      if (match.context.toLowerCase().includes('framework')) return 'framework';
      if (match.context.toLowerCase().includes('tool')) return 'tool';
    }
    return 'general';
  }

  /**
   * Generate context for a skill
   * @param {SkillMatch} skill - Skill match
   * @returns {string} Generated context
   * @private
   */
  generateSkillContext(skill) {
    if (skill.context) {
      return skill.context;
    }

    // Generate generic context based on match type and inferred category
    const category = this.inferSkillCategory(skill);
    /** @type {Record<string, string>} */
    const contextTemplates = {
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
   * @param {HighlightResult['highlightedSkills']} highlightedSkills - Highlighted skills
   * @returns {string[]} Generated phrases
   * @private
   */
  generateSuggestedPhrases(highlightedSkills) {
    const phrases = [];

    // Group skills by category if available
    /** @type {Record<string, HighlightResult['highlightedSkills']>} */
    const skillsByCategory = {};
    
    highlightedSkills.forEach(skill => {
      const category = skill.category || 'general';
      if (!skillsByCategory[category]) {
        skillsByCategory[category] = [];
      }
      skillsByCategory[category].push(skill);
    });

    // Generate phrases for each category
    for (const [, skills] of Object.entries(skillsByCategory)) {
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
   * @param {HighlightResult['highlightedSkills']} highlightedSkills - Highlighted skills
   * @returns {HighlightResult['statistics']} Calculated statistics
   * @private
   */
  calculateStatistics(highlightedSkills) {
    const totalHighlighted = highlightedSkills.length;
    const averageConfidence = highlightedSkills.reduce(
      (sum, skill) => sum + skill.confidence,
      0
    ) / totalHighlighted;

    /** @type {Record<string, number>} */
    const categoryCoverage = {};
    
    highlightedSkills.forEach(skill => {
      if (skill.category) {
        categoryCoverage[skill.category] = (categoryCoverage[skill.category] || 0) + 1;
      }
    });

    return {
      totalHighlighted,
      averageConfidence,
      categoryCoverage
    };
  }
}

module.exports = {
  SkillHighlighter
}; 