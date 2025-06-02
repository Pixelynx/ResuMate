// @ts-check

/** @typedef {import('../compensation/skillsCompensation').SkillMatchQuality} SkillMatchQuality */
/** @typedef {import('../compensation/projectCompensation').ProjectRelevance} ProjectRelevance */

/**
 * @typedef {Object} PenaltyThresholds
 * @property {number} SKILL_MISMATCH_MIN - Minimum penalty for severe skill mismatch
 * @property {number} TECH_ROLE_MISMATCH_MIN - Minimum penalty for tech role mismatch
 * @property {number} EXPERIENCE_GAP_MIN - Minimum penalty for critical experience gap
 * @property {number} EDUCATION_MISMATCH_MIN - Minimum penalty for education mismatch
 */

/**
 * @typedef {Object} PenaltyReason
 * @property {string} code - Reason code for the penalty
 * @property {string} description - Detailed description of the penalty reason
 * @property {string} suggestion - Suggestion for improvement
 * @property {number} minimumPenalty - Minimum penalty that must remain
 */

/**
 * @typedef {Object} PenaltyAnalysis
 * @property {Object.<string, number>} originalPenalties - Original penalties before compensation
 * @property {Object.<string, number>} adjustedPenalties - Penalties after compensation
 * @property {PenaltyReason[]} reasons - Reasons for penalties
 * @property {string[]} improvements - Suggested improvements
 */

class PenaltyThresholdManager {
  constructor() {
    /** @type {PenaltyThresholds} */
    this.thresholds = {
      SKILL_MISMATCH_MIN: 0.3,      // 30% minimum for severe skill mismatch
      TECH_ROLE_MISMATCH_MIN: 0.4,  // 40% minimum for tech role mismatch
      EXPERIENCE_GAP_MIN: 0.25,     // 25% minimum for experience gap
      EDUCATION_MISMATCH_MIN: 0.2   // 20% minimum for education mismatch
    };

    /** @type {Object.<string, string[]>} */
    this.penaltyReasonTemplates = {
      SKILL_MISMATCH: [
        "Critical skill gap detected",
        "Consider acquiring skills in: {missing_skills}",
        "Focus on core technical requirements"
      ],
      TECH_ROLE_MISMATCH: [
        "Background doesn't align with technical requirements",
        "Consider transitional roles or technical certifications",
        "Build portfolio with relevant technical projects"
      ],
      EXPERIENCE_GAP: [
        "Significant experience gap for role level",
        "Gain more experience in: {missing_areas}",
        "Consider roles matching your experience level"
      ]
    };
  }

  /**
   * Analyzes skill match to determine minimum penalties
   * @param {SkillMatchQuality} skillMatch - Skill match assessment
   * @param {boolean} isTechnicalRole - Whether this is a technical role
   * @returns {PenaltyReason[]} Applicable penalty reasons
   */
  analyzeSkillMatch(skillMatch, isTechnicalRole) {
    const reasons = [];
    
    // Check for severe skill mismatch
    if (skillMatch.overallMatch < 0.2) {
      reasons.push({
        code: 'SEVERE_SKILL_MISMATCH',
        description: 'Less than 20% of required skills matched',
        suggestion: `Focus on acquiring these key skills: ${skillMatch.missingCoreSkills.join(', ')}`,
        minimumPenalty: this.thresholds.SKILL_MISMATCH_MIN
      });
    }
    
    // Check for technical role mismatch
    if (isTechnicalRole && skillMatch.coreSkillMatch < 0.3) {
      reasons.push({
        code: 'TECH_ROLE_MISMATCH',
        description: 'Critical technical skill requirements not met',
        suggestion: 'Consider obtaining relevant technical certifications or completing technical projects',
        minimumPenalty: this.thresholds.TECH_ROLE_MISMATCH_MIN
      });
    }
    
    return reasons;
  }

  /**
   * Analyzes experience requirements
   * @param {number} requiredYears - Years of experience required
   * @param {number} actualYears - Candidate's years of experience
   * @returns {PenaltyReason[]} Applicable penalty reasons
   */
  analyzeExperienceGap(requiredYears, actualYears) {
    const reasons = [];
    
    if (requiredYears >= 5 && actualYears < 2) {
      reasons.push({
        code: 'CRITICAL_EXPERIENCE_GAP',
        description: `Role requires ${requiredYears}+ years, candidate has ${actualYears} years`,
        suggestion: 'Consider roles more aligned with your experience level or highlight relevant project work',
        minimumPenalty: this.thresholds.EXPERIENCE_GAP_MIN
      });
    }
    
    return reasons;
  }

  /**
   * Enforces minimum penalties based on analysis
   * @param {Object.<string, number>} penalties - Current penalties
   * @param {PenaltyReason[]} reasons - Reasons for minimum penalties
   * @returns {Object.<string, number>} Adjusted penalties
   */
  enforceMinimumPenalties(penalties, reasons) {
    const adjustedPenalties = { ...penalties };
    
    for (const reason of reasons) {
      switch (reason.code) {
        case 'SEVERE_SKILL_MISMATCH':
          adjustedPenalties.skills = Math.max(
            adjustedPenalties.skills || 0,
            reason.minimumPenalty
          );
          break;
        case 'TECH_ROLE_MISMATCH':
          adjustedPenalties.technical = Math.max(
            adjustedPenalties.technical || 0,
            reason.minimumPenalty
          );
          break;
        case 'CRITICAL_EXPERIENCE_GAP':
          adjustedPenalties.experience = Math.max(
            adjustedPenalties.experience || 0,
            reason.minimumPenalty
          );
          break;
      }
    }
    
    return adjustedPenalties;
  }

  /**
   * Calculates graduated penalty scale
   * @param {number} mismatchSeverity - Severity of the mismatch (0-1)
   * @param {number} minimumPenalty - Minimum penalty threshold
   * @returns {number} Calculated penalty
   */
  calculateGraduatedPenalty(mismatchSeverity, minimumPenalty) {
    // Use exponential scale to graduate penalties
    const base = Math.max(minimumPenalty, mismatchSeverity);
    const graduated = 1 - Math.pow(1 - base, 1.5);
    return Math.min(1, Math.max(minimumPenalty, graduated));
  }

  /**
   * Generates comprehensive penalty analysis
   * @param {Object.<string, number>} originalPenalties - Original penalties
   * @param {Object.<string, number>} adjustedPenalties - Adjusted penalties
   * @param {PenaltyReason[]} reasons - Reasons for penalties
   * @returns {PenaltyAnalysis} Complete penalty analysis
   */
  generatePenaltyAnalysis(originalPenalties, adjustedPenalties, reasons) {
    console.log('Generating penalty analysis...');
    
    const improvements = reasons.map(reason => {
      const penaltyReduction = originalPenalties[reason.code.toLowerCase()] - 
        (adjustedPenalties[reason.code.toLowerCase()] || 0);
      
      console.log(`Penalty analysis for ${reason.code}:
        Original: ${originalPenalties[reason.code.toLowerCase()]?.toFixed(2) || 0}
        Adjusted: ${adjustedPenalties[reason.code.toLowerCase()]?.toFixed(2) || 0}
        Reduction: ${penaltyReduction.toFixed(2)}
        Minimum Required: ${reason.minimumPenalty}
      `);
      
      return reason.suggestion;
    });
    
    return {
      originalPenalties,
      adjustedPenalties,
      reasons,
      improvements
    };
  }
}

module.exports = {
  PenaltyThresholdManager
}; 