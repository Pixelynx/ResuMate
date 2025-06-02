// @ts-check

/** @typedef {'NONE' | 'MODERATE' | 'HIGH' | 'VERY_HIGH'} SkillMatchLevel */
/** @typedef {'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'EXPERT'} ExperienceLevel */

/** @typedef {import('./skillsCompensation').SkillMatchQuality} SkillMatchQuality */
const { PenaltyThresholdManager } = require('../scoring/penaltyThresholds');

/**
 * @typedef {Object} SkillMatchThresholds
 * @property {number} MODERATE_MIN - Minimum threshold for moderate match (40%)
 * @property {number} HIGH_MIN - Minimum threshold for high match (70%)
 * @property {number} VERY_HIGH_MIN - Minimum threshold for very high match (85%)
 */

/** @type {SkillMatchThresholds} */
const SKILL_MATCH_THRESHOLDS = {
  MODERATE_MIN: 0.4,
  HIGH_MIN: 0.7,
  VERY_HIGH_MIN: 0.85
};

/**
 * @typedef {Object} CompensationPower
 * @property {number} educationPenaltyReduction - How much education penalty can be reduced (0-1)
 * @property {number} otherPenaltyReduction - How much other penalties can be reduced (0-1)
 */

/**
 * @typedef {Object} CompensationResult
 * @property {SkillMatchLevel} skillMatchLevel - Level of skill match
 * @property {CompensationPower} compensationPower - Penalty reduction powers
 * @property {string[]} compensatedPenalties - Which penalties were compensated
 * @property {Object.<string, number>} originalPenalties - Original penalty values
 * @property {Object.<string, number>} adjustedPenalties - Adjusted penalty values after compensation
 * @property {Object.<string, number>} reductions - Applied penalty reductions
 * @property {Object} analysis - Comprehensive analysis of penalties
 */

/**
 * Determines skill match level based on match percentage
 * @param {number} matchPercentage - Skill match percentage (0-1)
 * @returns {SkillMatchLevel} Skill match level
 */
const determineSkillMatchLevel = (matchPercentage) => {
  if (matchPercentage >= SKILL_MATCH_THRESHOLDS.VERY_HIGH_MIN) return 'VERY_HIGH';
  if (matchPercentage >= SKILL_MATCH_THRESHOLDS.HIGH_MIN) return 'HIGH';
  if (matchPercentage >= SKILL_MATCH_THRESHOLDS.MODERATE_MIN) return 'MODERATE';
  return 'NONE';
};

/**
 * Calculates years of experience from work history
 * @param {Array<{ startDate?: string, endDate?: string }>} workExperience - Work experience entries
 * @returns {number} Total years of experience
 */
const calculateTotalExperience = (workExperience) => {
  if (!workExperience?.length) return 0;

  const totalMonths = workExperience.reduce((total, exp) => {
    if (!exp.startDate) return total;
    
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return total;
    
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                  (end.getMonth() - start.getMonth());
    
    return total + Math.max(0, months);
  }, 0);

  return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal place
};

/**
 * Determines compensation power based on years of experience
 * @param {number} yearsExperience - Years of experience
 * @returns {CompensationPower} Compensation power levels
 */
const determineCompensationPower = (yearsExperience) => {
  if (yearsExperience >= 7) {
    return {
      educationPenaltyReduction: 1.0,  // Eliminate
      otherPenaltyReduction: 0.5   // Reduce by 50%
    };
  }
  if (yearsExperience >= 5) {
    return {
      educationPenaltyReduction: 1.0,  // Eliminate
      otherPenaltyReduction: 0.25  // Reduce by 25%
    };
  }
  if (yearsExperience >= 3) {
    return {
      educationPenaltyReduction: 1.0,  // Eliminate
      otherPenaltyReduction: 0.0   // No reduction
    };
  }
  if (yearsExperience >= 1) {
    return {
      educationPenaltyReduction: 0.5,  // Reduce by 50%
      otherPenaltyReduction: 0.0   // No reduction
    };
  }
  return {
    educationPenaltyReduction: 0.0,  // No reduction
    otherPenaltyReduction: 0.0   // No reduction
  };
};

