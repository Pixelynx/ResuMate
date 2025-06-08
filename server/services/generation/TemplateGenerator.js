// @ts-check
const { SkillHighlighter } = require('./SkillHighlighter');

/**
 * @typedef {import('../matching/core/interfaces/SkillMatcherType').SkillMatchResult} SkillMatchResult
 */

/**
 * @typedef {Object} TemplateSectionConfig
 * @property {number} minLength - Minimum section length
 * @property {number} maxLength - Maximum section length
 * @property {boolean} required - Whether section is required
 * @property {number} priority - Section priority
 */

/**
 * @typedef {'professional' | 'enthusiastic' | 'balanced'} ToneType
 * @typedef {('skills' | 'experience' | 'culture' | 'achievements')} FocusArea
 */

/**
 * @typedef {Object} TemplateGenerationOptions
 * @property {ToneType} tone - Desired tone
 * @property {FocusArea[]} focusAreas - Areas to focus on
 * @property {number} maxLength - Maximum length
 * @property {boolean} includeCompanyInfo - Whether to include company info
 */

/**
 * @typedef {Object} TemplateGenerationResult
 * @property {{
 *   introduction: string,
 *   skillsHighlight: string,
 *   relevantExperience: string,
 *   closing: string
 * }} sections - Template sections
 * @property {{
 *   totalLength: number,
 *   highlightedSkills: string[],
 *   matchScore: number,
 *   suggestedImprovements: string[]
 * }} metadata - Template metadata
 */

/**
 * @enum {string}
 */
const TemplateGenerationError = {
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA',
  INVALID_CONFIGURATION: 'INVALID_CONFIGURATION',
  GENERATION_FAILED: 'GENERATION_FAILED',
  VALIDATION_FAILED: 'VALIDATION_FAILED'
};

/**
 * Template generator for cover letters using job matching data
 */
class TemplateGenerator {
  constructor() {
    this.skillHighlighter = new SkillHighlighter();
    /** @type {Record<string, TemplateSectionConfig>} */
    this.sectionConfigs = {
      introduction: {
        minLength: 100,
        maxLength: 200,
        required: true,
        priority: 1
      },
      skillsHighlight: {
        minLength: 150,
        maxLength: 300,
        required: true,
        priority: 2
      },
      relevantExperience: {
        minLength: 200,
        maxLength: 400,
        required: true,
        priority: 3
      },
      closing: {
        minLength: 75,
        maxLength: 150,
        required: true,
        priority: 4
      }
    };
  }

