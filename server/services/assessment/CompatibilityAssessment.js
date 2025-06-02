// @ts-check
const { extractSkills } = require('../utils/skillsExtractor.js');
const { COMPATIBILITY_THRESHOLDS } = require('../../config/compatibilityThresholds');

/**
 * @typedef {Object} AssessmentSuggestion
 * @property {string} type
 * @property {string} message
 * @property {string} severity
 */

/**
 * @typedef {Object} AssessmentMetadata
 * @property {string[]} skillsMatch
 * @property {string[]} missingCriticalSkills
 * @property {boolean} experienceMismatch
 * @property {boolean} roleTypeMismatch
 * @property {Object} assessmentDetails
 * @property {string} [assessmentTimestamp]
 * @property {string} [assessmentVersion]
 * @property {boolean} [hasWarnings]
 */

/**
 * @typedef {Object} ExperienceAssessmentResult
 * @property {boolean} isMatch
 * @property {string} [reason]
 * @property {string} [warning]
 */

/**
 * @typedef {Object} AssessmentResult
 * @property {boolean} isCompatible
 * @property {number} compatibilityScore
 * @property {AssessmentSuggestion[]} suggestions
 * @property {AssessmentMetadata} metadata
 */

/**
 * @typedef {Object} AssessmentCriteria
 * @property {string} name - Criteria name
 * @property {number} weight - Weight in overall score (0-1)
 * @property {Function} assess - Assessment function returning score 0-100
 */

class CompatibilityAssessment {
  constructor() {
    this.criteria = this.initializeCriteria();
    this.thresholds = COMPATIBILITY_THRESHOLDS;
  }

  /**
   * Initialize assessment criteria
   * @returns {AssessmentCriteria[]}
   */
  initializeCriteria() {
    return [
      {
        name: 'experience_level',
        weight: 0.4,
        assess: this._assessExperienceLevel.bind(this)
      },
      {
        name: 'role_category',
        weight: 0.3,
        assess: this._assessRoleCategory.bind(this)
      },
      {
        name: 'hard_skills',
        weight: 0.3,
        assess: this._assessHardSkills.bind(this)
      }
    ];
  }

  /**
   * Main assessment function
   * @param {import('../ai.service').ResumeData} resumeData
   * @param {import('../ai.service').JobDetails} jobDetails
   * @returns {Promise<AssessmentResult>}
   */
  async assessJobCompatibility(resumeData, jobDetails) {
    /** @type {AssessmentResult} */
    const assessment = {
      isCompatible: false,
      compatibilityScore: 0,
      suggestions: [],
      metadata: {
        skillsMatch: [],
        missingCriticalSkills: [],
        experienceMismatch: false,
        roleTypeMismatch: false,
        assessmentDetails: {}
      }
    };

    // Extract skills from both resume and job description
    const resumeSkills = await extractSkills(this._getAllSkillsText(resumeData));
    const jobSkills = await extractSkills(jobDetails.jobDescription);

    // 1. Critical Skills Check (Blocking)
    const criticalSkillsAssessment = this._assessCriticalSkills(resumeSkills, jobSkills);
    assessment.metadata.missingCriticalSkills = criticalSkillsAssessment.missingSkills;
    
    if (criticalSkillsAssessment.missingSkills.length > COMPATIBILITY_THRESHOLDS.MAX_MISSING_CRITICAL_SKILLS) {
      assessment.suggestions.push({
        type: 'critical_skills',
        message: `This role requires expertise in: ${criticalSkillsAssessment.missingSkills.join(', ')}`,
        severity: 'blocking'
      });
      return this._finalizeAssessment(assessment);
    }

    // 2. Role Type Compatibility (Blocking)
    const roleTypeAssessment = this._assessRoleTypeMatch(resumeData, jobDetails);
    assessment.metadata.roleTypeMismatch = !roleTypeAssessment.isMatch;
    
    if (!roleTypeAssessment.isMatch && roleTypeAssessment.reason) {
      assessment.suggestions.push({
        type: 'role_type',
        message: roleTypeAssessment.reason,
        severity: 'blocking'
      });
      return this._finalizeAssessment(assessment);
    }

    // 3. Experience Level Check (Blocking)
    const experienceAssessment = this._assessExperienceLevel(resumeData, jobDetails);
    assessment.metadata.experienceMismatch = !experienceAssessment.isMatch;
    
    if (!experienceAssessment.isMatch && experienceAssessment.reason) {
      assessment.suggestions.push({
        type: 'experience',
        message: experienceAssessment.reason,
        severity: 'blocking'
      });
      return this._finalizeAssessment(assessment);
    }

    // 4. Skills Match Analysis (Scoring)
    const skillsMatchScore = this._calculateSkillsMatchScore(resumeSkills, jobSkills);
    assessment.metadata.skillsMatch = skillsMatchScore.matchedSkills;
    assessment.compatibilityScore += skillsMatchScore.score;

    if (skillsMatchScore.score < COMPATIBILITY_THRESHOLDS.MIN_SKILLS_MATCH_SCORE) {
      assessment.suggestions.push({
        type: 'skills_match',
        message: `Your skills alignment (${skillsMatchScore.score}%) is below our threshold for this role.`,
        severity: 'blocking'
      });
      return this._finalizeAssessment(assessment);
    }

    // If we reach here, the application is considered compatible
    assessment.isCompatible = true;
    return this._finalizeAssessment(assessment);
  }

