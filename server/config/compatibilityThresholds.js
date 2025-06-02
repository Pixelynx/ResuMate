/**
 * Compatibility assessment thresholds configuration
 * @type {Object}
 */
const COMPATIBILITY_THRESHOLDS = {
  /** Minimum score required to consider an application viable */
  MINIMUM_VIABLE_SCORE: 40,

  // Maximum number of critical skills that can be missing
  MAX_MISSING_CRITICAL_SKILLS: 2,
  
  // Minimum required skills match score (percentage)
  MIN_SKILLS_MATCH_SCORE: 50,
  
  // Minimum years of experience ratio (actual/required)
  MIN_EXPERIENCE_RATIO: 0.7,

  /** Score thresholds for different compatibility levels */
  COMPATIBILITY_LEVELS: {
    EXCELLENT_MATCH: 85,
    GOOD_MATCH: 70,
    POTENTIAL_MATCH: 55,
    POOR_MATCH: 40
  },

  /** Weights for different assessment criteria */
  CRITERIA_WEIGHTS: {
    EXPERIENCE: 0.35,
    ROLE_CATEGORY: 0.3,
    HARD_SKILLS: 0.35
  },

  /** Minimum years of experience for different role levels */
  EXPERIENCE_REQUIREMENTS: {
    SENIOR: 4,
    EXECUTIVE: 6,
    LEAD: 3,
    MANAGER: 2
  },

  /** Technical role specific requirements */
  TECHNICAL_ROLE: {
    MIN_TECHNICAL_SKILLS: 2,
    MIN_RELEVANT_PROJECTS: 1
  },

  /** Management role specific requirements */
  MANAGEMENT_ROLE: {
    MIN_YEARS_EXPERIENCE: 1.5,
    MIN_TEAM_SIZE: 2
  },

  /** Score thresholds for suggesting improvements */
  IMPROVEMENT_THRESHOLDS: {
    EXPERIENCE: 50,
    SKILLS: 50,
    ROLE_FIT: 50
  },

  /** Feature flags for different assessment types */
  FEATURE_FLAGS: {
    CHECK_CERTIFICATIONS: false,
    CHECK_EDUCATION: true,
    CHECK_INDUSTRY_MATCH: true,
    CHECK_MANAGEMENT_EXPERIENCE: true
  }
};

module.exports = {
  COMPATIBILITY_THRESHOLDS
}; 