// @ts-check
const { calculateTechnicalDensity, isTechnicalRole } = require('../analysis/technicalKeywordLibrary');

/**
 * @typedef {Object} WorkExperience
 * @property {string} startDate - Start date of experience
 * @property {string} [endDate] - End date of experience (optional)
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
 * Calculates technical mismatch penalty
 * @param {string} jobDescription - Job description
 * @param {string} resumeContent - Resume content
 * @param {string} jobTitle - Job title
 * @returns {TechnicalMismatchResult}
 */
function calculateTechnicalMismatchPenalty(jobDescription, resumeContent, jobTitle) {
  const jobTechProfile = calculateTechnicalDensity(jobDescription);
  const resumeTechProfile = calculateTechnicalDensity(resumeContent);
  const { isTechnical: isJobTechnical, confidence: jobTechConfidence } = isTechnicalRole(jobTitle);

  // Calculate technical density difference
  const techDensityGap = Math.max(0, jobTechProfile.score - resumeTechProfile.score);
  
  // Determine if this is a severe mismatch (technical job, non-technical resume)
  const hasSevereMismatch = isJobTechnical && 
    jobTechConfidence > 0.7 && 
    jobTechProfile.score > 0.3 && 
    resumeTechProfile.score < 0.2;

  // Calculate base penalty
  let penalty = techDensityGap * 2;

  // Add additional penalty for severe mismatches
  if (hasSevereMismatch) {
    penalty = Math.max(penalty, 0.6); // Ensures at least a 60% reduction
  }

  return {
    penalty: Math.min(0.8, penalty), // Cap penalty at 80%
    hasSevereMismatch,
    analysis: {
      jobTechnicalProfile: jobTechProfile,
      resumeTechnicalProfile: resumeTechProfile,
      techDensityGap,
      isJobTechnical,
      jobTechConfidence
    }
  };
}

/**
 * Calculates experience level mismatch penalty
 * @param {WorkExperience[]} workExperience - Work experience entries
 * @param {string} jobDescription - Job description
 * @param {string} jobTitle - Job title
 * @returns {{ penalty: number, analysis: Object }}
 */
function calculateExperienceMismatchPenalty(workExperience, jobDescription, jobTitle) {
  const seniorIndicators = ['senior', 'lead', 'principal', 'architect', 'head of', 'manager'];
  const juniorIndicators = ['junior', 'entry', 'associate', 'intern', 'trainee'];
  
  // Determine job seniority
  const titleLower = jobTitle.toLowerCase();
  const descLower = jobDescription.toLowerCase();
  
  const isSeniorRole = seniorIndicators.some(indicator => 
    titleLower.includes(indicator) || descLower.includes(indicator)
  );
  
  const isJuniorRole = juniorIndicators.some(indicator => 
    titleLower.includes(indicator) || descLower.includes(indicator)
  );

  // Calculate total years of experience
  const totalYears = workExperience.reduce((total, exp) => {
    if (!exp.startDate) return total;
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    return total + (end.getFullYear() - start.getFullYear());
  }, 0);

  let penalty = 0;
  let reason = '';

  // Apply penalties based on experience mismatches
  if (isSeniorRole && totalYears < 5) {
    penalty = 0.4; // 40% penalty for junior applying to senior role
    reason = 'Insufficient experience for senior role';
  } else if (isJuniorRole && totalYears > 8) {
    penalty = 0.2; // 20% penalty for senior applying to junior role
    reason = 'Overqualified for junior role';
  }

  return {
    penalty,
    analysis: {
      totalYears,
      isSeniorRole,
      isJuniorRole,
      reason
    }
  };
}

/**
 * Applies penalties to the base score
 * @param {number} baseScore - Original score before penalties
 * @param {PenaltyCollection} penalties - Collection of penalties to apply
 * @returns {{ finalScore: number, analysis: Object }}
 */
function applyPenalties(baseScore, penalties) {
  let finalScore = baseScore;
  const appliedPenalties = [];

  // Apply technical mismatch penalty
  if (penalties.technicalMismatch.hasSevereMismatch) {
    finalScore = Math.min(finalScore, 4.0); // Hard cap for severe technical mismatches
  }
  finalScore *= (1 - penalties.technicalMismatch.penalty);
  appliedPenalties.push({
    type: 'Technical Mismatch',
    penalty: penalties.technicalMismatch.penalty,
    impact: baseScore - finalScore
  });

  // Apply experience mismatch penalty
  const postExpScore = finalScore * (1 - penalties.experienceMismatch.penalty);
  appliedPenalties.push({
    type: 'Experience Mismatch',
    penalty: penalties.experienceMismatch.penalty,
    impact: finalScore - postExpScore
  });
  finalScore = postExpScore;

  // Ensure score stays within bounds
  finalScore = Math.max(1.0, Math.min(10.0, finalScore));

  return {
    finalScore,
    analysis: {
      originalScore: baseScore,
      appliedPenalties,
      totalPenaltyImpact: baseScore - finalScore
    }
  };
}

module.exports = {
  calculateTechnicalMismatchPenalty,
  calculateExperienceMismatchPenalty,
  applyPenalties
}; 