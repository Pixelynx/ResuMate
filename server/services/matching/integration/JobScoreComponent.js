// @ts-check
const { SkillAnalyzer } = require('../core/analysis/SkillAnalyzer');
const { ExperienceAnalyzer } = require('../core/analysis/ExperienceAnalyzer');
const { ContextAnalyzer } = require('../core/analysis/ContextAnalyzer');
const { SkillMatcher } = require('../core/SkillMatcher');

/**
 * @typedef {import('../../../models/Resume').Resume} Resume
 * @typedef {import('../../../models/JobDescription').JobDescription} JobDescription
 */

/**
 * @typedef {Object} JobScoreProps
 * @property {Resume} resume - Resume data
 * @property {JobDescription} jobDescription - Job description data
 * @property {boolean} showDetailed - Whether to show detailed analysis
 * @property {(score: number) => void} onScoreCalculated - Score calculation callback
 */

/**
 * @typedef {Object} ScoreBreakdown
 * @property {number} overall - Overall score
 * @property {{ score: number, matches: string[], gaps: string[] }} skills - Skills analysis
 * @property {{ score: number, relevantYears: number, details: string[] }} experience - Experience analysis
 * @property {{ score: number, relevance: string[], suggestions: string[] }} context - Context analysis
 */

/**
 * @typedef {Object} ExperienceAnalysisDetail
 * @property {number} actualYears - Actual years of experience
 * @property {number} score - Experience score
 * @property {string} explanation - Experience explanation
 */

/**
 * @typedef {Object} ExperienceAnalysisResult
 * @property {number} score - Overall experience score
 * @property {ExperienceAnalysisDetail[]} details - Experience analysis details
 */

/**
 * @typedef {Object} SkillAnalysisDetail
 * @property {string} skill - Skill name
 * @property {number} relevance - Skill relevance
 */

/**
 * @typedef {Object} SkillAnalysisResult
 * @property {number} score - Overall skill score
 * @property {SkillAnalysisDetail[]} details - Skill analysis details
 * @property {string[]} suggestions - Skill suggestions
 */

/**
 * Handles job compatibility scoring and analysis
 */
class JobScoreAnalyzer {
  constructor() {
    this.skillAnalyzer = new SkillAnalyzer();
    this.experienceAnalyzer = new ExperienceAnalyzer();
    this.contextAnalyzer = new ContextAnalyzer();
    this.skillMatcher = new SkillMatcher();
  }

  /**
   * Calculate detailed job compatibility score
   * @param {Resume} resume - Resume data
   * @param {JobDescription} jobDescription - Job description data
   * @returns {Promise<ScoreBreakdown>} Score breakdown
   */
  async calculateScore(resume, jobDescription) {
    try {
      // Extract skills from job description
      const requiredSkills = this.extractSkills(jobDescription);
      
      // Match skills
      const skillMatchResult = await this.skillMatcher.matchSkills(
        requiredSkills,
        resume.skills
      );

      // Analyze skills in context
      const skillAnalysis = await this.skillAnalyzer.analyzeSkills(
        requiredSkills,
        resume.skills,
        jobDescription.description
      );

      // Analyze experience
      const experienceAnalysis = this.experienceAnalyzer.evaluateExperience(
        this.extractExperienceRequirements(jobDescription),
        this.calculateExperience(resume),
        jobDescription.description
      );

      // Calculate context score
      const contextScore = this.contextAnalyzer.calculateContextScore({
        skills: resume.skills,
        experienceYears: this.calculateExperience(resume),
        jobContext: jobDescription.description,
        jobLevel: jobDescription.level || '',
        industry: jobDescription.industry || ''
      });

      // Calculate overall score
      const overall = this.calculateOverallScore(
        skillAnalysis.score,
        experienceAnalysis.score,
        contextScore
      );

      return {
        overall,
        skills: {
          score: skillAnalysis.score,
          matches: skillMatchResult.matches.map(m => m.skill),
          gaps: skillAnalysis.suggestions
        },
        experience: {
          score: experienceAnalysis.score,
          relevantYears: this.calculateTotalRelevantYears(experienceAnalysis),
          details: experienceAnalysis.details.map(d => d.explanation)
        },
        context: {
          score: contextScore,
          relevance: this.generateRelevanceInsights(skillAnalysis),
          suggestions: this.generateContextSuggestions(skillAnalysis, experienceAnalysis)
        }
      };
    } catch (error) {
      console.error('Error calculating job score:', error);
      throw new Error('Failed to calculate job compatibility score');
    }
  }

