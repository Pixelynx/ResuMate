// @ts-check
const { isFeatureEnabled } = require('../../../config/featureFlags');
const {
  calculateTechnicalMismatchPenalty: calculateTechnicalMismatchPenaltyOld,
  calculateExperienceMismatchPenalty: calculateExperienceMismatchPenaltyOld,
  applyPenalties: applyPenaltiesOld
} = require('./legacyScoring');
const { calculateTechnicalDensity, isTechnicalRole } = require('../analysis/technicalKeywordLibrary');

/**
 * @typedef {import('../../jobFitService').WorkExperience} WorkExperience
 */

/**
 * @typedef {Object} TechnicalMismatchResult
 * @property {number} penalty - Penalty value (0-1)
 * @property {boolean} hasSevereMismatch - Whether there's a severe mismatch
 * @property {Object} analysis - Analysis details
 */

/**
 * @typedef {Object} PenaltyCollection
 * @property {{ penalty: number, hasSevereMismatch: boolean }} technicalMismatch
 * @property {{ penalty: number }} experienceMismatch
 */

/**
 * @typedef {Object} ExperienceMismatchResult
 * @property {number} penalty - Penalty value (0-1)
 * @property {Object} analysis - Analysis details
 * @property {Object} analysis.jobLevel - Job level details
 * @property {Object} analysis.candidateLevel - Candidate level details
 * @property {number} analysis.levelGap - Gap between job and candidate levels
 * @property {number} analysis.transferableCredit - Credit for transferable skills
 * @property {string} analysis.reason - Reason for penalty
 */

/**
 * @typedef {Object} JobLevel
 * @property {number} level - Numeric level (1-5)
 * @property {string} category - Level category
 * @property {number} confidence - Detection confidence
 */

/**
 * Calculates technical mismatch penalty
 * @param {string} jobDescription - Job description
 * @param {string} resumeContent - Resume content
 * @param {string} jobTitle - Job title
 * @returns {TechnicalMismatchResult}
 */
function calculateTechnicalMismatchPenalty(jobDescription, resumeContent, jobTitle) {
  if (!isFeatureEnabled('LENIENT_JOB_FIT_SCORING')) {
    return calculateTechnicalMismatchPenaltyOld(jobDescription, resumeContent, jobTitle);
  }

  const jobTechProfile = calculateTechnicalDensity(jobDescription);
  const resumeTechProfile = calculateTechnicalDensity(resumeContent);
  const { isTechnical: isJobTechnical, confidence: jobTechConfidence } = isTechnicalRole(jobTitle);

  // Calculate technical density difference with more lenient gap
  const techDensityGap = Math.max(0, (jobTechProfile.score - resumeTechProfile.score) * 0.5); // Reduced from 0.7
  
  // Calculate partial credit for related technologies
  const relatedTechCredit = calculateRelatedTechCredit(jobTechProfile, resumeTechProfile);
  
  // Determine if this is a severe mismatch (technical job, non-technical resume)
  const hasSevereMismatch = isJobTechnical && 
    jobTechConfidence > 0.8 && // Increased threshold for severe mismatch confidence
    jobTechProfile.score > 0.5 && // Increased threshold for job technical score
    resumeTechProfile.score < 0.3; // More lenient threshold

  // Calculate base penalty with partial credit
  let penalty = Math.max(0, techDensityGap - relatedTechCredit);

  // Add reduced penalty for severe mismatches
  if (hasSevereMismatch) {
    penalty = Math.max(penalty, 0.3); // Reduced from 0.4
  }

  return {
    penalty: Math.min(0.4, penalty), // Cap penalty at 40% instead of 50%
    hasSevereMismatch,
    analysis: {
      jobTechnicalProfile: jobTechProfile,
      resumeTechnicalProfile: resumeTechProfile,
      techDensityGap,
      relatedTechCredit,
      isJobTechnical,
      jobTechConfidence
    }
  };
}

/**
 * Calculates credit for related technologies
 * @param {Object} jobProfile - Job technical profile
 * @param {Object} resumeProfile - Resume technical profile
 * @returns {number} Credit value (0-0.3)
 */
