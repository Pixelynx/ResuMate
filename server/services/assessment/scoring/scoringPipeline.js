// @ts-check

const { PenaltyThresholdManager } = require('./penaltyThresholds');
const { assessSkillMatchQuality, applySkillCompensation } = require('../compensation/skillsCompensation');
const { calculateProjectCompensation, calculateSynergyBonuses, stackCompensation } = require('../compensation/projectCompensation');
const { calculateCompensation } = require('../compensation/compensationSystem');
const { classifyJob } = require('../analysis/jobCategories');

/** @typedef {import('../compensation/skillsCompensation').SkillMatchQuality} SkillMatchQuality */
/** @typedef {import('../compensation/projectCompensation').ProjectRelevance} ProjectRelevance */
/** @typedef {import('../compensation/compensationSystem').CompensationResult} CompensationResult */
/** @typedef {import('../compensation/projectCompensation').Project} Project */

/**
 * @typedef {Object} Resume
 * @property {{ skills_: string[] }} [skills]
 * @property {Array<{ jobtitle: string }>} [workExperience]
 * @property {Array<Object>} [education]
 * @property {Project[]} [projects]
 */

/**
 * @typedef {Object} JobDetails
 * @property {string[]} [requiredSkills]
 * @property {string} [description]
 * @property {string} [title]
 * @property {number} [requiredYears]
 * @property {boolean} [isTechnicalRole]
 */

/**
 * @typedef {Object} TimingAnalytics
 * @property {number} [baseScores]
 * @property {number} [skillMatch]
 * @property {number} [projectComp]
 * @property {number} [compensations]
 * @property {number} [total]
 */

/**
 * @typedef {Object} ComponentScore
 * @property {number} skills - Skills match score (0-1)
 * @property {number} experience - Experience match score (0-1)
 * @property {number} education - Education match score (0-1)
 * @property {number} projects - Project relevance score (0-1)
 * @property {number} jobTitle - Job title relevance score (0-1)
 */

/**
 * @typedef {Object} ScoringAnalytics
 * @property {ComponentScore} baseScores - Raw component scores
 * @property {Object.<string, number>} compensations - Applied compensations
 * @property {Object.<string, number>} penalties - Applied penalties
 * @property {number} titleBonus - Job title bonus applied
 * @property {string[]} strengths - Identified strengths
 * @property {string[]} improvements - Suggested improvements
 * @property {TimingAnalytics} timing - Processing time analytics
 */

/**
 * @typedef {Object} ScoringResult
 * @property {number} finalScore - Final calculated score (0-10)
 * @property {ScoringAnalytics} analytics - Detailed scoring analytics
 * @property {string} explanation - Human-readable explanation
 */

/**
 * @typedef {Object} ProjectCompensation
 * @property {Object.<string, number>} reductions
 * @property {Array<ProjectRelevance>} relevantProjects
 */

class ScoringPipeline {
  constructor() {
    this.penaltyManager = new PenaltyThresholdManager();
    this.cache = new Map();
  }

  /**
   * Calculates base component scores
   * @param {Resume} resume - Candidate's resume
   * @param {JobDetails} jobDetails - Job details and requirements
   * @returns {Promise<ComponentScore>} Base component scores
   */
  async calculateBaseScores(resume, jobDetails) {
    // Calculate skills score
    const skillsScore = resume.skills?.skills_?.length ?
      assessSkillMatchQuality(
        resume.skills.skills_,
        jobDetails.requiredSkills || [],
        jobDetails.description || ''
      ).overallMatch : 0;

    // Calculate experience score
    const experienceScore = resume.workExperience?.length ?
      Math.min(1, resume.workExperience.reduce((total, exp) => {
        const relevance = exp.jobtitle.toLowerCase().includes(jobDetails.title?.toLowerCase() || '') ? 1 : 0.5;
        return total + relevance;
      }, 0) / (jobDetails.requiredYears || 1)) : 0;

    // Calculate education score
    const educationScore = resume.education?.length ? 0.8 : 0;  // Simplified for example

    // Calculate project score
    const projectScore = resume.projects?.length ?
      calculateProjectCompensation(
        resume.projects,
        jobDetails.requiredSkills || [],
        jobDetails.description || ''
      ).relevantProjects.reduce((score, proj) => score + (proj.relevanceScore || 0), 0) / 
      resume.projects.length : 0;

    // Calculate job title score
    const titleScore = this.calculateTitleBonus(
      resume.workExperience?.[0]?.jobtitle || '',
      jobDetails.title || ''
    ).score;

    return {
      skills: skillsScore,
      experience: experienceScore,
      education: educationScore,
      projects: projectScore,
      jobTitle: titleScore
    };
  }