/**
 * Applies compensation to penalties based on experience and skill levels
 * @param {Object} penalties - Original penalties
 * @param {CompensationPower} compensationPower - Compensation power levels
 * @param {SkillMatchQuality} skillMatch - Skill match assessment
 * @param {boolean} isTechnicalRole - Whether this is a technical role
 * @param {number} requiredYears - Required years of experience
 * @param {number} actualYears - Actual years of experience
 * @returns {Object} Adjusted penalties and analysis
 */
const applyCompensation = (penalties, compensationPower, skillMatch, isTechnicalRole, requiredYears, actualYears) => {
  const penaltyManager = new PenaltyThresholdManager();
  const adjustedPenalties = { ...penalties };
  const compensatedPenalties = [];

  // Get penalty reasons
  const skillReasons = penaltyManager.analyzeSkillMatch(skillMatch, isTechnicalRole);
  const experienceReasons = penaltyManager.analyzeExperienceGap(requiredYears, actualYears);
  const allReasons = [...skillReasons, ...experienceReasons];

  // Apply education penalty reduction
  if (adjustedPenalties.education && compensationPower.educationPenaltyReduction > 0) {
    const originalPenalty = adjustedPenalties.education;
    adjustedPenalties.education *= (1 - compensationPower.educationPenaltyReduction);
    if (adjustedPenalties.education < originalPenalty) {
      compensatedPenalties.push('education');
    }
  }

  // Apply other penalty reductions
  if (compensationPower.otherPenaltyReduction > 0) {
    for (const [key, value] of Object.entries(adjustedPenalties)) {
      if (key !== 'education') {
        const originalPenalty = value;
        adjustedPenalties[key] *= (1 - compensationPower.otherPenaltyReduction);
        if (adjustedPenalties[key] < originalPenalty) {
          compensatedPenalties.push(key);
        }
      }
    }
  }

  // Enforce minimum penalties
  const finalPenalties = penaltyManager.enforceMinimumPenalties(adjustedPenalties, allReasons);

  // Generate comprehensive analysis
  const analysis = penaltyManager.generatePenaltyAnalysis(
    penalties,
    finalPenalties,
    allReasons
  );

  return {
    adjustedPenalties: finalPenalties,
    compensatedPenalties,
    analysis
  };
};

/**
 * Calculates final compensation result
 * @param {Object} penalties - Original penalties
 * @param {number} skillMatchPercentage - Overall skill match percentage
 * @param {Array<{ startDate?: string, endDate?: string }>} workExperience - Work experience
 * @param {SkillMatchQuality} skillMatch - Skill match assessment
 * @param {boolean} isTechnicalRole - Whether this is a technical role
 * @param {number} requiredYears - Required years of experience
 * @returns {CompensationResult} Compensation calculation result
 */
const calculateCompensation = (penalties, skillMatchPercentage, workExperience, skillMatch, isTechnicalRole, requiredYears) => {
  const skillMatchLevel = determineSkillMatchLevel(skillMatchPercentage);
  const yearsExperience = calculateTotalExperience(workExperience);
  const compensationPower = determineCompensationPower(yearsExperience);
  
  const { adjustedPenalties, compensatedPenalties, analysis } = applyCompensation(
    penalties, 
    compensationPower,
    skillMatch,
    isTechnicalRole,
    requiredYears,
    yearsExperience
  );

  // Calculate reductions
  /** @type {Object.<string, number>} */
  const reductions = Object.create(null);
  for (const key in penalties) {
    if (Object.prototype.hasOwnProperty.call(penalties, key)) {
      reductions[key] = penalties[key] - (adjustedPenalties[key] || 0);
    }
  }

  return {
    skillMatchLevel,
    compensationPower,
    compensatedPenalties,
    originalPenalties: { ...penalties },
    adjustedPenalties,
    reductions,
    analysis
  };
};

module.exports = {
  calculateCompensation,
  determineSkillMatchLevel,
  calculateTotalExperience,
  determineCompensationPower,
  SKILL_MATCH_THRESHOLDS
};