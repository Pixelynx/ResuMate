const { TechnologyMapper } = require('./TechnologyMapper');
const { SkillNormalizer } = require('./SkillNormalizer');

/**
 * Default configuration for skill matching
 * @type {{
 *   baseWeight: number,
 *   contextMultiplier: number,
 *   compensationFactor: number,
 *   minThreshold: number
 * }}
 */
const DEFAULT_CONFIG = {
  baseWeight: 1.0,
  contextMultiplier: 1.2,
  compensationFactor: 0.8,
  minThreshold: 0.6
};

/**
 * Implementation of the skill matching system
 */
class SkillMatcher {
  /**
   * Match candidate skills against job requirements
   * @param {string[]} jobSkills - Required job skills
   * @param {string[]} candidateSkills - Candidate's skills
   * @param {Object} [config] - Optional configuration
   * @returns {Promise<Object>} Match result
   */
  async matchSkills(jobSkills, candidateSkills, config = {}) {
    try {
      const finalConfig = { ...DEFAULT_CONFIG, ...config };
      const matches = [];
      const compensations = [];
      const missingCritical = [];
      const processedSkills = new Set();

      // Normalize all skills
      const normalizedJobSkills = jobSkills.map(skill => SkillNormalizer.normalizeSkill(skill));
      const normalizedCandidateSkills = candidateSkills.map(skill => SkillNormalizer.normalizeSkill(skill));

      // Process direct matches first
      for (const jobSkill of normalizedJobSkills) {
        const directMatch = this.findDirectMatch(jobSkill, normalizedCandidateSkills);
        
        if (directMatch) {
          matches.push({
            skill: jobSkill,
            confidence: 1.0,
            matchType: 'direct'
          });
          processedSkills.add(jobSkill);
        } else {
          const relatedMatch = await this.findRelatedMatch(
            jobSkill,
            normalizedCandidateSkills,
            finalConfig
          );

          if (relatedMatch) {
            matches.push(relatedMatch.match);
            compensations.push(relatedMatch.compensation);
            processedSkills.add(jobSkill);
          } else {
            missingCritical.push(jobSkill);
          }
        }
      }

      // Calculate overall score
      const score = this.calculateOverallScore(matches, compensations, finalConfig);

      // Generate suggestions for missing skills
      const suggestions = this.generateSuggestions(missingCritical);

      return {
        score,
        matches,
        compensations,
        missingCritical,
        suggestions
      };
    } catch (error) {
      console.error('Error in skill matching:', error);
      throw new Error('Failed to perform skill matching');
    }
  }

  /**
   * Calculate relevance of a skill in a given context
   * @param {string} skill - Skill to evaluate
   * @param {string} context - Context to evaluate against
   * @returns {Promise<number>} Relevance score
   */
  async calculateSkillRelevance(skill, context) {
    try {
      const normalizedSkill = SkillNormalizer.normalizeSkill(skill);
      const normalizedContext = context.toLowerCase();

      // Find the technology group for the skill
      const groupInfo = TechnologyMapper.findGroupForSkill(normalizedSkill);
      if (!groupInfo) return 0.5; // Default relevance for unknown skills

      // Check if the context mentions the technology group or related terms
      const groupSkills = TechnologyMapper.getSkills(groupInfo.category, groupInfo.subcategory);
      const contextRelevance = groupSkills.some(s => normalizedContext.includes(s)) ? 1.0 : 0.7;

      return contextRelevance;
    } catch (error) {
      console.error('Error calculating skill relevance:', error);
      return 0.5; // Default relevance on error
    }
  }

  /**
   * Find related skills for a given skill
   * @param {string} skill - Skill to find related skills for
   * @returns {Promise<string[]>} Related skills
   */
  async findRelatedSkills(skill) {
    try {
      const normalizedSkill = SkillNormalizer.normalizeSkill(skill);
      return TechnologyMapper.getRelatedSkills(normalizedSkill);
    } catch (error) {
      console.error('Error finding related skills:', error);
      return [];
    }
  }

  /**
   * Find a direct match for a job skill in candidate skills
   * @param {string} jobSkill - Job skill to match
   * @param {string[]} candidateSkills - Candidate skills to match against
   * @returns {boolean} Whether a direct match was found
   */
  findDirectMatch(jobSkill, candidateSkills) {
    return candidateSkills.some(skill => 
      SkillNormalizer.areSimilarSkills(jobSkill, skill)
    );
  }

