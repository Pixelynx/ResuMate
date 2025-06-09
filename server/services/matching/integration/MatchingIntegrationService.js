// @ts-check
const { calculateJobFitScore } = require('../../jobFitService');
const { calculateComponentScores } = require('../../assessment/scoring/componentScoring');
const { extractCompleteResumeData } = require('../../generation/resumeDataProcessor');

/**
 * @typedef {import('../../jobFitService').JobFitResult} JobFitResult
 * @typedef {import('../../generation/resumeDataProcessor').StandardizedResumeData} StandardizedResumeData
 * @typedef {import('../../assessment/analysis/technicalKeywordLibrary').Resume} Resume
 * @typedef {Object} PersonalDetails
 * @property {string} title
 * @property {string} firstname
 * @property {string} lastname
 * @property {string} [email]
 * @property {string} [phone]
 * @property {string} [linkedIn]
 * @property {string} [portfolio]
 */

class MatchingIntegrationError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'MatchingIntegrationError';
    this.code = code;
    this.details = details;
  }
}

class MatchingCache {
  constructor(ttl = 3600000) { // 1 hour default TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  async get(key) {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < this.ttl) {
      return item.data;
    }
    return null;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }
}

class MatchingIntegrationService {
  constructor(options = {}) {
    this.cacheEnabled = options.cacheEnabled !== false;
    this.cache = new MatchingCache(options.cacheTTL);
    this.maxConcurrentRequests = options.maxConcurrentRequests || 10;
    this.activeRequests = 0;
    this.requestQueue = [];
  }

  /**
   * Adapts StandardizedResumeData to Resume format
   * @param {StandardizedResumeData} standardizedData 
   * @returns {Resume}
   */
  _adaptResumeData(standardizedData) {
    const [firstName, ...lastNameParts] = standardizedData.personalDetails.fullName.split(' ');
    const lastName = lastNameParts.join(' ');
    
    return {
      personalDetails: {
        title: standardizedData.personalDetails.fullName,
        firstname: firstName,
        lastname: lastName,
        email: standardizedData.personalDetails.email || '',
        phone: standardizedData.personalDetails.phone || '',
        location: standardizedData.personalDetails.location?.toString() || '',
        linkedin: standardizedData.personalDetails.linkedIn,
        github: undefined,
        website: standardizedData.personalDetails.portfolio
      },
      skills: {
        skills_: standardizedData.skills.technical.concat(standardizedData.skills.soft).join(', ')
      },
      workExperience: standardizedData.workExperience.map(exp => ({
        jobtitle: exp.position,
        companyName: exp.company,
        description: exp.description,
        startDate: exp.startDate?.toISOString(),
        endDate: exp.endDate?.toISOString()
      })),
      projects: standardizedData.projects.map(proj => ({
        title: proj.title,
        description: proj.description,
        technologies: proj.technologies.join(', ')
      })),
      education: standardizedData.education.map(edu => ({
        degree: edu.degree,
        fieldOfStudy: edu.degree,
        institutionName: edu.institution,
        graduationDate: edu.graduationDate?.toISOString()
      }))
    };
  }

