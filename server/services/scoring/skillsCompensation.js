// @ts-check

/** @typedef {import('./compensationSystem').SkillMatchLevel} SkillMatchLevel */

/**
 * @typedef {Object} SkillMatchQuality
 * @property {number} overallMatch - Overall match percentage (0-1)
 * @property {number} coreSkillMatch - Core skills match percentage (0-1)
 * @property {string[]} matchedCoreSkills - List of matched core skills
 * @property {string[]} missingCoreSkills - List of missing core skills
 * @property {string[]} matchedPeripheralSkills - List of matched peripheral skills
 * @property {number} compensationPower - Calculated compensation power (0-1)
 */

/**
 * @typedef {Object} SkillCompensationConfig
 * @property {number} HIGH_MATCH_THRESHOLD - Threshold for high match (0.8)
 * @property {number} VERY_HIGH_MATCH_THRESHOLD - Threshold for very high match (0.9)
 * @property {number} PERFECT_MATCH_THRESHOLD - Threshold for perfect match (0.95)
 * @property {number} HIGH_MATCH_REDUCTION - Penalty reduction for high match (0.3)
 * @property {number} VERY_HIGH_MATCH_REDUCTION - Penalty reduction for very high match (0.5)
 * @property {number} PERFECT_MATCH_REDUCTION - Penalty reduction for perfect match (0.7)
 * @property {number} MINIMUM_PENALTY_THRESHOLD - Minimum penalty after reductions (0.1)
 */

/** @type {SkillCompensationConfig} */
const SKILL_COMPENSATION_CONFIG = {
  HIGH_MATCH_THRESHOLD: 0.8,
  VERY_HIGH_MATCH_THRESHOLD: 0.9,
  PERFECT_MATCH_THRESHOLD: 0.95,
  HIGH_MATCH_REDUCTION: 0.3,
  VERY_HIGH_MATCH_REDUCTION: 0.5,
  PERFECT_MATCH_REDUCTION: 0.7,
  MINIMUM_PENALTY_THRESHOLD: 0.1
};

/**
 * Categorizes skills into core and peripheral based on job requirements
 * @param {string[]} requiredSkills - Skills listed in job description
 * @param {string} jobDescription - Full job description text
 * @returns {{ coreSkills: Set<string>, peripheralSkills: Set<string> }}
 */
const categorizeSkills = (requiredSkills, jobDescription) => {
  const description = jobDescription.toLowerCase();
  const coreSkills = new Set();
  const peripheralSkills = new Set();

  // Core skills indicators in description
  const coreIndicators = [
    'required', 'must have', 'essential', 'core', 
    'key', 'primary', 'fundamental', 'critical'
  ];

  for (const skill of requiredSkills) {
    const skillLower = skill.toLowerCase();
    const isCore = coreIndicators.some(indicator => 
      description.includes(`${indicator} ${skillLower}`) ||
      description.includes(`${indicator}: ${skillLower}`) ||
      description.includes(`${skillLower} ${indicator}`)
    );
    
    if (isCore) {
      coreSkills.add(skill);
    } else {
      peripheralSkills.add(skill);
    }
  }

  // If no explicit core skills found, treat frequently mentioned skills as core
  if (coreSkills.size === 0) {
    for (const skill of requiredSkills) {
      const skillLower = skill.toLowerCase();
      const mentions = (description.match(new RegExp(skillLower, 'g')) || []).length;
      if (mentions >= 2) {
        coreSkills.add(skill);
      } else {
        peripheralSkills.add(skill);
      }
    }
  }

  return { coreSkills, peripheralSkills };
};

/**
 * Assesses the quality of skill matches
 * @param {string[]} candidateSkills - Candidate's skills
 * @param {string[]} requiredSkills - Required skills from job description
 * @param {string} jobDescription - Full job description
 * @returns {SkillMatchQuality} Skill match quality assessment
 */
