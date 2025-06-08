// @ts-check
const { TechnologyMapper } = require('../TechnologyMapper');
const { SkillNormalizer } = require('../SkillNormalizer');
const { ContextAnalyzer } = require('./ContextAnalyzer');

/**
 * @typedef {import('./ContextRule').EvaluationContext} EvaluationContext
 * @typedef {import('../TechnologyMapper').TechnologyCategory} TechnologyCategory
 * @typedef {import('../TechnologyMapper').TechnologyMap} TechnologyMap
 * @typedef {import('../TechnologyMapper').TechGroup} TechGroup
 */

/**
 * @typedef {Object} SkillAnalysisResult
 * @property {number} score - Overall score
 * @property {number} contextScore - Context relevance score
 * @property {number} matchScore - Skill match score
 * @property {SkillAnalysisDetail[]} details - Analysis details
 * @property {SkillCombination[]} combinations - Skill combinations
 * @property {string[]} suggestions - Improvement suggestions
 */

/**
 * @typedef {Object} SkillAnalysisDetail
 * @property {string} skill - Skill name
 * @property {boolean} matched - Whether skill was matched
 * @property {number} relevance - Skill relevance
 * @property {string} context - Skill context
 * @property {string[]} relatedMatches - Related skill matches
 * @property {number} score - Skill score
 */

/**
 * @typedef {Object} SkillCombination
 * @property {string[]} skills - Combined skills
 * @property {'synergy' | 'stack' | 'workflow'} type - Combination type
 * @property {number} score - Combination score
 * @property {string} explanation - Combination explanation
 */

/**
 * @typedef {Object} SkillAnalyzerConfig
 * @property {number} baseWeight - Base weight for scoring
 * @property {number} contextWeight - Weight for context
 * @property {number} combinationBonus - Bonus for combinations
 * @property {number} minRelevance - Minimum relevance threshold
 * @property {number} fuzzyMatchThreshold - Threshold for fuzzy matching
 */

/** @type {SkillAnalyzerConfig} */
const DEFAULT_CONFIG = {
  baseWeight: 1.0,
  contextWeight: 0.3,
  combinationBonus: 0.2,
  minRelevance: 0.6,
  fuzzyMatchThreshold: 0.8
};

/**
 * Analyzes skills with context consideration
 */
class SkillAnalyzer {
  /**
   * @param {Partial<SkillAnalyzerConfig>} [config] - Analyzer configuration
   * @param {ContextAnalyzer} [contextAnalyzer] - Context analyzer instance
   */
  constructor(
    config = {},
    contextAnalyzer = new ContextAnalyzer()
  ) {
    /** @type {SkillAnalyzerConfig} */
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.contextAnalyzer = contextAnalyzer;
  }