  /**
   * Assess experience level compatibility
   * @param {import('../ai.service').ResumeData} resumeData
   * @param {import('../ai.service').JobDetails} jobDetails
   * @returns {ExperienceAssessmentResult}
   * @private
   */
  _assessExperienceLevel(resumeData, jobDetails) {
    const yearsOfExperience = this._calculateTotalExperience(resumeData.workExperience || []);
    const requiredExperience = this._extractRequiredExperience(jobDetails.jobDescription);

    // If no specific experience requirement is found, don't block based on experience
    if (!requiredExperience) {
      return { isMatch: true };
    }

    // Calculate the experience ratio
    const experienceRatio = yearsOfExperience / requiredExperience;

    // If they have at least 5 years of experience, be more lenient
    if (yearsOfExperience >= 5) {
      return { isMatch: true };
    }

    // If they're close to the requirement (within 70%), consider it a match
    if (experienceRatio >= this.thresholds.MIN_EXPERIENCE_RATIO) {
      return { isMatch: true };
    }

    // If they have less than half the required experience, it's a clear mismatch
    if (experienceRatio < 0.5) {
      return {
        isMatch: false,
        reason: `This role requires ${requiredExperience} years of experience, but your profile shows ${Math.round(yearsOfExperience)} years. Consider roles better aligned with your experience level.`
      };
    }

    // For cases between 50-70% of required experience, provide a warning but don't block
    return { 
      isMatch: true,
      warning: `This role typically requires ${requiredExperience} years of experience, and you have ${Math.round(yearsOfExperience)} years. However, your skills and background may compensate for this gap.`
    };
  }

  /**
   * Assess role category compatibility
   * @param {import('../ai.service').ResumeData} resumeData
   * @param {import('../ai.service').JobDetails} jobDetails
   * @returns {Promise<number>} Score from 0-100
   * @private
   */
  async _assessRoleCategory(resumeData, jobDetails) {
    const jobRole = this.categorizeRole(jobDetails);
    const candidateBackground = this.categorizeCandidateBackground(resumeData);
    
    // Technical role mismatch check
    if (jobRole.isTechnical && !candidateBackground.hasTechnicalBackground) {
      return 0;
    }

    // Management role mismatch check
    if (jobRole.isManagement && !candidateBackground.hasManagementExperience) {
      return 0;
    }

    // Industry match check
    const industryMatchScore = this.calculateIndustryMatch(
      candidateBackground.industries,
      jobRole.industry
    );

    return industryMatchScore;
  }

  /**
   * Assess hard skills compatibility
   * @param {import('../ai.service').ResumeData} resumeData
   * @param {import('../ai.service').JobDetails} jobDetails
   * @returns {Promise<number>} Score from 0-100
   * @private
   */
  async _assessHardSkills(resumeData, jobDetails) {
    const requiredSkills = this.extractRequiredSkills(jobDetails.jobDescription);
    const candidateSkills = this.extractCandidateSkills(resumeData);
    
    let matchedSkills = 0;
    let criticalSkillsMissing = false;

    for (const skill of requiredSkills) {
      if (skill.critical && !candidateSkills.has(skill.name.toLowerCase())) {
        criticalSkillsMissing = true;
        break;
      }
      if (candidateSkills.has(skill.name.toLowerCase())) {
        matchedSkills++;
      }
    }

    if (criticalSkillsMissing) {
      return 0;
    }

    return Math.min(100, (matchedSkills / requiredSkills.length) * 100);
  }