  /**
   * Find a related match for a job skill
   * @param {string} jobSkill - Job skill to match
   * @param {string[]} candidateSkills - Candidate skills to match against
   * @param {Object} config - Match configuration
   * @returns {Promise<Object|null>} Match and compensation info
   */
  async findRelatedMatch(jobSkill, candidateSkills, config) {
    const relatedSkills = await this.findRelatedSkills(jobSkill);
    
    for (const candidateSkill of candidateSkills) {
      if (relatedSkills.some(related => 
        SkillNormalizer.areSimilarSkills(related, candidateSkill)
      )) {
        const groupInfo = TechnologyMapper.findGroupForSkill(jobSkill);
        const compensationFactor = groupInfo 
          ? groupInfo.group.compensation
          : config.compensationFactor;

        return {
          match: {
            skill: jobSkill,
            confidence: compensationFactor,
            matchType: 'related',
            context: `Related to ${candidateSkill}`
          },
          compensation: {
            requiredSkill: jobSkill,
            relatedSkill: candidateSkill,
            factor: compensationFactor,
            reason: `${candidateSkill} is related to ${jobSkill} in the ${groupInfo?.category || 'technology'} category`
          }
        };
      }
    }

    return null;
  }

  /**
   * Calculate the overall score based on matches and compensations
   * @param {Array} matches - Skill matches
   * @param {Array} compensations - Skill compensations
   * @param {Object} config - Score configuration
   * @returns {number} Overall score
   */
  calculateOverallScore(matches, compensations, config) {
    const directMatches = matches.filter(m => m.matchType === 'direct').length;
    const relatedMatches = matches.filter(m => m.matchType === 'related').length;
    
    const directScore = directMatches * config.baseWeight;
    const relatedScore = relatedMatches * config.baseWeight * config.compensationFactor;
    
    const totalPossibleScore = matches.length * config.baseWeight;
    const actualScore = directScore + relatedScore;

    return Math.min(1, Math.max(0, actualScore / totalPossibleScore));
  }

  /**
   * Generate suggestions for missing skills
   * @param {string[]} missingSkills - Missing skills to generate suggestions for
   * @returns {string[]} Skill suggestions
   */
  generateSuggestions(missingSkills) {
    return missingSkills.map(skill => {
      const group = TechnologyMapper.findGroupForSkill(skill);
      if (!group) return `Consider learning ${skill}`;

      const relatedSkills = TechnologyMapper.getRelatedSkills(skill);
      const suggestion = relatedSkills.length > 0
        ? `Consider learning ${skill} or related technologies like ${relatedSkills.slice(0, 3).join(', ')}`
        : `Consider learning ${skill}`;

      return suggestion;
    });
  }

  /**
   * Check if a skill is valid/known
   * @param {string} skill - Skill to validate
   * @returns {boolean} Whether the skill is valid
   */
  isValidSkill(skill) {
    const normalizedSkill = SkillNormalizer.normalizeSkill(skill);
    return TechnologyMapper.findGroupForSkill(normalizedSkill) !== null;
  }

  /**
   * Find direct and related matches
   * @param {string[]} required - Required skills
   * @param {string[]} candidate - Candidate skills
   * @returns {Array<Object>} Matches
   */
  findMatches(required, candidate) {
    const matches = [];

    required.forEach(skill => {
      // Check for direct match
      if (candidate.some(s => SkillNormalizer.areSimilarSkills(s, skill))) {
        matches.push({ skill, matchType: 'direct' });
        return;
      }

      // Check for related match
      const relatedSkills = TechnologyMapper.getRelatedSkills(skill);
      if (candidate.some(s => relatedSkills.includes(s))) {
        matches.push({ skill, matchType: 'related' });
        return;
      }

      // Check for potential match (same technology group)
      const skillGroup = TechnologyMapper.findGroupForSkill(skill);
      if (skillGroup && candidate.some(s => {
        const candidateGroup = TechnologyMapper.findGroupForSkill(s);
        return candidateGroup && candidateGroup.category === skillGroup.category;
      })) {
        matches.push({ skill, matchType: 'potential' });
      }
    });

    return matches;
  }
}

module.exports = {
  SkillMatcher
}; 