  /**
   * Get relevant content for cover letter generation
   * @param {StandardizedResumeData} resumeData - Processed resume data
   * @param {Object} jobDetails - Job details
   * @param {Object} [options] - Additional options
   * @returns {Promise<Object>} Relevant content with scores
   */
  async getRelevantContent(resumeData, jobDetails, options = {}) {
    const cacheKey = this._generateCacheKey(resumeData, jobDetails);
    
    if (this.cacheEnabled) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return { ...cached, fromCache: true };
      }
    }

    try {
      await this._acquireRequestSlot();

      const adaptedResumeData = this._adaptResumeData(resumeData);
      const [matchingResults, componentScores] = await Promise.all([
        calculateJobFitScore(adaptedResumeData, jobDetails),
        calculateComponentScores(adaptedResumeData, jobDetails.jobDescription, jobDetails.jobTitle)
      ]);

      const relevantExperiences = await this.getRelevantExperiences(resumeData, jobDetails, matchingResults);
      const prioritizedSkills = this.prioritizeSkills(matchingResults, componentScores);
      const keywordMap = this.generateKeywordMap(matchingResults, jobDetails);

      const result = {
        overallScore: matchingResults.score,
        experiences: relevantExperiences,
        skills: prioritizedSkills,
        keywords: keywordMap,
        metadata: {
          jobClassification: matchingResults.jobClassification,
          processingTime: Date.now(),
          componentScores
        }
      };

      if (this.cacheEnabled) {
        this.cache.set(cacheKey, result);
      }

      return result;
    } catch (error) {
      throw new MatchingIntegrationError(
        'Failed to get relevant content',
        'INTEGRATION_ERROR',
        { originalError: error instanceof Error ? error.message : 'Unknown error' }
      );
    } finally {
      this._releaseRequestSlot();
    }
  }

  /**
   * Get relevant experiences ranked by job fit
   * @param {StandardizedResumeData} resumeData 
   * @param {Object} jobDetails 
   * @param {JobFitResult} matchingResults 
   * @returns {Promise<Array<Object>>}
   */
  async getRelevantExperiences(resumeData, jobDetails, matchingResults) {
    if (!resumeData.workExperience?.length) {
      return [];
    }

    const scoredExperiences = resumeData.workExperience.map(exp => {
      const skillAlignment = this._calculateSkillAlignment(exp, jobDetails);
      const industryMatch = this._calculateIndustryMatch(exp, jobDetails);
      const rolesSimilarity = this._calculateRoleSimilarity(exp, jobDetails);
      const achievementRelevance = this._calculateAchievementRelevance(exp, jobDetails);

      const relevanceScore = (
        (skillAlignment * 0.4) +
        (industryMatch * 0.2) +
        (rolesSimilarity * 0.25) +
        (achievementRelevance * 0.15)
      );

      return {
        ...exp,
        relevanceScore,
        metrics: {
          skillAlignment,
          industryMatch,
          rolesSimilarity,
          achievementRelevance
        }
      };
    });

    return scoredExperiences
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .map(exp => ({
        ...exp,
        suggested_highlights: this._generateExperienceHighlights(exp, jobDetails)
      }));
  }

  /**
   * Prioritize skills based on matching scores
   * @param {JobFitResult} matchingResults 
   * @param {Object} componentScores 
   * @returns {Object}
   */
  prioritizeSkills(matchingResults, componentScores) {
    const { jobClassification } = matchingResults;
    const categorizedSkills = {
      critical: [],
      important: [],
      supplementary: [],
      transferable: []
    };

    // Implementation details for skill prioritization
    // This will be expanded in the next phase

    return {
      categorized: categorizedSkills,
      gaps: this._identifySkillGaps(matchingResults),
      recommendations: this._generateSkillRecommendations(matchingResults)
    };
  }

  /**
   * Generate keyword optimization map
   * @param {JobFitResult} matchingResults 
   * @param {Object} jobDetails 
   * @returns {Object}
   */
  generateKeywordMap(matchingResults, jobDetails) {
    return {
      essential_terms: this._extractEssentialTerms(jobDetails),
      industry_specific: this._extractIndustryTerms(jobDetails),
      technical_keywords: this._extractTechnicalKeywords(jobDetails),
      soft_skills: this._extractSoftSkills(jobDetails),
      density_recommendations: this._calculateKeywordDensity(jobDetails)
    };
  }

  // Private helper methods
  
  _calculateSkillAlignment(experience, jobDetails) {
    // Implementation will be added in next phase
    return 0.5;
  }

  _calculateIndustryMatch(experience, jobDetails) {
    // Implementation will be added in next phase
    return 0.5;
  }

  _calculateRoleSimilarity(experience, jobDetails) {
    // Implementation will be added in next phase
    return 0.5;
  }

  _calculateAchievementRelevance(experience, jobDetails) {
    // Implementation will be added in next phase
    return 0.5;
  }

  _generateExperienceHighlights(experience, jobDetails) {
    // Implementation will be added in next phase
    return [];
  }

  _identifySkillGaps(matchingResults) {
    // Implementation will be added in next phase
    return [];
  }

  _generateSkillRecommendations(matchingResults) {
    // Implementation will be added in next phase
    return [];
  }

  _extractEssentialTerms(jobDetails) {
    // Implementation will be added in next phase
    return [];
  }

  _extractIndustryTerms(jobDetails) {
    // Implementation will be added in next phase
    return [];
  }

  _extractTechnicalKeywords(jobDetails) {
    // Implementation will be added in next phase
    return [];
  }

  _extractSoftSkills(jobDetails) {
    // Implementation will be added in next phase
    return [];
  }

  _calculateKeywordDensity(jobDetails) {
    // Implementation will be added in next phase
    return {};
  }

  _generateCacheKey(resumeData, jobDetails) {
    return `${resumeData.id}_${jobDetails.jobTitle}_${jobDetails.company}`;
  }

  async _acquireRequestSlot() {
    if (this.activeRequests < this.maxConcurrentRequests) {
      this.activeRequests++;
      return;
    }

    await new Promise(resolve => this.requestQueue.push(resolve));
    this.activeRequests++;
  }

  _releaseRequestSlot() {
    this.activeRequests--;
    if (this.requestQueue.length > 0) {
      const nextRequest = this.requestQueue.shift();
      nextRequest();
    }
  }
}

module.exports = MatchingIntegrationService; 