  /**
   * Helper function to determine compatibility level
   * @private
   */
  determineCompatibilityLevel(score) {
    if (score >= 90) return 'excellent_match';
    if (score >= 75) return 'good_match';
    if (score >= 60) return 'potential_match';
    if (score >= this.thresholds.MINIMUM_VIABLE_SCORE) return 'poor_match';
    return 'incompatible';
  }

  /**
   * Generate improvement suggestions based on assessment results
   * @private
   */
  generateSuggestions(assessmentDetails, resumeData, jobDetails) {
    const suggestions = [];

    if (assessmentDetails.experience_level < 60) {
      suggestions.push(
        'Consider roles better aligned with your experience level',
        'Focus on gaining more relevant experience in this field'
      );
    }

    if (assessmentDetails.role_category < 60) {
      suggestions.push(
        'Look for roles more aligned with your background',
        'Consider transitional roles to build relevant experience'
      );
    }

    if (assessmentDetails.hard_skills < 60) {
      suggestions.push(
        'Develop the required technical skills for this role',
        'Focus on acquiring relevant certifications'
      );
    }

    return suggestions;
  }

  /**
   * Extract required years from job description
   * @private
   * @param {string} description - Job description
   * @returns {number} Required years of experience
   */
  extractRequiredYears(description) {
    const yearPattern = /(\d+)[\+]?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)/i;
    const match = description.match(yearPattern);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Check if position is senior level
   * @private
   * @param {import('../ai.service').JobDetails} jobDetails
   * @returns {boolean}
   */
  isSeniorPosition(jobDetails) {
    return /\b(senior|sr\.?|lead|principal)\b/i.test(jobDetails.jobTitle);
  }

  /**
   * Check if position is executive level
   * @private
   * @param {import('../ai.service').JobDetails} jobDetails
   * @returns {boolean}
   */
  isExecutivePosition(jobDetails) {
    return /\b(chief|cto|ceo|cfo|coo|vp|director|head\s+of)\b/i.test(jobDetails.jobTitle);
  }

  /**
   * Categorize job role
   * @private
   * @param {import('../ai.service').JobDetails} jobDetails
   * @returns {Object} Role categories
   */
  categorizeRole(jobDetails) {
    return {
      isTechnical: /\b(software|developer|engineer|programmer|technical|IT|devops|architect)\b/i.test(jobDetails.jobTitle),
      isManagement: /\b(manager|director|lead|head|supervisor|chief)\b/i.test(jobDetails.jobTitle),
      industry: this.extractIndustry(jobDetails.jobDescription)
    };
  }

  /**
   * Categorize candidate background
   * @private
   * @param {import('../ai.service').ResumeData} resumeData
   * @returns {Object} Background categories
   */
  categorizeCandidateBackground(resumeData) {
    const skills = (resumeData.skills?.skills_ || '').toLowerCase();
    const titles = resumeData.workExperience?.map(exp => exp.title.toLowerCase()) || [];
    
    return {
      hasTechnicalBackground: /\b(programming|software|development|coding|technical)\b/i.test(skills),
      hasManagementExperience: titles.some(title => /\b(manager|director|lead|head|supervisor)\b/i.test(title)),
      industries: this.extractCandidateIndustries(resumeData)
    };
  }

  /**
   * Calculate industry match score
   * @private
   * @param {Set<string>} candidateIndustries
   * @param {string} jobIndustry
   * @returns {number} Match score
   */
  calculateIndustryMatch(candidateIndustries, jobIndustry) {
    if (candidateIndustries.has(jobIndustry)) {
      return 100;
    }
    
    // Check for related industries
    const relatedIndustries = this.getRelatedIndustries(jobIndustry);
    const hasRelatedIndustry = [...candidateIndustries].some(industry => 
      relatedIndustries.has(industry)
    );

    return hasRelatedIndustry ? 70 : 50;
  }

