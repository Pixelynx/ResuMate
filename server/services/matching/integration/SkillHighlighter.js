// @ts-check
const { SkillAnalyzer } = require('../core/analysis/SkillAnalyzer');
const { ContextAnalyzer } = require('../core/analysis/ContextAnalyzer');
const { TechnologyMapper } = require('../core/TechnologyMapper');

/**
 * @typedef {import('../core/interfaces/SkillMatcherType').SkillMatchResult} SkillMatchResult
 * @typedef {import('../core/analysis/SkillAnalyzer').SkillAnalysisResult} SkillAnalysisResult
 */

/**
 * @typedef {Object} SkillHighlightInput
 * @property {string[]} jobSkills - Required job skills
 * @property {string[]} candidateSkills - Candidate's skills
 * @property {SkillMatchResult} matchResults - Results of skill matching
 * @property {string} context - Job context
 */

/**
 * @typedef {Object} HighlightedSkill
 * @property {string} skill - Skill name
 * @property {number} relevance - Skill relevance
 * @property {string[]} context - Skill context
 * @property {'direct' | 'related' | 'potential'} matchType - Type of match
 * @property {'high' | 'medium' | 'low'} suggestedEmphasis - Suggested emphasis level
 */

/**
 * @typedef {Object} SkillHighlightResult
 * @property {HighlightedSkill[]} primarySkills - Primary skills
 * @property {HighlightedSkill[]} secondarySkills - Secondary skills
 * @property {string[]} suggestedOrder - Suggested order of skills
 * @property {string[]} contextualPhrases - Contextual phrases
 */

/**
 * Handles skill highlighting for cover letter generation
 */
class SkillHighlighter {
  /**
   * @param {SkillAnalyzer} [skillAnalyzer] - Skill analyzer instance
   * @param {ContextAnalyzer} [contextAnalyzer] - Context analyzer instance
   */
  constructor(
    skillAnalyzer = new SkillAnalyzer(),
    contextAnalyzer = new ContextAnalyzer()
  ) {
    this.skillAnalyzer = skillAnalyzer;
    this.contextAnalyzer = contextAnalyzer;
  }

  /**
   * Generate skill highlights for cover letter
   * @param {SkillHighlightInput} input - Input for highlighting
   * @returns {Promise<SkillHighlightResult>} Highlight result
   */
  async generateHighlights(input) {
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
   * @param {SkillAnalysisResult} analysis - Skill analysis result
   * @param {SkillMatchResult} matchResults - Match results
   * @returns {HighlightedSkill[]} Highlighted skills
   * @private
   */
  generateSkillHighlights(analysis, matchResults) {
    /** @type {HighlightedSkill[]} */
    const highlights = [];

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
   * @param {HighlightedSkill[]} highlights - Skills to categorize
   * @returns {{ primarySkills: HighlightedSkill[], secondarySkills: HighlightedSkill[] }} Categorized skills
   * @private
   */
  categorizeSkills(highlights) {
    const sorted = [...highlights].sort((a, b) => b.relevance - a.relevance);

    const primaryThreshold = 0.7;
    return {
      primarySkills: sorted.filter(h => h.relevance >= primaryThreshold),
      secondarySkills: sorted.filter(h => h.relevance < primaryThreshold)
    };
  }

  /**
   * Calculate emphasis level based on relevance
   * @param {number} relevance - Skill relevance
   * @returns {'high' | 'medium' | 'low'} Emphasis level
   * @private
   */
  calculateEmphasis(relevance) {
    if (relevance >= 0.8) return 'high';
    if (relevance >= 0.6) return 'medium';
    return 'low';
  }

  /**
   * Generate suggested order for mentioning skills
   * @param {HighlightedSkill[]} primary - Primary skills
   * @param {HighlightedSkill[]} secondary - Secondary skills
   * @returns {string[]} Ordered skill names
   * @private
   */
  generateSuggestedOrder(primary, secondary) {
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
   * @param {HighlightedSkill[]} skills - Skills to generate phrases for
   * @returns {string[]} Contextual phrases
   * @private
   */
  generateContextualPhrases(skills) {
    return skills.map(skill => {
      const contextPhrase = skill.context
        .slice(0, 2)
        .join(' and ');

      return `${skill.skill} for ${contextPhrase}`;
    });
  }
}

module.exports = {
  SkillHighlighter
}; 