function calculateRelatedTechCredit(jobProfile, resumeProfile) {
  // Group similar technologies
  const techGroups = {
    frontend: ['react', 'vue', 'angular', 'javascript', 'typescript'],
    backend: ['node', 'express', 'django', 'flask', 'spring', 'go'],
    database: ['sql', 'postgresql', 'mongodb', 'mysql', 'redis'],
    cloud: ['aws', 'azure', 'gcp', 'cloud'],
    general: ['git', 'docker', 'kubernetes', 'ci/cd']
  };

  // Handle undefined or missing keywords
  const jobKeywords = jobProfile?.keywords || [];
  const resumeKeywords = resumeProfile?.keywords || [];

  let credit = 0;
  const maxCredit = 0.3;

  // Check each tech group for partial matches
  for (const [category, technologies] of Object.entries(techGroups)) {
    const jobHasCategory = technologies.some(tech => 
      jobKeywords.some(k => k?.toLowerCase().includes(tech))
    );
    const resumeHasCategory = technologies.some(tech => 
      resumeKeywords.some(k => k?.toLowerCase().includes(tech))
    );
    
    if (jobHasCategory && resumeHasCategory) {
      credit += 0.1; // Credit for each matching category
    }
  }

  return Math.min(maxCredit, credit);
}

/**
 * Calculates experience level mismatch penalty
 * @param {WorkExperience[]} workExperience - Work experience entries
 * @param {string} jobDescription - Job description
 * @param {string} jobTitle - Job title
 * @returns {ExperienceMismatchResult}
 */
function calculateExperienceMismatchPenalty(workExperience, jobDescription, jobTitle) {
  if (!isFeatureEnabled('LENIENT_JOB_FIT_SCORING')) {
    return calculateExperienceMismatchPenaltyOld(workExperience, jobDescription, jobTitle);
  }

  const jobLevel = detectJobLevel(jobTitle, jobDescription);
  const candidateLevel = calculateCandidateLevel(workExperience);
  
  // Calculate transferable experience credit
  const transferableCredit = calculateTransferableExperience(workExperience, jobDescription);

  let penalty = 0;
  let reason = '';

  const levelGap = Math.abs(jobLevel.level - candidateLevel.level);
  
  if (jobLevel.level > candidateLevel.level) {
    // Under-experienced case
    if (levelGap >= 2) {
      penalty = 0.3; // Reduced from 0.4
      reason = 'Candidate has significantly less experience than required';
    } else if (levelGap === 1) {
      penalty = 0.15; // Reduced from 0.2
      reason = 'Candidate has somewhat less experience than ideal';
    }
  } else if (jobLevel.level < candidateLevel.level) {
    // Over-experienced case
    if (levelGap >= 2) {
      penalty = 0.15; // Reduced from 0.2
      reason = 'Candidate may be overqualified for this position';
    } else if (levelGap === 1) {
      penalty = 0.1; // Reduced from 0.15
      reason = 'Candidate has more experience than required';
    }
  }

  // Apply transferable experience credit
  penalty = Math.max(0, penalty - transferableCredit);

  return {
    penalty,
    analysis: {
      jobLevel,
      candidateLevel,
      levelGap,
      transferableCredit,
      reason
    }
  };
}

/**
 * Calculates credit for transferable experience
 * @param {WorkExperience[]} workExperience - Work experience entries
 * @param {string} jobDescription - Job description
 * @returns {number} Credit value (0-0.2)
 */
function calculateTransferableExperience(workExperience, jobDescription) {
  const transferableSkills = [
    // Leadership & Management
    {
      keywords: ['team lead', 'manager', 'supervisor', 'leadership', 'mentoring'],
      weight: 0.05
    },
    // Project Management
    {
      keywords: ['project management', 'agile', 'scrum', 'delivery', 'stakeholder'],
      weight: 0.04
    },
    // Technical Architecture
    {
      keywords: ['architecture', 'system design', 'scalability', 'performance', 'optimization'],
      weight: 0.05
    },
    // Cross-functional Skills
    {
      keywords: ['cross-functional', 'collaboration', 'communication', 'presentation'],
      weight: 0.03
    },
    // Problem Solving
    {
      keywords: ['problem solving', 'debugging', 'troubleshooting', 'analysis'],
      weight: 0.03
    }
  ];

  let totalCredit = 0;
  const expText = workExperience.map(exp => `${exp.description || ''}`).join(' ').toLowerCase();

  // Calculate credit for each transferable skill category
  for (const skill of transferableSkills) {
    if (skill.keywords.some(keyword => 
      expText.includes(keyword) && jobDescription.toLowerCase().includes(keyword)
    )) {
      totalCredit += skill.weight;
    }
  }

  return Math.min(0.2, totalCredit);
}