  /**
   * Analyze skills against requirements with context consideration
   * @param {string[]} requiredSkills - Required skills
   * @param {string[]} candidateSkills - Candidate's skills
   * @param {string} context - Job context
   * @returns {SkillAnalysisResult} Analysis result
   */
  analyzeSkills(requiredSkills, candidateSkills, context) {
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
   * @param {string[]} required - Required skills
   * @param {string[]} candidate - Candidate's skills
   * @param {string} context - Job context
   * @returns {SkillAnalysisDetail[]} Analysis details
   * @private
   */
  analyzeIndividualSkills(required, candidate, context) {
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
   * @param {string[]} required - Required skills
   * @param {string[]} candidate - Candidate's skills
   * @returns {SkillCombination[]} Skill combinations
   * @private
   */
  analyzeSkillCombinations(required, candidate) {
    /** @type {SkillCombination[]} */
    const combinations = [];

    // Check for technology stack combinations
    Object.entries(TechnologyMapper['technologyMap']).forEach(([category, data]) => {
      // Get all skills from the category's groups
      const stackSkills = Object.values(/** @type {TechnologyCategory} */ (data))
        .flatMap((groups) => 
          groups?.flatMap(group => [group.primary, ...group.related]) || []
        );

      const matchedSkills = stackSkills.filter(s => 
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
   * @param {string[]} required - Required skills
   * @param {string[]} candidate - Candidate's skills
   * @returns {SkillCombination[]} Workflow combinations
   * @private
   */
  checkWorkflowCombinations(required, candidate) {
    /** @type {SkillCombination[]} */
    const combinations = [];
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
        const categoryData = /** @type {TechnologyCategory} */ (TechnologyMapper['technologyMap'][group]);
        if (!categoryData) return [];
        
        return Object.values(categoryData)
          .flatMap((groups) => 
            groups?.flatMap(group => [group.primary, ...group.related]) || []
          )
          .filter(skill =>
            candidate.some(cs => SkillNormalizer.areSimilarSkills(cs, skill))
          );
      });

      if (matchedSkills.length >= pattern.minSkills) {
        combinations.push({
          skills: matchedSkills,
          type: 'workflow',
          score: matchedSkills.length / (pattern.groups.length * 2),
          explanation: `Found ${matchedSkills.length} skills for ${pattern.name} workflow`
        });
      }
    });

    return combinations;
  }

  /**
   * Calculate relevance of skill to context
   * @param {string} skill - Skill name
   * @param {string} context - Job context
   * @returns {number} Relevance score
   * @private
   */
  calculateSkillRelevance(skill, context) {
    const groupInfo = TechnologyMapper.findGroupForSkill(skill);
    if (!groupInfo) return 0.5;

    const contextWords = context.toLowerCase().split(/\s+/);
    const skillContext = this.getSkillContext(skill).toLowerCase().split(/\s+/);

    const matchingWords = skillContext.filter(word =>
      contextWords.some(cw => cw.includes(word))
    );

    return Math.min(1, (matchingWords.length / skillContext.length) + 0.3);
  }

  /**
   * Get context for a skill
   * @param {string} skill - Skill name
   * @returns {string} Skill context
   * @private
   */
  getSkillContext(skill) {
    const groupInfo = TechnologyMapper.findGroupForSkill(skill);
    if (!groupInfo) return '';

    return groupInfo.group.context.join(' ');
  }

  /**
   * Calculate score for a specific skill
   * @param {boolean} directMatch - Whether there's a direct match
   * @param {number} relatedMatchCount - Number of related matches
   * @param {number} relevance - Skill relevance
   * @returns {number} Skill score
   * @private
   */
  calculateSkillScore(directMatch, relatedMatchCount, relevance) {
    let score = 0;

    if (directMatch) {
      score = 1;
    } else if (relatedMatchCount > 0) {
      score = 0.7 + Math.min(0.3, relatedMatchCount * 0.1);
    }

    return score * (relevance * this.config.contextWeight + 
      (1 - this.config.contextWeight));
  }

  /**
   * Calculate context score
   * @param {SkillAnalysisDetail[]} details - Analysis details
   * @param {string} context - Job context
   * @returns {number} Context score
   * @private
   */
  calculateContextScore(details, context) {
    if (details.length === 0) return 0;

    const totalRelevance = details.reduce((sum, detail) => 
      sum + detail.relevance, 0);
    
    return totalRelevance / details.length;
  }

  /**
   * Calculate match score
   * @param {SkillAnalysisDetail[]} details - Analysis details
   * @returns {number} Match score
   * @private
   */
  calculateMatchScore(details) {
    if (details.length === 0) return 0;

    const totalScore = details.reduce((sum, detail) => sum + detail.score, 0);
    return totalScore / details.length;
  }

  /**
   * Calculate overall score
   * @param {number} matchScore - Match score
   * @param {number} contextScore - Context score
   * @param {SkillCombination[]} combinations - Skill combinations
   * @returns {number} Overall score
   * @private
   */
  calculateOverallScore(matchScore, contextScore, combinations) {
    let score = (matchScore * (1 - this.config.contextWeight) + 
      contextScore * this.config.contextWeight) * 
      this.config.baseWeight;

    // Add bonus for combinations
    if (combinations.length > 0) {
      const combinationScore = combinations.reduce((sum, combo) => 
        sum + combo.score, 0) / combinations.length;
      score += combinationScore * this.config.combinationBonus;
    }

    return Math.min(1, score);
  }

  /**
   * Generate suggestions for improvement
   * @param {SkillAnalysisDetail[]} details - Analysis details
   * @param {SkillCombination[]} combinations - Skill combinations
   * @returns {string[]} Suggestions
   * @private
   */
  generateSuggestions(details, combinations) {
    /** @type {string[]} */
    const suggestions = [];

    // Add suggestions for unmatched skills
    details
      .filter(d => !d.matched && d.relatedMatches.length === 0)
      .forEach(detail => {
        const related = TechnologyMapper.getRelatedSkills(detail.skill);
        if (related.length > 0) {
          suggestions.push(
            `Consider learning ${detail.skill} or related technologies like ${
              related.slice(0, 2).join(', ')
            }`
          );
        } else {
          suggestions.push(`Consider learning ${detail.skill}`);
        }
      });

    // Add suggestions for missing combinations
    const missingCombos = this.findMissingCombinations(combinations);
    missingCombos.forEach(combo => {
      suggestions.push(
        `Consider learning ${combo.missing.join(', ')} to complete ${combo.type}`
      );
    });

    return suggestions;
  }

  /**
   * Find missing skill combinations
   * @param {SkillCombination[]} combinations - Current combinations
   * @returns {Array<{ type: string, missing: string[] }>} Missing combinations
   * @private
   */
  findMissingCombinations(combinations) {
    /** @type {Array<{ type: string, missing: string[] }>} */
    const missing = [];

    // Check for incomplete stacks
    Object.entries(TechnologyMapper['technologyMap']).forEach(([category, data]) => {
      const stackCombo = combinations.find(c => 
        c.type === 'stack' && c.explanation.includes(category)
      );

      if (!stackCombo) {
        const essentialSkills = Object.values(/** @type {TechnologyCategory} */ (data))
          .flatMap((groups) => 
            groups?.map(group => group.primary) || []
          )
          .slice(0, 3);

        if (essentialSkills.length > 0) {
          missing.push({
            type: `${category} stack`,
            missing: essentialSkills
          });
        }
      }
    });

    return missing;
  }
}

module.exports = {
  SkillAnalyzer,
  DEFAULT_CONFIG
}; 