  /**
   * Extract skills from job description
   * @param {JobDescription} job - Job description
   * @returns {string[]} Extracted skills
   * @private
   */
  extractSkills(job) {
    const skills = new Set();
    const words = job.description.toLowerCase().split(/\s+/);

    words.forEach(word => {
      if (this.skillMatcher.isValidSkill(word)) {
        skills.add(word);
      }
    });

    if (job.requiredSkills) {
      job.requiredSkills.forEach(skill => skills.add(skill.toLowerCase()));
    }

    return Array.from(skills);
  }

  /**
   * Extract experience requirements from job description
   * @param {JobDescription} job - Job description
   * @returns {Object.<string, number>} Experience requirements
   * @private
   */
  extractExperienceRequirements(job) {
    /** @type {Object.<string, number>} */
    const requirements = Object.create(null);

    if (job.requiredYears) {
      requirements['general'] = job.requiredYears;
    }

    if (job.requiredSkills) {
      job.requiredSkills.forEach(skill => {
        requirements[skill] = job.requiredYears || 1;
      });
    }

    return requirements;
  }

  /**
   * Calculate years of experience per skill/area
   * @param {Resume} resume - Resume data
   * @returns {Object.<string, number>} Experience per area
   * @private
   */
  calculateExperience(resume) {
    /** @type {Object.<string, number>} */
    const experience = Object.create(null);

    resume.workExperience?.forEach(job => {
      const duration = this.calculateDuration(job.startDate, job.endDate);
      
      // Add to general experience
      experience['general'] = (experience['general'] || 0) + duration;

      // Add to skill-specific experience
      job.skills?.forEach(skill => {
        experience[skill.toLowerCase()] = (experience[skill.toLowerCase()] || 0) + duration;
      });
    });

    return experience;
  }

  /**
   * Calculate duration between dates in years
   * @param {string} start - Start date
   * @param {string} [end] - End date
   * @returns {number} Duration in years
   * @private
   */
  calculateDuration(start, end) {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diffMs = endDate.getTime() - startDate.getTime();
    return diffMs / (1000 * 60 * 60 * 24 * 365.25); // Account for leap years
  }

  /**
   * Calculate total relevant years of experience
   * @param {ExperienceAnalysisResult} analysis - Experience analysis
   * @returns {number} Total relevant years
   * @private
   */
  calculateTotalRelevantYears(analysis) {
    return analysis.details.reduce(
      (sum, detail) => sum + (detail.actualYears || 0),
      0
    );
  }

  /**
   * Generate insights about skill relevance
   * @param {SkillAnalysisResult} analysis - Skill analysis
   * @returns {string[]} Relevance insights
   * @private
   */
  generateRelevanceInsights(analysis) {
    return analysis.details
      .filter(d => d.relevance >= 0.7)
      .map(d => `Strong match: ${d.skill} (${Math.round(d.relevance * 100)}% relevant)`);
  }

  /**
   * Generate context-aware suggestions
   * @param {SkillAnalysisResult} skillAnalysis - Skill analysis
   * @param {ExperienceAnalysisResult} experienceAnalysis - Experience analysis
   * @returns {string[]} Context suggestions
   * @private
   */
  generateContextSuggestions(skillAnalysis, experienceAnalysis) {
    const suggestions = [];

    // Add skill-based suggestions
    skillAnalysis.suggestions.forEach(suggestion => {
      suggestions.push(`Consider adding skill: ${suggestion}`);
    });

    // Add experience-based suggestions
    experienceAnalysis.details
      .filter(detail => detail.score < 0.7)
      .forEach(detail => {
        suggestions.push(detail.explanation);
      });

    return suggestions;
  }

  /**
   * Calculate overall score
   * @param {number} skillScore - Skill score
   * @param {number} experienceScore - Experience score
   * @param {number} contextScore - Context score
   * @returns {number} Overall score
   * @private
   */
  calculateOverallScore(skillScore, experienceScore, contextScore) {
    // Weighted average: skills (40%), experience (40%), context (20%)
    return (
      skillScore * 0.4 +
      experienceScore * 0.4 +
      contextScore * 0.2
    );
  }
}

module.exports = {
  JobScoreAnalyzer
}; 