  /**
   * Calculates job title relevance bonus
   * @param {string} candidateTitle - Candidate's most recent job title
   * @param {string} jobTitle - Target job title
   * @returns {{ score: number, explanation: string }}
   */
  calculateTitleBonus(candidateTitle, jobTitle) {
    const cacheKey = `title_${candidateTitle}_${jobTitle}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    /** @param {string} title */
    const normalize = (title) => title.toLowerCase().replace(/[^\w\s]/g, '');
    const candidateNorm = normalize(candidateTitle);
    const jobNorm = normalize(jobTitle);

    // Direct or close match
    if (candidateNorm === jobNorm) {
      return { score: 1.0, explanation: 'Direct title match' };
    }

    // Partial match
    const words = new Set(jobNorm.split(' '));
    const matchedWords = candidateNorm.split(' ')
      .filter(/** @param {string} word */ (word) => words.has(word)).length;
    
    const score = Math.min(0.5, matchedWords / words.size);
    const result = {
      score,
      explanation: score > 0 ? 'Partial title match' : 'No significant title match'
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Calculates final score with all compensations and bonuses
   * @param {Resume} resume - Candidate's resume
   * @param {JobDetails} jobDetails - Job details and requirements
   * @returns {Promise<ScoringResult>} Final scoring result
   */
  async calculateScore(resume, jobDetails) {
    const startTime = Date.now();
    /** @type {ScoringAnalytics} */
    const analytics = {
      baseScores: await this.calculateBaseScores(resume, jobDetails),
      compensations: {},
      penalties: {},
      titleBonus: 0,
      strengths: [],
      improvements: [],
      timing: {}
    };

    try {
      // 1. Assess skill match quality
      const skillMatch = assessSkillMatchQuality(
        resume.skills?.skills_ || [],
        jobDetails.requiredSkills || [],
        jobDetails.description || ''
      );
      analytics.timing.skillMatch = Date.now() - startTime - (analytics.timing.baseScores || 0);

      // 2. Calculate project relevance and compensation
      /** @type {ProjectCompensation} */
      const projectComp = calculateProjectCompensation(
        resume.projects || [],
        jobDetails.requiredSkills || [],
        jobDetails.description || ''
      );
      analytics.timing.projectComp = Date.now() - startTime - (analytics.timing.skillMatch || 0);

      // 3. Apply compensations in priority order
      const { adjustedPenalties, compensations } = this.applyCompensations(
        analytics.baseScores,
        skillMatch,
        projectComp,
        jobDetails.isTechnicalRole || false,
        jobDetails.requiredYears || 0
      );
      analytics.compensations = compensations;
      analytics.timing.compensations = Date.now() - startTime - (analytics.timing.projectComp || 0);

      // 4. Calculate and apply job title bonus
      const titleBonus = this.calculateTitleBonus(
        resume.workExperience?.[0]?.jobtitle || '',
        jobDetails.title || ''
      );
      analytics.titleBonus = titleBonus.score;

      // 5. Calculate final score
      const rawScore = this.calculateFinalScore(analytics.baseScores, adjustedPenalties, titleBonus.score);
      const finalScore = Math.min(10, Math.max(0, rawScore));

      // 6. Generate explanation and analytics
      const explanation = await this.generateScoreExplanation(
        finalScore,
        analytics.baseScores,
        analytics.compensations,
        titleBonus,
        skillMatch
      );

      analytics.timing.total = Date.now() - startTime;

      return {
        finalScore,
        analytics,
        explanation
      };

    } catch (error) {
      console.error('Error in scoring pipeline:', error);
      throw new Error('Failed to calculate job fit score');
    }
  }

  /**
   * Applies all compensations in priority order
   * @param {ComponentScore} baseScores - Base component scores
   * @param {SkillMatchQuality} skillMatch - Skill match assessment
   * @param {ProjectCompensation} projectComp - Project compensation data
   * @param {boolean} isTechnicalRole - Whether this is a technical role
   * @param {number} requiredYears - Required years of experience
   * @returns {{ adjustedPenalties: Object.<string, number>, compensations: Object.<string, number> }}
   */
  applyCompensations(baseScores, skillMatch, projectComp, isTechnicalRole, requiredYears) {
    // Convert base scores to initial penalties
    const initialPenalties = {
      skills: 1 - baseScores.skills,
      experience: 1 - baseScores.experience,
      education: 1 - baseScores.education,
      technical: isTechnicalRole ? 1 - skillMatch.coreSkillMatch : 0
    };

    // Apply compensations in priority order
    const { adjustedPenalties: eduAdjusted } = applySkillCompensation(
      initialPenalties,
      skillMatch
    );

    const { adjustedPenalties: expAdjusted, reductions: expReductions } = 
      calculateCompensation(
        eduAdjusted,
        skillMatch.overallMatch,
        [],  // workExperience handled separately
        skillMatch,
        isTechnicalRole,
        requiredYears
      );

    // Stack all compensations
    const { finalReductions } = stackCompensation(
      expReductions,
      projectComp.reductions,
      calculateSynergyBonuses(skillMatch, projectComp.relevantProjects)
    );

    return {
      adjustedPenalties: expAdjusted,
      compensations: finalReductions
    };
  }

  /**
   * Calculates final score from components
   * @param {ComponentScore} baseScores - Base component scores
   * @param {Object.<string, number>} penalties - Applied penalties
   * @param {number} titleBonus - Job title bonus
   * @returns {number} Final score
   */
  calculateFinalScore(baseScores, penalties, titleBonus) {
    // Weight the components
    /** @type {Record<keyof ComponentScore, number>} */
    const weights = {
      skills: 0.3,
      experience: 0.25,
      education: 0.15,
      projects: 0.2,
      jobTitle: 0.1
    };

    let score = 0;
    for (const [component, weight] of Object.entries(weights)) {
      // @ts-ignore - We know these properties exist
      const baseScore = baseScores[component] || 0;
      const penalty = penalties[component] || 0;
      score += (baseScore * (1 - penalty)) * weight;
    }

    // Add title bonus (max 1 point)
    score += titleBonus;

    // Scale to 0-10
    return score * 10;
  }

  /**
   * Generates human-readable score explanation
   * @param {number} finalScore - Final calculated score
   * @param {ComponentScore} baseScores - Base component scores
   * @param {Object} compensations - Applied compensations
   * @param {{ score: number, explanation: string }} titleBonus - Job title bonus info
   * @param {SkillMatchQuality} skillMatch - Skill match assessment
   * @returns {Promise<string>} Score explanation
   */
  async generateScoreExplanation(finalScore, baseScores, compensations, titleBonus, skillMatch) {
    const strengths = [];
    const improvements = [];

    // Analyze components
    if (baseScores.skills >= 0.8) strengths.push('Strong skill match');
    if (baseScores.experience >= 0.7) strengths.push('Relevant experience');
    if (baseScores.projects >= 0.7) strengths.push('Relevant projects');
    if (titleBonus.score > 0.5) strengths.push('Highly relevant job title');

    // Add improvement suggestions
    if (skillMatch.missingCoreSkills.length > 0) {
      improvements.push(`Consider acquiring these key skills: ${skillMatch.missingCoreSkills.join(', ')}`);
    }

    // Generate explanation
    return `Job Fit Score: ${finalScore.toFixed(1)}/10.0\n\n` +
           `Strengths:\n${strengths.map(s => `- ${s}`).join('\n')}\n\n` +
           (improvements.length > 0 ? `Areas for Improvement:\n${improvements.map(i => `- ${i}`).join('\n')}` : '');
  }
}

module.exports = {
  ScoringPipeline
}; 