  /**
   * Extract required skills from job description
   * @private
   * @param {string} description
   * @returns {Array<{name: string, critical: boolean}>}
   */
  extractRequiredSkills(description) {
    const requirementSection = description.match(/requirements?:?(.*?)(?:\n\n|$)/si)?.[1] || description;
    const skills = requirementSection.match(/\b[A-Za-z0-9+#]+(?:\s*[A-Za-z0-9+#]+)*\b/g) || [];
    
    return skills.map(skill => ({
      name: skill.toLowerCase(),
      critical: /\b(must|required|essential)\b/i.test(requirementSection)
    }));
  }

  /**
   * Extract candidate skills
   * @private
   * @param {import('../ai.service').ResumeData} resumeData
   * @returns {Set<string>}
   */
  extractCandidateSkills(resumeData) {
    const skills = new Set();
    const skillsText = resumeData.skills?.skills_ || '';
    
    skillsText.toLowerCase().split(/[,\n]/).forEach(skill => {
      skills.add(skill.trim());
    });

    return skills;
  }

  /**
   * Extract industry from description
   * @private
   * @param {string} description
   * @returns {string}
   */
  extractIndustry(description) {
    // Simplified industry extraction - enhance based on your needs
    const industries = [
      'technology', 'healthcare', 'finance', 'education',
      'manufacturing', 'retail', 'consulting'
    ];
    
    return industries.find(industry => 
      new RegExp(`\\b${industry}\\b`, 'i').test(description)
    ) || 'unknown';
  }

  /**
   * Extract industries from candidate experience
   * @private
   * @param {import('../ai.service').ResumeData} resumeData
   * @returns {Set<string>}
   */
  extractCandidateIndustries(resumeData) {
    const industries = new Set();
    
    resumeData.workExperience?.forEach(exp => {
      const industry = this.extractIndustry(exp.description);
      if (industry !== 'unknown') {
        industries.add(industry);
      }
    });

    return industries;
  }

  /**
   * Get related industries for a given industry
   * @private
   * @param {string} industry
   * @returns {Set<string>}
   */
  getRelatedIndustries(industry) {
    // Simplified related industries mapping - enhance based on your needs
    const relatedIndustriesMap = {
      'technology': new Set(['consulting', 'education']),
      'healthcare': new Set(['technology', 'consulting']),
      'finance': new Set(['technology', 'consulting']),
      'education': new Set(['technology', 'consulting']),
      'manufacturing': new Set(['technology', 'consulting']),
      'retail': new Set(['technology', 'consulting']),
      'consulting': new Set(['technology', 'finance', 'healthcare'])
    };

    return relatedIndustriesMap[industry] || new Set();
  }

  /**
   * Assess if critical skills are present
   * @param {string[]} resumeSkills
   * @param {string[]} jobSkills
   * @returns {{missingSkills: string[], hasCriticalSkills: boolean}}
   * @private
   */
  _assessCriticalSkills(resumeSkills, jobSkills) {
    const criticalSkills = this._identifyCriticalSkills(jobSkills);
    const missingSkills = criticalSkills.filter(skill => !resumeSkills.includes(skill));
    
    return {
      missingSkills,
      hasCriticalSkills: missingSkills.length <= COMPATIBILITY_THRESHOLDS.MAX_MISSING_CRITICAL_SKILLS
    };
  }

  /**
   * Assess role type match
   * @param {import('../ai.service').ResumeData} resumeData
   * @param {import('../ai.service').JobDetails} jobDetails
   * @returns {{isMatch: boolean, reason?: string}}
   * @private
   */
  _assessRoleTypeMatch(resumeData, jobDetails) {
    const roleCategories = {
      technical: ['developer', 'engineer', 'programmer', 'analyst', 'architect', 'software', 'data scientist', 'devops'],
      management: ['manager', 'director', 'lead', 'head', 'supervisor', 'coordinator'],
      hr: ['hr', 'human resources', 'recruiter', 'talent', 'people operations'],
      design: ['designer', 'ux', 'ui', 'creative', 'graphic'],
      administrative: ['coordinator', 'assistant', 'secretary', 'admin'],
      marketing: ['marketing', 'seo', 'content', 'social media', 'brand'],
      sales: ['sales', 'account executive', 'business development']
    };

    const jobRole = jobDetails.jobTitle.toLowerCase();
    const resumeRole = resumeData.title?.toLowerCase() || '';
    const resumeExp = resumeData.workExperience || [];
    
    // Determine job category
    const jobCategory = Object.entries(roleCategories)
      .find(([_, keywords]) => keywords.some(k => jobRole.includes(k)))?.[0];

    // Check current role and past roles
    const resumeCategories = new Set();
    if (resumeRole) {
      Object.entries(roleCategories).forEach(([category, keywords]) => {
        if (keywords.some(k => resumeRole.includes(k))) {
          resumeCategories.add(category);
        }
      });
    }

    // Check past experience
    resumeExp.forEach(exp => {
      const title = exp?.title?.toLowerCase() || '';
      Object.entries(roleCategories).forEach(([category, keywords]) => {
        if (keywords.some(k => title.includes(k))) {
          resumeCategories.add(category);
        }
      });
    });

    // Strict role category validation
    if (!jobCategory) {
      return {
        isMatch: false,
        reason: 'Unable to determine the role category. Please check the job title.'
      };
    }

    if (resumeCategories.size === 0) {
      return {
        isMatch: false,
        reason: 'Unable to determine your professional background from your experience.'
      };
    }

    // Technical roles require technical background
    if (jobCategory === 'technical') {
      const hasTechnicalBackground = resumeCategories.has('technical') ||
        this._hasStrongTechnicalSkills(resumeData);
      
      if (!hasTechnicalBackground) {
        return {
          isMatch: false,
          reason: 'This technical role requires a strong technical background, which is not evident in your profile.'
        };
      }
    }

    // Management roles require relevant experience
    if (jobCategory === 'management') {
      const hasManagementExp = resumeCategories.has('management') &&
        this._hasMinimumManagementExperience(resumeData);
      
      if (!hasManagementExp) {
        return {
          isMatch: false,
          reason: 'This management role requires previous management experience.'
        };
      }
    }

    // Direct category mismatch
    if (!resumeCategories.has(jobCategory)) {
      const currentCategory = Array.from(resumeCategories)[0] || 'unrelated field';
      return {
        isMatch: false,
        reason: `Your background is primarily in ${currentCategory}, which doesn't align with this ${jobCategory} role.`
      };
    }

    return { isMatch: true };
  }

  /**
   * Check for strong technical skills
   * @private
   */
  _hasStrongTechnicalSkills(resumeData) {
    const technicalKeywords = [
      'programming', 'software development', 'coding', 'engineering',
      'database', 'api', 'backend', 'frontend', 'full stack',
      'algorithms', 'data structures', 'system design'
    ];

    const skills = resumeData.skills?.skills_?.toLowerCase() || '';
    const hasSkills = technicalKeywords.some(keyword => skills.includes(keyword));

    // Check projects for technical nature
    const projects = resumeData.projects || [];
    const hasTechnicalProjects = projects.some(project => 
      technicalKeywords.some(keyword => 
        (project.description?.toLowerCase() || '').includes(keyword)
      )
    );

    // Check work experience descriptions
    const workExp = resumeData.workExperience || [];
    const hasTechnicalWork = workExp.some(exp => 
      technicalKeywords.some(keyword => 
        (exp.description?.toLowerCase() || '').includes(keyword)
      )
    );

    return hasSkills || hasTechnicalProjects || hasTechnicalWork;
  }

  /**
   * Check for minimum management experience
   * @private
   */
  _hasMinimumManagementExperience(resumeData) {
    const workExp = resumeData.workExperience || [];
    const managementExp = workExp.filter(exp => 
      /\b(manager|director|lead|head|supervisor)\b/i.test(exp.title)
    );

    if (managementExp.length === 0) return false;

    // Calculate total management experience
    const totalYears = this._calculateTotalExperience(managementExp);
    return totalYears >= 2; // Minimum 2 years management experience
  }

  /**
   * Calculate skills match score
   * @param {string[]} resumeSkills
   * @param {string[]} jobSkills
   * @returns {{score: number, matchedSkills: string[]}}
   * @private
   */
  _calculateSkillsMatchScore(resumeSkills, jobSkills) {
    // Normalize skills for comparison
    const normalizedResumeSkills = new Set(
      resumeSkills.map(skill => skill.toLowerCase().trim())
    );
    const normalizedJobSkills = jobSkills.map(skill => skill.toLowerCase().trim());

    // Find exact and related matches
    const matchedSkills = [];
    const relatedMatches = new Set();

    // Define related skills mapping
    const relatedSkillsMap = {
      'react': ['javascript', 'jsx', 'redux', 'hooks', 'frontend', 'front-end', 'web'],
      'javascript': ['typescript', 'js', 'es6', 'frontend', 'nodejs', 'react', 'vue', 'angular'],
      'frontend': ['front-end', 'react', 'vue', 'angular', 'javascript', 'html', 'css'],
      'backend': ['back-end', 'nodejs', 'express', 'java', 'python', 'php'],
      'database': ['sql', 'mysql', 'postgresql', 'mongodb', 'oracle'],
      // Add more related skills mappings as needed
    };

    for (const jobSkill of normalizedJobSkills) {
      // Check for exact matches
      if (normalizedResumeSkills.has(jobSkill)) {
        matchedSkills.push(jobSkill);
        continue;
      }

      // Check for related skills
      for (const [mainSkill, relatedSkills] of Object.entries(relatedSkillsMap)) {
        if ((jobSkill.includes(mainSkill) || mainSkill.includes(jobSkill)) &&
            relatedSkills.some(related => normalizedResumeSkills.has(related))) {
          relatedMatches.add(jobSkill);
          break;
        }
      }
    }

    // Calculate score giving more weight to exact matches
    const exactMatchScore = (matchedSkills.length / normalizedJobSkills.length) * 70;
    const relatedMatchScore = (relatedMatches.size / normalizedJobSkills.length) * 30;
    const totalScore = Math.min(100, exactMatchScore + relatedMatchScore);

    return {
      score: Math.round(totalScore),
      matchedSkills: [...matchedSkills, ...[...relatedMatches].map(skill => `${skill}*`)]
    };
  }

  /**
   * Extract all skills text from resume
   * @param {import('../ai.service').ResumeData} resumeData
   * @returns {string}
   * @private
   */
  _getAllSkillsText(resumeData) {
    return [
      resumeData.skills?.skills_,
      ...(resumeData.workExperience || []).map(exp => exp.description),
      ...(resumeData.projects || []).map(proj => proj.description)
    ].filter(Boolean).join(' ');
  }

  /**
   * Identify critical skills from job requirements
   * @param {string[]} jobSkills
   * @returns {string[]}
   * @private
   */
  _identifyCriticalSkills(jobSkills) {
    // Consider skills mentioned multiple times or with emphasis as critical
    const skillFrequency = jobSkills.reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(skillFrequency)
      .filter(([_, count]) => count > 1)
      .map(([skill]) => skill);
  }

  /**
   * Calculate total years of experience
   * @param {Array<{startDate: string, endDate?: string}>} workExperience
   * @returns {number}
   * @private
   */
  _calculateTotalExperience(workExperience) {
    return workExperience.reduce((total, exp) => {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return total + years;
    }, 0);
  }

  /**
   * Extract required experience from job description
   * @param {string} description
   * @returns {number|null}
   * @private
   */
  _extractRequiredExperience(description) {
    const patterns = [
      /(\d+)[\+]?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)/i,
      /(?:experience|exp)(?:\s*:)?\s*(\d+)[\+]?\s*(?:years?|yrs?)/i,
      /(\d+)[\+]?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:relevant|professional)/i
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        // If it's a "X+" years requirement, reduce it by 1 to make it more lenient
        const years = parseInt(match[1]);
        return match[0].includes('+') ? years - 1 : years;
      }
    }
    