/**
 * Applies penalties to the base score
 * @param {number} baseScore - Original score before penalties
 * @param {PenaltyCollection} penalties - Collection of penalties to apply
 * @returns {{ finalScore: number, analysis: Object }}
 */
function applyPenalties(baseScore, penalties) {
  if (!isFeatureEnabled('LENIENT_JOB_FIT_SCORING')) {
    return applyPenaltiesOld(baseScore, penalties);
  }

  let finalScore = baseScore;
  const appliedPenalties = [];

  // Apply technical mismatch penalty
  if (penalties.technicalMismatch.hasSevereMismatch) {
    finalScore = Math.min(finalScore, 6.0);
  }
  const technicalPenaltyImpact = finalScore * penalties.technicalMismatch.penalty * 0.8; // Reduce penalty impact by 20%
  finalScore -= technicalPenaltyImpact;
  
  appliedPenalties.push({
    type: 'Technical Mismatch',
    penalty: penalties.technicalMismatch.penalty,
    impact: technicalPenaltyImpact
  });

  // Apply experience mismatch penalty
  const experiencePenaltyImpact = finalScore * penalties.experienceMismatch.penalty * 0.7; // Reduce penalty impact by 30%
  finalScore -= experiencePenaltyImpact;
  
  appliedPenalties.push({
    type: 'Experience Mismatch',
    penalty: penalties.experienceMismatch.penalty,
    impact: experiencePenaltyImpact
  });

  // Ensure score stays within bounds
  finalScore = Math.max(3.0, Math.min(10.0, finalScore));

  return {
    finalScore,
    analysis: {
      originalScore: baseScore,
      appliedPenalties,
      totalPenaltyImpact: baseScore - finalScore
    }
  };
}

/**
 * Detects job level from title and description
 * @param {string} jobTitle - Job title
 * @param {string} jobDescription - Job description
 * @returns {JobLevel}
 */
function detectJobLevel(jobTitle, jobDescription) {
  const levelIndicators = {
    entry: ['entry', 'junior', 'associate', 'intern', 'trainee'],
    mid: ['intermediate', 'regular', 'software engineer', 'developer'],
    senior: ['senior', 'lead', 'principal', 'architect'],
    manager: ['manager', 'head', 'director', 'vp', 'chief']
  };

  const titleLower = jobTitle.toLowerCase();
  const descLower = jobDescription.toLowerCase();
  
  // Check for level indicators in both title and description
  for (const [category, indicators] of Object.entries(levelIndicators)) {
    const titleMatch = indicators.some(i => titleLower.includes(i));
    const descMatch = indicators.some(i => descLower.includes(i));
    
    if (titleMatch || descMatch) {
      return {
        level: category === 'entry' ? 1 :
               category === 'mid' ? 2 :
               category === 'senior' ? 3 :
               category === 'manager' ? 4 : 2,
        category,
        confidence: titleMatch ? 0.8 : 0.6
      };
    }
  }

  // Default to mid-level if no clear indicators
  return {
    level: 2,
    category: 'mid',
    confidence: 0.5
  };
}

/**
 * Calculates candidate's experience level
 * @param {WorkExperience[]} workExperience - Work experience entries
 * @returns {JobLevel}
 */
function calculateCandidateLevel(workExperience) {
  // Calculate total years of experience
  const totalYears = workExperience.reduce((total, exp) => {
    if (!exp.startDate) return total;
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    return total + (end.getFullYear() - start.getFullYear());
  }, 0);

  // Determine level based on years of experience
  if (totalYears < 2) {
    return { level: 1, category: 'entry', confidence: 0.8 };
  } else if (totalYears < 5) {
    return { level: 2, category: 'mid', confidence: 0.8 };
  } else if (totalYears < 8) {
    return { level: 3, category: 'senior', confidence: 0.7 };
  } else {
    return { level: 4, category: 'manager', confidence: 0.6 };
  }
}

module.exports = {
  calculateTechnicalMismatchPenalty,
  calculateExperienceMismatchPenalty,
  applyPenalties,
  // Export these for legacy implementation
  calculateTechnicalDensity,
  isTechnicalRole
}; 