const assessSkillMatchQuality = (candidateSkills, requiredSkills, jobDescription) => {
  console.log('Assessing skill match quality...');
  
  const { coreSkills, peripheralSkills } = categorizeSkills(requiredSkills, jobDescription);
  const candidateSkillSet = new Set(candidateSkills.map(s => s.toLowerCase()));
  
  // Calculate core skills match
  const matchedCoreSkills = Array.from(coreSkills)
    .filter(skill => candidateSkillSet.has(skill.toLowerCase()));
  
  const missingCoreSkills = Array.from(coreSkills)
    .filter(skill => !candidateSkillSet.has(skill.toLowerCase()));
  
  // Calculate peripheral skills match
  const matchedPeripheralSkills = Array.from(peripheralSkills)
    .filter(skill => candidateSkillSet.has(skill.toLowerCase()));
  
  // Calculate match percentages
  const coreSkillMatch = coreSkills.size > 0 ? 
    matchedCoreSkills.length / coreSkills.size : 1;
  
  const peripheralMatch = peripheralSkills.size > 0 ? 
    matchedPeripheralSkills.length / peripheralSkills.size : 1;
  
  // Weight core skills more heavily in overall match
  const overallMatch = coreSkills.size > 0 ? 
    (coreSkillMatch * 0.7) + (peripheralMatch * 0.3) :
    peripheralMatch;
  
  // Calculate compensation power based on match quality
  let compensationPower = 0;
  if (overallMatch >= SKILL_COMPENSATION_CONFIG.PERFECT_MATCH_THRESHOLD) {
    compensationPower = SKILL_COMPENSATION_CONFIG.PERFECT_MATCH_REDUCTION;
  } else if (overallMatch >= SKILL_COMPENSATION_CONFIG.VERY_HIGH_MATCH_THRESHOLD) {
    compensationPower = SKILL_COMPENSATION_CONFIG.VERY_HIGH_MATCH_REDUCTION;
  } else if (overallMatch >= SKILL_COMPENSATION_CONFIG.HIGH_MATCH_THRESHOLD) {
    compensationPower = SKILL_COMPENSATION_CONFIG.HIGH_MATCH_REDUCTION;
  }

  console.log(`Skill match assessment complete:
    Overall Match: ${(overallMatch * 100).toFixed(1)}%
    Core Skills Match: ${(coreSkillMatch * 100).toFixed(1)}%
    Compensation Power: ${(compensationPower * 100).toFixed(1)}%
    Matched Core Skills: ${matchedCoreSkills.join(', ')}
    Missing Core Skills: ${missingCoreSkills.join(', ')}
  `);

  return {
    overallMatch,
    coreSkillMatch,
    matchedCoreSkills,
    missingCoreSkills,
    matchedPeripheralSkills,
    compensationPower
  };
};

/**
 * Applies skill-based compensation to experience penalties
 * @param {Object.<string, number>} penalties - Current penalties
 * @param {SkillMatchQuality} skillMatch - Skill match quality assessment
 * @returns {{ adjustedPenalties: Object.<string, number>, reductions: Object.<string, number> }}
 */
const applySkillCompensation = (penalties, skillMatch) => {
  console.log('Applying skill-based compensation...');
  
  const adjustedPenalties = { ...penalties };
  /** @type {Object.<string, number>} */
  const reductions = Object.create(null);
  
  // Only reduce experience-related penalties
  const experiencePenalties = ['experience', 'seniority', 'leadership'];
  
  for (const key of experiencePenalties) {
    if (adjustedPenalties[key]) {
      const originalPenalty = adjustedPenalties[key];
      const reduction = originalPenalty * skillMatch.compensationPower;
      
      // Ensure we don't reduce below minimum threshold
      const minPenalty = originalPenalty * SKILL_COMPENSATION_CONFIG.MINIMUM_PENALTY_THRESHOLD;
      adjustedPenalties[key] = Math.max(originalPenalty - reduction, minPenalty);
      
      reductions[key] = originalPenalty - adjustedPenalties[key];
      
      console.log(`Applied compensation to ${key} penalty:
        Original: ${originalPenalty.toFixed(2)}
        Reduction: ${reduction.toFixed(2)}
        Final: ${adjustedPenalties[key].toFixed(2)}
      `);
    }
  }
  
  return { adjustedPenalties, reductions };
};

module.exports = {
  assessSkillMatchQuality,
  applySkillCompensation,
  SKILL_COMPENSATION_CONFIG
}; 