    // If no explicit requirement found, try to infer from job title
    const title = description.toLowerCase();
    if (title.includes('senior') || title.includes('sr.')) return 4;
    if (title.includes('lead')) return 3;
    if (title.includes('junior') || title.includes('jr.')) return 1;
    
    return null;
  }

  /**
   * Finalize assessment with metadata
   * @param {AssessmentResult} assessment
   * @returns {AssessmentResult}
   * @private
   */
  _finalizeAssessment(assessment) {
    // Ensure we have a valid compatibility score
    if (!assessment.compatibilityScore || assessment.compatibilityScore < 0) {
      assessment.compatibilityScore = 0;
    }

    // Add warnings to metadata if they exist
    if (assessment.suggestions.some(s => s.severity === 'warning')) {
      assessment.metadata.hasWarnings = true;
    }

    assessment.metadata.assessmentTimestamp = new Date().toISOString();
    assessment.metadata.assessmentVersion = '2.0';

    // If score is above minimum viable but there are only warnings, mark as compatible
    if (assessment.compatibilityScore >= this.thresholds.MINIMUM_VIABLE_SCORE &&
        !assessment.suggestions.some(s => s.severity === 'blocking')) {
      assessment.isCompatible = true;
    }

    return assessment;
  }
}

module.exports = new CompatibilityAssessment(); 