  /**
   * Generate a cover letter template using job matching results
   * @param {SkillMatchResult} matchResult - Match results
   * @param {{
   *   experience: string[],
   *   achievements: string[],
   *   education: string
   * }} candidateInfo - Candidate information
   * @param {{
   *   name: string,
   *   culture?: string,
   *   values?: string[]
   * }} companyInfo - Company information
   * @param {Partial<TemplateGenerationOptions>} [options] - Generation options
   * @returns {Promise<TemplateGenerationResult>} Generated template
   */
  async generateTemplate(matchResult, candidateInfo, companyInfo, options = {}) {
    try {
      this.validateInputs(matchResult, candidateInfo, companyInfo);

      const finalOptions = this.getDefaultOptions(options);
      const sections = await this.generateSections(
        matchResult,
        candidateInfo,
        companyInfo,
        finalOptions
      );

      const metadata = this.generateMetadata(matchResult, sections);
      
      await this.validateTemplate(sections, finalOptions);

      return { sections, metadata };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Template generation failed: ${error.message}`);
      }
      throw new Error('Template generation failed: Unknown error');
    }
  }

  /**
   * Validate input data for template generation
   * @param {SkillMatchResult} matchResult - Match results
   * @param {{ experience: string[], achievements: string[], education: string }} candidateInfo - Candidate info
   * @param {{ name: string, culture?: string, values?: string[] }} companyInfo - Company info
   * @private
   */
  validateInputs(matchResult, candidateInfo, companyInfo) {
    if (!matchResult || !matchResult.matches || matchResult.matches.length === 0) {
      throw new Error(TemplateGenerationError.INSUFFICIENT_DATA);
    }

    if (!candidateInfo.experience || candidateInfo.experience.length === 0) {
      throw new Error(TemplateGenerationError.INSUFFICIENT_DATA);
    }

    if (!companyInfo.name) {
      throw new Error(TemplateGenerationError.INSUFFICIENT_DATA);
    }
  }

  /**
   * Get default options merged with provided options
   * @param {Partial<TemplateGenerationOptions>} options - Provided options
   * @returns {TemplateGenerationOptions} Final options
   * @private
   */
  getDefaultOptions(options) {
    return {
      tone: options.tone || 'professional',
      focusAreas: options.focusAreas || ['skills', 'experience'],
      maxLength: options.maxLength || 800,
      includeCompanyInfo: options.includeCompanyInfo ?? true
    };
  }

  /**
   * Generate individual sections of the cover letter
   * @param {SkillMatchResult} matchResult - Match results
   * @param {{ experience: string[], achievements: string[], education: string }} candidateInfo - Candidate info
   * @param {{ name: string, culture?: string, values?: string[] }} companyInfo - Company info
   * @param {TemplateGenerationOptions} options - Generation options
   * @returns {Promise<TemplateGenerationResult['sections']>} Generated sections
   * @private
   */
  async generateSections(matchResult, candidateInfo, companyInfo, options) {
    const introduction = await this.generateIntroduction(matchResult, companyInfo, options);
    const skillsHighlight = await this.generateSkillsSection(matchResult, options);
    const relevantExperience = await this.generateExperienceSection(
      candidateInfo.experience,
      matchResult,
      options
    );
    const closing = await this.generateClosing(companyInfo, options);

    return {
      introduction,
      skillsHighlight,
      relevantExperience,
      closing
    };
  }

  /**
   * Generate metadata for the template
   * @param {SkillMatchResult} matchResult - Match results
   * @param {TemplateGenerationResult['sections']} sections - Generated sections
   * @returns {TemplateGenerationResult['metadata']} Generated metadata
   * @private
   */
  generateMetadata(matchResult, sections) {
    return {
      totalLength: Object.values(sections).reduce((sum, section) => sum + section.length, 0),
      highlightedSkills: matchResult.matches.map(match => match.skill),
      matchScore: matchResult.score,
      suggestedImprovements: matchResult.suggestions
    };
  }

  /**
   * Validate the generated template
   * @param {TemplateGenerationResult['sections']} sections - Generated sections
   * @param {TemplateGenerationOptions} options - Generation options
   * @private
   */
  async validateTemplate(sections, options) {
    const totalLength = Object.values(sections).reduce((sum, section) => sum + section.length, 0);
    
    if (totalLength > options.maxLength) {
      throw new Error(TemplateGenerationError.VALIDATION_FAILED);
    }

    for (const [name, content] of Object.entries(sections)) {
      const config = this.sectionConfigs[name];
      if (config.required && (!content || content.length < config.minLength)) {
        throw new Error(TemplateGenerationError.VALIDATION_FAILED);
      }
    }
  }

  /**
   * Generate introduction section
   * @param {SkillMatchResult} matchResult - Match results
   * @param {{ name: string, culture?: string, values?: string[] }} companyInfo - Company info
   * @param {TemplateGenerationOptions} options - Generation options
   * @returns {Promise<string>} Generated introduction
   * @private
   */
  async generateIntroduction(matchResult, companyInfo, options) {
    // Implementation would go here
    return "Introduction placeholder";
  }

  /**
   * Generate skills section
   * @param {SkillMatchResult} matchResult - Match results
   * @param {TemplateGenerationOptions} options - Generation options
   * @returns {Promise<string>} Generated skills section
   * @private
   */
  async generateSkillsSection(matchResult, options) {
    // Implementation would go here
    return "Skills section placeholder";
  }

  /**
   * Generate experience section
   * @param {string[]} experience - Experience entries
   * @param {SkillMatchResult} matchResult - Match results
   * @param {TemplateGenerationOptions} options - Generation options
   * @returns {Promise<string>} Generated experience section
   * @private
   */
  async generateExperienceSection(experience, matchResult, options) {
    // Implementation would go here
    return "Experience section placeholder";
  }

  /**
   * Generate closing section
   * @param {{ name: string, culture?: string, values?: string[] }} companyInfo - Company info
   * @param {TemplateGenerationOptions} options - Generation options
   * @returns {Promise<string>} Generated closing
   * @private
   */
  async generateClosing(companyInfo, options) {
    // Implementation would go here
    return "Closing placeholder";
  }
}

module.exports = {
  TemplateGenerator,
  TemplateGenerationError
}; 